/**
 * WebRequest Service for Manifest V2 (Firefox)
 * 
 * This service uses the webRequest API to block pages based on labor actions.
 * This is the Firefox/MV2 equivalent of the DNR service used in Chrome/MV3.
 */

// Use function constructor for better Firefox compatibility
function WebRequestService() {
  this.isListenerActive = false;
  this.laborActions = [];
  this.blockMode = false;
  this.bypassedDomains = {};
  this._boundHandler = null;
}

/**
 * Check if a domain has been bypassed
 */
WebRequestService.prototype.isDomainBypassed = function(url) {
  try {
    var hostname = new URL(url).hostname.toLowerCase();
    for (var domain in this.bypassedDomains) {
      if (this.bypassedDomains.hasOwnProperty(domain)) {
        if (hostname === domain || hostname.endsWith('.' + domain)) {
          return true;
        }
      }
    }
  } catch (e) {
    // Invalid URL
  }
  return false;
};

/**
 * Add a domain to the bypass list
 */
WebRequestService.prototype.addBypass = function(domain) {
  if (domain) {
    this.bypassedDomains[domain.toLowerCase()] = true;
    console.log('Added bypass for domain:', domain);
  }
};

/**
 * Match URL against labor action patterns
 */
WebRequestService.prototype.matchUrlToAction = function(url) {
  if (!url || !this.laborActions || this.laborActions.length === 0) {
    return null;
  }

  try {
    var urlToTest = url.toLowerCase();
    var i, j, action, patterns, pattern, regex, hostname, targets, target;

    for (i = 0; i < this.laborActions.length; i++) {
      action = this.laborActions[i];
      
      // Skip inactive actions
      if (action.status && action.status !== 'active') {
        continue;
      }

      // Use extension format data if available
      if (action._extensionData && action._extensionData.matchingUrlRegexes) {
        patterns = action._extensionData.matchingUrlRegexes;
        for (j = 0; j < patterns.length; j++) {
          pattern = patterns[j];
          try {
            regex = new RegExp(pattern, 'i');
            if (regex.test(urlToTest)) {
              return action;
            }
          } catch (e) {
            console.warn('Invalid regex pattern:', pattern);
          }
        }
      } else {
        // Fallback to legacy target_urls matching
        try {
          hostname = new URL(url).hostname.toLowerCase();
        } catch (e) {
          continue;
        }
        targets = action.target_urls || action.targets || action.domains || [];

        for (j = 0; j < targets.length; j++) {
          target = targets[j].toLowerCase();
          if (hostname === target || hostname.endsWith('.' + target)) {
            return action;
          }
        }

        // Fallback: check company name
        if (action.company) {
          var companyLower = action.company.toLowerCase().replace(/\s+/g, '');
          if (hostname.indexOf(companyLower) !== -1) {
            return action;
          }
        }
      }
    }
  } catch (error) {
    console.error('Error matching URL in WebRequestService:', error);
  }

  return null;
};

/**
 * Handle webRequest.onBeforeRequest event
 */
WebRequestService.prototype.handleRequest = function(details) {
  // Only process main frame
  if (details.type !== 'main_frame') {
    return;
  }

  console.log('WebRequest intercepted:', details.url, 'blockMode:', this.blockMode, 'actions:', this.laborActions.length);

  if (!this.blockMode) {
    return;
  }

  if (this.isDomainBypassed(details.url)) {
    console.log('WebRequest: Allowing bypassed URL:', details.url);
    return;
  }

  var match = this.matchUrlToAction(details.url);
  
  if (match) {
    console.log('WebRequest blocking URL:', details.url, 'Action:', match.title);
    
    var domain = '';
    try {
      domain = new URL(details.url).hostname;
    } catch (e) {
      domain = details.url.replace(/^https?:\/\//, '').split('/')[0];
    }

    var blockPageUrl = (typeof browser !== 'undefined' ? browser : chrome).runtime.getURL('block.html');
    return {
      redirectUrl: blockPageUrl + '?domain=' + encodeURIComponent(domain) + '&url=' + encodeURIComponent(details.url)
    };
  }
};

/**
 * Update the webRequest listener based on current settings
 */
WebRequestService.prototype.updateRules = function(laborActions, blockMode) {
  this.laborActions = laborActions || [];
  this.blockMode = blockMode;

  console.log('WebRequest service: ' + this.laborActions.length + ' actions, blockMode=' + blockMode);

  if (blockMode && !this.isListenerActive) {
    this.startListener();
  } else if (!blockMode && this.isListenerActive) {
    this.stopListener();
  }

  return Promise.resolve(true);
};

/**
 * Start the webRequest listener
 */
WebRequestService.prototype.startListener = function() {
  if (this.isListenerActive) {
    console.log('WebRequest listener already active');
    return;
  }

  console.log('Starting WebRequest listener...');

  var self = this;
  this._boundHandler = function(details) {
    return self.handleRequest(details);
  };

  var webRequestAPI = (typeof browser !== 'undefined' ? browser.webRequest : null) || 
                      (typeof chrome !== 'undefined' ? chrome.webRequest : null);
  
  if (!webRequestAPI) {
    console.error('WebRequest API not available!');
    return;
  }

  try {
    webRequestAPI.onBeforeRequest.addListener(
      this._boundHandler,
      { urls: ['<all_urls>'], types: ['main_frame'] },
      ['blocking']
    );
    this.isListenerActive = true;
    console.log('WebRequest blocking listener started successfully');
  } catch (err) {
    console.error('Failed to add WebRequest listener:', err);
  }
};

/**
 * Stop the webRequest listener
 */
WebRequestService.prototype.stopListener = function() {
  if (!this.isListenerActive || !this._boundHandler) {
    return;
  }

  var webRequestAPI = (typeof browser !== 'undefined' ? browser.webRequest : null) || 
                      (typeof chrome !== 'undefined' ? chrome.webRequest : null);
  
  if (webRequestAPI) {
    webRequestAPI.onBeforeRequest.removeListener(this._boundHandler);
  }
  
  this.isListenerActive = false;
  this._boundHandler = null;
  console.log('WebRequest blocking listener stopped');
};

/**
 * Clear all rules
 */
WebRequestService.prototype.clearRules = function() {
  this.stopListener();
  this.laborActions = [];
  return Promise.resolve(true);
};

/**
 * Add bypass rule (compatibility method)
 */
WebRequestService.prototype.addBypassRule = function(url) {
  try {
    var domain = new URL(url).hostname;
    this.addBypass(domain);
  } catch (e) {
    console.error('Error adding bypass rule:', e);
  }
  return Promise.resolve(true);
};

/**
 * Get rule statistics
 */
WebRequestService.prototype.getRuleStats = function() {
  var bypassList = [];
  for (var domain in this.bypassedDomains) {
    if (this.bypassedDomains.hasOwnProperty(domain)) {
      bypassList.push(domain);
    }
  }
  return Promise.resolve({
    totalRules: this.laborActions.length,
    maxRules: 'unlimited',
    listenerActive: this.isListenerActive,
    blockMode: this.blockMode,
    bypassedDomains: bypassList
  });
};

// Export for Node.js testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WebRequestService;
}
