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
        fetch: 'readonly',
        URL: 'readonly',
        btoa: 'readonly',
        atob: 'readonly',
        performance: 'readonly',
        setTimeout: 'readonly',
        Date: 'readonly',
        Math: 'readonly',
        String: 'readonly',
        Object: 'readonly',
        Array: 'readonly',
        Promise: 'readonly',
        Error: 'readonly',
        sessionStorage: 'readonly',
        history: 'readonly',
        require: 'readonly',
        process: 'readonly',
        __dirname: 'readonly'
      }
    },
    rules: {
      'no-console': 'off',
      'no-debugger': 'warn',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_|^e$|^e2$|^data$|^error$|^response$|^result$|^timestamp$|^changes$|^actionType$|^urlToTest$|^actions$|^blockMode$|^manyActions$|^testButton$' }],
      'no-undef': 'error',
      'no-useless-escape': 'warn'
    }
  },
  {
    files: ['tests/**/*.js'],
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
        fetch: 'readonly',
        URL: 'readonly',
        btoa: 'readonly',
        atob: 'readonly',
        performance: 'readonly',
        setTimeout: 'readonly',
        Date: 'readonly',
        Math: 'readonly',
        String: 'readonly',
        Object: 'readonly',
        Array: 'readonly',
        Promise: 'readonly',
        Error: 'readonly',
        sessionStorage: 'readonly',
        history: 'readonly',
        require: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        expect: 'readonly',
        jest: 'readonly',
        matchUrlToAction: 'readonly'
      }
    },
    rules: {
      'no-console': 'off',
      'no-debugger': 'off',
      'no-unused-vars': 'off',
      'no-undef': 'warn',
      'no-useless-escape': 'warn'
    }
  }
];
