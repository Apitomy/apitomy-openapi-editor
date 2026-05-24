# Contributing to Apitomy OpenAPI Editor

Thank you for your interest in contributing to the Apitomy OpenAPI Editor!

## Getting Started

1. Fork the repository
2. Clone your fork locally
3. Install dependencies: `npm install`
4. Create a feature branch: `git checkout -b feature/your-feature-name`
5. Make your changes
6. Run the linter: `npm run lint`
7. Build the project: `npm run build`
8. Commit your changes
9. Push to your fork
10. Create a Pull Request

## Code Style

This project uses:

- **TypeScript** with strict mode enabled
- **ESLint** for code linting
- **4-space indentation** (following the project owner's preference)
- **React best practices** including hooks and functional components
- **PatternFly 6** components for UI

## Commit Guidelines

- Write clear, descriptive commit messages
- Reference issue numbers when applicable
- Keep commits focused on a single change

## Pull Request Process

1. Ensure your code passes linting: `npm run lint`
2. Ensure the project builds successfully: `npm run build`
3. Update documentation if you've changed APIs
4. Describe your changes clearly in the PR description
5. Link to any related issues

## Development Workflow

### Project Structure

```
src/
├── components/     # React components
├── services/       # Business logic services
├── stores/         # Zustand stores
├── hooks/          # Custom React hooks
├── models/         # TypeScript types/interfaces
├── commands/       # Custom commands
└── utils/          # Utility functions
```

### Adding New Features

1. Review the implementation plan in `docs/IMPLEMENTATION_PLAN.md`
2. Discuss larger changes in an issue first
3. Follow the existing architectural patterns
4. Use Zustand for state management
5. Use the command pattern for mutations
6. Add TypeScript types for all new code

## Questions?

If you have questions, please open an issue on GitHub.
