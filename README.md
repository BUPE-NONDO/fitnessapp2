# 🏋️ FitnessApp

A modern fitness tracking application that helps users set, monitor, and achieve fitness goals through personalized dashboards and data-driven progress tracking.

## 🎯 Overview

FitnessApp enables users to:
- Set measurable health and fitness goals
- Log progress with detailed context (weight, reps, distance, etc.)
- Visualize progress and habits over time
- Track streaks and earn achievement badges
- Monitor goal completion rates and personal records

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React + Vite + TypeScript |
| **UI Framework** | shadcn/ui (Radix + Tailwind) |
| **State Management** | TanStack Query |
| **Forms** | React Hook Form + Zod |
| **API Layer** | tRPC (typed, router-based) |
| **Backend** | Firebase Cloud Functions |
| **Database** | Firestore |
| **Authentication** | Firebase Auth |
| **Hosting** | Firebase Hosting |
| **Monorepo** | PNPM workspaces + Turborepo |
| **Testing** | Vitest + Playwright + Storybook |
| **CI/CD** | GitHub Actions |

## 📁 Project Structure

```
.
├── apps/
│   └── web/            # React frontend application
├── functions/          # Firebase Cloud Functions + tRPC
├── packages/
│   ├── shared/         # Zod schemas, utils, types
│   └── seeding/        # Firestore seeding scripts
├── docs/               # Technical documentation
│   ├── technical-design-doc.md
│   └── todo.md
└── .github/            # GitHub workflows and templates
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PNPM 8+
- Firebase CLI
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/BUPE-NONDO/FitnessApp.git
   cd FitnessApp
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Firebase configuration
   ```

4. **Start Firebase emulators**
   ```bash
   pnpm emulators
   ```

5. **Start development server**
   ```bash
   pnpm dev
   ```

6. **Seed development data** (optional)
   ```bash
   pnpm seed
   ```

## 📋 Development Workflow

### Available Scripts

```bash
# Development
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm preview          # Preview production build

# Testing
pnpm test             # Run unit tests
pnpm test:e2e         # Run E2E tests
pnpm test:coverage    # Generate coverage report

# Code Quality
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix ESLint issues
pnpm typecheck        # Run TypeScript checks
pnpm format           # Format with Prettier

# Firebase
pnpm emulators        # Start Firebase emulators
pnpm deploy:staging   # Deploy to staging
pnpm deploy:prod      # Deploy to production

# Database
pnpm seed             # Seed development data
pnpm db:reset         # Reset database
```

### Git Workflow

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes and commit: `git commit -m "feat: add new feature"`
3. Push branch: `git push origin feature/your-feature`
4. Create Pull Request
5. After review, merge to main

## 🏗️ Architecture

```
Client (React + TanStack Query)
     ⇄
tRPC (Cloud Functions)
     ⇄
Firestore + Firebase Auth
```

### Data Model

| Entity | Key Fields | Notes |
|--------|------------|-------|
| **User** | uid, email, name, avatar | Auth via Firebase |
| **Goal** | id, userId, title, metric, frequency, target | User's fitness goals |
| **LogEntry** | id, goalId, date, value, notes | Activity logs |
| **Badge** | id, userId, title, unlockedAt | Achievement system |

## 🧪 Testing Strategy

- **Unit Tests**: Vitest for pure functions and utilities
- **Component Tests**: Testing Library for React components
- **E2E Tests**: Playwright for critical user flows
- **Visual Tests**: Storybook for component documentation
- **Coverage Target**: ≥80% statements

## 🚀 Deployment

### Environments

| Environment | URL | Purpose |
|-------------|-----|---------|
| **Local** | `http://localhost:5173` | Development with emulators |
| **Staging** | Firebase preview channels | PR previews |
| **Production** | `https://app.yourdomain.com` | Live application |

### CI/CD Pipeline

1. **PR Checks**: Lint, typecheck, test, build
2. **Preview Deploy**: Automatic staging deployment
3. **Production Deploy**: Manual promotion after approval
4. **Monitoring**: Error tracking and performance monitoring

## 📖 Documentation

- [Technical Design Document](./docs/technical-design-doc.md)
- [Development Roadmap](./docs/todo.md)
- [API Documentation](./docs/api.md) (Coming soon)
- [Component Library](./storybook) (Coming soon)

## 🤝 Contributing

1. Check the [Project Board](https://github.com/users/BUPE-NONDO/projects/2) for available tasks
2. Read the [Technical Design Document](./docs/technical-design-doc.md)
3. Follow the development workflow above
4. Ensure all tests pass and code is properly formatted
5. Submit a Pull Request with clear description

### Issue Labels

- `frontend` - Frontend/UI related tasks
- `backend` - Backend/API related tasks
- `database` - Database and data modeling
- `authentication` - Auth and authorization
- `testing` - Testing related tasks
- `devops` - CI/CD and deployment
- `performance` - Performance optimization
- `accessibility` - Accessibility improvements
- `priority:high/medium/low` - Task priority levels

## 📊 Project Status

### Current Milestone: **Milestone 1 - Project & Environment Setup**

**Progress**: 5/5 issues
- ✅ Create GitHub repo and documentation
- ✅ Setup monorepo structure
- ✅ Create Firebase project
- 🔄 Deploy to staging
- 🔄 Validate authentication

[View all milestones →](https://github.com/BUPE-NONDO/FitnessApp/milestones)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [T3 Stack](https://create.t3.gg/) for the technology foundation
- [shadcn/ui](https://ui.shadcn.com/) for the component library
- [Firebase](https://firebase.google.com/) for backend services
fitness tracking app
