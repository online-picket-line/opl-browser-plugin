
// API service to fetch labor actions from Online Picketline External API (v3.0)
// Requires API key authentication (public or private)
const DEFAULT_API_BASE_URL = 'https://onlinepicketline.com';
const DEFAULT_API_KEY = 'opl_02cafecc3361fb5ee303832dde26e3c67f47b94476b55f10b464ba20bfec4f1c';
const CACHE_KEY = 'labor_actions_cache';
const CACHE_DURATION = 300000; // 5 minutes in milliseconds
const CACHE_HASH_KEY = 'content_hash';


class ApiService {
  constructor() {
    this.baseUrl = DEFAULT_API_BASE_URL;
    this.apiKey = DEFAULT_API_KEY;
  }

  /**
   * Initialize the API service with settings
   */
  async init() {
    // Settings are now hardcoded
    this.baseUrl = DEFAULT_API_BASE_URL;
    this.apiKey = DEFAULT_API_KEY;
  }

  /**
   * Get API settings
   * @returns {Promise<Object>}
   */
  async getSettings() {
    return Promise.resolve({
      apiUrl: DEFAULT_API_BASE_URL,
      apiKey: DEFAULT_API_KEY
    });
  }

  /**
   * Fetch labor actions from the Online Picketline API with caching
   * @returns {Promise<Array>} List of transformed labor action objects with structure:
   *   {
   *     id: string,
   *     title: string,
   *     description: string,
   *     company: string,
   *     type: string,
   *     status: string,
   *     target_urls: string[],
   *     locations: string[],
   *     divisions: string[]
   *   }
   * @throws {Error} If API request fails or API key is invalid
   */
  async getLaborActions() {
    try {
      // Check cache first
      const cached = await this.getCachedData();
      if (cached) {
        console.log('Using cached labor actions');
        return cached;
      }

      // Ensure we have the latest settings
      await this.init();

      // Get cached hash for efficient caching
      const cachedHash = await this.getCachedHash();
      
      // Fetch from Online Picketline External API with required API key
      let url = `${this.baseUrl}/api/blocklist.json?format=extension&includeInactive=false`;
      if (cachedHash) {
        url += `&hash=${cachedHash}`;
      }
      
      const headers = {
        'Accept': 'application/json',
        'X-API-Key': this.apiKey
      };
      
      const response = await fetch(url, {
        method: 'GET',
        headers
      });

      if (response.status === 304) {
        // Content not modified, use cached data
        console.log('Content not modified (304), using cached data');
        const cached = await this.getCachedData(true);
        if (cached) {
          return cached;
        }
        // Fall through to fetch fresh if no cache
      }
      
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After') || '120';
        throw new Error(`Rate limited. Retry after ${retryAfter} seconds`);
      }
      
      if (response.status === 401) {
        throw new Error('Invalid or missing API key. Please check your API key in settings.');
      }
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Store content hash for future requests
      const contentHash = response.headers.get('X-Content-Hash');
      if (contentHash) {
        await this.setCachedHash(contentHash);
      }

      // Transform API response to internal format (new extension format)
      const transformedData = this.transformExtensionApiResponse(data);

      // Cache the transformed data
      await this.setCachedData(transformedData);

      console.log(`Fetched ${transformedData.length} labor actions (Extension format v3.0)`);

      return transformedData;
    } catch (error) {
      console.error('Error fetching labor actions:', error);

      // Return cached data if available, even if expired
      const cached = await this.getCachedData(true);
      if (cached) {
        console.log('Using stale cached data due to API error');
        return cached;
      }

      // Return empty array if no cache available
      return [];
    }
  }

  /**
   * Transform Extension API response to internal format
   * @param {Object} extensionData - Raw extension format from API v3.0
   * @returns {Array} Transformed data for internal use
   */
  transformExtensionApiResponse(extensionData) {
    if (!extensionData || typeof extensionData !== 'object') {
      return [];
    }

    const actions = [];

    // Process each organization in the extension format
    for (const [orgName, orgData] of Object.entries(extensionData)) {
      // Skip the _optimizedPatterns helper object
      if (orgName === '_optimizedPatterns') {
        continue;
      }

      // Extract action details with fallbacks
      const actionDetails = orgData.actionDetails || {};
      
      const action = {
        id: actionDetails.id || `org-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: actionDetails.organization 
          ? `${actionDetails.actionType || 'Labor Action'}: ${actionDetails.organization}` 
          : `Labor Action: ${orgName}`,
        description: actionDetails.description || 'Active labor action',
        company: orgName,
        type: actionDetails.actionType || this.extractActionType('labor action'),
        status: actionDetails.status || 'active',
        more_info: orgData.moreInfoUrl || (actionDetails.urls?.[0]?.url) || '',
        target_urls: (orgData.matchingUrlRegexes || []).map(regex => this.extractDomainFromRegex(regex)),
        locations: actionDetails.location ? [actionDetails.location] : [],
        demands: actionDetails.demands || '',
        startDate: orgData.startTime || actionDetails.startDate || '',
        endDate: orgData.endTime || actionDetails.endDate || '',
        contactInfo: actionDetails.contactInfo || '',
        logoUrl: actionDetails.logoUrl || '',
        divisions: [],
        actionResources: actionDetails.urls || [],
        // Store original extension data for advanced matching
        _extensionData: orgData
      };

      actions.push(action);
    }

    return actions;
  }

  /**
   * Extract domain from regex pattern
   * @param {string} regex - URL matching regex
   * @returns {string} Extracted domain
   */
  extractDomainFromRegex(regex) {
    // Simple extraction - remove common regex chars to get domain
    return regex.replace(/[\\^$*+?.()|[\]{}]/g, '').replace(/\.com.*/, '.com');
  }

  /**
   * Extract action type from reason string
   * @param {string} reason - Reason string from API
   * @returns {string} Action type
   */
  extractActionType(reason) {
    if (!reason) return 'labor_action';
    
    const lowerReason = reason.toLowerCase();
    if (lowerReason.includes('strike')) return 'strike';
    if (lowerReason.includes('boycott')) return 'boycott';
    if (lowerReason.includes('picket')) return 'picket';
    if (lowerReason.includes('protest')) return 'protest';
    
    return 'labor_action';
  }

  /**
   * Parse URL safely
   * @param {string} urlString - URL string
   * @returns {URL|null} Parsed URL or null
   */
  parseUrl(urlString) {
    try {
      return new URL(urlString);
    } catch (e) {
      // If URL doesn't have protocol, try adding https://
      try {
        return new URL('https://' + urlString);
      } catch (e2) {
        console.warn('Failed to parse URL:', urlString);
        return null;
      }
    }
  }

  /**
   * Get cached data from storage
   * @param {boolean} ignoreExpiry - Whether to ignore cache expiry
   * @returns {Promise<Array|null>}
   */
  async getCachedData(ignoreExpiry = false) {
    return new Promise((resolve) => {
      chrome.storage.local.get([CACHE_KEY, 'cache_timestamp'], (result) => {
        const cached = result[CACHE_KEY];
        const timestamp = result.cache_timestamp;

        if (!cached || !timestamp) {
          resolve(null);
          return;
        }

        const now = Date.now();
        const age = now - timestamp;

        if (!ignoreExpiry && age > CACHE_DURATION) {
          resolve(null);
          return;
        }

        resolve(cached);
      });
    });
  }

  /**
   * Cache data in storage
   * @param {Array} data - Labor actions data to cache
   */
  async setCachedData(data) {
    return new Promise((resolve) => {
      chrome.storage.local.set({
        [CACHE_KEY]: data,
        cache_timestamp: Date.now()
      }, resolve);
    });
  }

  /**
   * Clear cached data
   */
  async clearCache() {
    return new Promise((resolve) => {
      chrome.storage.local.remove([CACHE_KEY, 'cache_timestamp', CACHE_HASH_KEY], resolve);
    });
  }

  /**
   * Get cached content hash
   * @returns {Promise<string|null>}
   */
  async getCachedHash() {
    return new Promise((resolve) => {
      chrome.storage.local.get([CACHE_HASH_KEY], (result) => {
        resolve(result[CACHE_HASH_KEY] || null);
      });
    });
  }

  /**
   * Set cached content hash
   * @param {string} hash - Content hash from API
   */
  async setCachedHash(hash) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [CACHE_HASH_KEY]: hash }, resolve);
    });
  }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ApiService;
}
