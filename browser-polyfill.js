/**
 * Browser API Polyfill for Cross-Browser Compatibility
 *
 * Ensures consistent API access across Chrome, Edge, Firefox, and Safari.
 * Safari and Firefox prefer the `browser` namespace, while Chrome uses `chrome`.
 * This polyfill ensures both work seamlessly.
 */

// Get the global object (compatible with all contexts)
var globalObject = (function() {
  if (typeof globalThis !== 'undefined') return globalThis;
  if (typeof window !== 'undefined') return window;
  if (typeof self !== 'undefined') return self;
  return this;
})();

// Use the browser namespace if available (Firefox, Safari), otherwise fall back to chrome (Chrome, Edge)
if (typeof browser === 'undefined' && typeof chrome !== 'undefined') {
  // Chrome/Edge: create browser namespace that points to chrome
  globalObject.browser = chrome;
}

// Ensure chrome namespace is available for code that uses it
if (typeof chrome === 'undefined' && typeof browser !== 'undefined') {
  // Safari/Firefox: ensure chrome namespace exists for backwards compatibility
  globalObject.chrome = browser;
}
