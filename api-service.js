
// API service to fetch labor actions from Online Picketline API (v1.2 unified, public, no-auth)
// Default API base URL - must be configured by user
const DEFAULT_API_BASE_URL = '';
const CACHE_KEY = 'labor_actions_cache';
const CACHE_DURATION = 300000; // 5 minutes in milliseconds (as per new API docs)


class ApiService {
  constructor() {
    this.baseUrl = DEFAULT_API_BASE_URL;
  }

  /**
   * Initialize the API service with settings
   */
  async init() {
    const settings = await this.getSettings();
    if (settings.apiUrl) {
      this.baseUrl = settings.apiUrl;
    }
  }

  /**
   * Get API settings from storage
   * @returns {Promise<Object>}
   */
  async getSettings() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['apiUrl'], (result) => {
        resolve({
          apiUrl: result.apiUrl || DEFAULT_API_BASE_URL
        });
      });
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

      // Fetch from Online Picketline API (no auth required)
      const url = `${this.baseUrl}/api/blocklist?format=json&includeInactive=false`;
      const response = await fetch(url, { method: 'GET' });

      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After') || '120';
        throw new Error(`Rate limited. Retry after ${retryAfter} seconds`);
      }
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();

      // Transform API response to internal format (now includes actionResources)
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
   * @param {Object} apiData - Raw API response from Online Picketline
   * @param {Array} apiData.blocklist - Array of blocklist entries
   * @param {Array} apiData.employers - Array of employer metadata
   * @returns {Array} Transformed data grouped by employer
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
          divisions: [],
          actionResources: []
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

    // Attach actionResources to each employer if present
    if (apiData.actionResources && Array.isArray(apiData.actionResources.resources)) {
      // Map resources by employerId (via actionId/organization if possible)
      apiData.actionResources.resources.forEach(resource => {
        // Try to match by organization name (may need to improve if API adds employerId to resources)
        for (const action of employerMap.values()) {
          if (resource.organization && action.company && resource.organization.toLowerCase().includes(action.company.toLowerCase())) {
            action.actionResources.push(resource);
          }
        }
      });
    }

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
