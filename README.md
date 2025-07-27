# 🏋️ FitnessApp - Complete Fitness Tracking Solution

[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

> A comprehensive fitness tracking application built with modern web technologies, featuring personalized workout plans, progress tracking, and achievement systems.

## 🌟 **Live Demo**

🚀 **Staging Environment:** [https://fitness-app-bupe-staging.web.app](https://fitness-app-bupe-staging.web.app)

## 🎯 Overview

### 🎯 **Core Features**
- **🔐 Secure Authentication** - Firebase Auth with Google Sign-in
- **📋 Smart Onboarding** - 8-step personalized setup process
- **📊 Dynamic Dashboard** - Real-time progress tracking and analytics
- **🏋️ Workout Planning** - AI-generated personalized workout plans
- **🏆 Achievement System** - Badges and milestones to keep you motivated
- **⚙️ Comprehensive Settings** - Profile management with enterprise-grade security

### 🛡️ **Security & Privacy**
- **🔒 Password Security** - Industry-standard bcrypt/scrypt hashing
- **🔐 Secure Authentication** - Firebase Auth with multi-factor support
- **🛡️ Data Protection** - HTTPS/TLS 1.3 encryption for all data transmission
- **🔑 Privacy Controls** - Granular privacy settings and data management

### 📱 **User Experience**
- **🌓 Dark/Light Theme** - Automatic theme switching based on user preference
- **📱 Responsive Design** - Optimized for mobile, tablet, and desktop
- **♿ Accessibility** - WCAG 2.1 AA compliant with full keyboard navigation
- **⚡ Performance** - Optimized loading with code splitting and caching

### 📈 **Progress Tracking**
- **📊 Real-time Analytics** - Weekly and monthly progress visualization
- **🎯 Goal Management** - Smart goal setting and tracking
- **📅 Calendar Integration** - Workout scheduling and planning
- **🏃 Activity Logging** - Comprehensive workout and activity tracking

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

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+
- npm or pnpm
- Firebase account
- Git

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/BUPE-NONDO/fitnessapp2.git
   cd fitnessapp2
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp apps/web/.env.example apps/web/.env
   # Edit .env with your Firebase configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   ```
   http://localhost:3000
   ```

## 🧪 **Testing**

```bash
# Run unit tests
npm run test

# Run integration tests
npm run test:integration

# Run e2e tests
npm run test:e2e

# Generate coverage report
npm run test:coverage
```

## 🚀 **Deployment**

### **Firebase Hosting**
```bash
# Build for production
npm run build

# Deploy to Firebase
npm run deploy

# Deploy to staging
npm run deploy:staging
```

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 👨‍💻 **Author**

**Bupe Nondo**
- GitHub: [@BUPE-NONDO](https://github.com/BUPE-NONDO)
- Email: peternondo1@gmail.com

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <strong>Built with ❤️ for fitness enthusiasts everywhere</strong>
</div>

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
