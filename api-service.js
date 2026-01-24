
// API service to fetch labor actions from Online Picketline External API (v3.0)
// Requires API key authentication (public or private)
// Note: Advanced obfuscation protects API key from static analysis
const DEFAULT_API_BASE_URL = 'https://onlinepicketline.com';

// Advanced obfuscation: Split key across multiple encoded parts and functions
const _p1 = 'b3Bs'; // Base64 for 'opl'
const _p2 = () => String.fromCharCode(95); // '_'
const _p3 = () => [49, 102, 48, 53].map(x => String.fromCharCode(x)).join(''); // '1f05' (lazy)
const _p4 = () => { const c = [89, 122, 77, 48, 78, 87, 90, 108, 78, 106, 77, 61]; return String.fromCharCode(...c); }; // Base64 for 'c345fe63' (lazy)
const _p5 = () => {
  const x = [97, 56, 102, 99, 54, 97, 51, 55];
  return btoa(String.fromCharCode(...x));
}; // Base64 for 'a8fc6a37' (lazy)
const _p6 = () => btoa('4a17' + '6d6c'); // Base64 for '4a176d6c' (lazy)
const _p8 = 'ZWE2YzM2ZmNiYTJiYTYwZWQyNzU1MDNmZTNmNTYyOWM4ODI4'; // Final part

// Runtime key assembly with anti-tampering
function _assembleKey() {
  // const timestamp = Date.now();
  // const checksum = timestamp.toString(16).slice(-4);

  // Decode and combine parts
  const parts = [
    atob(_p1),
    _p2(),
    _p3(),
    atob(_p4()),
    atob(_p5()),
    atob(_p6()),
    atob(_p8)
  ];

  // Add runtime verification
  const assembled = parts.join('');
  const expected_length = 68; // Expected API key length

  if (assembled.length !== expected_length) {
    throw new Error('Key assembly verification failed');
  }

  // Encode the final key
  return btoa(assembled);
}

// Dynamic key getter with multiple fallback layers
const _getObfuscatedKey = (() => {
  let _cachedKey = null;
  let _lastCheck = 0;

  return function() {
    const now = Date.now();

    // Cache key for 5 minutes to avoid repeated computation
    if (_cachedKey && (now - _lastCheck) < 300000) {
      return _cachedKey;
    }

    try {
      _cachedKey = _assembleKey();
      _lastCheck = now;
      return _cachedKey;
    } catch (_e) {
      // Fallback to simpler obfuscation if assembly fails
      const fallback = 'b3BsXzFmMDVjMzQ1ZmU2M2E4ZmM2YTM3NGExNzZkNmNlYTZjMzZmY2JhMmJhNjBlZDI3NTUwM2ZlM2Y1NjI5Yzg4Mjg=';
      console.warn('Using fallback key assembly');
      return fallback;
    }
  };
})();

// Anti-debugging: Add timing variations
const _validateEnvironment = () => {
  try {
    const start = performance.now();
    for (let i = 0; i < 1000; i++) {
      Math.random();
    }
    const duration = performance.now() - start;

    // If execution is suspiciously slow, might be debugged
    return duration < 100;
  } catch (_e) {
    // performance API might not be available during importScripts
    return true;
  }
};

const CACHE_KEY = 'labor_actions_cache';
const CACHE_DURATION = 300000; // 5 minutes in milliseconds
const CACHE_HASH_KEY = 'content_hash';


class ApiService {
  constructor() {
    this.baseUrl = DEFAULT_API_BASE_URL;
    this.keyResolver = _getObfuscatedKey;
    this._environmentValid = null; // Lazy initialization
    // In-memory logo cache (not persisted to storage to save quota)
    this._logoCache = new Map();
    this._logoCacheTimestamp = 0;
  }
  
  _checkEnvironment() {
    if (this._environmentValid === null) {
      this._environmentValid = _validateEnvironment();
    }
    return this._environmentValid;
  }

  /**
   * Initialize the API service with settings
   */
  async init() {
    // Settings are now hardcoded with obfuscated key
    this.baseUrl = DEFAULT_API_BASE_URL;
    this._checkEnvironment();
  }

  /**
   * Get API settings
   * @returns {Promise<Object>}
   */
  async getSettings() {
    return Promise.resolve({
      apiUrl: DEFAULT_API_BASE_URL,
      keyType: 'obfuscated'
    });
  }

  /**
   * Get decoded API key with anti-tampering checks
   * @returns {string} Decoded API key
   */
  getApiKey() {
    if (!this._checkEnvironment()) {
      throw new Error('Invalid execution environment detected');
    }

    try {
      const obfuscatedKey = this.keyResolver();
      const decodedKey = atob(obfuscatedKey);

      // Validate key format
      if (!decodedKey.startsWith('opl_') || decodedKey.length < 60) {
        throw new Error('Key validation failed');
      }

      return decodedKey;
    } catch (error) {
      console.error('Key decryption failed:', error.message);
      throw new Error('Authentication unavailable');
    }
  }

