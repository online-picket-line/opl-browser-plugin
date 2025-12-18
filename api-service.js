// API service to fetch labor actions
const API_BASE_URL = 'https://api.oplfun.org';
const CACHE_KEY = 'labor_actions_cache';
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

class ApiService {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  /**
   * Fetch labor actions from the API with caching
   * @returns {Promise<Array>} List of labor actions
   */
  async getLaborActions() {
    try {
      // Check cache first
      const cached = await this.getCachedData();
      if (cached) {
        console.log('Using cached labor actions');
        return cached;
      }

      // Fetch from API
      const response = await fetch(`${this.baseUrl}/labor-actions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      
      // Cache the data
      await this.setCachedData(data);
      
      return data;
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
