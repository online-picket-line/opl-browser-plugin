/**
 * Strike Injector Engine
 * 
 * Orchestrates the process of finding ads on a page and replacing them
 * with labor action information cards. Uses ad-detector.js for finding
 * ads and strike-card.js for rendering replacement content.
 * 
 * Rotates through available actions so different ad slots show different
 * labor actions (maximizing exposure).
 */

// Track which elements have been replaced to avoid double-processing
var _oplReplacedElements = (typeof WeakSet !== 'undefined') ? new WeakSet() : null;

// Current action rotation index
var _oplActionIndex = 0;

// Observer handle for disconnecting
var _oplAdObserver = null;

// Container-guard observers (prevent ad-platform JS from resizing injected containers)
var _oplGuardObservers = [];

// Track injected elements so we can remove cards that end up inside overlays
var _oplInjectedElements = [];

// Whether the injector is currently active
var _oplInjectorActive = false;

// Persistent stylesheet injected into page to force OPL containers visible.
// Stylesheet rules can't be overridden by ad JS setting inline styles.
var _oplStyleSheet = null;

/**
 * Inject a persistent <style> element into the page that forces all
 * [data-opl-injected] elements (and their ancestors up to 3 levels) to
 * remain visible. This beats ad-platform JS that sets inline styles
 * to hide/collapse containers because:
 * - If they remove our inline styles, the stylesheet rules still apply
 * - If they set their own inline styles, our stylesheet can't be beaten by
 *   inline !important, but we re-apply inline !important via MutationObserver
 * - The stylesheet acts as a persistent baseline that never goes away
 */
function _injectGuardStylesheet() {
  if (_oplStyleSheet) return;
  try {
    _oplStyleSheet = document.createElement('style');
    _oplStyleSheet.setAttribute('data-opl-guard', 'true');
    _oplStyleSheet.textContent = [
      '/* OPL Guard: prevent ad platforms from collapsing injected cards */',
      '/* Only targets the container itself, not ancestors */',
      '[data-opl-container="true"] {',
      '  display: block !important;',
      '  visibility: visible !important;',
      '  opacity: 1 !important;',
      '  overflow: hidden !important;',
      '  min-height: var(--opl-h, auto) !important;',
      '  max-height: none !important;',
      '  transform: none !important;',
      '  clip: auto !important;',
      '  clip-path: none !important;',
      '}',
    ].join('\n');
    (document.head || document.documentElement).appendChild(_oplStyleSheet);
  } catch (_e) { /* ignore */ }
}

/**
 * Watch a container element for style mutations and revert any size changes.
 * Only guards the container itself — ancestor monitoring is handled by the
 * periodic overlay check (_checkForOverlayCapture).
 *
 * @param {HTMLElement} element - The container element to guard
 * @param {string} lockedWidth - The locked CSS width value (e.g., '300px')
 * @param {string} lockedHeight - The locked CSS height value (e.g., '250px')
 */
