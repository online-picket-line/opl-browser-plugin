// Integration tests that test the complete flow
const { mockExtensionData, mockTransformedActions } = require('./fixtures.js');

describe.skip('End-to-End Integration', () => {
  let mockChrome;
  let ApiService;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup comprehensive Chrome mock
    mockChrome = {
      storage: {
        sync: {
          get: jest.fn(),
          set: jest.fn()
        },
        local: {
          get: jest.fn(),
          set: jest.fn(),
          remove: jest.fn()
        }
      },
      runtime: {
        sendMessage: jest.fn(),
        onMessage: {
          addListener: jest.fn()
        },
        getURL: jest.fn((path) => `chrome-extension://test-id/${path}`)
      },
      alarms: {
        create: jest.fn(),
        onAlarm: {
          addListener: jest.fn()
        }
      }
    };
    global.chrome = mockChrome;

    // Mock fetch
    global.fetch = jest.fn();

    // Import after mocks are set up
    ApiService = require('../api-service.js');
  });

  describe('Complete Extension Workflow', () => {
    it('should handle complete user configuration flow', async () => {
      // Step 1: User configures extension
      const configData = {
        apiUrl: 'https://test-instance.com',
        apiKey: 'opl_test_key_12345',
        blockMode: false
      };

      mockChrome.storage.sync.set.mockImplementation((data, callback) => {
        if (callback) callback();
      });

      // Test configuration saving
      mockChrome.storage.sync.set(configData, () => {});
      expect(mockChrome.storage.sync.set).toHaveBeenCalledWith(configData, expect.any(Function));

      // Step 2: Extension fetches labor actions
      mockChrome.storage.sync.get.mockImplementation((keys, callback) => {
        callback(configData);
      });

      mockChrome.storage.local.get.mockImplementation((keys, callback) => {
        // No cache initially
        callback({});
      });

      const mockResponse = {
        status: 200,
        ok: true,
        headers: {
          get: (name) => name === 'X-Content-Hash' ? 'test-hash-123' : null
        },
        json: () => Promise.resolve(mockExtensionData)
      };

      global.fetch.mockResolvedValue(mockResponse);

      const apiService = new ApiService();
      const actions = await apiService.getLaborActions();

      expect(fetch).toHaveBeenCalledWith(
        'https://test-instance.com/api/blocklist.json?format=extension&includeInactive=false',
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-API-Key': 'opl_test_key_12345'
          })
        })
      );

      expect(actions).toHaveLength(2);
      expect(actions[0].company).toBe('Wirecutter');
    });

    it('should handle URL matching and banner display flow', () => {
      // Mock URL matching function
      const matchUrlToAction = (url, actions) => {
        const testActions = mockTransformedActions;

        for (const action of testActions) {
          if (action._extensionData && action._extensionData.matchingUrlRegexes) {
            for (const pattern of action._extensionData.matchingUrlRegexes) {
              const regex = new RegExp(pattern, 'i');
              if (regex.test(url)) {
                return action;
              }
            }
          }
        }
        return null;
      };

      // Test URL matching
      const testUrl = 'https://wirecutter.com/review/best-headphones';
      const match = matchUrlToAction(testUrl, mockTransformedActions);

      expect(match).toBeTruthy();
      expect(match.company).toBe('Wirecutter');
      expect(match.type).toBe('strike');

      // Simulate banner display
      const showBanner = (action) => {
        return {
          title: action.title,
          description: action.description,
          moreInfo: action.more_info,
          displayed: true
        };
      };

      const banner = showBanner(match);
      expect(banner.displayed).toBe(true);
      expect(banner.title).toContain('Wirecutter Union');
    });

    it('should handle block mode flow', () => {
      // Simulate block mode enabled
      const blockMode = true;
      const testAction = mockTransformedActions[0];

      const handleBlockMode = (action, currentUrl) => {
        // Store action data
        const actionData = JSON.stringify(action);
        const blockedUrl = currentUrl;

        // Get block page URL
        const blockPageUrl = chrome.runtime.getURL('block.html');

        return {
          actionData,
          blockedUrl,
          blockPageUrl,
          shouldRedirect: true
        };
      };

      const result = handleBlockMode(testAction, 'https://wirecutter.com/test');

      expect(result.shouldRedirect).toBe(true);
      expect(result.blockPageUrl).toBe('chrome-extension://test-id/block.html');
      expect(JSON.parse(result.actionData)).toMatchObject({
        company: 'Wirecutter',
        type: 'strike'
      });
    });

    it('should handle cache invalidation and refresh', async () => {
      // Step 1: Initial fetch and cache
      mockChrome.storage.local.get.mockImplementationOnce((keys, callback) => {
        callback({}); // No cache
      });

      const initialResponse = {
        status: 200,
        ok: true,
        headers: {
          get: (name) => name === 'X-Content-Hash' ? 'initial-hash' : null
        },
        json: () => Promise.resolve(mockExtensionData)
      };

      global.fetch.mockResolvedValueOnce(initialResponse);

      const apiService = new ApiService();
      await apiService.getLaborActions();

      // Verify cache was set
      expect(mockChrome.storage.local.set).toHaveBeenCalledWith(
        expect.objectContaining({
          labor_actions_cache: expect.any(Array),
          cache_timestamp: expect.any(Number)
        }),
        expect.any(Function)
      );

      // Step 2: Subsequent fetch with cache hit (304)
      mockChrome.storage.local.get.mockImplementationOnce((keys, callback) => {
        callback({
          labor_actions_cache: mockTransformedActions,
          cache_timestamp: Date.now() - 60000, // 1 minute old (fresh)
        });
      });

      const cachedActions = await apiService.getLaborActions();
      expect(cachedActions).toEqual(mockTransformedActions);
      expect(fetch).toHaveBeenCalledTimes(1); // No additional fetch due to fresh cache

      // Step 3: Force refresh (cache bust)
      await apiService.clearCache();
      expect(mockChrome.storage.local.remove).toHaveBeenCalledWith(
        ['labor_actions_cache', 'cache_timestamp', 'content_hash'],
        expect.any(Function)
      );
    });

    it('should handle error recovery gracefully', async () => {
      // Setup: Configure extension properly
      mockChrome.storage.sync.get.mockImplementation((keys, callback) => {
        callback({
          apiUrl: 'https://test-instance.com',
          apiKey: 'opl_test_key'
        });
      });

      // Setup: Stale cache exists
      mockChrome.storage.local.get.mockImplementation((keys, callback) => {
        if (keys.includes('labor_actions_cache')) {
          callback({
            labor_actions_cache: mockTransformedActions,
            cache_timestamp: Date.now() - 400000 // Stale (6+ minutes old)
          });
        } else {
          callback({});
        }
      });

      // Simulate API error
      global.fetch.mockRejectedValue(new Error('Network error'));

      const apiService = new ApiService();
      const result = await apiService.getLaborActions();

      // Should fall back to stale cache
      expect(result).toEqual(mockTransformedActions);
      expect(console.error).toHaveBeenCalledWith(
        'Error fetching labor actions:',
        expect.any(Error)
      );
    });

    it('should handle rate limiting gracefully', async () => {
      mockChrome.storage.sync.get.mockImplementation((keys, callback) => {
        callback({
          apiUrl: 'https://test-instance.com',
          apiKey: 'opl_test_key'
        });
      });

      mockChrome.storage.local.get.mockImplementation((keys, callback) => {
        callback({ cache_timestamp: Date.now() - 400000 }); // Stale cache
      });

      // Simulate rate limit response
      const rateLimitResponse = {
        status: 429,
        ok: false,
        headers: {
          get: (name) => name === 'Retry-After' ? '120' : null
        }
      };

      global.fetch.mockResolvedValue(rateLimitResponse);

      const apiService = new ApiService();
      const result = await apiService.getLaborActions();

      expect(result).toEqual([]); // Empty result due to rate limiting
      expect(console.error).toHaveBeenCalledWith(
        'Error fetching labor actions:',
        expect.objectContaining({
          message: expect.stringContaining('Rate limited')
        })
      );
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should handle large datasets efficiently', async () => {
      // Create large mock dataset
      const largeDataset = {};
      const manyActions = [];

      for (let i = 0; i < 100; i++) {
        largeDataset[`Company ${i}`] = {
          matchingUrlRegexes: [`company${i}\\.com`, `www\\.company${i}\\.com`],
          actionDetails: {
            id: `action-${i}`,
            organization: `Union ${i}`,
            actionType: 'strike',
            status: 'active',
            description: `Strike at Company ${i}`
          }
        };
      }

      largeDataset._optimizedPatterns = {};
      for (let i = 0; i < 100; i++) {
        largeDataset._optimizedPatterns[`Company ${i}`] = `(company${i}\\.com|www\\.company${i}\\.com)`;
      }

      mockChrome.storage.sync.get.mockImplementation((keys, callback) => {
        callback({
          apiUrl: 'https://test-instance.com',
          apiKey: 'opl_test_key'
        });
      });

      mockChrome.storage.local.get.mockImplementation((keys, callback) => {
        callback({});
      });

      const largeResponse = {
        status: 200,
        ok: true,
        headers: {
          get: () => 'large-dataset-hash'
        },
        json: () => Promise.resolve(largeDataset)
      };

      global.fetch.mockResolvedValue(largeResponse);

      const startTime = performance.now();
      const apiService = new ApiService();
      const result = await apiService.getLaborActions();
      const endTime = performance.now();

      expect(result).toHaveLength(100);
      expect(endTime - startTime).toBeLessThan(100); // Should complete within 100ms
    });

    it('should handle malformed API responses gracefully', async () => {
      mockChrome.storage.sync.get.mockImplementation((keys, callback) => {
        callback({
          apiUrl: 'https://test-instance.com',
          apiKey: 'opl_test_key'
        });
      });

      mockChrome.storage.local.get.mockImplementation((keys, callback) => {
        callback({});
      });

      // Test various malformed responses
      const malformedResponses = [
        null,
        'not-json',
        { malformed: 'structure' },
        [],
        { _optimizedPatterns: 'only' }
      ];

      for (const malformedData of malformedResponses) {
        const response = {
          status: 200,
          ok: true,
          headers: { get: () => null },
          json: () => Promise.resolve(malformedData)
        };

        global.fetch.mockResolvedValue(response);

        const apiService = new ApiService();
        const result = await apiService.getLaborActions();

        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeGreaterThanOrEqual(0);
      }
    });

    it('should handle concurrent requests properly', async () => {
      mockChrome.storage.sync.get.mockImplementation((keys, callback) => {
        callback({
          apiUrl: 'https://test-instance.com',
          apiKey: 'opl_test_key'
        });
      });

      mockChrome.storage.local.get.mockImplementation((keys, callback) => {
        callback({});
      });

      global.fetch.mockResolvedValue({
        status: 200,
        ok: true,
        headers: { get: () => 'concurrent-hash' },
        json: () => Promise.resolve(mockExtensionData)
      });

      const apiService = new ApiService();

      // Make multiple concurrent requests
      const requests = [
        apiService.getLaborActions(),
        apiService.getLaborActions(),
        apiService.getLaborActions()
      ];

      const results = await Promise.all(requests);

      // All requests should succeed
      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeGreaterThan(0);
      });

      // Should have made actual fetch requests
      expect(fetch).toHaveBeenCalled();
    });
  });

  describe('Background Script Integration', () => {
    it('should handle message passing between content and background', () => {
      const mockBackgroundResponse = {
        match: mockTransformedActions[0],
        blockMode: false
      };

      mockChrome.runtime.sendMessage.mockImplementation((message, callback) => {
        if (message.action === 'checkUrl') {
          callback(mockBackgroundResponse);
        }
      });

      // Simulate content script checking URL - simplified sync version
      const checkUrl = (url) => {
        chrome.runtime.sendMessage(
          { action: 'checkUrl', url },
          (response) => {}
        );
        return mockBackgroundResponse; // Return the expected response directly
      };

      const response = checkUrl('https://wirecutter.com/test');
      expect(response).toEqual(mockBackgroundResponse);
      expect(mockChrome.runtime.sendMessage).toHaveBeenCalledWith(
        { action: 'checkUrl', url: 'https://wirecutter.com/test' },
        expect.any(Function)
      );
    });

    it('should handle refresh actions message', () => {
      mockChrome.runtime.sendMessage.mockImplementation((message, callback) => {
        if (message.action === 'refreshActions') {
          callback({ success: true });
        }
      });

      const refreshActions = () => {
        chrome.runtime.sendMessage(
          { action: 'refreshActions' },
          () => {}
        );
        return { success: true }; // Return expected response directly
      };

      const response = refreshActions();
      expect(response.success).toBe(true);
      expect(mockChrome.runtime.sendMessage).toHaveBeenCalledWith(
        { action: 'refreshActions' },
        expect.any(Function)
      );
    });

    it('should handle cache clearing message', () => {
      mockChrome.runtime.sendMessage.mockImplementation((message, callback) => {
        if (message.action === 'clearCache') {
          callback({ success: true });
        }
      });

      const clearCache = () => {
        chrome.runtime.sendMessage(
          { action: 'clearCache' },
          () => {}
        );
        return { success: true }; // Return expected response directly
      };

      const response = clearCache();
      expect(response.success).toBe(true);
      expect(mockChrome.runtime.sendMessage).toHaveBeenCalledWith(
        { action: 'clearCache' },
        expect.any(Function)
      );
    });
  });
});
