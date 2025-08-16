# Contributing to Cartridge

Thank you for your interest in contributing to Cartridge! This document provides guidelines and information for contributors.

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 8.0.0
- Git

### Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/cartridge.git
   cd cartridge
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Running the Project

- **Development mode**: `npm run dev`
- **Build for production**: `npm run build`
- **Run tests**: `npm test`
- **Run linting**: `npm run lint`
- **Type checking**: `npm run type-check`

### Code Quality

We use several tools to maintain code quality:

- **ESLint**: Code linting
- **Prettier**: Code formatting
- **TypeScript**: Type checking
- **Jest**: Testing
- **Husky**: Git hooks
- **Commitlint**: Commit message validation

### Git Hooks

The project uses Husky to run pre-commit and pre-push hooks:

- **Pre-commit**: Runs lint-staged (ESLint + Prettier)
- **Commit-msg**: Validates commit message format
- **Pre-push**: Runs full validation (lint + type-check + tests)

### Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**

- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `ci`: CI/CD changes
- `build`: Build system changes

**Examples:**

```bash
feat(wallet): add account creation functionality
fix(ui): resolve popup sizing issue
docs(readme): update installation instructions
```

### Interactive Commits

Use the interactive commit tool:

```bash
npm run commit
```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Writing Tests

- Write tests for new features
- Ensure all tests pass before submitting PR
- Aim for good test coverage

## Pull Request Process

1. **Create a feature branch** from `main`
2. **Make your changes** following the coding standards
3. **Write/update tests** for your changes
4. **Run the validation suite**:
   ```bash
   npm run validate
   ```
5. **Commit your changes** using conventional commits
6. **Push to your fork** and create a pull request
7. **Fill out the PR template** completely
8. **Wait for review** and address any feedback

### PR Checklist

- [ ] Code follows the style guidelines
- [ ] Self-review of code completed
- [ ] Tests added/updated and passing
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Commit messages follow conventional format

## Code Standards

### TypeScript

- Use strict TypeScript configuration
- Provide proper type annotations
- Avoid `any` types when possible
- Use interfaces for object shapes

### React

- Use functional components with hooks
- Follow React best practices
- Use proper prop types
- Keep components focused and small

### Styling

- Use CSS-in-JS or CSS modules
- Follow BEM methodology for CSS classes
- Ensure responsive design
- Maintain accessibility standards

### Extension Development

- Follow Chrome Extension Manifest V3 guidelines
- Use proper security practices
- Handle errors gracefully
- Provide user-friendly error messages

## Issue Reporting

### Bug Reports

When reporting bugs, please include:

- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Environment details (browser, OS, extension version)
- Console logs or error messages
- Screenshots if applicable

### Feature Requests

When requesting features, please include:

- Clear description of the feature
- Use cases and benefits
- Mockups or examples if possible
- Technical considerations

## Getting Help

- Check existing issues and pull requests
- Join our Discord community
- Create an issue for questions or discussions

## License

By contributing to Cartridge, you agree that your contributions will be licensed under the MIT License.

## Recognition

Contributors will be recognized in the project's README and release notes.

Thank you for contributing to Cartridge! 🚀
