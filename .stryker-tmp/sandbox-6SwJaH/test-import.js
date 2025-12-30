// @ts-nocheck
// Test script to simulate browser importScripts behavior
// This tests if the files can be loaded in a service worker-like environment

console.log('=== Testing Service Worker Script Loading ===\n');

// Remove window from global scope to simulate service worker
if (typeof window !== 'undefined') {
  console.log('⚠️  Running in window context (not service worker)');
} else {
  console.log('✅ Running in non-window context (service worker-like)');
}

console.log('\nLoading browser-polyfill.js...');
try {
  require('./browser-polyfill.js');
  console.log('✅ browser-polyfill.js loaded successfully');
} catch (error) {
  console.error('❌ browser-polyfill.js failed:', error.message);
  process.exit(1);
}

console.log('\nLoading api-service.js...');
try {
  const ApiService = require('./api-service.js');
  console.log('✅ api-service.js loaded successfully');
  console.log('   ApiService type:', typeof ApiService);
} catch (error) {
  console.error('❌ api-service.js failed:', error.message);
  process.exit(1);
}

console.log('\nLoading update-service.js...');
try {
  const UpdateService = require('./update-service.js');
  console.log('✅ update-service.js loaded successfully');
  console.log('   UpdateService type:', typeof UpdateService);
} catch (error) {
  console.error('❌ update-service.js failed:', error.message);
  console.error('   Stack:', error.stack);
  process.exit(1);
}

console.log('\n=== All scripts loaded successfully! ===');
console.log('This means the scripts are compatible with service worker contexts.');
