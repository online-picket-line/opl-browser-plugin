// eslint.config.js
export default [
  {
    files: ["**/*.js"],
    ignores: [
      "node_modules/**",
      "browser-polyfill.js",
      "coverage/**",
      "generate-icons.js",
      "test-import.js"
    ],
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
        module: "readonly"
      }
    },
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "error",
      "no-console": "off",
      "no-debugger": "off"
    }
  }
];