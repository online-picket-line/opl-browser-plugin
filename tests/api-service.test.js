const {
  mockExtensionData,
  mockTransformedActions,
  mockApiResponse200,
  mockApiResponse304,
  mockApiResponse401,
  mockApiResponse429
} = require('./fixtures.js');

// Import the module under test
const ApiService = require('../api-service.js');

describe('ApiService', () => {
  let apiService;
  let mockChromeStorage;

  beforeEach(() => {
    // Mock console methods
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});

    apiService = new ApiService();

    // Setup Chrome storage mocks
    mockChromeStorage = {
      sync: {
        get: jest.fn((keys, callback) => {
          callback({
            apiUrl: 'https://test-instance.com',
            apiKey: 'opl_test_key_12345'
          });
        }),
        set: jest.fn((data, callback) => callback && callback())
      },
      local: {
        get: jest.fn((keys, callback) => {
          const result = {};
          if (keys.includes('labor_actions_cache')) {
            result.labor_actions_cache = mockTransformedActions;
          }
          if (keys.includes('cache_timestamp')) {
            result.cache_timestamp = Date.now() - 60000; // 1 minute ago
          }
          if (keys.includes('content_hash')) {
            result.content_hash = 'abc123hash';
          }
          callback(result);
        }),
        set: jest.fn((data, callback) => callback && callback()),
        remove: jest.fn((keys, callback) => callback && callback())
      }
    };

    global.chrome.storage = mockChromeStorage;
  });

  describe('getSettings', () => {
    it('should return hardcoded API settings', async () => {
      const settings = await apiService.getSettings();

      expect(settings).toEqual({
        apiUrl: 'https://onlinepicketline.com',
        keyType: 'obfuscated'
      });
    });
  });

  describe('transformExtensionApiResponse', () => {
    it('should transform extension format to internal format', () => {
      const result = apiService.transformExtensionApiResponse(mockExtensionData);

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        company: 'Wirecutter',
        title: 'Wirecutter Union',
        type: 'strike',
        status: 'active',
        description: 'Workers striking for fair wages and benefits',
        demands: '15% wage increase, healthcare coverage',
        logoUrl: 'https://example.com/logos/wirecutter-union.png'
      });
      expect(result[1]).toMatchObject({
        company: 'Example Corp',
        title: 'Workers United Local 789',
        type: 'boycott',
        status: 'active',
        description: 'Consumer boycott for worker rights',
        demands: 'Union recognition, fair wages',
        logoUrl: 'https://example.com/logos/workers-united.png'
      });
    });

    it('should handle missing logoUrl gracefully', () => {
      const dataWithoutLogo = {
        "Test Org": {
          "moreInfoUrl": "https://test.com",
          "matchingUrlRegexes": ["test.com"],
          "actionDetails": {
            "id": "test-123",
            "organization": "Test Org",
            "actionType": "strike",
            "status": "active"
          }
        }
      };

      const result = apiService.transformExtensionApiResponse(dataWithoutLogo);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        company: 'Test Org',
        logoUrl: ''
      });
    });

    it('should use learnMoreUrl from actionDetails when moreInfoUrl is missing', () => {
      const dataWithLearnMoreUrl = {
        "Test Org": {
          "matchingUrlRegexes": ["test.com"],
          "actionDetails": {
            "id": "test-123",
            "organization": "Test Org",
            "actionType": "strike",
            "status": "active",
            "learnMoreUrl": "https://union.org/learn-more"
          }
        }
      };

      const result = apiService.transformExtensionApiResponse(dataWithLearnMoreUrl);

      expect(result).toHaveLength(1);
      expect(result[0].more_info).toBe("https://union.org/learn-more");
    });

    it('should prefer moreInfoUrl over learnMoreUrl', () => {
      const dataWithBothUrls = {
        "Test Org": {
          "moreInfoUrl": "https://primary.org/info",
          "matchingUrlRegexes": ["test.com"],
          "actionDetails": {
            "id": "test-123",
            "organization": "Test Org",
            "actionType": "strike",
            "status": "active",
            "learnMoreUrl": "https://secondary.org/learn-more"
          }
        }
      };

      const result = apiService.transformExtensionApiResponse(dataWithBothUrls);

      expect(result).toHaveLength(1);
      expect(result[0].more_info).toBe("https://primary.org/info");
    });

    it('should use logoUrl from orgData level when available', () => {
      const dataWithOrgLevelLogo = {
        "Test Org": {
          "moreInfoUrl": "https://test.com",
          "logoUrl": "https://example.com/org-level-logo.png",
          "matchingUrlRegexes": ["test.com"],
          "actionDetails": {
            "id": "test-123",
            "organization": "Test Org",
            "actionType": "strike",
            "status": "active"
          }
        }
      };

      const result = apiService.transformExtensionApiResponse(dataWithOrgLevelLogo);

      expect(result).toHaveLength(1);
      expect(result[0].logoUrl).toBe("https://example.com/org-level-logo.png");
    });

    it('should prefer orgData.logoUrl over actionDetails.logoUrl', () => {
      const dataWithBothLogos = {
        "Test Org": {
          "moreInfoUrl": "https://test.com",
          "logoUrl": "https://example.com/primary-logo.png",
          "matchingUrlRegexes": ["test.com"],
          "actionDetails": {
            "id": "test-123",
            "organization": "Test Org",
            "actionType": "strike",
            "status": "active",
            "logoUrl": "https://example.com/secondary-logo.png"
          }
        }
      };

      const result = apiService.transformExtensionApiResponse(dataWithBothLogos);

      expect(result).toHaveLength(1);
      expect(result[0].logoUrl).toBe("https://example.com/primary-logo.png");
    });

    it('should use unionImageUrl from orgData level when logoUrl is not available', () => {
      const dataWithUnionImageUrl = {
        "Test Org": {
          "moreInfoUrl": "https://test.com",
          "unionImageUrl": "https://example.com/union-image.png",
          "matchingUrlRegexes": ["test.com"],
          "actionDetails": {
            "id": "test-123",
            "organization": "Test Org",
            "actionType": "strike",
            "status": "active"
          }
        }
      };

      const result = apiService.transformExtensionApiResponse(dataWithUnionImageUrl);

      expect(result).toHaveLength(1);
      expect(result[0].logoUrl).toBe("https://example.com/union-image.png");
    });

    it('should use unionImageUrl from actionDetails when other options not available', () => {
      const dataWithActionDetailsUnionImageUrl = {
        "Test Org": {
          "moreInfoUrl": "https://test.com",
          "matchingUrlRegexes": ["test.com"],
          "actionDetails": {
            "id": "test-123",
            "organization": "Test Org",
            "actionType": "strike",
            "status": "active",
            "unionImageUrl": "https://example.com/action-details-union-image.png"
          }
        }
      };

      const result = apiService.transformExtensionApiResponse(dataWithActionDetailsUnionImageUrl);

      expect(result).toHaveLength(1);
      expect(result[0].logoUrl).toBe("https://example.com/action-details-union-image.png");
    });

    it('should prefer logoUrl over unionImageUrl', () => {
      const dataWithBothLogoTypes = {
        "Test Org": {
          "moreInfoUrl": "https://test.com",
          "logoUrl": "https://example.com/logo.png",
          "unionImageUrl": "https://example.com/union-image.png",
          "matchingUrlRegexes": ["test.com"],
          "actionDetails": {
            "id": "test-123",
            "organization": "Test Org",
            "actionType": "strike",
            "status": "active"
          }
        }
      };

      const result = apiService.transformExtensionApiResponse(dataWithBothLogoTypes);

      expect(result).toHaveLength(1);
      expect(result[0].logoUrl).toBe("https://example.com/logo.png");
    });

    it('should extract demands from actionDetails', () => {
      const dataWithDemands = {
        "Test Org": {
          "moreInfoUrl": "https://test.com",
          "matchingUrlRegexes": ["test.com"],
          "actionDetails": {
            "id": "test-123",
            "organization": "Test Org",
            "actionType": "strike",
            "status": "active",
            "demands": "Higher wages, better benefits, safe working conditions"
          }
        }
      };

      const result = apiService.transformExtensionApiResponse(dataWithDemands);

      expect(result).toHaveLength(1);
      expect(result[0].demands).toBe("Higher wages, better benefits, safe working conditions");
    });

    it('should handle missing demands gracefully', () => {
      const dataWithoutDemands = {
        "Test Org": {
          "moreInfoUrl": "https://test.com",
          "matchingUrlRegexes": ["test.com"],
          "actionDetails": {
            "id": "test-123",
            "organization": "Test Org",
            "actionType": "strike",
            "status": "active"
          }
        }
      };

      const result = apiService.transformExtensionApiResponse(dataWithoutDemands);

      expect(result).toHaveLength(1);
      expect(result[0].demands).toBe("");
    });

    it('should use organization name as title (without action type prefix)', () => {
      const dataWithOrg = {
        "Employer Name": {
          "moreInfoUrl": "https://test.com",
          "matchingUrlRegexes": ["test.com"],
          "actionDetails": {
            "id": "test-123",
            "organization": "UAW Local 456",
            "actionType": "strike",
            "status": "active"
          }
        }
      };

      const result = apiService.transformExtensionApiResponse(dataWithOrg);

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("UAW Local 456");
      expect(result[0].company).toBe("Employer Name");
    });

    it('should fallback to orgName when organization is missing', () => {
      const dataWithoutOrg = {
        "Fallback Name": {
          "moreInfoUrl": "https://test.com",
          "matchingUrlRegexes": ["test.com"],
          "actionDetails": {
            "id": "test-123",
            "actionType": "strike",
            "status": "active"
          }
        }
      };

      const result = apiService.transformExtensionApiResponse(dataWithoutOrg);

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("Fallback Name");
      expect(result[0].company).toBe("Fallback Name");
    });

    it('should handle empty or invalid data', () => {
      expect(apiService.transformExtensionApiResponse(null)).toEqual([]);
      expect(apiService.transformExtensionApiResponse({})).toEqual([]);
      expect(apiService.transformExtensionApiResponse("invalid")).toEqual([]);
    });

    it('should skip _optimizedPatterns in transformation', () => {
      const dataWithOptimized = {
        ...mockExtensionData,
        "_optimizedPatterns": { "test": "pattern" }
      };

      const result = apiService.transformExtensionApiResponse(dataWithOptimized);

      // Should still only have 2 organizations (not 3 with _optimizedPatterns)
      expect(result).toHaveLength(2);
      expect(result.find(action => action.company === "_optimizedPatterns")).toBeUndefined();
    });
  });

  describe('extractDomainFromRegex', () => {
    it('should extract domain from regex patterns', () => {
      expect(apiService.extractDomainFromRegex('example\\.com')).toBe('examplecom');
      expect(apiService.extractDomainFromRegex('facebook\\.com/test')).toBe('facebookcom/test');
      expect(apiService.extractDomainFromRegex('nytimes\\.com/wirecutter')).toBe('nytimescom/wirecutter');
    });

    it('should handle complex regex patterns', () => {
      expect(apiService.extractDomainFromRegex('(example\\.com|test\\.com)')).toBe('examplecomtestcom');
      expect(apiService.extractDomainFromRegex('twitter\\.com/[^/]+')).toBe('twittercom//');
    });
  });

  describe('getLaborActions', () => {
    beforeEach(() => {
      apiService.baseUrl = 'https://test-instance.com';
    });

    it('should return cached data if fresh', async () => {
      // Mock fresh cache (less than 5 minutes old)
      mockChromeStorage.local.get.mockImplementation((keys, callback) => {
        const result = {};
        if (keys.includes('labor_actions_cache')) {
          result.labor_actions_cache = mockTransformedActions;
        }
        if (keys.includes('cache_timestamp')) {
          result.cache_timestamp = Date.now() - 60000; // 1 minute ago (fresh)
        }
        callback(result);
      });

      const result = await apiService.getLaborActions();

      expect(result).toEqual(mockTransformedActions);
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should fetch new data when cache is stale', async () => {
      // Mock stale cache (over 5 minutes old)
      mockChromeStorage.local.get.mockImplementation((keys, callback) => {
        const result = {};
        if (keys.includes('cache_timestamp')) {
          result.cache_timestamp = Date.now() - 400000; // 6+ minutes ago (stale)
        }
        callback(result);
      });

      global.fetch.mockResolvedValue(mockApiResponse200);

      const result = await apiService.getLaborActions();

      expect(fetch).toHaveBeenCalledWith(
        'https://onlinepicketline.com/api/blocklist.json?format=extension&includeInactive=false',
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-API-Key': 'opl_1f05c345fe63a8fc6a374a176d6cea6c36fcba2ba60ed275503fe3f5629c8828'
          })
        })
      );
      expect(result).toHaveLength(2);
    });

    it('should handle 304 Not Modified response', async () => {
      mockChromeStorage.local.get.mockImplementation((keys, callback) => {
        const result = {};
        if (keys.includes('cache_timestamp')) {
          result.cache_timestamp = Date.now() - 400000; // Stale cache
        }
        if (keys.includes('content_hash')) {
          result.content_hash = 'abc123hash';
        }
        if (keys.includes('labor_actions_cache')) {
          result.labor_actions_cache = mockTransformedActions;
        }
        callback(result);
      });

      global.fetch.mockResolvedValue(mockApiResponse304);

      const result = await apiService.getLaborActions();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('hash=abc123hash'),
        expect.any(Object)
      );
      expect(result).toEqual(mockTransformedActions);
    });

    it('should handle 401 authentication error gracefully and set upgrade flag', async () => {
      mockChromeStorage.local.get.mockImplementation((keys, callback) => {
        callback({ cache_timestamp: Date.now() - 400000 }); // Stale cache
      });

      global.fetch.mockResolvedValue(mockApiResponse401);

      const result = await apiService.getLaborActions();

      // Should return empty array (no cached data available)
      expect(result).toEqual([]);
      
      // Should set upgrade_needed flag in storage (with callback)
      expect(mockChromeStorage.local.set).toHaveBeenCalledWith(
        expect.objectContaining({
          upgrade_needed: true,
          upgrade_reason: 'api_key_invalid',
          connection_status: 'upgrade_needed'
        }),
        expect.any(Function)
      );
      
      // Should warn but not throw error
      expect(console.warn).toHaveBeenCalledWith(
        'API key rejected - extension upgrade may be required'
      );
    });

    it('should handle 429 rate limit error', async () => {
      mockChromeStorage.local.get.mockImplementation((keys, callback) => {
        callback({ cache_timestamp: Date.now() - 400000 });
      });

      global.fetch.mockResolvedValue(mockApiResponse429);

      const result = await apiService.getLaborActions();

      expect(result).toEqual([]);
    });
  });

  describe('caching methods', () => {
    it('should cache and retrieve content hash', async () => {
      await apiService.setCachedHash('test-hash-123');

      expect(mockChromeStorage.local.set).toHaveBeenCalledWith(
        { content_hash: 'test-hash-123' },
        expect.any(Function)
      );

      const hash = await apiService.getCachedHash();
      expect(hash).toBe('abc123hash'); // From mock
    });

    it('should cache and retrieve data with timestamp', async () => {
      const testData = [{ id: 'test' }];
      await apiService.setCachedData(testData);

      expect(mockChromeStorage.local.set).toHaveBeenCalledWith({
        labor_actions_cache: testData,
        cache_timestamp: expect.any(Number)
      }, expect.any(Function));
    });

    it('should clear all cache data', async () => {
      await apiService.clearCache();

      expect(mockChromeStorage.local.remove).toHaveBeenCalledWith(
        ['labor_actions_cache', 'cache_timestamp', 'content_hash'],
        expect.any(Function)
      );
    });
  });

  describe('getCachedData', () => {
    it('should return null for expired cache when not ignoring expiry', async () => {
      mockChromeStorage.local.get.mockImplementation((keys, callback) => {
        callback({
          labor_actions_cache: mockTransformedActions,
          cache_timestamp: Date.now() - 400000 // 6+ minutes ago (expired)
        });
      });

      const result = await apiService.getCachedData(false);
      expect(result).toBeNull();
    });

    it('should return cached data when ignoring expiry', async () => {
      mockChromeStorage.local.get.mockImplementation((keys, callback) => {
        callback({
          labor_actions_cache: mockTransformedActions,
          cache_timestamp: Date.now() - 400000
        });
      });

      const result = await apiService.getCachedData(true);
      expect(result).toEqual(mockTransformedActions);
    });

    it('should return null when no cached data exists', async () => {
      mockChromeStorage.local.get.mockImplementation((keys, callback) => {
        callback({});
      });

      const result = await apiService.getCachedData();
      expect(result).toBeNull();
    });
  });

  describe('Service Worker Compatibility', () => {
    test('should not reference window object (service worker compatibility)', () => {
      const fs = require('fs');
      const path = require('path');

      // Read the api-service.js file
      const filePath = path.join(__dirname, '..', 'api-service.js');
      const fileContent = fs.readFileSync(filePath, 'utf8');

      // Check that the file doesn't contain problematic window references
      const codeLines = fileContent.split('\n')
        .filter(line => !line.trim().startsWith('//') && !line.trim().startsWith('*'));
      const codeOnly = codeLines.join('\n');

      // Should not have window.ApiService assignments (IIFE window checks are acceptable)
      expect(codeOnly).not.toMatch(/window\.ApiService/);
    });

    test('should be loadable in a simulated service worker environment', () => {
      // Simulate service worker global scope (no window object)
      const originalWindow = global.window;
      delete global.window;

      try {
        // Try to require/reload the module
        delete require.cache[require.resolve('../api-service.js')];
        const ApiServiceReloaded = require('../api-service.js');

        // Should successfully create an instance
        const instance = new ApiServiceReloaded();
        expect(instance).toBeDefined();
        expect(instance.baseUrl).toBeDefined();
      } finally {
        // Restore window if it existed
        if (originalWindow !== undefined) {
          global.window = originalWindow;
        }
      }
    });

    test('should handle missing performance API gracefully during importScripts', () => {
      // Simulate service worker environment where performance API might not be available
      const originalPerformance = global.performance;
      delete global.performance;

      try {
        // Reload the module without performance API
        delete require.cache[require.resolve('../api-service.js')];
        const ApiServiceReloaded = require('../api-service.js');

        // Should successfully create an instance without throwing
        const instance = new ApiServiceReloaded();
        expect(instance).toBeDefined();
        expect(instance.baseUrl).toBe('https://onlinepicketline.com');
        
        // Environment check should default to true when performance is unavailable
        expect(instance._checkEnvironment()).toBe(true);
      } finally {
        // Restore performance
        if (originalPerformance !== undefined) {
          global.performance = originalPerformance;
        }
      }
    });

    test('should lazy-initialize environment validation', () => {
      const instance = new ApiService();
      
      // _environmentValid should be null initially (lazy)
      expect(instance._environmentValid).toBeNull();
      
      // First check should initialize it
      const firstCheck = instance._checkEnvironment();
      expect(firstCheck).toBe(true);
      expect(instance._environmentValid).toBe(true);
      
      // Subsequent checks should use cached value
      const secondCheck = instance._checkEnvironment();
      expect(secondCheck).toBe(true);
    });

    test('should handle performance.now errors gracefully', () => {
      // Mock performance.now to throw an error
      const originalPerformance = global.performance;
      global.performance = {
        now: jest.fn(() => {
          throw new Error('Performance API not available');
        })
      };

      try {
        // Reload module with broken performance API
        delete require.cache[require.resolve('../api-service.js')];
        const ApiServiceReloaded = require('../api-service.js');

        const instance = new ApiServiceReloaded();
        
        // Should handle the error and default to true
        expect(() => instance._checkEnvironment()).not.toThrow();
        expect(instance._checkEnvironment()).toBe(true);
      } finally {
        // Restore performance
        global.performance = originalPerformance;
      }
    });

    test('should validate environment before getting API key', () => {
      const instance = new ApiService();
      
      // Mock _checkEnvironment to return false
      instance._checkEnvironment = jest.fn(() => false);
      
      // Should throw error when environment is invalid
      expect(() => instance.getApiKey()).toThrow('Invalid execution environment detected');
      expect(instance._checkEnvironment).toHaveBeenCalled();
    });

    test('should check environment during getLaborActions without throwing', async () => {
      const instance = new ApiService();
      
      // Mock _checkEnvironment to return false
      instance._checkEnvironment = jest.fn(() => false);
      
      // Mock fetch to return data
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: async () => mockExtensionData
      });

      // Should warn but not throw
      const consoleSpy = jest.spyOn(console, 'warn');
      await instance.getLaborActions();
      
      expect(consoleSpy).toHaveBeenCalledWith('Execution environment validation failed');
      expect(instance._checkEnvironment).toHaveBeenCalled();
    });
  });

  describe('getLogoForCompany', () => {
    test('should return null for empty company name', () => {
      const instance = new ApiService();
      expect(instance.getLogoForCompany('')).toBeNull();
      expect(instance.getLogoForCompany(null)).toBeNull();
      expect(instance.getLogoForCompany(undefined)).toBeNull();
    });

    test('should return logo for exact match', () => {
      const instance = new ApiService();
      instance._logoCache.set('testcompany', 'https://example.com/logo.png');
      instance._logoCacheTimestamp = Date.now();
      
      expect(instance.getLogoForCompany('testcompany')).toBe('https://example.com/logo.png');
      expect(instance.getLogoForCompany('TestCompany')).toBe('https://example.com/logo.png'); // case insensitive
    });

    test('should return logo for partial match', () => {
      const instance = new ApiService();
      instance._logoCache.set('newyork-presbyterian hospital', 'https://example.com/nyp-logo.png');
      instance._logoCacheTimestamp = Date.now();
      
      expect(instance.getLogoForCompany('newyork-presbyterian')).toBe('https://example.com/nyp-logo.png');
    });

    test('should return logo for normalized match with hyphens and spaces', () => {
      const instance = new ApiService();
      instance._logoCache.set('newyork-presbyterian', 'https://example.com/nyp-logo.png');
      instance._logoCacheTimestamp = Date.now();
      
      // Should match even with different hyphen/space patterns
      expect(instance.getLogoForCompany('NewYork Presbyterian')).toBe('https://example.com/nyp-logo.png');
      expect(instance.getLogoForCompany('newyorkpresbyterian')).toBe('https://example.com/nyp-logo.png');
    });

    test('should return null when cache is expired', () => {
      const instance = new ApiService();
      instance._logoCache.set('testcompany', 'https://example.com/logo.png');
      instance._logoCacheTimestamp = Date.now() - (6 * 60 * 1000); // 6 minutes ago (cache is 5 min)
      
      expect(instance.getLogoForCompany('testcompany')).toBeNull();
    });

    test('should return null for no match', () => {
      const instance = new ApiService();
      instance._logoCache.set('somecompany', 'https://example.com/logo.png');
      instance._logoCacheTimestamp = Date.now();
      
      expect(instance.getLogoForCompany('differentcompany')).toBeNull();
    });
  });

  describe('API Key Management', () => {
    test('should return valid obfuscated API key', () => {
      const instance = new ApiService();
      const key = instance.getApiKey();
      
      // Check key format
      expect(key).toBeDefined();
      expect(typeof key).toBe('string');
      expect(key).toMatch(/^opl_[a-f0-9]{64}$/);
      expect(key.length).toBe(68); // 'opl_' + 64 hex chars
    });

    test('should return the new API key after update', () => {
      const instance = new ApiService();
      const key = instance.getApiKey();
      
      // Verify we're using the new key
      expect(key).toBe('opl_1f05c345fe63a8fc6a374a176d6cea6c36fcba2ba60ed275503fe3f5629c8828');
      
      // Verify it's not the old key
      expect(key).not.toBe('opl_8677beaeb06c599997ec46f9891036a37a81bee1c32d32cbb4398ab344b1b7cf');
    });

    test('should validate API key format', () => {
      const instance = new ApiService();
      const key = instance.getApiKey();
      
      // Must start with 'opl_'
      expect(key.startsWith('opl_')).toBe(true);
      
      // Must be at least 60 characters
      expect(key.length).toBeGreaterThanOrEqual(60);
      
      // Must contain only valid hex characters after prefix
      const keyWithoutPrefix = key.substring(4);
      expect(keyWithoutPrefix).toMatch(/^[a-f0-9]+$/);
    });

    test('should throw error when key validation fails', () => {
      const instance = new ApiService();
      
      // Mock keyResolver to return an invalid key (too short)
      instance.keyResolver = jest.fn(() => btoa('opl_short'));
      
      expect(() => instance.getApiKey()).toThrow('Authentication unavailable');
    });

    test('should throw error when key cannot be decoded', () => {
      const instance = new ApiService();
      
      // Mock keyResolver to return invalid base64
      instance.keyResolver = jest.fn(() => 'not-valid-base64!!!');
      
      expect(() => instance.getApiKey()).toThrow('Authentication unavailable');
    });
  });
});
