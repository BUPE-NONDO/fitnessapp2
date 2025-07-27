# ADR-002: CQRS (Command Query Responsibility Segregation) Implementation

## Status
**ACCEPTED** - January 26, 2025

## Context
FitnessApp requires clear separation between read and write operations to:
- Optimize read and write models independently
- Support complex business logic in commands
- Enable event sourcing for audit trails
- Improve scalability and performance
- Facilitate testing and maintenance

## Decision
Implement CQRS pattern with the following components:

### Command Side (Write Model)
- **Commands**: Represent user intentions to change state
- **Command Handlers**: Execute business logic and persist changes
- **Domain Events**: Capture what happened in the domain
- **Event Store**: Persist domain events for audit and replay

### Query Side (Read Model)
- **Queries**: Represent requests for data
- **Query Handlers**: Retrieve and format data for presentation
- **Read Models**: Optimized data structures for queries
- **Projections**: Transform events into read models

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐
│   Commands      │    │    Queries      │
│                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │   Command   │ │    │ │    Query    │ │
│ │   Handler   │ │    │ │   Handler   │ │
│ └─────────────┘ │    │ └─────────────┘ │
│        │        │    │        │        │
│        ▼        │    │        ▼        │
│ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │   Domain    │ │    │ │    Read     │ │
│ │   Events    │ │    │ │   Models    │ │
│ └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘
         │                       ▲
         └───────────────────────┘
              Event Projections
```

## Implementation Details

### Command Structure
```typescript
// application/commands/CreateWorkoutPlanCommand.ts
export interface CreateWorkoutPlanCommand {
  readonly userId: string;
  readonly title: string;
  readonly description: string;
  readonly fitnessLevel: FitnessLevel;
  readonly goal: FitnessGoal;
  readonly duration: number;
}

export class CreateWorkoutPlanCommandHandler {
  constructor(
    private readonly workoutPlanRepository: WorkoutPlanRepository,
    private readonly eventBus: EventBus
  ) {}

  async handle(command: CreateWorkoutPlanCommand): Promise<void> {
    // Validate command
    this.validateCommand(command);
    
    // Create domain entity
    const workoutPlan = WorkoutPlan.create(command);
    
    // Persist changes
    await this.workoutPlanRepository.save(workoutPlan);
    
    // Publish domain events
    const events = workoutPlan.getUncommittedEvents();
    await this.eventBus.publishAll(events);
    
    // Mark events as committed
    workoutPlan.markEventsAsCommitted();
  }

  private validateCommand(command: CreateWorkoutPlanCommand): void {
    if (!command.userId) {
      throw new ValidationError('User ID is required');
    }
    if (!command.title?.trim()) {
      throw new ValidationError('Title is required');
    }
    // Additional validation logic
  }
}
```

### Query Structure
```typescript
// application/queries/GetUserWorkoutPlansQuery.ts
export interface GetUserWorkoutPlansQuery {
  readonly userId: string;
  readonly page?: number;
  readonly limit?: number;
  readonly fitnessLevel?: FitnessLevel;
}

export interface WorkoutPlanSummary {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly fitnessLevel: string;
  readonly duration: number;
  readonly createdAt: Date;
}

export class GetUserWorkoutPlansQueryHandler {
  constructor(
    private readonly readModelRepository: WorkoutPlanReadModelRepository
  ) {}

  async handle(query: GetUserWorkoutPlansQuery): Promise<WorkoutPlanSummary[]> {
    return await this.readModelRepository.findByUserId(
      query.userId,
      {
        page: query.page || 1,
        limit: query.limit || 10,
        fitnessLevel: query.fitnessLevel,
      }
    );
  }
}
```

### Domain Events
```typescript
// domain/events/WorkoutPlanCreatedEvent.ts
export class WorkoutPlanCreatedEvent implements DomainEvent {
  readonly eventId: string;
  readonly aggregateId: string;
  readonly eventType = 'WorkoutPlanCreated';
  readonly occurredOn: Date;
  readonly eventVersion = 1;

  constructor(
    public readonly workoutPlanId: string,
    public readonly userId: string,
    public readonly title: string,
    public readonly fitnessLevel: FitnessLevel,
    public readonly goal: FitnessGoal
  ) {
    this.eventId = generateUUID();
    this.aggregateId = workoutPlanId;
    this.occurredOn = new Date();
  }
}
```

### Event Projections
```typescript
// infrastructure/projections/WorkoutPlanProjection.ts
export class WorkoutPlanProjection {
  constructor(
    private readonly readModelRepository: WorkoutPlanReadModelRepository
  ) {}

