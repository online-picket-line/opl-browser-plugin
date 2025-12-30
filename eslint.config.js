module.exports = [
  {
    ignores: [
      "node_modules/**",
      "browser-polyfill.js",
      "coverage/**",
      "generate-icons.js",
      "test-import.js",
      "eslint.config.js"
    ]
  },
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals: {
        chrome: "readonly",
        browser: "readonly",
        console: "readonly",
        document: "readonly",
        window: "readonly",
        fetch: "readonly",
        URL: "readonly",
        btoa: "readonly",
        atob: "readonly",
        performance: "readonly",
        setTimeout: "readonly",
        Date: "readonly",
        Math: "readonly",
        String: "readonly",
        Object: "readonly",
        Array: "readonly",
        Promise: "readonly",
        Error: "readonly",
        importScripts: "readonly",
        ApiService: "readonly",
        sessionStorage: "readonly",
        history: "readonly",
        module: "readonly",
        exports: "readonly",
        require: "readonly",
        process: "readonly",
        __dirname: "readonly"
      }
    },
    rules: {
      "no-console": "off",
      "no-debugger": "warn",
      "no-unused-vars": ["error", { "argsIgnorePattern": "^_.*$", "caughtErrorsIgnorePattern": "^_.*$" }],
      "no-undef": "error",
      "no-useless-escape": "warn"
    }
  },
  {
    files: ["tests/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals: {
        chrome: "readonly",
        browser: "readonly",
        console: "readonly",
        document: "readonly",
        window: "readonly",
        fetch: "readonly",
        URL: "readonly",
        btoa: "readonly",
        atob: "readonly",
        performance: "readonly",
        setTimeout: "readonly",
        Date: "readonly",
        Math: "readonly",
        String: "readonly",
        Object: "readonly",
        Array: "readonly",
        Promise: "readonly",
        Error: "readonly",
        importScripts: "readonly",
        ApiService: "readonly",
        sessionStorage: "readonly",
        history: "readonly",
        module: "readonly",
        exports: "readonly",
        require: "readonly",
        process: "readonly",
        __dirname: "readonly",
        describe: "readonly",
        it: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        expect: "readonly",
        jest: "readonly",
        matchUrlToAction: "readonly"
      }
    },
    rules: {
      "no-console": "off",
      "no-debugger": "off",
      "no-unused-vars": "off",
      "no-undef": "warn",
      "no-useless-escape": "warn"
    }
  }
];
