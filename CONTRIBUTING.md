# Contributing

Thank you for your interest in contributing to vite-oxc-decorator-stage-3!

## Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/nyanrus/vite-oxc-decorator-stage-3.git
   cd vite-oxc-decorator-stage-3
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   npm run build
   ```

4. Run tests:
   ```bash
   npm test
   ```

## Project Structure

```
vite-oxc-decorator-stage-3/
├── src/
│   └── index.ts          # Main plugin implementation
├── test/
│   ├── decorators.test.ts # Tests for decorator transformations
│   └── plugin.test.ts     # Tests for plugin functionality
├── examples/
│   ├── example.ts         # Simple examples
│   ├── comprehensive-example.ts # Comprehensive demo
│   └── vite.config.ts     # Example configuration
├── dist/                  # Built output (generated)
├── IMPLEMENTATION.md      # Implementation details
└── README.md             # User documentation
```

## Making Changes

1. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** and ensure:
   - Code follows existing style
   - Tests pass: `npm test`
   - Build succeeds: `npm run build`
   - Examples work: Test in `examples/` directory

3. **Add tests** for new features:
   - Add test cases to `test/decorators.test.ts` or `test/plugin.test.ts`
   - Ensure tests cover edge cases
   - All tests should pass

4. **Update documentation**:
   - Update README.md if adding new features
   - Update IMPLEMENTATION.md if changing architecture
   - Add JSDoc comments to new functions

5. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: description of your changes"
   ```

## Commit Message Convention

Follow conventional commits:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `test:` Test changes
- `refactor:` Code refactoring
- `chore:` Build/tooling changes

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

### Test Categories

1. **Decorator Transformation Tests** (`test/decorators.test.ts`):
   - Test each decorator type
   - Verify correct transformation
   - Cover edge cases

2. **Plugin Tests** (`test/plugin.test.ts`):
   - Test plugin configuration
   - Test file filtering
   - Test integration with Vite

### Adding Tests

When adding new features, include tests that verify:
1. Successful transformation
2. Correct output format
3. Edge cases and error handling
4. Integration with existing features

## Code Style

- Use TypeScript
- Follow existing code style
- Add JSDoc comments for public APIs
- Keep functions focused and small
- Use descriptive variable names

## Pull Request Process

1. Update the README.md with details of changes if applicable
2. Update CHANGELOG.md with your changes
3. Ensure all tests pass
4. Update examples if adding new features
5. Request review from maintainers

## Questions?

Feel free to open an issue for:
- Bug reports
- Feature requests
- Questions about usage
- Questions about contributing

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