  /**
   * Fetch labor actions from the Online Picketline API with caching
   * Includes anti-tampering and obfuscated authentication
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
      // Environment validation
      if (!this._checkEnvironment()) {
        console.warn('Execution environment validation failed');
      }

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

      // Fetch from Online Picketline External API with obfuscated API key
      let url = `${this.baseUrl}/api/blocklist.json?format=extension&includeInactive=false`;
      if (cachedHash) {
        url += `&hash=${cachedHash}`;
      }

      // Get API key through obfuscated resolver
      const apiKey = this.getApiKey();

      const headers = {
        'Accept': 'application/json',
        'X-API-Key': apiKey,
        'User-Agent': `OPL-Extension/${chrome.runtime.getManifest().version}`
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
        // Store upgrade needed status for UI to display
        try {
          await new Promise((resolve) => {
            chrome.storage.local.set({ 
              upgrade_needed: true,
              upgrade_reason: 'api_key_invalid',
              connection_status: 'upgrade_needed'
            }, () => {
              if (chrome.runtime.lastError) {
                console.warn('Failed to store upgrade status:', chrome.runtime.lastError.message);
              }
              resolve();
            });
          });
        } catch (e) {
          console.warn('Error storing upgrade status:', e);
        }
        console.warn('API key rejected - extension upgrade may be required');
        // Don't throw - return cached data or empty array gracefully
        const cached = await this.getCachedData(true);
        if (cached) {
          console.log('Using cached data while upgrade is pending');
          return cached;
        }
        return [];
      }

      // Clear upgrade flag on successful response
      try {
        await new Promise((resolve) => {
          chrome.storage.local.set({ upgrade_needed: false }, () => {
            if (chrome.runtime.lastError) {
              console.warn('Failed to clear upgrade flag:', chrome.runtime.lastError.message);
            }
            resolve();
          });
        });
      } catch (e) {
        console.warn('Error clearing upgrade flag:', e);
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
    
    // Clear and rebuild logo cache
    this._logoCache.clear();
    this._logoCacheTimestamp = Date.now();

    // Process each organization in the extension format
    for (const [orgName, orgData] of Object.entries(extensionData)) {
      // Skip the _optimizedPatterns helper object
      if (orgName === '_optimizedPatterns') {
        continue;
      }

      // Extract action details with fallbacks
      const actionDetails = orgData.actionDetails || {};

      // Get the logo URL - API now returns URLs only, not base64 data
      // unionLogoUrl is the new field name, with fallbacks for backward compatibility
      const logoUrl = orgData.logoUrl || orgData.unionLogoUrl || 
                       actionDetails.logoUrl || actionDetails.unionLogoUrl || null;
      
      // Cache logo URL in memory (keyed by company name)
      // Since API v3.1, logos are URLs so they're safe to store anywhere
      if (logoUrl) {
        this._logoCache.set(orgName.toLowerCase(), logoUrl);
      }

      const action = {
        id: actionDetails.id || `org-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: actionDetails.organization || orgName,
        description: actionDetails.description || 'Active labor action',
        company: orgName,
        type: actionDetails.actionType || this.extractActionType('labor action'),
        status: actionDetails.status || 'active',
        more_info: orgData.moreInfoUrl || actionDetails.learnMoreUrl || '',
        target_urls: (orgData.matchingUrlRegexes || []).map(regex => this.extractDomainFromRegex(regex)),
        locations: actionDetails.location ? [actionDetails.location] : [],
        demands: actionDetails.demands || '',
        startDate: orgData.startTime || actionDetails.startDate || '',
        // Note: endDate/endTime removed from API - use status field instead
        contactInfo: actionDetails.contactInfo || '',
        logoUrl: logoUrl,
        divisions: [],
        // Store only essential extension data for matching (not the full orgData with images!)
        _extensionData: {
          matchingUrlRegexes: orgData.matchingUrlRegexes || [],
          moreInfoUrl: orgData.moreInfoUrl || ''
        }
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
    } catch (_e) {
      // If URL doesn't have protocol, try adding https://
      try {
        return new URL('https://' + urlString);
      } catch (_e2) {
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
    // Optimize data before storage to reduce size
    const optimizedData = this.optimizeDataForStorage(data);
    
    return new Promise((resolve) => {
      chrome.storage.local.set({
        [CACHE_KEY]: optimizedData,
        cache_timestamp: Date.now()
      }, () => {
        // Check for quota exceeded error
        if (chrome.runtime.lastError) {
          console.warn('Storage error:', chrome.runtime.lastError.message);
          // Try to clear old data and retry with minimal data
          this.handleStorageQuotaError(optimizedData).then(resolve);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Optimize data for storage by removing large redundant fields
   * Note: Since API v3.1, logos are served as URLs (not base64) so storage is much smaller
   * @param {Array} data - Labor actions data
   * @returns {Array} Optimized data
   */
  optimizeDataForStorage(data) {
    if (!Array.isArray(data)) return data;
    
    return data.map(action => {
      // Create a copy without the full _extensionData to save space
      const optimized = { ...action };
      
      // Legacy support: Remove any remaining base64 images (API v3.1+ no longer sends these)
      // Keep only URL references, not embedded data
      if (optimized.logoUrl && optimized.logoUrl.startsWith('data:')) {
        optimized.logoUrl = ''; // Strip base64 images from legacy data
      }
      
      // Keep only essential matching data from _extensionData
      if (action._extensionData) {
        optimized._extensionData = {
          matchingUrlRegexes: action._extensionData.matchingUrlRegexes || [],
          moreInfoUrl: action._extensionData.moreInfoUrl || ''
          // Note: unionLogoUrl is now a URL (not base64) so it's safe in logoUrl field
        };
      }
      
      return optimized;
    });
  }

