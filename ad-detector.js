/**
 * Ad Detector Module
 * 
 * Detects advertising elements on web pages using known CSS selectors
 * for major ad networks: Google, Amazon, Media.net, Taboola, Outbrain.
 * 
 * Uses MutationObserver to detect dynamically inserted ads.
 */

// Combined CSS selector for all known ad elements
var AD_SELECTORS = [
  // Google AdSense / GPT
  'ins.adsbygoogle',
  '[id^="google_ads_iframe"]',
  '[id^="div-gpt-ad"]',
  '[data-google-query-id]',
  'div[id^="google_ads"]',
  '.gpt-ad',
  '[id*="google_ad"]',

  // Amazon Ads
  '[id^="amzn-assoc"]',
  '.amzn-native-ad',
  'iframe[src*="amazon-adsystem"]',

  // Media.net
  '[id^="mnet-adslot"]',
  'div[data-mediavine]',
  '[id*="media-net"]',

  // Taboola
  '[id^="taboola-"]',
  '.trc_related_container',
  '#taboola-below-article',
  '.taboola-widget',

  // Outbrain
  '.OUTBRAIN',
  '[data-widget-id*="outbrain"]',
  '.ob-widget',
  '.ob-smartfeed-wrapper',

  // Generic ad patterns
  'iframe[src*="doubleclick"]',
  'iframe[src*="googlesyndication"]',
  '[class*="ad-slot"]',
  '[class*="ad-container"]',
  '[id*="ad-wrapper"]',
  '[class*="ad-banner"]',
  '[data-ad-slot]',
  '[data-ad-unit]'
].join(', ');

/**
 * Determine ad size category based on element dimensions.
 * 
 * @param {HTMLElement} element - The ad element
 * @returns {'small'|'medium'|'large'} - Size category
 */
function getAdSize(element) {
  var rect = element.getBoundingClientRect();
  var width = rect.width || element.offsetWidth;
  var height = rect.height || element.offsetHeight;

  // Large: both dimensions substantial (300x250 rectangle, 728x90 leaderboard, etc.)
  if (width >= 300 && height >= 200) {
    return 'large';
  }
  // Small: either dimension is tiny
  if (width < 200 || height < 60) {
    return 'small';
  }
  // Medium: everything else
  return 'medium';
}

/**
 * Find all visible ad elements in a root element.
 * Skips elements that have already been processed (marked with data-opl-injected).
 * 
 * @param {HTMLElement|Document} rootElement - The root to search within
 * @returns {Array<{element: HTMLElement, size: string, rect: {width: number, height: number}}>}
 */
function findAdElements(rootElement) {
  var root = rootElement || document;
  var elements;
  try {
    elements = root.querySelectorAll(AD_SELECTORS);
  } catch (_e) {
    return [];
  }

  var results = [];
  for (var i = 0; i < elements.length; i++) {
    var el = elements[i];

    // Skip already-processed elements
    if (el.getAttribute('data-opl-injected') === 'true') {
      continue;
    }

    // Skip invisible elements
    if (el.offsetWidth === 0 && el.offsetHeight === 0) {
      continue;
    }

    // Skip elements hidden by CSS
    var style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden') {
      continue;
    }

    var rect = el.getBoundingClientRect();
    results.push({
      element: el,
      size: getAdSize(el),
      rect: {
        width: rect.width || el.offsetWidth,
        height: rect.height || el.offsetHeight
      }
    });
  }

  return results;
}

/**
 * Start observing the DOM for dynamically inserted ad elements.
 * Uses MutationObserver with debouncing for performance.
 * 
 * @param {function(Array<{element: HTMLElement, size: string, rect: Object}>): void} callback
 *   Called with newly detected ad elements
 * @returns {{ disconnect: function(): void }} - Observer handle with disconnect method
 */
function observeNewAds(callback) {
  if (typeof MutationObserver === 'undefined') {
    return { disconnect: function() {} };
  }

  var debounceTimer = null;
  var DEBOUNCE_MS = 500;

  var observer = new MutationObserver(function(_mutations) {
    // Debounce: don't scan on every tiny DOM change
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(function() {
      var newAds = findAdElements(document);
      if (newAds.length > 0) {
        callback(newAds);
      }
    }, DEBOUNCE_MS);
  });

  observer.observe(document.body || document.documentElement, {
    childList: true,
    subtree: true
  });

  return {
    disconnect: function() {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      observer.disconnect();
    }
  };
}

// Export for Node.js/Jest testing environment
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined' && typeof process !== 'undefined') {
  module.exports = { AD_SELECTORS, getAdSize, findAdElements, observeNewAds };
}
