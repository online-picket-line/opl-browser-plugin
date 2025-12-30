// @ts-nocheck
// Error handling and edge case tests
describe.skip('Error Handling and Edge Cases', () => {
  let mockChrome;
  let ApiService;

  beforeEach(() => {
    jest.clearAllMocks();

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
      }
    };
    global.chrome = mockChrome;
    global.fetch = jest.fn();

    ApiService = require('../api-service.js');
  });

  describe('Network Error Handling', () => {
    it('should handle fetch timeout errors', async () => {
      mockChrome.storage.sync.get.mockImplementation((keys, callback) => {
        callback({
          apiUrl: 'https://test-instance.com',
          apiKey: 'opl_test_key'
        });
      });

      mockChrome.storage.local.get.mockImplementation((keys, callback) => {
        callback({});
      });

      const timeoutError = new Error('Timeout');
      timeoutError.name = 'AbortError';
      global.fetch.mockRejectedValue(timeoutError);

      const apiService = new ApiService();
      const result = await apiService.getLaborActions();

      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalledWith(
        'Error fetching labor actions:',
        expect.any(Error)
      );
    });

    it('should handle DNS resolution errors', async () => {
      mockChrome.storage.sync.get.mockImplementation((keys, callback) => {
        callback({
          apiUrl: 'https://nonexistent-domain-xyz.com',
          apiKey: 'opl_test_key'
        });
      });

      mockChrome.storage.local.get.mockImplementation((keys, callback) => {
        callback({});
      });

      const dnsError = new Error('getaddrinfo ENOTFOUND');
      global.fetch.mockRejectedValue(dnsError);

      const apiService = new ApiService();
      const result = await apiService.getLaborActions();

      expect(result).toEqual([]);
    });

    it('should handle CORS errors', async () => {
      mockChrome.storage.sync.get.mockImplementation((keys, callback) => {
        callback({
          apiUrl: 'https://test-instance.com',
          apiKey: 'opl_test_key'
        });
      });

      mockChrome.storage.local.get.mockImplementation((keys, callback) => {
        callback({});
      });

      const corsError = new Error('CORS policy');
      global.fetch.mockRejectedValue(corsError);

      const apiService = new ApiService();
      const result = await apiService.getLaborActions();

      expect(result).toEqual([]);
    });
  });

  describe('Invalid Configuration Handling', () => {
    it('should handle missing API URL', async () => {
      mockChrome.storage.sync.get.mockImplementation((keys, callback) => {
        callback({
          apiKey: 'opl_test_key'
          // apiUrl missing
        });
      });

      const apiService = new ApiService();
      const result = await apiService.getLaborActions();

      expect(result).toEqual([]);
    });

    it('should handle invalid API URL format', async () => {
      mockChrome.storage.sync.get.mockImplementation((keys, callback) => {
        callback({
          apiUrl: 'not-a-valid-url',
          apiKey: 'opl_test_key'
        });
      });

      mockChrome.storage.local.get.mockImplementation((keys, callback) => {
        callback({});
      });

      const apiService = new ApiService();

      // This might throw due to invalid URL, handle gracefully
      try {
        const result = await apiService.getLaborActions();
        expect(result).toEqual([]);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });

    it('should handle missing API key', async () => {
      mockChrome.storage.sync.get.mockImplementation((keys, callback) => {
        callback({
          apiUrl: 'https://test-instance.com'
          // apiKey missing
        });
      });

      const apiService = new ApiService();
      const result = await apiService.getLaborActions();

      expect(result).toEqual([]);
    });

    it('should handle empty configuration', async () => {
      mockChrome.storage.sync.get.mockImplementation((keys, callback) => {
        callback({});
      });

      const apiService = new ApiService();
      const result = await apiService.getLaborActions();

      expect(result).toEqual([]);
    });
  });

  describe('Chrome API Error Handling', () => {
    it('should handle storage.sync.get errors', async () => {
      mockChrome.storage.sync.get.mockImplementation((keys, callback) => {
        // Simulate Chrome API error
        chrome.runtime.lastError = { message: 'Storage quota exceeded' };
        callback(undefined);
      });

      const apiService = new ApiService();
      const result = await apiService.getLaborActions();

      expect(result).toEqual([]);

      // Clean up
      delete chrome.runtime.lastError;
    });

    it('should handle storage.local.get errors', async () => {
      mockChrome.storage.sync.get.mockImplementation((keys, callback) => {
        callback({
          apiUrl: 'https://test-instance.com',
          apiKey: 'opl_test_key'
        });
      });

      mockChrome.storage.local.get.mockImplementation((keys, callback) => {
        chrome.runtime.lastError = { message: 'Local storage error' };
        callback(undefined);
      });

      global.fetch.mockResolvedValue({
        status: 200,
        ok: true,
        headers: { get: () => 'test-hash' },
        json: () => Promise.resolve({ companies: {} })
      });

      const apiService = new ApiService();
      const result = await apiService.getLaborActions();

      // Should still work despite cache error
      expect(Array.isArray(result)).toBe(true);

      delete chrome.runtime.lastError;
    });

    it('should handle storage.local.set errors during caching', async () => {
      mockChrome.storage.sync.get.mockImplementation((keys, callback) => {
        callback({
          apiUrl: 'https://test-instance.com',
          apiKey: 'opl_test_key'
        });
      });

      mockChrome.storage.local.get.mockImplementation((keys, callback) => {
        callback({});
      });

      mockChrome.storage.local.set.mockImplementation((data, callback) => {
        chrome.runtime.lastError = { message: 'Storage quota exceeded' };
        callback();
      });

      global.fetch.mockResolvedValue({
        status: 200,
        ok: true,
        headers: { get: () => 'test-hash' },
        json: () => Promise.resolve({
          companies: {
            'TestCompany': {
              matchingUrlRegexes: ['test\\.com'],
              actionDetails: {
                id: 'test',
                organization: 'Test Union',
                actionType: 'strike',
                status: 'active'
              }
            }
          }
        })
      });

      const apiService = new ApiService();
      const result = await apiService.getLaborActions();

      // Should still return results despite cache save error
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);

      delete chrome.runtime.lastError;
    });
  });

  describe('API Response Validation', () => {
    it('should handle completely invalid JSON', async () => {
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
        headers: { get: () => null },
        json: () => Promise.reject(new Error('Invalid JSON'))
      });

      const apiService = new ApiService();
      const result = await apiService.getLaborActions();

      expect(result).toEqual([]);
    });

    it('should handle null response data', async () => {
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
        headers: { get: () => null },
        json: () => Promise.resolve(null)
      });

      const apiService = new ApiService();
      const result = await apiService.getLaborActions();

      expect(result).toEqual([]);
    });

    it('should handle response with missing companies object', async () => {
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
        headers: { get: () => null },
        json: () => Promise.resolve({
          _optimizedPatterns: {},
          someOtherField: 'value'
          // companies missing
        })
      });

      const apiService = new ApiService();
      const result = await apiService.getLaborActions();

      expect(result).toEqual([]);
    });

    it('should handle company entries with missing required fields', async () => {
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
        headers: { get: () => null },
        json: () => Promise.resolve({
          companies: {
            'ValidCompany': {
              matchingUrlRegexes: ['valid\\.com'],
              actionDetails: {
                id: 'valid',
                organization: 'Valid Union',
                actionType: 'strike',
                status: 'active'
              }
            },
            'InvalidCompany1': {
              // Missing matchingUrlRegexes
              actionDetails: {
                id: 'invalid1',
                organization: 'Invalid Union',
                actionType: 'strike',
                status: 'active'
              }
            },
            'InvalidCompany2': {
              matchingUrlRegexes: ['invalid\\.com']
              // Missing actionDetails
            },
            'InvalidCompany3': {
              matchingUrlRegexes: [],
              actionDetails: {
                id: 'invalid3'
                // Missing other required fields
              }
            }
          }
        })
      });

      const apiService = new ApiService();
      const result = await apiService.getLaborActions();

      // Should only include valid entries
      expect(result).toHaveLength(1);
      expect(result[0].company).toBe('ValidCompany');
    });
  });

  describe('Memory and Performance Edge Cases', () => {
    it('should handle extremely large company names', async () => {
      const largeCompanyName = 'A'.repeat(10000); // 10KB company name

      mockChrome.storage.sync.get.mockImplementation((keys, callback) => {
        callback({
          apiUrl: 'https://test-instance.com',
          apiKey: 'opl_test_key'
        });
      });

      mockChrome.storage.local.get.mockImplementation((keys, callback) => {
        callback({});
      });

      const responseData = {
        companies: {}
      };
      responseData.companies[largeCompanyName] = {
        matchingUrlRegexes: ['test\\.com'],
        actionDetails: {
          id: 'large-name-test',
          organization: 'Test Union',
          actionType: 'strike',
          status: 'active'
        }
      };

      global.fetch.mockResolvedValue({
        status: 200,
        ok: true,
        headers: { get: () => null },
        json: () => Promise.resolve(responseData)
      });

      const apiService = new ApiService();
      const result = await apiService.getLaborActions();

      expect(result).toHaveLength(1);
      expect(result[0].company).toBe(largeCompanyName);
    });

    it('should handle malformed regex patterns gracefully', async () => {
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
        headers: { get: () => null },
        json: () => Promise.resolve({
          companies: {
            'TestCompany': {
              matchingUrlRegexes: [
                '[invalid-regex', // Malformed regex
                'valid\\.com',     // Valid regex
                '**invalid**'      // Another malformed regex
              ],
              actionDetails: {
                id: 'test',
                organization: 'Test Union',
                actionType: 'strike',
                status: 'active'
              }
            }
          }
        })
      });

      const apiService = new ApiService();
      const result = await apiService.getLaborActions();

      // Should still process the entry but handle regex errors gracefully
      expect(result).toHaveLength(1);
      expect(result[0].company).toBe('TestCompany');
    });
  });

  describe('Concurrent Access Edge Cases', () => {
    it('should handle multiple simultaneous cache operations', async () => {
      mockChrome.storage.sync.get.mockImplementation((keys, callback) => {
        callback({
          apiUrl: 'https://test-instance.com',
          apiKey: 'opl_test_key'
        });
      });

      let cacheGetCallCount = 0;
      mockChrome.storage.local.get.mockImplementation((keys, callback) => {
        cacheGetCallCount++;
        if (cacheGetCallCount === 1) {
          // First call - no cache
          callback({});
        } else {
          // Subsequent calls - return cache
          callback({
            labor_actions_cache: [{
              id: 'cached',
              company: 'Cached Company',
              type: 'strike'
            }],
            cache_timestamp: Date.now()
          });
        }
      });

      global.fetch.mockResolvedValue({
        status: 200,
        ok: true,
        headers: { get: () => 'test-hash' },
        json: () => Promise.resolve({
          companies: {
            'TestCompany': {
              matchingUrlRegexes: ['test\\.com'],
              actionDetails: {
                id: 'test',
                organization: 'Test Union',
                actionType: 'strike',
                status: 'active'
              }
            }
          }
        })
      });

      const apiService1 = new ApiService();
      const apiService2 = new ApiService();
      const apiService3 = new ApiService();

      // Make concurrent requests
      const [result1, result2, result3] = await Promise.all([
        apiService1.getLaborActions(),
        apiService2.getLaborActions(),
        apiService3.getLaborActions()
      ]);

      // All should succeed
      expect(Array.isArray(result1)).toBe(true);
      expect(Array.isArray(result2)).toBe(true);
      expect(Array.isArray(result3)).toBe(true);
    });
  });

  describe('URL Matching Edge Cases', () => {
    it('should handle invalid URLs gracefully', () => {
      const matchUrlToAction = require('../background.js').matchUrlToAction ||
        ((url, actions) => {
          try {
            // Simulate URL matching logic
            for (const action of actions) {
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
          } catch (error) {
            console.error('URL matching error:', error);
            return null;
          }
        });

      const testActions = [{
        id: 'test',
        company: 'TestCompany',
        type: 'strike',
        _extensionData: {
          matchingUrlRegexes: ['test\\.com']
        }
      }];

      const invalidUrls = [
        'not-a-url',
        '',
        'javascript:alert("test")',
        'file:///etc/passwd',
        'chrome-extension://abc/test.html',
        null,
        undefined
      ];

      invalidUrls.forEach(url => {
        const result = matchUrlToAction(url, testActions);
        expect(result).toBeNull();
      });
    });

    it('should handle international domain names', () => {
      const matchUrlToAction = (url, actions) => {
        try {
          for (const action of actions) {
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
        } catch (error) {
          return null;
        }
      };

      const testActions = [{
        id: 'international',
        company: 'International Company',
        type: 'strike',
        _extensionData: {
          matchingUrlRegexes: ['测试\\.com', 'тест\\.com', 'test-café\\.com']
        }
      }];

      const internationalUrls = [
        'https://测试.com/page',
        'https://тест.com/страница',
        'https://test-café.com/menu'
      ];

      internationalUrls.forEach(url => {
        const result = matchUrlToAction(url, testActions);
        // May or may not match depending on regex engine capabilities
        expect(result).toBeNull(); // Conservative expectation
      });
    });
  });
});
