# Mutation Testing

This project uses [Stryker Mutator](https://stryker-mutator.io/) for mutation testing to ensure the quality and effectiveness of our test suite.

## What is Mutation Testing?

Mutation testing is a technique to evaluate the quality of software tests. It works by making small changes (mutations) to your code and checking if your tests catch these changes. If a test fails after a mutation, the mutant is "killed" (good!). If all tests pass despite the mutation, the mutant "survived" (indicates a gap in test coverage).

## Running Mutation Tests

### Locally

Run mutation tests with:

```bash
npm run test:mutation
```

This will:
1. Create mutants of your source code
2. Run the test suite against each mutant
3. Generate an HTML report in `reports/mutation/mutation.html`

### In CI

Mutation tests run automatically as part of the CI pipeline after regular tests pass. The mutation report is uploaded as an artifact for each CI run.

## Configuration

### Files Tested

Currently, mutation testing covers:
- `background.js` - Background script
- `block.js` - Block page logic
- `content.js` - Content script
- `popup.js` - Popup UI logic

### Configuration Files

- **`stryker.conf.json`**: Main Stryker configuration
- **`jest.stryker.config.js`**: Custom Jest configuration for mutation testing that excludes some test files

### Thresholds

Current thresholds are set to allow mutation testing to pass even with low scores:
- **High**: 60%
- **Low**: 40%
- **Break**: null (won't fail the build)

These thresholds are intentionally lenient for the initial setup and can be tightened as test coverage improves.

## Improving Mutation Score

A low mutation score indicates opportunities to improve your tests:

1. **Review survived mutants**: Check the mutation report to see which mutations weren't caught
2. **Add assertions**: Ensure tests verify behavior, not just that code runs
3. **Test edge cases**: Add tests for boundary conditions and error scenarios
4. **Remove redundant code**: If a mutation survives consistently, the code might be unnecessary

## Excluded Files

Some files are excluded from mutation testing:
- Files without corresponding tests (e.g., `migration-helper.js`, `api-service.js`)
- Test files themselves
- Configuration files
- Generated files and dependencies

## Resources

- [Stryker Mutator Documentation](https://stryker-mutator.io/docs/)
- [Mutation Testing Handbook](https://stryker-mutator.io/docs/mutation-testing-elements/introduction)
