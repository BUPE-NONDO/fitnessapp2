# Contributing to FitnessApp

Thank you for your interest in contributing to FitnessApp! This document provides guidelines and information for contributors.

## 🎯 Getting Started

### Prerequisites

- Node.js 18+
- PNPM 8+
- Firebase CLI
- Git
- Basic knowledge of React, TypeScript, and Firebase

### Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/your-username/FitnessApp.git
   cd FitnessApp
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Setup environment**
   ```bash
   cp .env.example .env.local
   # Configure your Firebase settings
   ```

4. **Start development environment**
   ```bash
   pnpm emulators  # Start Firebase emulators
   pnpm dev        # Start development server
   ```

## 📋 How to Contribute

### 1. Find an Issue

- Check the [Project Board](https://github.com/users/BUPE-NONDO/projects/2)
- Look for issues labeled `good first issue` or `help wanted`
- Review the current [Milestones](https://github.com/BUPE-NONDO/FitnessApp/milestones)

### 2. Create a Branch

```bash
git checkout -b feature/issue-number-description
# Examples:
# git checkout -b feature/123-add-goal-creation
# git checkout -b fix/456-auth-redirect-bug
```

### 3. Make Changes

- Follow the coding standards below
- Write tests for new functionality
- Update documentation as needed
- Ensure all checks pass locally

### 4. Submit a Pull Request

- Use the provided PR template
- Link to related issues
- Provide clear description of changes
- Ensure CI checks pass

## 🎨 Coding Standards

### TypeScript

- Use strict TypeScript configuration
- Prefer explicit types over `any`
- Use Zod for runtime validation
- Follow functional programming patterns where possible

### React

- Use functional components with hooks
- Prefer composition over inheritance
- Use React Hook Form for forms
- Implement proper error boundaries

### Styling

- Use Tailwind CSS for styling
- Follow shadcn/ui component patterns
- Ensure responsive design (mobile-first)
- Maintain consistent spacing and typography

### Code Organization

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── hooks/         # Custom React hooks
├── lib/           # Utility functions
├── types/         # TypeScript type definitions
└── styles/        # Global styles and Tailwind config
```

## 🧪 Testing Guidelines

### Unit Tests

- Write tests for all utility functions
- Test custom hooks thoroughly
- Use Vitest and Testing Library
- Aim for >80% coverage

### Component Tests

- Test user interactions
- Test different component states
- Mock external dependencies
- Focus on behavior, not implementation

### E2E Tests

- Test critical user flows
- Use Playwright for browser testing
- Test across different browsers
- Include accessibility testing

### Running Tests

```bash
pnpm test              # Unit tests
pnpm test:e2e          # E2E tests
pnpm test:coverage     # Coverage report
```

## 📝 Commit Guidelines

### Commit Message Format

```
type(scope): description

[optional body]

[optional footer]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
git commit -m "feat(auth): add password reset functionality"
git commit -m "fix(dashboard): resolve goal deletion bug"
git commit -m "docs: update API documentation"
```

## 🏷️ Issue Labels

### Type Labels
- `frontend` - Frontend/UI tasks
- `backend` - Backend/API tasks
- `database` - Database related
- `authentication` - Auth features
- `testing` - Testing tasks
- `devops` - CI/CD and deployment
- `documentation` - Documentation updates

### Priority Labels
- `priority:high` - Critical issues
- `priority:medium` - Important features
- `priority:low` - Nice to have

### Status Labels
- `good first issue` - Beginner friendly
- `help wanted` - Community help needed
- `blocked` - Waiting on dependencies
- `in progress` - Currently being worked on

## 🔍 Code Review Process

### For Contributors

- Ensure all CI checks pass
- Respond to feedback promptly
- Keep PRs focused and small
- Update documentation as needed

### For Reviewers

- Be constructive and helpful
- Focus on code quality and maintainability
- Check for security issues
- Verify tests are adequate

## 🚀 Release Process

1. **Feature Development**: Work on feature branches
2. **Code Review**: Submit PR for review
3. **Testing**: Ensure all tests pass
4. **Staging Deploy**: Automatic preview deployment
5. **Production Deploy**: Manual promotion after approval

## 📚 Resources

### Documentation
- [Technical Design Document](./docs/technical-design-doc.md)
- [Development Roadmap](./docs/todo.md)
- [Firebase Documentation](https://firebase.google.com/docs)
- [React Documentation](https://react.dev/)

### Tools
- [Storybook](http://localhost:6006) - Component library
- [Firebase Console](https://console.firebase.google.com/)
- [GitHub Project Board](https://github.com/users/BUPE-NONDO/projects/2)

## ❓ Getting Help

- **Questions**: Open a [Discussion](https://github.com/BUPE-NONDO/FitnessApp/discussions)
- **Bugs**: Create an [Issue](https://github.com/BUPE-NONDO/FitnessApp/issues/new)
- **Features**: Submit a [Feature Request](https://github.com/BUPE-NONDO/FitnessApp/issues/new)

## 🙏 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

Thank you for contributing to FitnessApp! 🎉
