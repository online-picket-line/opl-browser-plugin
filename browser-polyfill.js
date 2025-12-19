/**
 * Browser API Polyfill for Cross-Browser Compatibility
 * 
 * Ensures consistent API access across Chrome, Edge, Firefox, and Safari.
 * Safari and Firefox prefer the `browser` namespace, while Chrome uses `chrome`.
 * This polyfill ensures both work seamlessly.
 */

// Use the browser namespace if available (Firefox, Safari), otherwise fall back to chrome (Chrome, Edge)
if (typeof browser === 'undefined') {
  // Chrome/Edge: create browser namespace that points to chrome
  globalThis.browser = chrome;
}

// Ensure chrome namespace is available for code that uses it
if (typeof chrome === 'undefined') {
  // Safari/Firefox: ensure chrome namespace exists for backwards compatibility
  globalThis.chrome = browser;
}
