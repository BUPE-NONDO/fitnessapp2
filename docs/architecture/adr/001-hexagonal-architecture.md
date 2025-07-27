# ADR-001: Hexagonal Architecture Implementation

## Status
**ACCEPTED** - January 26, 2025

## Context
FitnessApp requires a scalable, maintainable architecture that supports:
- Clean separation of concerns
- Testability and mockability
- Technology-agnostic business logic
- Plugin-based extensibility
- Future migration capabilities

## Decision
Implement Hexagonal Architecture (Ports and Adapters) pattern with the following structure:

```
src/
├── domain/           # Core business logic (no dependencies)
│   ├── entities/     # Business entities
│   ├── value-objects/ # Immutable value objects
│   ├── services/     # Domain services
│   └── repositories/ # Repository interfaces (ports)
├── application/      # Application services and use cases
│   ├── commands/     # Command handlers (CQRS)
│   ├── queries/      # Query handlers (CQRS)
│   ├── services/     # Application services
│   └── ports/        # Application ports
├── infrastructure/   # External adapters
│   ├── repositories/ # Repository implementations
│   ├── services/     # External service adapters
│   ├── api/          # API adapters
│   └── persistence/  # Database adapters
└── presentation/     # UI layer
    ├── components/   # React components
    ├── pages/        # Page components
    └── hooks/        # Custom hooks
```

## Rationale

### Benefits
1. **Dependency Inversion**: Core business logic doesn't depend on external frameworks
2. **Testability**: Easy to mock external dependencies
3. **Flexibility**: Can swap implementations without changing business logic
4. **Maintainability**: Clear boundaries and responsibilities
5. **Scalability**: Supports microservices migration

### Implementation Strategy
- Domain layer contains pure business logic
- Application layer orchestrates use cases
- Infrastructure layer handles external concerns
- Presentation layer manages UI interactions

## Implementation Details

### Domain Layer Example
```typescript
// domain/entities/User.ts
export class User {
  constructor(
    private readonly id: UserId,
    private readonly email: Email,
    private readonly profile: UserProfile
  ) {}

  public updateProfile(newProfile: UserProfile): User {
    // Business logic for profile updates
    return new User(this.id, this.email, newProfile);
  }

  public canAccessWorkoutPlan(plan: WorkoutPlan): boolean {
    // Business rules for access control
    return this.profile.fitnessLevel.isCompatibleWith(plan.difficulty);
  }
}
```

### Application Layer Example
```typescript
// application/commands/CreateWorkoutPlanCommand.ts
export class CreateWorkoutPlanCommandHandler {
  constructor(
    private readonly workoutPlanRepository: WorkoutPlanRepository,
    private readonly userRepository: UserRepository
  ) {}

  async handle(command: CreateWorkoutPlanCommand): Promise<WorkoutPlan> {
    const user = await this.userRepository.findById(command.userId);
    const workoutPlan = WorkoutPlan.create(command.planData, user);
    
    return await this.workoutPlanRepository.save(workoutPlan);
  }
}
```

### Infrastructure Layer Example
```typescript
// infrastructure/repositories/FirebaseWorkoutPlanRepository.ts
export class FirebaseWorkoutPlanRepository implements WorkoutPlanRepository {
  constructor(private readonly firestore: Firestore) {}

  async save(workoutPlan: WorkoutPlan): Promise<WorkoutPlan> {
    const doc = this.firestore.collection('workoutPlans').doc(workoutPlan.id);
    await doc.set(workoutPlan.toPlainObject());
    return workoutPlan;
  }

  async findById(id: string): Promise<WorkoutPlan | null> {
    const doc = await this.firestore.collection('workoutPlans').doc(id).get();
    return doc.exists ? WorkoutPlan.fromPlainObject(doc.data()) : null;
  }
}
```

## Consequences

### Positive
- Clear separation of concerns
- High testability
- Technology independence
- Easy to extend and modify
- Supports SOLID principles

### Negative
- Initial complexity overhead
- More files and abstractions
- Learning curve for team members
- Potential over-engineering for simple features

### Mitigation Strategies
- Comprehensive documentation and examples
- Team training on hexagonal architecture
- Gradual migration from existing code
- Clear guidelines for when to apply patterns

## Compliance
This decision supports:
- **SOLID Principles**: Single responsibility, dependency inversion
- **Clean Architecture**: Dependency rule enforcement
- **Domain-Driven Design**: Rich domain models
- **Test-Driven Development**: Easy mocking and testing

## Related ADRs
- ADR-002: CQRS Implementation
- ADR-003: Plugin Architecture
- ADR-004: Dependency Injection Container

## Implementation Timeline
- **Phase 1**: Core domain entities and value objects (Week 1-2)
- **Phase 2**: Application services and command/query handlers (Week 3-4)
- **Phase 3**: Infrastructure adapters and repositories (Week 5-6)
- **Phase 4**: Integration and testing (Week 7-8)

## Success Metrics
- **Code Coverage**: >90% for domain and application layers
- **Dependency Violations**: 0 violations of dependency rules
- **Test Execution Time**: <30 seconds for unit tests
- **Cyclomatic Complexity**: <10 for all domain methods

## References
- [Hexagonal Architecture by Alistair Cockburn](https://alistair.cockburn.us/hexagonal-architecture/)
- [Clean Architecture by Robert Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Ports and Adapters Pattern](https://herbertograca.com/2017/09/14/ports-adapters-architecture/)

---
**Author**: Architecture Team
**Reviewers**: Development Team, Security Team
**Next Review**: July 26, 2025