function _guardContainerSize(element, lockedWidth, lockedHeight) {
  if (typeof MutationObserver === 'undefined') return;

  var lockedH = parseInt(lockedHeight, 10) || 50;

  // Apply guard styles to an element
  function applyContainerGuard() {
    element.setAttribute('data-opl-container', 'true');
    // Remove any adversarial height that ad JS set to shrink the container.
    // Only remove if the current inline height is SMALLER than our locked height,
    // to avoid removing heights we need.
    var inlineH = element.style.getPropertyValue('height');
    if (inlineH) {
      var inlineHVal = parseInt(inlineH, 10);
      if (inlineHVal < lockedH) {
        element.style.removeProperty('height');
      }
    }
    var inlineMaxH = element.style.getPropertyValue('max-height');
    if (inlineMaxH && inlineMaxH !== 'none') {
      var inlineMaxHVal = parseInt(inlineMaxH, 10);
      if (!isNaN(inlineMaxHVal) && inlineMaxHVal < lockedH) {
        element.style.removeProperty('max-height');
      }
    }
    // Now set our properties
    element.style.setProperty('--opl-h', lockedHeight);
    element.style.setProperty('overflow', 'hidden', 'important');
    element.style.setProperty('max-width', lockedWidth, 'important');
    element.style.setProperty('min-height', lockedHeight, 'important');
    element.style.setProperty('display', 'block', 'important');
    element.style.setProperty('visibility', 'visible', 'important');
    element.style.setProperty('opacity', '1', 'important');
    element.style.setProperty('box-sizing', 'border-box', 'important');
    element.style.setProperty('padding', '0', 'important');
    var computedPos = window.getComputedStyle(element).position;
    if (computedPos === 'fixed') {
      element.style.setProperty('position', 'relative', 'important');
    }
  }

  function applyParentGuard(el) {
    var style = window.getComputedStyle(el);
    if (style.display === 'none') {
      var orig = el.getAttribute('data-opl-orig-display');
      el.style.setProperty('display', orig || 'block', 'important');
    }
    if (style.visibility === 'hidden') {
      el.style.setProperty('visibility', 'visible', 'important');
    }
    if (parseFloat(style.opacity) < 0.1) {
      el.style.setProperty('opacity', '1', 'important');
    }
    if (el.offsetHeight < 5) {
      el.style.setProperty('min-height', lockedHeight, 'important');
    }
  }

  // === ResizeObserver: catches ALL size changes regardless of cause ===
  // This is the primary defense — MutationObserver is supplementary.
  if (typeof ResizeObserver !== 'undefined') {
    var resizeGuard = new ResizeObserver(function(entries) {
      for (var j = 0; j < entries.length; j++) {
        var entry = entries[j];
        var h = entry.contentRect ? entry.contentRect.height : entry.target.offsetHeight;
        if (h < lockedH * 0.5) {
          // Container was shrunk — restore it
          applyContainerGuard();
        }
      }
    });
    resizeGuard.observe(element);
    // Store for cleanup — use a wrapper so we can disconnect both types
    _oplGuardObservers.push({ disconnect: function() { resizeGuard.disconnect(); } });
  }

  // === MutationObserver: catches attribute stripping ===
  var containerGuard = new MutationObserver(function(mutations) {
    // Only react to external changes, not our own
    // Check if data-opl-container was removed or style was changed
    for (var m = 0; m < mutations.length; m++) {
      var mut = mutations[m];
      if (mut.attributeName === 'data-opl-container' && element.getAttribute('data-opl-container') !== 'true') {
        applyContainerGuard();
        return;
      }
      if (mut.attributeName === 'style' || mut.attributeName === 'class') {
        applyContainerGuard();
        return;
      }
    }
  });
  containerGuard.observe(element, {
    attributes: true,
    attributeFilter: ['style', 'class', 'data-opl-container']
  });
  _oplGuardObservers.push(containerGuard);

  // Watch up to 3 ancestor levels for hide/collapse
  var ancestor = element.parentElement;
  for (var level = 0; level < 3 && ancestor && ancestor !== document.body && ancestor !== document.documentElement; level++) {
    if (!ancestor.hasAttribute('data-opl-orig-display')) {
      var origDisplay = window.getComputedStyle(ancestor).display;
      if (origDisplay !== 'none') {
        ancestor.setAttribute('data-opl-orig-display', origDisplay);
      }
    }
    (function(el) {
      var parentGuard = new MutationObserver(function() {
        applyParentGuard(el);
      });
      parentGuard.observe(el, {
        attributes: true,
        attributeFilter: ['style', 'class']
      });
      _oplGuardObservers.push(parentGuard);

      // ResizeObserver on parent too
      if (typeof ResizeObserver !== 'undefined') {
        var parentResize = new ResizeObserver(function() {
          if (el.offsetHeight < 5) {
            applyParentGuard(el);
          }
        });
        parentResize.observe(el);
        _oplGuardObservers.push({ disconnect: function() { parentResize.disconnect(); } });
      }
    })(ancestor);
    ancestor = ancestor.parentElement;
  }
}

/**
 * Watch for our card being removed from the container (ad JS replacing innerHTML
 * or removing child nodes). If the card disappears, re-inject it.
 *
 * @param {HTMLElement} container - The ad container element
 * @param {HTMLElement} card - The OPL card element
 * @param {string} lockHeight - Locked height CSS value
 */
