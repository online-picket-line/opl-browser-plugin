// Test script to verify service worker compatibility
// Run this with: node test-service-worker-load.js

const fs = require('fs');

// Simulate minimal service worker environment
const originalConsole = { ...console };

global.chrome = {
  runtime: {
    getURL: (path) => `chrome-extension://test-id/${path}`
  },
  storage: {
    sync: { get: () => {}, set: () => {} },
    local: { get: () => {}, set: () => {}, remove: () => {} }
  },
  declarativeNetRequest: {
    getDynamicRules: () => Promise.resolve([]),
    updateDynamicRules: () => Promise.resolve(),
    updateSessionRules: () => Promise.resolve()
  }
};

global.console = {
  log: (...args) => originalConsole.log('[LOG]', ...args),
  warn: (...args) => originalConsole.warn('[WARN]', ...args),
  error: (...args) => originalConsole.error('[ERROR]', ...args)
};

try {
  console.log('Loading browser-polyfill.js...');
  eval(fs.readFileSync('browser-polyfill.js', 'utf8'));
  console.log('✓ browser-polyfill.js loaded');
  
  console.log('Loading api-service.js...');
  eval(fs.readFileSync('api-service.js', 'utf8'));
  console.log('✓ api-service.js loaded');
  
  console.log('Loading dnr-service.js...');
  eval(fs.readFileSync('dnr-service.js', 'utf8'));
  console.log('✓ dnr-service.js loaded');
  
  console.log('\nTesting instantiation...');
  const apiService = new ApiService();
  console.log('✓ ApiService instantiated');
  
  const dnrService = new DnrService();
  console.log('✓ DnrService instantiated');
  
  console.log('\n✅ All scripts load successfully in service worker simulation!');
  process.exit(0);
} catch (error) {
  console.error('\n❌ Failed to load scripts:');
  console.error(error.message);
  console.error(error.stack);
  process.exit(1);
}
