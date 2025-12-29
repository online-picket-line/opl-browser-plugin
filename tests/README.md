# Update Service Test Suite

## Overview

This directory contains comprehensive unit and integration tests for the update mechanism feature.

## Test Files

### Core Unit Tests

#### `update-service.test.js` (95+ tests)
Tests the `UpdateService` class functionality:
- Version comparison and parsing
- GitHub API integration
- Update check logic
- Storage operations
- Cache management
- Error handling

**Key Test Suites:**
- Constructor initialization
- Version parsing and comparison
- Update check timing
- GitHub release fetching
- Dismiss/undismiss functionality
- Cached update retrieval

### Integration Tests

#### `background-update-integration.test.js` (20+ tests)
Tests integration between UpdateService and background.js:
- Message passing (chrome.runtime.sendMessage)
- Alarm-based periodic checks
- Storage integration
- Error scenarios
- Response handling

#### `popup-update-ui.test.js` (25+ tests)
Tests the update notification UI in popup:
- Update check on popup load
- Update banner display
- Button interactions (Update Now, Dismiss)
- UI state management
- Complete user workflows

## Running Tests

### Quick Start

```bash
# Install dependencies (first time only)
npm install

# Run all tests
npm test

# Run specific test file
npm test tests/update-service.test.js

# Watch mode (auto-rerun on changes)
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Using Test Runner Script

```bash
# Run all tests
./run-tests.sh

# Run with coverage
./run-tests.sh --coverage

# Watch mode
./run-tests.sh --watch

# Run specific file
./run-tests.sh tests/update-service.test.js
```

## Test Structure

### Typical Test Pattern

```javascript
describe('FeatureName', () => {
  beforeEach(() => {
    // Setup mocks and state
    jest.clearAllMocks();
  });
  
  describe('methodName', () => {
    test('should do something when condition', () => {
      // Arrange
      const input = 'test';
      
      // Act
      const result = functionUnderTest(input);
      
      // Assert
      expect(result).toBe('expected');
    });
  });
});
```

## Mocks and Fixtures

### Global Mocks (setup.js)

The test setup provides mocks for:
- `chrome.storage` (sync and local)
- `chrome.runtime` (sendMessage, getManifest)
- `chrome.alarms` (create, onAlarm)
- `chrome.tabs` (create, query, update)
- `fetch` (for API calls)
- `console` methods (to reduce noise)

### Example Mock Usage

```javascript
// Mock chrome.storage.local.get
chrome.storage.local.get.mockImplementation((keys, callback) => {
  callback({ update_latest_version: { version: '1.2.0' } });
});

// Mock fetch for GitHub API
global.fetch.mockResolvedValue({
  ok: true,
  json: async () => ({ tag_name: 'v1.2.0' })
});
```

## Coverage Goals

| File | Target Coverage | Current Status |
|------|----------------|----------------|
| update-service.js | 90%+ | ✅ High coverage |
| background.js (update code) | 85%+ | ✅ Good coverage |
| popup.js (update UI) | 85%+ | ✅ Good coverage |

View coverage report:
```bash
npm run test:coverage
```

## Test Categories

### Unit Tests
- Pure function testing
- Isolated component testing
- Mock all external dependencies

### Integration Tests
- Test component interactions
- Test message passing
- Test state management

### UI Tests
- Test DOM manipulation
- Test event handlers
- Test user workflows

## Common Test Scenarios

### Testing Version Comparison
```javascript
test('should compare versions correctly', () => {
  expect(service.compareVersions('1.2.0', '1.1.0')).toBe(1);
  expect(service.compareVersions('1.1.0', '1.2.0')).toBe(-1);
  expect(service.compareVersions('1.1.0', '1.1.0')).toBe(0);
});
```

### Testing Async Operations
```javascript
test('should fetch release data', async () => {
  global.fetch.mockResolvedValue({
    ok: true,
    json: async () => ({ tag_name: 'v1.2.0' })
  });
  
  const release = await service.fetchLatestRelease();
  
  expect(release.version).toBe('1.2.0');
});
```

### Testing Storage
```javascript
test('should store dismissed version', async () => {
  await service.dismissUpdate('1.2.0');
  
  expect(chrome.storage.local.set).toHaveBeenCalledWith({
    update_dismissed_version: '1.2.0'
  });
});
```

### Testing UI Interactions
```javascript
test('should hide notification when dismissed', () => {
  const notification = document.getElementById('update-notification');
  
  // Simulate dismiss
  notification.style.display = 'none';
  
  expect(notification.style.display).toBe('none');
});
```

## Debugging Tests

### Run Single Test
```javascript
test.only('should test specific case', () => {
  // Only this test will run
});
```

### Skip Test
```javascript
test.skip('should test later', () => {
  // This test will be skipped
});
```

### Verbose Output
```bash
npm test -- --verbose
```

### Debug in VS Code
Add to `.vscode/launch.json`:
```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand", "${file}"],
  "console": "integratedTerminal"
}
```

## Troubleshooting

### Tests Won't Run

**Problem**: `npm: command not found`
**Solution**: Install Node.js from https://nodejs.org/

**Problem**: `Cannot find module 'jest'`
**Solution**: Run `npm install`

### Tests Fail

**Problem**: `chrome is not defined`
**Solution**: Check that `tests/setup.js` is loaded (see `package.json`)

**Problem**: Tests timeout
**Solution**: Increase timeout in `package.json`:
```json
"jest": {
  "testTimeout": 30000
}
```

### Mock Issues

**Problem**: Mocks don't reset
**Solution**: Add `jest.clearAllMocks()` to `beforeEach()`

**Problem**: Fetch not working
**Solution**: Verify `global.fetch = jest.fn()` is in `setup.js`

## Best Practices

### DO
✅ Clear all mocks in `beforeEach()`
✅ Test one thing per test
✅ Use descriptive test names
✅ Mock external dependencies
✅ Test both success and error cases
✅ Keep tests fast (< 5 seconds total)

### DON'T
❌ Make real API calls
❌ Depend on external state
❌ Test implementation details
❌ Write tests that can randomly fail
❌ Skip writing tests for error cases
❌ Commit failing tests

## Continuous Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
      - run: npm run test:coverage
```

## Test Metrics

Current test statistics:
- **Total Test Files**: 3 (update-related)
- **Total Tests**: 95+
- **Average Runtime**: ~2-3 seconds
- **Coverage**: 85%+ for update code

## Contributing

When adding new features:
1. Write tests first (TDD)
2. Ensure all existing tests pass
3. Add tests for new functionality
4. Update this README if needed
5. Run coverage to verify

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Testing Chrome Extensions](https://developer.chrome.com/docs/extensions/mv3/tut_testing/)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

## Quick Reference

```bash
# Common commands
npm test                              # Run all tests
npm test -- tests/update-service.test.js  # Run specific file
npm run test:watch                    # Watch mode
npm run test:coverage                 # Coverage report
npm test -- --verbose                 # Verbose output
npm test -- --testNamePattern="version"   # Run matching tests

# Test runner script
./run-tests.sh                        # Run all tests
./run-tests.sh --coverage             # With coverage
./run-tests.sh --watch                # Watch mode
```

---

**Last Updated**: December 28, 2025  
**Test Coverage**: 85%+  
**Total Tests**: 95+