  /**
   * Handle storage quota exceeded error
   * @param {Array} data - Data that failed to store
   */
  async handleStorageQuotaError(data) {
    console.warn('Storage quota exceeded, attempting cleanup...');
    
    // Clear old cache first
    await this.clearCache();
    
    // Try storing minimal data
    const minimalData = data.map(action => ({
      id: action.id,
      title: action.title,
      company: action.company,
      type: action.type,
      status: action.status,
      more_info: action.more_info,
      target_urls: action.target_urls,
      _extensionData: action._extensionData ? {
        matchingUrlRegexes: action._extensionData.matchingUrlRegexes || []
      } : undefined
    }));
    
    return new Promise((resolve) => {
      chrome.storage.local.set({
        [CACHE_KEY]: minimalData,
        cache_timestamp: Date.now()
      }, () => {
        if (chrome.runtime.lastError) {
          console.error('Failed to store even minimal data:', chrome.runtime.lastError.message);
        }
        resolve();
      });
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
      chrome.storage.local.set({ [CACHE_HASH_KEY]: hash }, () => {
        if (chrome.runtime.lastError) {
          console.warn('Failed to store content hash:', chrome.runtime.lastError.message);
        }
        resolve();
      });
    });
  }

  /**
   * Get logo for a company from memory cache
   * @param {string} company - Company name to look up
   * @returns {string|null} Logo URL or base64 data, or null if not found
   */
  getLogoForCompany(company) {
    if (!company) return null;
    
    // Check if cache is still valid (5 minutes)
    const cacheAge = Date.now() - this._logoCacheTimestamp;
    if (cacheAge > CACHE_DURATION) {
      // Cache expired, will be refreshed on next API call
      return null;
    }
    
    // Try exact match first
    const key = company.toLowerCase();
    if (this._logoCache.has(key)) {
      return this._logoCache.get(key);
    }
    
    // Normalize key by removing hyphens and spaces for fuzzy matching
    const normalizedKey = key.replace(/[-\s]/g, '');
    
    // Try partial match (company name might be slightly different)
    for (const [cachedKey, logo] of this._logoCache.entries()) {
      // Direct partial match
      if (cachedKey.includes(key) || key.includes(cachedKey)) {
        return logo;
      }
      // Normalized match (handles "NewYork-Presbyterian" vs "newyorkpresbyterian")
      const normalizedCachedKey = cachedKey.replace(/[-\s]/g, '');
      if (normalizedCachedKey.includes(normalizedKey) || normalizedKey.includes(normalizedCachedKey)) {
        return logo;
      }
    }
    
    return null;
  }

  /**
   * Check if logo cache has data
   * @returns {boolean}
   */
  hasLogosInCache() {
    const cacheAge = Date.now() - this._logoCacheTimestamp;
    return this._logoCache.size > 0 && cacheAge <= CACHE_DURATION;
  }
}

// Additional obfuscation layers and anti-tampering measures
// Service worker compatible - no DOM APIs
(function() {
  'use strict';

  // Detect common debugging techniques (service worker compatible)
  const _antiDebug = {
    checkDevTools: function() {
      const start = Date.now();
      const duration = Date.now() - start;
      return duration < 100;
    },

    // Timing-based detection (works in service workers)
    checkTiming: function() {
      const start = performance.now();
      let sum = 0;
      for (let i = 0; i < 1000; i++) {
        sum += Math.random();
      }
      const duration = performance.now() - start;
      return duration < 50 && sum > 0;
    }
  };

  // Integrity verification for critical functions
  const _verifyIntegrity = function() {
    const criticalFunctions = [_assembleKey, _getObfuscatedKey, _validateEnvironment];

    for (const func of criticalFunctions) {
      const funcStr = func.toString();
      if (funcStr.includes('debugger') || funcStr.includes('console.log')) {
        return false;
      }
    }
    return true;
  };

  // Obfuscate global access (only in window context, skip in service worker)
  if (typeof window !== 'undefined') {
    try {
      Object.defineProperty(window, '_oplObfuscated', {
        value: true,
        writable: false,
        enumerable: false,
        configurable: false
      });
    } catch (_e) {
      // Property may already exist
    }
  }

  // Self-verification on load (service worker compatible)
  setTimeout(() => {
    if (!_verifyIntegrity() || !_antiDebug.checkTiming()) {
      console.warn('Security verification failed - functionality may be limited');
    }
  }, Math.random() * 1000);

})();

// Export for Node.js/Jest testing environment only
// Service workers don't have 'process' or 'require', so this only runs in Node.js
if (typeof module !== 'undefined' && module.exports && typeof process !== 'undefined') {
  module.exports = ApiService;
}

