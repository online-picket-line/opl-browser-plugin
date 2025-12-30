// @ts-nocheck
const js = require('@eslint/js');

module.exports = [
  js.configs.recommended,
  {
    files: ['**/*.js'],
    ignores: [
      'node_modules/**',
      'browser-polyfill.js',
      'coverage/**',
      'generate-icons.js',
      'test-import.js',
      'tests/**',
      '*.min.js'
    ],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: {
        chrome: 'readonly',
        browser: 'readonly',
        importScripts: 'readonly',
        ApiService: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        console: 'readonly',
        document: 'readonly',
        window: 'readonly',
        fetch: 'readonly'
      }
    },
    rules: {
      'no-unused-vars': 'off',
      'no-console': 'off',
      'no-debugger': 'off',
      'no-undef': 'error'
    }
  }
];
