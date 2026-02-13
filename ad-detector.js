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

  // Generic ad patterns (class/id based)
  'iframe[src*="doubleclick"]',
  'iframe[src*="googlesyndication"]',
  '[class*="ad-slot"]',
  '[class*="ad-container"]',
  '[id*="ad-wrapper"]',
  '[class*="ad-banner"]',
  '[data-ad-slot]',
  '[data-ad-unit]',

  // Broader generic ad selectors
  '.advertisement',
  '[class*="Advertisement"]',
  '[class*="ad-unit"]',
  '[id*="ad-unit"]',
  '[class*="ad-wrapper"]',
  '[data-ad]',
  '[data-ad-region]',
  '[aria-label*="advertisement" i]',
  '[aria-label*="Advertisement"]',
  '[class*="ad-recirc"]',
  '[class*="dfp"]',
  '[id*="dfp"]',

  // HuffPost / BuzzFeed Media style
  '[data-module*="ad" i]',
  '[data-component*="Ad"]',
  '[data-zone]',
  '.ad__slot',
  '.ad__container',

  // Programmatic / native ad containers
  '[class*="nativo"]',
  '[id*="nativo"]',
  '[class*="connatix"]',
  '[class*="teads"]',
  '[id*="teads"]',
  '[class*="sharethrough"]',
  '[class*="yieldmo"]',
  '[id*="kargo"]',
  '[class*="gumgum"]',

  // Sponsored content markers
  'div[class*="sponsored-content"]',
  'div[class*="SponsoredContent"]',
  'div[data-testid*="ad" i]'
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

    // Skip elements hidden by CSS (but allow zero-size — ads often start empty)
    var style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden') {
      continue;
    }

    var rect = el.getBoundingClientRect();
    var width = rect.width || el.offsetWidth;
    var height = rect.height || el.offsetHeight;

    results.push({
      element: el,
      size: (width > 0 && height > 0) ? getAdSize(el) : 'medium',
      rect: {
        width: width,
        height: height
      }
    });
  }

  // Also detect iframes that look like ads (by src URL)
  try {
    var iframes = root.querySelectorAll('iframe');
    for (var j = 0; j < iframes.length; j++) {
      var iframe = iframes[j];
      if (iframe.getAttribute('data-opl-injected') === 'true') continue;
      var src = (iframe.src || '').toLowerCase();
      if (!src) continue;

      var isAd = false;
      var adSrcPatterns = [
        'doubleclick', 'googlesyndication', 'googleadservices',
        'amazon-adsystem', 'taboola', 'outbrain', 'adnxs',
        'criteo', 'pubmatic', 'rubiconproject', 'openx',
        'casalemedia', 'sharethrough', 'triplelift', 'teads',
        'adsrvr.org', 'serving-sys', 'nativo', 'connatix',
        'yieldmo', 'gumgum', 'kargo', 'media.net', 'bidswitch',
        'safeframe', 'ad-delivery'
      ];
      for (var k = 0; k < adSrcPatterns.length; k++) {
        if (src.indexOf(adSrcPatterns[k]) !== -1) {
          isAd = true;
          break;
        }
      }
      if (!isAd) continue;

      // Target the parent of the iframe (the ad container) if possible
      var target = iframe.parentElement || iframe;
      if (target.getAttribute('data-opl-injected') === 'true') continue;

      var style2 = window.getComputedStyle(target);
      if (style2.display === 'none' || style2.visibility === 'hidden') continue;

      var iRect = target.getBoundingClientRect();
      results.push({
        element: target,
        size: (iRect.width > 0 && iRect.height > 0) ? getAdSize(target) : 'medium',
        rect: {
          width: iRect.width || target.offsetWidth,
          height: iRect.height || target.offsetHeight
        }
      });
    }
  } catch (_e2) {
    // iframe detection is best-effort
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
  var DEBOUNCE_MS = 200;
  var rescanTimer = null;
  var RESCAN_INTERVAL = 2000;
  var rescanCount = 0;
  var MAX_RESCANS = 15; // Rescan for 30 seconds after page load

  function scanAndCallback() {
    var newAds = findAdElements(document);
    if (newAds.length > 0) {
      callback(newAds);
    }
  }

  var observer = new MutationObserver(function(_mutations) {
    // Debounce: don't scan on every tiny DOM change
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(scanAndCallback, DEBOUNCE_MS);
  });

  observer.observe(document.body || document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['src', 'class', 'style']
  });

  // Periodic rescan to catch ads that load without DOM mutations
  // (e.g., ads that fill existing containers via JS, or delayed ad loads)
  rescanTimer = setInterval(function() {
    rescanCount++;
    scanAndCallback();
    if (rescanCount >= MAX_RESCANS) {
      clearInterval(rescanTimer);
      rescanTimer = null;
    }
  }, RESCAN_INTERVAL);

  return {
    disconnect: function() {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      if (rescanTimer) {
        clearInterval(rescanTimer);
        rescanTimer = null;
      }
      observer.disconnect();
    }
  };
}

// Export for Node.js/Jest testing environment
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined' && typeof process !== 'undefined') {
  module.exports = { AD_SELECTORS, getAdSize, findAdElements, observeNewAds };
}