function _guardCardPresence(container, card, lockHeight) {
  if (typeof MutationObserver === 'undefined') return;

  var presenceGuard = new MutationObserver(function() {
    // Check if our card is still in the container
    if (!container.contains(card)) {
      // Card was removed — re-inject it
      try {
        container.innerHTML = '';
        container.appendChild(card);
        container.style.setProperty('min-height', lockHeight, 'important');
        container.style.setProperty('display', 'block', 'important');
        container.style.setProperty('visibility', 'visible', 'important');
        container.style.setProperty('opacity', '1', 'important');
        console.log('OPL: Re-injected removed card');
      } catch (_e) { /* ignore */ }
    }
  });
  presenceGuard.observe(container, {
    childList: true,
    subtree: false
  });
  _oplGuardObservers.push(presenceGuard);
}

/**
 * Periodically check if any injected cards have been captured inside a
 * full-page overlay (e.g., interstitial takeover). If so, hide them
 * to prevent our small card from appearing on top of a fullscreen backdrop.
 * This runs every second for 30 seconds after injection starts.
 */
var _oplOverlayCheckTimer = null;
var _oplOverlayCheckCount = 0;
var _OPL_MAX_OVERLAY_CHECKS = 60;

function _startOverlayCheck() {
  if (_oplOverlayCheckTimer) return; // Already running
  _oplOverlayCheckCount = 0;

  _oplOverlayCheckTimer = setInterval(function() {
    _oplOverlayCheckCount++;
    _checkForOverlayCapture();
    if (_oplOverlayCheckCount >= _OPL_MAX_OVERLAY_CHECKS) {
      clearInterval(_oplOverlayCheckTimer);
      _oplOverlayCheckTimer = null;
    }
  }, 1000);
}

function _checkForOverlayCapture() {
  for (var i = _oplInjectedElements.length - 1; i >= 0; i--) {
    var entry = _oplInjectedElements[i];
    var el = entry.element;

    // Skip elements no longer in the DOM
    if (!el || !el.parentElement) {
      _oplInjectedElements.splice(i, 1);
      continue;
    }

    // Check if this element has become an overlay
    var isInOverlay = false;
    try {
      if (typeof _hasOverlayAncestor === 'function') {
        isInOverlay = _hasOverlayAncestor(el);
      }
      if (!isInOverlay && typeof _isFullPageTakeover === 'function') {
        isInOverlay = _isFullPageTakeover(el);
      }
    } catch (_e) {}

    if (isInOverlay) {
      // Remove the guard attribute so our stylesheet doesn't fight us
      el.removeAttribute('data-opl-injected');
      el.style.setProperty('display', 'none', 'important');
      el.style.setProperty('visibility', 'hidden', 'important');
      el.style.setProperty('width', '0', 'important');
      el.style.setProperty('height', '0', 'important');
      el.style.setProperty('overflow', 'hidden', 'important');
      el.style.setProperty('position', 'absolute', 'important');
      el.style.setProperty('pointer-events', 'none', 'important');
      if (typeof _collapseOverlayAncestors === 'function') {
        _collapseOverlayAncestors(el);
      }
      _oplInjectedElements.splice(i, 1);
      console.log('OPL: Removed card captured by overlay takeover');
      continue;
    }

    // Restore collapsed containers (ad JS hiding our cards)
    // Check if element or any ancestor up to 3 levels has been collapsed
    var collapsed = false;
    try {
      var checkEl = el;
      for (var lvl = 0; lvl < 4 && checkEl && checkEl !== document.body; lvl++) {
        var cs = window.getComputedStyle(checkEl);
        if (cs.display === 'none' || cs.visibility === 'hidden' ||
            parseFloat(cs.opacity) < 0.1 || checkEl.offsetHeight < 5) {
          collapsed = true;
          if (lvl === 0) {
            // Container itself — full restore via data-opl-container attribute
            checkEl.setAttribute('data-opl-container', 'true');
            checkEl.style.setProperty('--opl-h', entry.lockHeight);
            checkEl.style.setProperty('display', 'block', 'important');
            checkEl.style.setProperty('visibility', 'visible', 'important');
            checkEl.style.setProperty('opacity', '1', 'important');
            checkEl.style.setProperty('min-height', entry.lockHeight, 'important');
          } else {
            // Ancestor — only restore display/visibility/opacity
            // Use saved original display value to avoid breaking flex/grid
            if (cs.display === 'none') {
              var origDisp = checkEl.getAttribute('data-opl-orig-display');
              checkEl.style.setProperty('display', origDisp || 'block', 'important');
            }
            if (cs.visibility === 'hidden') {
              checkEl.style.setProperty('visibility', 'visible', 'important');
            }
            if (parseFloat(cs.opacity) < 0.1) {
              checkEl.style.setProperty('opacity', '1', 'important');
            }
            if (checkEl.offsetHeight < 5) {
              checkEl.style.setProperty('min-height', entry.lockHeight, 'important');
            }
          }
        }
        checkEl = checkEl.parentElement;
      }
    } catch (_e2) {}

    // Also re-apply container styles in case they were stripped
    if (collapsed || el.offsetHeight < 5) {
      el.setAttribute('data-opl-container', 'true');
      el.style.setProperty('--opl-h', entry.lockHeight);
      el.style.setProperty('min-height', entry.lockHeight, 'important');
      el.style.setProperty('display', 'block', 'important');
      el.style.setProperty('visibility', 'visible', 'important');
      el.style.setProperty('opacity', '1', 'important');
      el.style.setProperty('overflow', 'hidden', 'important');
    }

    // Re-inject card if it was removed
    if (entry.card && !el.contains(entry.card)) {
      try {
        el.innerHTML = '';
        el.appendChild(entry.card);
        console.log('OPL: Periodic re-inject of removed card');
      } catch (_e3) { /* ignore */ }
    }
  }
}

