# Update Service Testing Guide

## Running Unit Tests

### Prerequisites

Ensure you have Node.js and npm installed:
```bash
node --version  # Should be v16 or higher
npm --version
```

#### Fedora Silverblue / Flatpak Users

If you're using Fedora Silverblue or running VS Code in a flatpak container, you'll need to use a toolbox:

```bash
# Create a toolbox (if not already created)
toolbox create opl-dev

# Enter the toolbox
toolbox enter opl-dev

# Install Node.js in the toolbox
sudo dnf install -y nodejs npm

# Verify installation
node --version
npm --version
```

The test runner script (`run-tests.sh`) will automatically detect the flatpak environment and use `flatpak-spawn` to run tests in your toolbox.

### Installing Dependencies

First, install the test dependencies:
```bash
npm install
```

This will install:
- Jest (testing framework)
- jest-environment-jsdom (browser environment simulation)

### Running All Tests

Run all tests including update service tests:
```bash
npm test
```

**On Silverblue/Flatpak:**
```bash
# Option 1: Use the test runner script (recommended)
./run-tests.sh

# Option 2: Use flatpak-spawn directly
flatpak-spawn --host toolbox run -c opl-dev bash -c "cd '$PWD' && npm test"

# Option 3: Enter toolbox and run
toolbox enter opl-dev
cd /path/to/opl-browser-plugin
npm test
```

### Running Specific Test Files

Run only update service tests:
```bash
npm test tests/update-service.test.js
```

Run only background integration tests:
```bash
npm test tests/background-update-integration.test.js
```

Run only popup UI tests:
```bash
npm test tests/popup-update-ui.test.js
```

### Running Tests in Watch Mode

Automatically rerun tests when files change:
```bash
npm run test:watch
```

### Generating Coverage Reports

See test coverage for all files:
```bash
npm run test:coverage
```

## Test Structure

### Unit Tests (tests/update-service.test.js)

Tests the core `UpdateService` class functionality:

- **Constructor**: Verifies proper initialization
- **getCurrentVersion**: Tests version retrieval from manifest
- **parseVersion**: Tests version string parsing
- **compareVersions**: Tests semantic versioning comparison
  - Major version differences
  - Minor version differences
  - Patch version differences
  - Equal versions
  - Different length versions
- **shouldCheckForUpdate**: Tests timing logic
  - No previous check
  - Old check (should check)
  - Recent check (should skip)
- **fetchLatestRelease**: Tests GitHub API integration
  - Successful fetch
  - Version prefix handling
  - Fetch failures
  - Network errors
- **checkForUpdate**: Tests full update check workflow
  - New version detection
  - Up-to-date detection
  - Dismissed version handling
  - Timestamp updates
  - Cache updates
  - Skip on recent check
- **isDismissed**: Tests dismiss state checking
- **dismissUpdate**: Tests marking version as dismissed
- **clearDismissed**: Tests clearing dismissed state
- **getCachedUpdate**: Tests cached update retrieval
- **openUpdatePage**: Tests opening GitHub releases
- **Error Handling**: Tests graceful error handling

**Total Tests**: 50+ test cases

### Integration Tests (tests/background-update-integration.test.js)

Tests the integration between UpdateService and background script:

- **Message Handlers**: Tests chrome.runtime.sendMessage handling
  - checkUpdate message
  - openUpdatePage message
  - dismissUpdate message
- **Periodic Checks**: Tests alarm-based update checking
- **Storage Integration**: Tests chrome.storage operations
- **Error Scenarios**: Tests error handling
- **Message Responses**: Tests response formats

**Total Tests**: 20+ test cases

### UI Tests (tests/popup-update-ui.test.js)

Tests the update notification UI in popup:

- **Update Check on Load**: Tests initial update check
- **Update Now Button**: Tests opening GitHub releases
- **Dismiss Button**: Tests dismissing notifications
- **UI State Management**: Tests notification visibility
- **Visual Elements**: Tests DOM structure
- **Integration Flows**: Tests complete user workflows

**Total Tests**: 25+ test cases

## Test Results Example

When all tests pass, you should see:
```
PASS  tests/update-service.test.js
  UpdateService
    ✓ Constructor (5 ms)
    ✓ getCurrentVersion (2 ms)
    ✓ parseVersion (1 ms)
    ✓ compareVersions - major version (1 ms)
    ...
  
PASS  tests/background-update-integration.test.js
  Background Script - Update Integration
    ✓ should handle checkUpdate message (3 ms)
    ...

PASS  tests/popup-update-ui.test.js
  Popup - Update Notifications
    ✓ should check for updates when popup opens (2 ms)
    ...

Test Suites: 3 passed, 3 total
Tests:       95 passed, 95 total
Snapshots:   0 total
Time:        2.5 s
```

