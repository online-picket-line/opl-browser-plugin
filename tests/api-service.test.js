
import { jest } from '@jest/globals';
import {
  mockExtensionData,
  mockTransformedActions,
  mockApiResponse200,
  mockApiResponse304,
  mockApiResponse401,
  mockApiResponse429
} from './fixtures.js';

import ApiService from '../api-service.js';

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
        apiKey: 'opl_02cafecc3361fb5ee303832dde26e3c67f47b94476b55f10b464ba20bfec4f1c'
      });
    });
  });

  describe('transformExtensionApiResponse', () => {
    it('should transform extension format to internal format', () => {
      const result = apiService.transformExtensionApiResponse(mockExtensionData);
      
      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        company: 'Wirecutter',
        type: 'strike',
        status: 'active',
        description: 'Workers striking for fair wages and benefits'
      });
      expect(result[1]).toMatchObject({
        company: 'Example Corp',
        type: 'boycott',
        status: 'active',
        description: 'Consumer boycott for worker rights'
      });
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
            'X-API-Key': 'opl_02cafecc3361fb5ee303832dde26e3c67f47b94476b55f10b464ba20bfec4f1c'
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

    it('should handle 401 authentication error', async () => {
      mockChromeStorage.local.get.mockImplementation((keys, callback) => {
        callback({ cache_timestamp: Date.now() - 400000 }); // Stale cache
      });

      global.fetch.mockResolvedValue(mockApiResponse401);

      const result = await apiService.getLaborActions();
      
      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalledWith(
        'Error fetching labor actions:',
        expect.any(Error)
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
});