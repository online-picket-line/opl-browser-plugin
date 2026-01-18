/**
 * WebRequest Service for Manifest V2 (Firefox)
 * 
 * This service uses the webRequest API to block pages based on labor actions.
 * This is the Firefox/MV2 equivalent of the DNR service used in Chrome/MV3.
 * 
 * The webRequest API allows intercepting and blocking/redirecting requests
 * before they are made, which is used to implement block mode.
 */

class WebRequestService {
  constructor() {
    this.isListenerActive = false;
    this.laborActions = [];
    this.blockMode = false;
    this.bypassedDomains = new Set(); // Track bypassed domains in memory
  }

  /**
   * Check if a domain has been bypassed
   * @param {string} url - URL to check
   * @returns {boolean} - True if bypassed
   */
  isDomainBypassed(url) {
    try {
      const hostname = new URL(url).hostname.toLowerCase();
      // Check exact match or parent domain match
      for (const bypassed of this.bypassedDomains) {
        if (hostname === bypassed || hostname.endsWith('.' + bypassed)) {
          return true;
        }
      }
    } catch (_e) {
      // Invalid URL
    }
    return false;
  }

  /**
   * Add a domain to the bypass list
   * @param {string} domain - Domain to bypass
   * @param {string} _url - Original URL (unused but kept for API compatibility)
   */
  addBypass(domain, _url) {
    if (domain) {
      this.bypassedDomains.add(domain.toLowerCase());
      console.log('Added bypass for domain:', domain);
    }
  }

  /**
   * Match URL against labor action patterns
   * @param {string} url - URL to check
   * @returns {Object|null} - Matching action or null
   */
  matchUrlToAction(url) {
    if (!url || !this.laborActions || this.laborActions.length === 0) {
      return null;
    }

    try {
      const urlToTest = url.toLowerCase();

      for (const action of this.laborActions) {
        // Skip inactive actions
        if (action.status && action.status !== 'active') {
          continue;
        }

        // Use extension format data if available (preferred)
        if (action._extensionData && action._extensionData.matchingUrlRegexes) {
          for (const pattern of action._extensionData.matchingUrlRegexes) {
            try {
              const regex = new RegExp(pattern, 'i');
              if (regex.test(urlToTest)) {
                return action;
              }
            } catch (_e) {
              console.warn('Invalid regex pattern:', pattern);
              continue;
            }
          }
        } else {
          // Fallback to legacy target_urls matching
          const hostname = new URL(url).hostname.toLowerCase();
          const targets = action.target_urls || action.targets || action.domains || [];

          for (const target of targets) {
            const targetLower = target.toLowerCase();

            // Match exact domain or subdomain
            if (hostname === targetLower || hostname.endsWith('.' + targetLower)) {
              return action;
            }
          }

          // Fallback: check company name
          if (action.company) {
            const companyLower = action.company.toLowerCase().replace(/\s+/g, '');
            if (hostname.includes(companyLower)) {
              return action;
            }
          }
        }
      }
    } catch (error) {
      console.error('Error matching URL in WebRequestService:', error);
    }

    return null;
  }

  /**
   * Handle webRequest.onBeforeRequest event
   * @param {Object} details - Request details
   * @returns {Object|void} - Blocking response or nothing
   */
  handleRequest(details) {
    // Only process main frame (top-level navigation)
    if (details.type !== 'main_frame') {
      return;
    }

    // Skip if not in block mode
    if (!this.blockMode) {
      return;
    }

    // Check if this domain has been bypassed
    if (this.isDomainBypassed(details.url)) {
      console.log('WebRequest: Allowing bypassed URL:', details.url);
      return;
    }

    // Check if this URL matches a labor action
    const match = this.matchUrlToAction(details.url);
    
    if (match) {
      console.log('WebRequest blocking URL:', details.url, 'Action:', match.title);
      
      // Extract domain for block page
      let domain = '';
      try {
        domain = new URL(details.url).hostname;
      } catch (e) {
        domain = details.url.replace(/^https?:\/\//, '').split('/')[0];
      }

      // Redirect to block page
      const blockPageUrl = browser.runtime.getURL('block.html');
      return {
        redirectUrl: `${blockPageUrl}?domain=${encodeURIComponent(domain)}&url=${encodeURIComponent(details.url)}`
      };
    }
  }

  /**
   * Update the webRequest listener based on current settings
   * @param {Array} laborActions - Labor actions from API
   * @param {boolean} blockMode - Whether block mode is enabled
   */
  updateRules(laborActions, blockMode) {
    this.laborActions = laborActions || [];
    this.blockMode = blockMode;

    console.log(`WebRequest service: ${this.laborActions.length} actions, blockMode=${blockMode}`);

    // Set up the listener if in block mode and not already active
    if (blockMode && !this.isListenerActive && this.laborActions.length > 0) {
      this.startListener();
    } 
    // Remove listener if not in block mode
    else if (!blockMode && this.isListenerActive) {
      this.stopListener();
    }

    return Promise.resolve(true);
  }

  /**
   * Start the webRequest listener
   */
  startListener() {
    if (this.isListenerActive) {
      return;
    }

    // Bind the handler to this instance
    this._boundHandler = this.handleRequest.bind(this);

    browser.webRequest.onBeforeRequest.addListener(
      this._boundHandler,
      { urls: ['<all_urls>'], types: ['main_frame'] },
      ['blocking']
    );

    this.isListenerActive = true;
    console.log('WebRequest blocking listener started');
  }

  /**
   * Stop the webRequest listener
   */
  stopListener() {
    if (!this.isListenerActive || !this._boundHandler) {
      return;
    }

    browser.webRequest.onBeforeRequest.removeListener(this._boundHandler);
    this.isListenerActive = false;
    this._boundHandler = null;
    console.log('WebRequest blocking listener stopped');
  }

  /**
   * Clear all rules (stop blocking)
   */
  clearRules() {
    this.stopListener();
    this.laborActions = [];
    return Promise.resolve(true);
  }

  /**
   * Add bypass for a URL (store in session)
   * @param {string} url - URL to bypass
   */
  addBypassRule(url) {
    // For MV2, we handle bypasses differently - store bypassed domains in session storage
    // The content script and block page can check this
    try {
      const domain = new URL(url).hostname;
      browser.storage.session.get(['bypassed_domains']).then((result) => {
        const bypassed = result.bypassed_domains || [];
        if (!bypassed.includes(domain)) {
          bypassed.push(domain);
          browser.storage.session.set({ bypassed_domains: bypassed });
        }
      }).catch(() => {
        // session storage may not be available in older Firefox
        console.log('Session storage not available for bypass');
      });
      // Also add to in-memory bypass list
      this.addBypass(domain);
    } catch (e) {
      console.error('Error adding bypass rule:', e);
    }
    return Promise.resolve(true);
  }

  /**
   * Get rule statistics
   */
  getRuleStats() {
    return Promise.resolve({
      totalRules: this.laborActions.length,
      maxRules: 'unlimited',
      rulesRemaining: 'unlimited',
      listenerActive: this.isListenerActive,
      blockMode: this.blockMode,
      bypassedDomains: Array.from(this.bypassedDomains)
    });
  }
}

// Export for use in background script
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = WebRequestService;
}