/**
 * Collapse any fixed/absolute overlay ancestors of an element by setting
 * display:none. This prevents the ad platform's overlay backdrop from
 * covering the page after we hide our card.
 */
function _collapseOverlayAncestors(el) {
  var vw = window.innerWidth || 1;
  var vh = window.innerHeight || 1;
  var ancestor = el.parentElement;
  while (ancestor && ancestor !== document.body && ancestor !== document.documentElement) {
    try {
      var style = window.getComputedStyle(ancestor);
      if (style.position === 'fixed' || style.position === 'absolute') {
        var rect = ancestor.getBoundingClientRect();
        if (rect.width > vw * 0.7 && rect.height > vh * 0.7) {
          ancestor.style.setProperty('display', 'none', 'important');
          ancestor.style.setProperty('visibility', 'hidden', 'important');
        }
      }
    } catch (_e) { /* ignore */ }
    ancestor = ancestor.parentElement;
  }
}

/**
 * Get the next action in the rotation.
 * Cycles through all available actions.
 * 
 * @param {Array} actions - Array of labor action objects
 * @returns {Object|null} - Next action in rotation, or null if no actions
 */
function getNextAction(actions) {
  if (!actions || actions.length === 0) return null;
  var action = actions[_oplActionIndex % actions.length];
  _oplActionIndex++;
  return action;
}

/**
 * Replace a single ad element with a strike card.
 * 
 * @param {HTMLElement} element - The ad element to replace
 * @param {Array} actions - Available labor actions
 * @returns {boolean} - True if replacement succeeded
 */
