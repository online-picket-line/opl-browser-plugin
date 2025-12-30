// Jest configuration for Stryker mutation testing
// Excludes failing tests that are not related to mutation testing
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: [
    '<rootDir>/tests/setup.js'
  ],
  testTimeout: 10000,
  collectCoverageFrom: [
    '*.js',
    '!browser-polyfill.js',
    '!generate-icons.js',
    '!update-service.js',
    '!tests/**'
  ],
  testMatch: [
    '**/tests/background.test.js',
    '**/tests/block.test.js',
    '**/tests/content-script.test.js',
    '**/tests/popup.test.js',
    '**/tests/integration.test.js',
    '**/tests/error-handling.test.js',
    '**/tests/url-matching.test.js'
  ]
};
