/**
 * Declarative Net Request Service
 * 
 * This service manages dynamic rules for the declarativeNetRequest API.
 * It converts labor action data from the API into DNR rules that can
 * block or redirect pages based on URL patterns.
 * 
 * Architecture:
 * - Block Mode: Uses redirect rules to send users to block.html
 * - Banner Mode: Uses allowAllRequests rules (allows page load) + content script shows banner
 * 
 * Benefits of DNR:
 * - More performant (browser-level URL matching)
 * - Better privacy (no content script execution on every page until match)
 * - Reduced permission scope for Chrome Web Store approval
 * - Manifest V3 compliant
 */

class DnrService {
  constructor() {
    this.MAX_RULES = 5000; // Chrome limit for dynamic rules
    this.RULE_ID_OFFSET = 1; // Starting rule ID
  }

  /**
   * Convert a regex pattern to DNR urlFilter format
   * 
   * DNR urlFilter supports:
   * - Wildcards: * (zero or more characters)
   * - Separator: ^ (matches /, ?, #, or end of URL)
   * - Domain anchors: ||example.com (matches http(s)://example.com)
   * - Path anchors: |http://example.com (exact start)
   * 
   * @param {string} regexPattern - Regex pattern from API
   * @returns {string|null} - DNR urlFilter pattern or null if conversion fails
   */
  convertRegexToUrlFilter(regexPattern) {
    try {
      // Remove regex anchors and flags
      let pattern = regexPattern.replace(/^\/|\/[igm]*$/g, '');
      
      // Common conversions
      // Domain pattern: example\.com -> ||example.com^
      if (pattern.match(/^[a-z0-9\\.-]+\.[a-z]{2,}$/i)) {
        return `||${pattern}^`;
      }
      
      // Domain with path: example\.com/path -> ||example.com/path
      if (pattern.match(/^[a-z0-9\\.-]+\.[a-z]{2,}\/.+$/i)) {
        pattern = pattern.replace(/\\\./g, '.');
        return `||${pattern}`;
      }
      
      // Facebook/social media pattern: facebook\.com/company
      if (pattern.includes('facebook.com') || pattern.includes('twitter.com') || 
          pattern.includes('instagram.com') || pattern.includes('linkedin.com')) {
        pattern = pattern.replace(/\\\./g, '.').replace(/\.\*/g, '*');
        return `||${pattern}*`;
      }
      
      // OR patterns: (example\.com|test\.com)
      // DNR doesn't support OR in single rule, return first option
      const orMatch = pattern.match(/\(([^|]+)\|/);
      if (orMatch) {
        const firstOption = orMatch[1].replace(/\\\./g, '.');
        return `||${firstOption}*`;
      }
      
      // Generic pattern with wildcards
      pattern = pattern
        .replace(/\\\./g, '.') // Unescape dots
        .replace(/\.\*/g, '*')  // .* -> *
        .replace(/\.\+/g, '*')  // .+ -> *
        .replace(/\*/g, '*');   // Normalize wildcards
      
      // If pattern looks like a domain
      if (pattern.match(/^[a-z0-9\\.*-]+$/i)) {
        return `||${pattern}*`;
      }
      
      // Otherwise try as substring match
      return `*${pattern}*`;
      
    } catch (error) {
      console.error('Error converting regex to urlFilter:', regexPattern, error);
      return null;
    }
  }

  /**
   * Generate multiple DNR rules from a single regex if needed
   * Some complex patterns need multiple rules
   * 
   * @param {string} regexPattern - Regex pattern from API
   * @returns {Array<string>} - Array of DNR urlFilter patterns
   */
  expandRegexToMultipleFilters(regexPattern) {
    try {
      let pattern = regexPattern.replace(/^\/|\/[igm]*$/g, '');
      
      // Handle OR patterns: (example\.com|test\.com|another\.com)
      const orPattern = /^\(([^)]+)\)$/;
      const orMatch = pattern.match(orPattern);
      
      if (orMatch) {
        // Split by | and convert each to a filter
        const options = orMatch[1].split('|');
        return options
          .map(opt => this.convertRegexToUrlFilter(opt.trim()))
          .filter(f => f !== null);
      }
      
      // Single pattern
      const filter = this.convertRegexToUrlFilter(pattern);
      return filter ? [filter] : [];
      
    } catch (error) {
      console.error('Error expanding regex pattern:', regexPattern, error);
      return [];
    }
  }