function replaceAdWithCard(element, actions) {
  // Skip if already processed
  if (_oplReplacedElements && _oplReplacedElements.has(element)) {
    return false;
  }
  if (element.getAttribute('data-opl-injected') === 'true') {
    return false;
  }

  var action = getNextAction(actions);
  if (!action) return false;

  // Get element dimensions before clearing
  var rect = element.getBoundingClientRect();
  var width = rect.width || element.offsetWidth;
  var height = rect.height || element.offsetHeight;

  // Safety-net: never inject into structural elements or tiny/detached elements
  var blockedTags = { 'HTML': 1, 'BODY': 1, 'HEAD': 1, 'HEADER': 1, 'FOOTER': 1, 'MAIN': 1, 'NAV': 1 };
  if (blockedTags[element.tagName]) {
    console.log('OPL: Blocked injection into structural element:', element.tagName);
    return false;
  }
  if (!element.parentElement && element !== document.documentElement) {
    console.log('OPL: Blocked injection into detached element');
    return false;
  }
  if (width < 50 || height < 40) {
    console.log('OPL: Blocked injection into tiny element:', width + 'x' + height, element.tagName, element.id || '', element.className || '');
    return false;
  }

  // Cap dimensions to sane maximums — prevents injection into full-page takeover containers
  // that slipped past the findAdElements filter (e.g., resized after detection)
  var maxW = (typeof MAX_AD_WIDTH !== 'undefined') ? MAX_AD_WIDTH : 970;
  var maxH = (typeof MAX_AD_HEIGHT !== 'undefined') ? MAX_AD_HEIGHT : 600;
  if (width > maxW) width = maxW;
  if (height > maxH) height = maxH;

  // Determine size category
  // Use getAdSize from ad-detector.js if available, otherwise compute here
  var size;
  if (typeof getAdSize === 'function') {
    size = getAdSize(element);
  } else {
    if (width >= 300 && height >= 200) size = 'large';
    else if (width < 200 || height < 60) size = 'small';
    else size = 'medium';
  }

  // Render the strike card
  var card;
  if (typeof renderStrikeCard === 'function') {
    card = renderStrikeCard(action, size, { width: width, height: height });
  } else {
    return false;
  }

  // Replace ad element content
  try {
    // Pre-check: bail if element is currently inside a fullscreen overlay
    if (typeof _hasOverlayAncestor === 'function' && _hasOverlayAncestor(element)) {
      console.log('OPL: Skipped injection - element inside overlay:', element.tagName, element.id || '', element.className || '');
      return false;
    }

    // Log what we're injecting into for debugging
    console.log('OPL: Injecting into', element.tagName,
      'id=' + (element.id || '(none)'),
      'class=' + (element.className || '(none)'),
      'size=' + width + 'x' + height,
      'parent=' + (element.parentElement ? element.parentElement.tagName + '#' + (element.parentElement.id || '') : '(none)'));

    element.innerHTML = '';
    element.appendChild(card);

    // Ensure the guard stylesheet is in the page
    _injectGuardStylesheet();

    // Lock the container's dimensions so ad-platform JS cannot resize it.
    // Use max-width/max-height as caps but let width be 100% so it respects
    // parent constraints (flex/grid columns) that may be narrower than
    // the detected BoundingClientRect.
    var lockWidth = width > 0 ? width + 'px' : 'none';
    var lockHeight = height > 0 ? height + 'px' : 'none';
    element.style.setProperty('overflow', 'hidden', 'important');
    element.style.setProperty('max-width', lockWidth, 'important');
    element.style.setProperty('min-height', lockHeight, 'important');
    element.style.setProperty('display', 'block', 'important');
    element.style.setProperty('visibility', 'visible', 'important');
    element.style.setProperty('opacity', '1', 'important');
    element.style.setProperty('box-sizing', 'border-box', 'important');
    element.style.setProperty('padding', '0', 'important');
    // Set CSS custom property so the guard stylesheet can enforce min-height
    element.style.setProperty('--opl-h', lockHeight);
    // Only override position if it's fixed (overlay-like)
    var currentPos = window.getComputedStyle(element).position;
    if (currentPos === 'fixed') {
      element.style.setProperty('position', 'relative', 'important');
    }

    element.setAttribute('data-opl-injected', 'true');
    element.setAttribute('data-opl-container', 'true');

    // Save ancestor display values for correct restore on collapse
    var anc = element.parentElement;
    for (var lvl = 0; lvl < 3 && anc && anc !== document.body && anc !== document.documentElement; lvl++) {
      if (!anc.hasAttribute('data-opl-orig-display')) {
        var origDisp = window.getComputedStyle(anc).display;
        if (origDisp !== 'none') {
          anc.setAttribute('data-opl-orig-display', origDisp);
        }
      }
      anc = anc.parentElement;
    }

    // Guard against ad-platform JS mutating the container styles back
    _guardContainerSize(element, lockWidth, lockHeight);

    // Watch for our card being removed from the container (ad JS replacing innerHTML)
    _guardCardPresence(element, card, lockHeight);

    // Track for overlay-capture detection and periodic restore
    _oplInjectedElements.push({ element: element, lockWidth: lockWidth, lockHeight: lockHeight, card: card });

    // Mark in WeakSet
    if (_oplReplacedElements) {
      _oplReplacedElements.add(element);
    }

    return true;
  } catch (e) {
    console.error('OPL: Failed to replace ad element:', e);
    return false;
  }
}

