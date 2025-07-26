# Contributing to Centivo API

Thank you for considering contributing to the Centivo API project! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to abide by its Code of Conduct. Please report unacceptable behavior to project maintainers.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the issue list to avoid duplicates. When creating a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the bug**
- **Provide specific examples** (e.g., curl commands)
- **Describe the behavior you observed and why it's a problem**
- **Include screenshots or console output if applicable**
- **Include details about your environment** (OS, Node.js version, MongoDB version)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a detailed description of the suggested enhancement**
- **Explain why this enhancement would be useful**
- **List any alternative solutions you've considered**

### Pull Requests

- Fill in the required template
- Follow the JavaScript style guide
- Include tests for new features or bug fixes
- Update documentation for API changes
- Ensure all tests pass before submitting

## Development Setup

1. Fork and clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file based on `.env.example`
4. Run tests to ensure everything is working: `npm test`

## Development Workflow

1. Create a new branch from `dev`: `git checkout -b feature/your-feature-name`
2. Make your changes
3. Add tests for your changes
4. Run tests: `npm test`
5. Update documentation if needed
6. Commit your changes following the commit message guidelines
7. Push to your fork and submit a pull request

## Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` A new feature
- `fix:` A bug fix
- `docs:` Documentation only changes
- `style:` Changes that do not affect the meaning of the code
- `refactor:` A code change that neither fixes a bug nor adds a feature
- `perf:` A code change that improves performance
- `test:` Adding missing tests or correcting existing tests
- `chore:` Changes to the build process or auxiliary tools

Examples:
- `feat: add user authentication endpoint`
- `fix: handle invalid ObjectId in user lookup`
- `docs: update API documentation for user endpoints`

## Testing Guidelines

- Write tests for all new features and bug fixes
- Aim for high test coverage
- Use descriptive test names that explain what is being tested
- Structure tests with arrange-act-assert pattern
- Mock external dependencies

## Style Guide

We use ESLint to enforce code style. Run `npm run lint` to check your code.

Key style points:
- Use 2 spaces for indentation
- Use semicolons
- Use single quotes for strings
- No unused variables
- No console.log in production code (use proper logging)

## Documentation Guidelines

- Keep API documentation up-to-date
- Document all public methods and functions
- Include examples for API endpoints
- Update README.md when adding major features

## Versioning

We use [SemVer](http://semver.org/) for versioning:
- MAJOR version for incompatible API changes
- MINOR version for backwards-compatible functionality additions
- PATCH version for backwards-compatible bug fixes

## License

By contributing, you agree that your contributions will be licensed under the project's MIT License.