## Continuous Testing

For development, keep tests running in watch mode:
```bash
npm run test:watch
```

This will automatically rerun tests when you modify:
- `update-service.js`
- `background.js`
- `popup.js`
- Any test files

## Coverage Goals

Aim for these coverage levels:
- **update-service.js**: 90%+ coverage
- **background.js**: Update-related code 85%+
- **popup.js**: Update UI code 85%+

Check current coverage:
```bash
npm run test:coverage
```

View detailed HTML coverage report:
```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

## Debugging Tests

### Running a Single Test

Use `.only` to run a specific test:
```javascript
test.only('should compare versions correctly', () => {
  // This test will run alone
});
```

### Skipping Tests

Use `.skip` to temporarily skip tests:
```javascript
test.skip('should handle edge case', () => {
  // This test will be skipped
});
```

### Verbose Output

Get detailed test output:
```bash
npm test -- --verbose
```

### Debug Mode

Run tests with Node debugger:
```bash
node --inspect-brk node_modules/.bin/jest tests/update-service.test.js
```

Then open Chrome and go to `chrome://inspect`

## Common Issues

### Tests Fail Due to Missing Mocks

**Problem**: Tests fail with "chrome is not defined"
**Solution**: Ensure `tests/setup.js` is being loaded. Check `package.json` jest config.

### Tests Timeout

**Problem**: Tests timeout after 10 seconds
**Solution**: Increase timeout in `package.json`:
```json
"jest": {
  "testTimeout": 30000
}
```

### Mock Not Working

**Problem**: Mocks don't reset between tests
**Solution**: Ensure `jest.clearAllMocks()` is in `beforeEach()`:
```javascript
beforeEach(() => {
  jest.clearAllMocks();
});
```

### Fetch Mock Issues

**Problem**: `fetch` is not defined
**Solution**: Check that `tests/setup.js` includes:
```javascript
global.fetch = jest.fn();
```

## Manual Testing

After unit tests pass, perform manual testing:

1. **Load Extension**: Load the extension in browser
2. **Check Console**: Verify no errors in console
3. **Test Update Check**: Run in console:
   ```javascript
   chrome.runtime.sendMessage({action: 'checkUpdate'}, console.log)
   ```
4. **Test UI**: Open popup and verify update banner appears (if update available)
5. **Test Buttons**: Click "Update Now" and "Dismiss"
6. **Test Persistence**: Verify dismissed state persists

## CI/CD Integration

Add to your CI pipeline (e.g., GitHub Actions):

```yaml
- name: Install dependencies
  run: npm install

- name: Run tests
  run: npm test

- name: Generate coverage
  run: npm run test:coverage

- name: Upload coverage
  uses: codecov/codecov-action@v3
```

## Test Maintenance

### When to Update Tests

Update tests when:
- Adding new features to UpdateService
- Changing version comparison logic
- Modifying API endpoints
- Changing storage structure
- Updating UI elements

### Test Naming Convention

Follow this pattern:
```javascript
describe('FeatureName', () => {
  describe('methodName', () => {
    test('should behavior when condition', () => {
      // Test code
    });
  });
});
```

### Keep Tests Fast

- Mock external dependencies (fetch, storage)
- Avoid real API calls in unit tests
- Use `beforeEach()` for setup, not in each test
- Keep each test focused on one thing

## Resources

- **Jest Documentation**: https://jestjs.io/docs/getting-started
- **Jest Matchers**: https://jestjs.io/docs/expect
- **Chrome Extension Testing**: https://developer.chrome.com/docs/extensions/mv3/tut_testing/
- **Test Coverage**: https://jestjs.io/docs/configuration#collectcoverage-boolean

## Quick Reference

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run specific test file
npm test tests/update-service.test.js

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# Verbose output
npm test -- --verbose

# Run with specific test name pattern
npm test -- --testNamePattern="compareVersions"
```

## Success Criteria

Tests are considered successful when:
- ✅ All test suites pass
- ✅ Coverage is above 85% for update-related code
- ✅ No console errors or warnings
- ✅ Tests run in under 5 seconds
- ✅ Manual testing confirms functionality

---

**Last Updated**: December 28, 2025
**Total Test Count**: 95+ tests
**Estimated Test Runtime**: ~2-3 seconds