  @EventHandler(WorkoutPlanCreatedEvent)
  async handleWorkoutPlanCreated(event: WorkoutPlanCreatedEvent): Promise<void> {
    const readModel: WorkoutPlanReadModel = {
      id: event.workoutPlanId,
      userId: event.userId,
      title: event.title,
      fitnessLevel: event.fitnessLevel,
      goal: event.goal,
      createdAt: event.occurredOn,
      updatedAt: event.occurredOn,
    };

    await this.readModelRepository.save(readModel);
  }

  @EventHandler(WorkoutPlanUpdatedEvent)
  async handleWorkoutPlanUpdated(event: WorkoutPlanUpdatedEvent): Promise<void> {
    await this.readModelRepository.update(event.workoutPlanId, {
      title: event.title,
      description: event.description,
      updatedAt: event.occurredOn,
    });
  }
}
```

### Command Bus Implementation
```typescript
// infrastructure/messaging/CommandBus.ts
export class CommandBus {
  private readonly handlers = new Map<string, CommandHandler>();

  register<T>(commandType: new (...args: any[]) => T, handler: CommandHandler<T>): void {
    this.handlers.set(commandType.name, handler);
  }

  async execute<T>(command: T): Promise<void> {
    const commandName = command.constructor.name;
    const handler = this.handlers.get(commandName);

    if (!handler) {
      throw new Error(`No handler registered for command: ${commandName}`);
    }

    try {
      await handler.handle(command);
    } catch (error) {
      // Log error and potentially retry
      console.error(`Error executing command ${commandName}:`, error);
      throw error;
    }
  }
}
```

### Query Bus Implementation
```typescript
// infrastructure/messaging/QueryBus.ts
export class QueryBus {
  private readonly handlers = new Map<string, QueryHandler>();

  register<T, R>(queryType: new (...args: any[]) => T, handler: QueryHandler<T, R>): void {
    this.handlers.set(queryType.name, handler);
  }

  async execute<T, R>(query: T): Promise<R> {
    const queryName = query.constructor.name;
    const handler = this.handlers.get(queryName) as QueryHandler<T, R>;

    if (!handler) {
      throw new Error(`No handler registered for query: ${queryName}`);
    }

    try {
      return await handler.handle(query);
    } catch (error) {
      console.error(`Error executing query ${queryName}:`, error);
      throw error;
    }
  }
}
```

## Benefits

### Performance
- **Read Optimization**: Read models optimized for specific queries
- **Write Optimization**: Commands focus on business logic
- **Scalability**: Independent scaling of read and write sides
- **Caching**: Read models can be heavily cached

### Maintainability
- **Separation of Concerns**: Clear distinction between reads and writes
- **Testability**: Easy to test commands and queries independently
- **Flexibility**: Different storage strategies for reads and writes
- **Auditability**: Complete event history for compliance

### Business Value
- **Complex Business Logic**: Commands can implement sophisticated rules
- **Reporting**: Optimized read models for analytics
- **Event Sourcing**: Complete audit trail of all changes
- **Temporal Queries**: Query state at any point in time

## Trade-offs

### Complexity
- **Learning Curve**: Team needs to understand CQRS concepts
- **More Code**: Separate models for reads and writes
- **Eventual Consistency**: Read models may lag behind writes

### Mitigation Strategies
- **Training**: Comprehensive team training on CQRS
- **Documentation**: Clear examples and guidelines
- **Tooling**: Code generators for boilerplate
- **Monitoring**: Track projection lag and performance

## Testing Strategy

### Command Testing
```typescript
describe('CreateWorkoutPlanCommandHandler', () => {
  it('should create workout plan and publish events', async () => {
    // Arrange
    const command = new CreateWorkoutPlanCommand(/* ... */);
    const mockRepository = createMockRepository();
    const mockEventBus = createMockEventBus();
    const handler = new CreateWorkoutPlanCommandHandler(mockRepository, mockEventBus);

    // Act
    await handler.handle(command);

    // Assert
    expect(mockRepository.save).toHaveBeenCalledWith(expect.any(WorkoutPlan));
    expect(mockEventBus.publishAll).toHaveBeenCalledWith(expect.any(Array));
  });
});
```

### Query Testing
```typescript
describe('GetUserWorkoutPlansQueryHandler', () => {
  it('should return user workout plans', async () => {
    // Arrange
    const query = new GetUserWorkoutPlansQuery({ userId: 'user-123' });
    const mockRepository = createMockReadModelRepository();
    const handler = new GetUserWorkoutPlansQueryHandler(mockRepository);

    // Act
    const result = await handler.handle(query);

    // Assert
    expect(result).toHaveLength(2);
    expect(mockRepository.findByUserId).toHaveBeenCalledWith('user-123', expect.any(Object));
  });
});
```

## Related ADRs
- ADR-001: Hexagonal Architecture
- ADR-003: Plugin Architecture
- ADR-004: Event Sourcing Implementation

---
**Author**: Architecture Team  
**Reviewers**: Development Team, Product Team  
**Next Review**: July 26, 2025
