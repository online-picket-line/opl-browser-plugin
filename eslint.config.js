module.exports = [
  {
    ignores: [
      "node_modules/**",
      "browser-polyfill.js", 
      "coverage/**",
      "generate-icons.js",
      "test-import.js",
      "tests/**",
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
      "no-unused-vars": "off",
      "no-console": "off", 
      "no-debugger": "off"
    }
  }
];