  /**
   * Generate DNR rules for block mode
   * Redirects matching URLs to block.html with action data
   * 
   * @param {Array} laborActions - Array of labor action objects
   * @returns {Array} - Array of DNR rule objects
   */
  generateBlockModeRules(laborActions) {
    const rules = [];
    let ruleId = this.RULE_ID_OFFSET;

    for (const action of laborActions) {
      // Skip inactive actions
      if (action.status && action.status !== 'active') {
        continue;
      }

      // Get URL patterns from action
      const patterns = action._extensionData?.matchingUrlRegexes || 
                      action.matchingUrlRegexes || 
                      action.target_urls || 
                      [];

      for (const pattern of patterns) {
        // Expand pattern into multiple filters if needed
        const urlFilters = this.expandRegexToMultipleFilters(pattern);
        
        for (const urlFilter of urlFilters) {
          if (ruleId > this.MAX_RULES) {
            console.warn(`Reached maximum rule limit (${this.MAX_RULES})`);
            return rules;
          }

          // Create redirect rule to block page
          // We'll pass the action ID in the redirect URL
          const blockPageUrl = chrome.runtime.getURL('block.html');
          
          rules.push({
            id: ruleId++,
            priority: 1,
            action: {
              type: 'redirect',
              redirect: {
                // Note: We can't pass dynamic data in redirect URL easily
                // So we'll store action data in storage and retrieve it
                url: blockPageUrl
              }
            },
            condition: {
              urlFilter: urlFilter,
              resourceTypes: ['main_frame'] // Only intercept main page loads
            }
          });
        }
      }
    }

    return rules;
  }

  /**
   * Generate DNR rules for banner mode
   * Allows page load but marks for banner display
   * 
   * Strategy: We can't inject content with DNR, so we use a hybrid approach:
   * 1. Don't use DNR rules for banner mode (let page load normally)
   * 2. Content script still checks URLs and shows banner
   * 3. This keeps banner mode non-intrusive
   * 
   * Alternative: Could use allowAllRequests action with content script
   * 
   * @param {Array} laborActions - Array of labor action objects
   * @returns {Array} - Empty array (banner mode uses content script)
   */
  generateBannerModeRules(_laborActions) {
    // For banner mode, we don't use DNR rules
    // Content script will handle URL checking and banner display
    // This keeps the banner non-intrusive and allows the page to load normally
    return [];
  }

  /**
   * Update DNR rules based on labor actions and mode
   * 
   * @param {Array} laborActions - Array of labor action objects
   * @param {boolean} blockMode - Whether to use block mode (true) or banner mode (false)
   * @returns {Promise<boolean>} - Success status
   */
  async updateRules(laborActions, blockMode) {
    try {
      console.log(`Updating DNR rules for ${blockMode ? 'block' : 'banner'} mode`);
      
      // Generate rules based on mode
      const newRules = blockMode 
        ? this.generateBlockModeRules(laborActions)
        : this.generateBannerModeRules(laborActions);

      console.log(`Generated ${newRules.length} DNR rules`);

      // Get existing dynamic rules
      const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
      const existingRuleIds = existingRules.map(rule => rule.id);

      // Update rules atomically
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: existingRuleIds, // Remove all existing rules
        addRules: newRules // Add new rules
      });

      console.log('DNR rules updated successfully');
      return true;

    } catch (error) {
      console.error('Error updating DNR rules:', error);
      return false;
    }
  }

  /**
   * Clear all DNR rules
   * Used when switching to banner mode or on errors
   * 
   * @returns {Promise<boolean>} - Success status
   */
  async clearRules() {
    try {
      const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
      const existingRuleIds = existingRules.map(rule => rule.id);

      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: existingRuleIds
      });

      console.log('DNR rules cleared');
      return true;

    } catch (error) {
      console.error('Error clearing DNR rules:', error);
      return false;
    }
  }

  /**
   * Add bypass rule for a specific URL
   * Allows user to proceed to a blocked page
   * 
   * @param {string} url - URL to allow
   * @returns {Promise<boolean>} - Success status
   */
  async addBypassRule(url) {
    try {
      // Extract domain from URL for urlFilter
      let domain;
      try {
        const urlObj = new URL(url);
        domain = urlObj.hostname;
      } catch (_e) {
        // If URL parsing fails, try to extract domain manually
        domain = url.replace(/^https?:\/\//, '').split('/')[0];
      }
      
      // Create an allow rule with higher priority
      const bypassRule = {
        id: this.MAX_RULES + 10000 + Math.floor(Math.random() * 1000), // Unique ID range for bypasses
        priority: 100, // Much higher priority than block rules (which have priority 1)
        action: {
          type: 'allow'
        },
        condition: {
          urlFilter: `||${domain}`, // Match domain and subpaths
          resourceTypes: ['main_frame']
        }
      };

      await chrome.declarativeNetRequest.updateSessionRules({
        addRules: [bypassRule]
      });

      console.log('Added bypass rule for domain:', domain);
      return true;

    } catch (error) {
      console.error('Error adding bypass rule:', error);
      return false;
    }
  }

  /**
   * Get statistics about current DNR rules
   * 
   * @returns {Promise<Object>} - Rule statistics
   */
  async getRuleStats() {
    try {
      const rules = await chrome.declarativeNetRequest.getDynamicRules();
      
      return {
        totalRules: rules.length,
        maxRules: this.MAX_RULES,
        rulesRemaining: this.MAX_RULES - rules.length,
        ruleTypes: {
          redirect: rules.filter(r => r.action.type === 'redirect').length,
          allow: rules.filter(r => r.action.type === 'allow').length,
          block: rules.filter(r => r.action.type === 'block').length
        }
      };

    } catch (error) {
      console.error('Error getting rule stats:', error);
      return null;
    }
  }
}
