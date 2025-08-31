# 🤝 Contributing to Cartridge

Thank you for your interest in contributing to Cartridge! This document provides guidelines for contributing to the project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Commit Message Convention](#commit-message-convention)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Feature Requests](#feature-requests)

## 📜 Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please be respectful and inclusive in all interactions.

## 🚀 Getting Started

1. Fork the repository
2. Clone your fork locally
3. Install dependencies: `pnpm install`
4. Set up pre-commit hooks: `pnpm prepare`
5. Create a feature branch: `git checkout -b feature/your-feature-name`

## 📝 Commit Message Convention

We use [Conventional Commits](https://www.conventionalcommits.org/) for commit messages. This ensures a clean and readable git history.

### Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, etc.)
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **chore**: Changes to the build process or auxiliary tools
- **ci**: Changes to CI configuration files and scripts
- **build**: Changes that affect the build system or external dependencies
- **revert**: Reverts a previous commit
- **wip**: Work in progress
- **security**: Security fixes
- **contract**: Smart contract changes
- **ui**: UI/UX changes
- **api**: API changes

### Examples

```bash
# Feature
feat: add time-locked savings smart contract

# Bug fix
fix: resolve penalty calculation issue in withdrawal function

# Documentation
docs: update README with deployment instructions

# Smart contract changes
contract: implement penalty redistribution logic

# UI changes
ui: redesign savings dashboard layout

# Breaking change
feat!: change penalty calculation to use percentage instead of fixed amount

BREAKING CHANGE: Penalty calculation now uses percentage-based system
```

## 🔄 Development Workflow

1. **Create a feature branch** from `main` or `develop`
2. **Make your changes** following the coding standards
3. **Write tests** for new functionality
4. **Run the test suite** locally: `pnpm test`
5. **Run linting**: `pnpm lint`
6. **Run type checking**: `pnpm type-check`
7. **Commit your changes** using conventional commit format
8. **Push to your fork** and create a pull request

### Pre-commit Hooks

The project uses Husky to run pre-commit hooks automatically:

- **Linting**: Ensures code follows style guidelines
- **Type checking**: Validates TypeScript types
- **Commit message validation**: Ensures conventional commit format

### Running Tests

```bash
# Run all tests
pnpm test

# Run smart contract tests
pnpm contracts:test

# Run frontend tests
pnpm test --filter=web
```

## 🔀 Pull Request Process

1. **Update documentation** if needed
2. **Add tests** for new functionality
3. **Ensure all tests pass** locally
4. **Update the milestone** if your PR addresses a specific milestone item
5. **Request review** from maintainers
6. **Address feedback** and make necessary changes
7. **Merge** once approved

### PR Title Format

Use the same conventional commit format for PR titles:

```
feat: add time-locked savings smart contract
fix: resolve penalty calculation issue
docs: update deployment documentation
```

## 🐛 Reporting Bugs

When reporting bugs, please include:

1. **Clear description** of the issue
2. **Steps to reproduce** the problem
3. **Expected behavior** vs actual behavior
4. **Environment details** (OS, Node.js version, etc.)
5. **Screenshots** if applicable
6. **Console logs** or error messages

## 💡 Feature Requests

When requesting features, please:

1. **Describe the feature** clearly
2. **Explain the use case** and benefits
3. **Consider implementation** complexity
4. **Check existing issues** to avoid duplicates

## 🔧 Development Setup

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Git

### Environment Variables

Create a `.env` file in the root directory:

```env
# Celo Network
CELO_RPC_URL=https://alfajores-forno.celo-testnet.org
PRIVATE_KEY=your_private_key_here

# Optional: For mainnet deployment
CELO_MAINNET_RPC_URL=https://forno.celo.org
MAINNET_PRIVATE_KEY=your_mainnet_private_key_here
```

### Smart Contract Development

```bash
# Compile contracts
pnpm contracts:compile

# Run tests
pnpm contracts:test

# Deploy to local network
pnpm contracts:deploy

# Deploy to Alfajores testnet
pnpm contracts:deploy:alfajores
```

## 📞 Getting Help

- **Issues**: Use GitHub issues for bugs and feature requests
- **Discussions**: Use GitHub discussions for questions and general discussion
- **Documentation**: Check the README and milestone files

## 🎯 Milestone Contributions

When contributing to specific milestones:

1. **Check the milestone file** for current priorities
2. **Update milestone progress** in your PR description
3. **Link related issues** to the milestone
4. **Follow the weekly timeline** outlined in the milestone

Thank you for contributing to Cartridge! 🛡️
