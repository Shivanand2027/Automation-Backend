# Contributing to AI-Powered GitHub Automation Platform

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Code of Conduct

Please be respectful and constructive in all interactions.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported
2. Create a detailed issue with:
   - Clear title
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details
   - Screenshots if applicable

### Suggesting Features

1. Check existing feature requests
2. Create an issue with:
   - Clear description
   - Use case
   - Proposed implementation
   - Benefits

### Pull Requests

1. **Fork the repository**

2. **Create a branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes:**
   - Follow the code style
   - Add tests if applicable
   - Update documentation

4. **Commit your changes:**
   ```bash
   git commit -m "feat: add amazing feature"
   ```
   
   Use conventional commits:
   - `feat:` New feature
   - `fix:` Bug fix
   - `docs:` Documentation
   - `style:` Formatting
   - `refactor:` Code restructuring
   - `test:` Adding tests
   - `chore:` Maintenance

5. **Push to your fork:**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Open a Pull Request:**
   - Describe your changes
   - Reference related issues
   - Wait for review

## Development Setup

```bash
# Clone your fork
git clone https://github.com/your-username/github-automation-platform.git

# Install dependencies
npm run install:all

# Set up environment variables
cp .env.example .env

# Start development
npm run dev
```

## Code Style

- Use TypeScript
- Follow ESLint rules
- Use meaningful variable names
- Comment complex logic
- Keep functions small and focused

## Testing

```bash
# Run tests (when available)
npm test

# Lint code
npm run lint
```

## Documentation

- Update README.md for feature changes
- Add JSDoc comments to functions
- Update API documentation
- Include examples

## Questions?

Feel free to open an issue for any questions or clarifications.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
