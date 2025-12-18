// API service to fetch labor actions from Online Picketline API
// Default API base URL - can be configured via settings
const DEFAULT_API_BASE_URL = 'https://your-instance.com';
const CACHE_KEY = 'labor_actions_cache';
const CACHE_DURATION = 900000; // 15 minutes in milliseconds (as recommended by API docs)

class ApiService {
  constructor() {
    this.baseUrl = DEFAULT_API_BASE_URL;
    this.apiKey = null;
  }

  /**
   * Initialize the API service with settings
   */
  async init() {
    const settings = await this.getSettings();
    if (settings.apiUrl) {
      this.baseUrl = settings.apiUrl;
    }
    if (settings.apiKey) {
      this.apiKey = settings.apiKey;
    }
  }

  /**
   * Get API settings from storage
   * @returns {Promise<Object>}
   */
  async getSettings() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['apiUrl', 'apiKey'], (result) => {
        resolve({
          apiUrl: result.apiUrl || DEFAULT_API_BASE_URL,
          apiKey: result.apiKey || null
        });
      });
    });
  }

  /**
   * Fetch labor actions from the Online Picketline API with caching
   * @returns {Promise<Array>} List of blocklist entries
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

      if (!this.apiKey) {
        console.warn('No API key configured. Please set up API key in extension settings.');
        return [];
      }

      // Fetch from Online Picketline API
      const url = `${this.baseUrl}/api/blocklist?format=json&includeInactive=false`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-API-Key': this.apiKey
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid API key. Please check your API key in extension settings.');
        }
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      
      // Transform API response to internal format
      const transformedData = this.transformApiResponse(data);
      
      // Cache the transformed data
      await this.setCachedData(transformedData);
      
      console.log(`Fetched ${transformedData.length} labor actions from ${data.employers?.length || 0} employers`);
      
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
   * Transform API response to internal format
   * @param {Object} apiData - Raw API response
   * @returns {Array} Transformed data
   */
  transformApiResponse(apiData) {
    if (!apiData || !apiData.blocklist) {
      return [];
    }

    // Group URLs by employer to create labor action entries
    const employerMap = new Map();
    
    apiData.blocklist.forEach(entry => {
      const employerId = entry.employerId;
      
      if (!employerMap.has(employerId)) {
        employerMap.set(employerId, {
          id: employerId,
          title: `Labor Action: ${entry.employer}`,
          description: entry.reason || 'Active labor action',
          company: entry.employer,
          type: this.extractActionType(entry.reason),
          status: 'active',
          target_urls: [],
          locations: [],
          divisions: []
        });
      }
      
      const action = employerMap.get(employerId);
      
      // Add URL to targets
      const urlObj = this.parseUrl(entry.url);
      if (urlObj) {
        action.target_urls.push(urlObj.hostname);
      }
      
      // Add location info if available
      if (entry.locationName && !action.locations.includes(entry.locationName)) {
        action.locations.push(entry.locationName);
      }
      
      // Add division info if available
      if (entry.divisionName && !action.divisions.includes(entry.divisionName)) {
        action.divisions.push(entry.divisionName);
      }
    });

    return Array.from(employerMap.values());
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
      chrome.storage.local.remove([CACHE_KEY, 'cache_timestamp'], resolve);
    });
  }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ApiService;
}
