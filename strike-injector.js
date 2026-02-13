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

// Whether the injector is currently active
var _oplInjectorActive = false;

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

  // Determine size category
  // Use getAdSize from ad-detector.js if available, otherwise compute here
  var size;
  if (width >= 50 && height >= 30) {
    if (typeof getAdSize === 'function') {
      size = getAdSize(element);
    } else {
      if (width >= 300 && height >= 200) size = 'large';
      else if (width < 200 || height < 60) size = 'small';
      else size = 'medium';
    }
  } else {
    // Container is tiny or unsized — default to medium and let the card set its own size
    size = 'medium';
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
    element.innerHTML = '';
    element.appendChild(card);
    element.style.overflow = 'hidden';
    element.setAttribute('data-opl-injected', 'true');

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
      if (_oplAdObserver) {
        _oplAdObserver.disconnect();
        _oplAdObserver = null;
      }
    }
  };
}
