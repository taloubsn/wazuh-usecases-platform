# Contributing to Wazuh Use Cases Platform

First off, thank you for considering contributing to the Wazuh Use Cases Platform! It's people like you that make this project a great tool for the cybersecurity community.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

This section guides you through submitting a bug report. Following these guidelines helps maintainers and the community understand your report, reproduce the behavior, and find related reports.

**Before Submitting A Bug Report**
- Check the debugging guide
- Check the FAQ
- Perform a cursory search to see if the problem has already been reported

**How Do I Submit A Bug Report?**
- Use the GitHub issue tracker
- Use a clear and descriptive title
- Describe the exact steps which reproduce the problem
- Provide specific examples to demonstrate the steps
- Include screenshots and animated GIFs if possible
- Include your environment details (OS, Docker version, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- Use a clear and descriptive title
- Provide a step-by-step description of the suggested enhancement
- Provide specific examples to demonstrate the steps
- Describe the current behavior and explain which behavior you expected to see instead
- Explain why this enhancement would be useful

### Pull Requests

The process described here has several goals:
- Maintain the project's quality
- Fix problems that are important to users
- Engage the community in working toward the best possible Wazuh platform

Please follow these steps to have your contribution considered by the maintainers:

1. Follow the style guides
2. After you submit your pull request, verify that all status checks are passing

## Development Setup

### Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for frontend development)
- Python 3.9+ (for backend development)
- Git

### Setting Up Your Development Environment

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/yourusername/wazuh-usecases-platform.git
   cd wazuh-usecases-platform
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start the development environment**
   ```bash
   docker-compose up -d
   ```

### Backend Development

1. **Set up Python environment**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. **Run backend in development mode**
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

3. **Run tests**
   ```bash
   pytest
   pytest --cov=app tests/  # With coverage
   ```

### Frontend Development

1. **Set up Node.js environment**
   ```bash
   cd frontend
   npm install
   ```

2. **Run frontend in development mode**
   ```bash
   npm run dev
   ```

3. **Run tests**
   ```bash
   npm test
   npm run test:coverage  # With coverage
   ```

4. **Lint and format**
   ```bash
   npm run lint
   npm run format
   ```

## Style Guides

### Git Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line
- Consider starting the commit message with an applicable emoji:
  - 🎨 `:art:` when improving the format/structure of the code
  - 🐛 `:bug:` when fixing a bug
  - ✨ `:sparkles:` when introducing new features
  - 📝 `:memo:` when writing docs
  - 🔧 `:wrench:` when updating configuration files
  - ✅ `:white_check_mark:` when adding tests
  - 🔒 `:lock:` when dealing with security

### Python Style Guide

- Follow PEP 8
- Use type hints where appropriate
- Document functions and classes with docstrings
- Use meaningful variable and function names
- Maximum line length: 88 characters (Black formatter)

### JavaScript/TypeScript Style Guide

- Use TypeScript for new code
- Follow the existing ESLint configuration
- Use meaningful variable and function names
- Prefer const/let over var
- Use async/await over Promise chains
- Document complex functions with JSDoc comments

### CSS/Styling

- Use Ant Design components whenever possible
- Follow BEM methodology for custom CSS classes
- Use CSS-in-JS with styled-components or emotion
- Maintain consistency with the existing design system

## Testing Guidelines

### Backend Testing

- Write unit tests for all new functions
- Write integration tests for API endpoints
- Ensure all tests pass before submitting PR
- Maintain or improve code coverage

### Frontend Testing

- Write unit tests for components
- Write integration tests for user flows
- Test accessibility features
- Ensure all tests pass before submitting PR

## Documentation

- Update the README.md if you change functionality
- Update API documentation for backend changes
- Add inline documentation for complex code
- Update the changelog for user-facing changes

## Community

- Join our discussions on GitHub
- Be respectful and constructive
- Help other contributors
- Share your ideas and feedback

## Recognition

Contributors who make significant contributions will be recognized in:
- The README.md file
- Release notes
- Project documentation

## Questions?

Feel free to open an issue with the "question" label or start a discussion if you have any questions about contributing.

Thank you for contributing! 🎉