/**
 * Process a batch of detected ad elements.
 * 
 * @param {Array<{element: HTMLElement, size: string, rect: Object}>} adElements
 * @param {Array} actions - Available labor actions
 * @returns {number} - Count of successfully replaced elements
 */
function processAdElements(adElements, actions) {
  var count = 0;
  for (var i = 0; i < adElements.length; i++) {
    if (replaceAdWithCard(adElements[i].element, actions)) {
      count++;
    }
  }
  return count;
}

/**
 * Initialize the strike injector on a page.
 * 
 * 1. Immediately scans for existing ad elements
 * 2. Sets up MutationObserver for dynamically loaded ads
 * 3. Rotates through available actions across ad slots
 * 
 * @param {Array} actions - Array of labor action objects from the background script
 * @returns {{ stop: function(): void }} - Handle to stop the injector
 */
function initStrikeInjector(actions) {
  if (_oplInjectorActive) {
    stopStrikeInjector();
  }

  if (!actions || actions.length === 0) {
    console.log('OPL Ad Blocker: No actions available for injection');
    return { stop: function() {} };
  }

  _oplInjectorActive = true;
  _oplActionIndex = 0;
  console.log('OPL Ad Blocker: Starting with ' + actions.length + ' actions');

  // Start periodic overlay-capture check
  _startOverlayCheck();

  // Initial scan
  if (typeof findAdElements === 'function') {
    var initialAds = findAdElements(document);
    console.log('OPL Ad Blocker: Initial scan found ' + initialAds.length + ' ad elements');
    if (initialAds.length > 0) {
      var replaced = processAdElements(initialAds, actions);
      console.log('OPL Ad Blocker: Replaced ' + replaced + ' ads on initial scan');
    }
  }

  // Observe for dynamically inserted ads
  if (typeof observeNewAds === 'function') {
    _oplAdObserver = observeNewAds(function(newAds) {
      if (newAds.length > 0) {
        var count = processAdElements(newAds, actions);
        if (count > 0) {
          console.log('OPL Ad Blocker: Replaced ' + count + ' dynamically loaded ads');
        }
      }
    });
  }

  return {
    stop: stopStrikeInjector
  };
}

/**
 * Stop the strike injector.
 * Disconnects the MutationObserver. Does NOT restore original ads
 * (replaced ads stay replaced until page reload).
 */
function stopStrikeInjector() {
  _oplInjectorActive = false;

  if (_oplAdObserver) {
    _oplAdObserver.disconnect();
    _oplAdObserver = null;
  }

  // Stop overlay-capture check
  if (_oplOverlayCheckTimer) {
    clearInterval(_oplOverlayCheckTimer);
    _oplOverlayCheckTimer = null;
  }

  // Disconnect all container-guard observers
  for (var i = 0; i < _oplGuardObservers.length; i++) {
    _oplGuardObservers[i].disconnect();
  }
  _oplGuardObservers = [];
  _oplInjectedElements = [];

  // Remove guard stylesheet
  if (_oplStyleSheet && _oplStyleSheet.parentNode) {
    _oplStyleSheet.parentNode.removeChild(_oplStyleSheet);
    _oplStyleSheet = null;
  }
}

/**
 * Check if the injector is currently active.
 * @returns {boolean}
 */
function isInjectorActive() {
  return _oplInjectorActive;
}

// Export for Node.js/Jest testing environment
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined' && typeof process !== 'undefined') {
  module.exports = {
    initStrikeInjector,
    stopStrikeInjector,
    isInjectorActive,
    replaceAdWithCard,
    processAdElements,
    getNextAction,
    // Expose internal state for testing
    _resetState: function() {
      _oplActionIndex = 0;
      _oplInjectorActive = false;
      _oplReplacedElements = (typeof WeakSet !== 'undefined') ? new WeakSet() : null;
      _oplInjectedElements = [];
      if (_oplAdObserver) {
        _oplAdObserver.disconnect();
        _oplAdObserver = null;
      }
      if (_oplOverlayCheckTimer) {
        clearInterval(_oplOverlayCheckTimer);
        _oplOverlayCheckTimer = null;
      }
      _oplOverlayCheckCount = 0;
      for (var i = 0; i < _oplGuardObservers.length; i++) {
        _oplGuardObservers[i].disconnect();
      }
      _oplGuardObservers = [];
    }
  };
}
