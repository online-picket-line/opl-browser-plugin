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

  // Structural/document elements that should NEVER be replaced with ad cards.
  // Broad selectors like [data-zone] can match <html> or <body> on some sites.
  var BLOCKED_TAG_NAMES = {
    'HTML': true, 'BODY': true, 'HEAD': true, 'HEADER': true, 'FOOTER': true,
    'MAIN': true, 'NAV': true, 'FORM': true, 'TABLE': true, 'SCRIPT': true,
    'STYLE': true, 'LINK': true, 'META': true, 'NOSCRIPT': true, 'TITLE': true
  };

  // Minimum pixel dimensions to consider an element a real ad slot.
  // Elements smaller than this are tracking pixels or hidden containers.
  var MIN_AD_WIDTH = 50;
  var MIN_AD_HEIGHT = 40;

  var results = [];
  for (var i = 0; i < elements.length; i++) {
    var el = elements[i];

    // Skip structural/document elements — never inject into page structure
    if (BLOCKED_TAG_NAMES[el.tagName]) {
      continue;
    }

    // Skip detached elements (not in the visible DOM)
    if (!el.parentElement && el !== document.documentElement) {
      continue;
    }

    // Skip already-processed elements
    if (el.getAttribute('data-opl-injected') === 'true') {
      continue;
    }

    // Skip elements that contain an already-injected child
    // (prevents injecting into a parent container of a card we already placed)
    if (el.querySelector && el.querySelector('[data-opl-injected="true"]')) {
      continue;
    }

    // Skip elements hidden by CSS (but allow zero-size — ads often start empty)
    var style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden') {
      continue;
    }

    // Skip elements that look like full-page takeover overlays
    // (position:fixed with near-viewport dimensions)
    if (_isFullPageTakeover(el, style)) {
      continue;
    }

    // Skip elements inside a fixed/absolute overlay ancestor
    // (the element itself may be small, but if it's inside a viewport-covering
    // overlay, injecting into it creates a visible full-page disruption)
    if (_hasOverlayAncestor(el)) {
      continue;
    }

    var rect = el.getBoundingClientRect();
    var width = rect.width || el.offsetWidth;
    var height = rect.height || el.offsetHeight;

    // Skip zero-size, tracking-pixel, and tiny elements.
    // These are either 1x1 tracking pixels, hidden interstitial containers
    // waiting to expand, or elements not yet rendered. Injecting into them
    // causes cards to appear in unexpected places or trigger interstitials.
    if (width < MIN_AD_WIDTH || height < MIN_AD_HEIGHT) {
      continue;
    }

    results.push({
      element: el,
      size: getAdSize(el),
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
        'casalemedia', 'sharethrough', 'triplelift', '3lift', 'teads',
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

// Maximum ad dimensions — anything larger is likely a takeover/interstitial, not a standard ad slot
var MAX_AD_WIDTH = 970;   // Largest standard IAB format (Billboard 970x250)
var MAX_AD_HEIGHT = 600;  // Generous: largest standard is 300x600 (Half Page)

/**
 * Check if an element looks like a full-page ad takeover / interstitial overlay.
 * These are position:fixed or position:absolute elements sized to fill the viewport.
 * We do NOT want to inject into these — they'd make the card full-page.
 *
 * @param {HTMLElement} el - The element to check
 * @param {CSSStyleDeclaration} [computedStyle] - Pre-computed style (optional)
 * @returns {boolean} - True if this looks like a takeover overlay
 */
function _isFullPageTakeover(el, computedStyle) {
  var style = computedStyle || window.getComputedStyle(el);
  var pos = style.position;

  // Only fixed/absolute elements can be takeovers
  if (pos !== 'fixed' && pos !== 'absolute') {
    return false;
  }

  var rect = el.getBoundingClientRect();
  var vw = window.innerWidth || document.documentElement.clientWidth;
  var vh = window.innerHeight || document.documentElement.clientHeight;

  // Consider it a takeover if it covers most of the viewport (>80% of both dimensions)
  if (rect.width > vw * 0.8 && rect.height > vh * 0.8) {
    return true;
  }

  return false;
}

/**
 * Check if an element has an ancestor that indicates it's part of an
 * overlay / interstitial / takeover ad — NOT a normal in-page ad slot.
 *
 * Key insight: normal in-page ad slots are in the document flow.
 * They do NOT sit inside `position: fixed` containers. Only overlays,
 * interstitials, and modals use `position: fixed`. So any ad element
 * inside a fixed-position ancestor is an interstitial — skip it.
 *
 * Also checks for very high z-index, which is another interstitial signal.
 *
 * @param {HTMLElement} el - Element to check
 * @returns {boolean} - True if this element is inside an overlay/interstitial
 */
function _hasOverlayAncestor(el) {
  // Check the element itself first
  try {
    var elStyle = window.getComputedStyle(el);
    if (elStyle.position === 'fixed') return true;
    var zIndex = parseInt(elStyle.zIndex, 10);
    if (zIndex >= 1000) return true;
  } catch (_e) { /* ignore */ }

  // Walk ancestors — ANY position:fixed ancestor means this is an overlay
  var ancestor = el.parentElement;
  while (ancestor && ancestor !== document.body && ancestor !== document.documentElement) {
    try {
      var style = window.getComputedStyle(ancestor);
      // position:fixed = overlay/interstitial — always skip
      if (style.position === 'fixed') {
        return true;
      }
      // Very high z-index on a positioned ancestor = likely overlay
      var z = parseInt(style.zIndex, 10);
      if (z >= 1000 && style.position !== 'static') {
        return true;
      }
    } catch (_e) {
      // getComputedStyle can fail on detached elements
    }
    ancestor = ancestor.parentElement;
  }
  return false;
}

// Export for Node.js/Jest testing environment
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined' && typeof process !== 'undefined') {
  module.exports = { AD_SELECTORS, getAdSize, findAdElements, observeNewAds, MAX_AD_WIDTH, MAX_AD_HEIGHT, _isFullPageTakeover, _hasOverlayAncestor };
}
