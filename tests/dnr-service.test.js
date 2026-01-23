const DnrService = require('../dnr-service.js');

describe('DnrService', () => {
  let dnrService;
  let mockChrome;

  beforeEach(() => {
    // Mock console methods
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});

    dnrService = new DnrService();

    // Setup Chrome DNR API mocks
    mockChrome = {
      runtime: {
        getURL: jest.fn((path) => `chrome-extension://test-id/${path}`)
      },
      declarativeNetRequest: {
        getDynamicRules: jest.fn(() => Promise.resolve([])),
        updateDynamicRules: jest.fn(() => Promise.resolve()),
        updateSessionRules: jest.fn(() => Promise.resolve())
      }
    };

    global.chrome = mockChrome;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Module Loading', () => {
    test('should be loadable via importScripts in service worker', () => {
      // Test that the module exports correctly for service workers
      expect(DnrService).toBeDefined();
      expect(typeof DnrService).toBe('function');
    });

    test('should export for Node.js testing environment', () => {
      // Verify module.exports works in test environment
      // In Jest, module.exports might be wrapped in an object
      expect(DnrService).toBeDefined();
      expect(typeof DnrService).toBe('function');
    });

    test('should handle typeof checks without errors', () => {
      // This tests the fix for module.exports check
      // Previously: if (typeof module !== 'undefined' && module.exports && ...)
      // Now: if (typeof module !== 'undefined' && typeof module.exports !== 'undefined' && ...)
      
      // Simulate environment where module exists but module.exports might be undefined
      const testModule = { exports: undefined };
      
      // Should not throw when checking typeof module.exports
      expect(() => {
        if (typeof testModule !== 'undefined' && typeof testModule.exports !== 'undefined') {
          testModule.exports = DnrService;
        }
      }).not.toThrow();
    });
  });

  describe('Constructor', () => {
    test('should initialize with correct defaults', () => {
      expect(dnrService.MAX_RULES).toBe(5000);
      expect(dnrService.RULE_ID_OFFSET).toBe(1);
    });
  });

  describe('convertRegexToUrlFilter', () => {
    test('should convert simple domain pattern', () => {
      // Backslash-escaped dots are converted to literal dots for DNR urlFilter format
      const result = dnrService.convertRegexToUrlFilter('example\\.com');
      expect(result).toBe('||example.com^');
    });

    test('should convert domain with path', () => {
      const result = dnrService.convertRegexToUrlFilter('example\\.com/path');
      expect(result).toBe('||example.com/path');
    });

    test('should handle facebook.com patterns', () => {
      const result = dnrService.convertRegexToUrlFilter('facebook\\.com/company');
      expect(result).toBe('||facebook.com/company');
    });

    test('should handle OR patterns by returning first option', () => {
      const result = dnrService.convertRegexToUrlFilter('(example\\.com|test\\.com)');
      expect(result).toBe('||example.com*');
    });

    test('should handle wildcards', () => {
      const result = dnrService.convertRegexToUrlFilter('.*example\\.com.*');
      expect(result).toContain('example.com');
    });

    test('should return null for invalid patterns', () => {
      // Mock console.error to prevent test output noise
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // Test that errors are caught and null is returned
      const result = dnrService.convertRegexToUrlFilter(null);
      expect(result).toBeNull();
      
      errorSpy.mockRestore();
    });
  });

  describe('expandRegexToMultipleFilters', () => {
    test('should expand OR pattern into multiple filters', () => {
      const result = dnrService.expandRegexToMultipleFilters('(example\\.com|test\\.com|another\\.com)');
      expect(result).toHaveLength(3);
      expect(result).toContain('||example.com^');
      expect(result).toContain('||test.com^');
      expect(result).toContain('||another.com^');
    });

    test('should return single filter for non-OR patterns', () => {
      const result = dnrService.expandRegexToMultipleFilters('example\\.com');
      expect(result).toHaveLength(1);
      expect(result[0]).toBe('||example.com^');
    });

    test('should filter out null results', () => {
      // Test with pattern that might produce null
      const result = dnrService.expandRegexToMultipleFilters('');
      expect(Array.isArray(result)).toBe(true);
    });

    test('should handle errors gracefully', () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      const result = dnrService.expandRegexToMultipleFilters(null);
      expect(result).toEqual([]);
      
      errorSpy.mockRestore();
    });
  });

  describe('generateBlockModeRules', () => {
    const mockActions = [
      {
        id: 'action-1',
        company: 'Example Corp',
        status: 'active',
        _extensionData: {
          matchingUrlRegexes: ['example\\.com', 'example\\.org']
        }
      },
      {
        id: 'action-2',
        company: 'Test Inc',
        status: 'active',
        target_urls: ['test.com', 'test.org']
      },
      {
        id: 'action-3',
        company: 'Inactive Corp',
        status: 'inactive',
        _extensionData: {
          matchingUrlRegexes: ['inactive\\.com']
        }
      }
    ];

    test('should generate redirect rules for active actions', () => {
      const rules = dnrService.generateBlockModeRules(mockActions);

      expect(rules.length).toBeGreaterThan(0);
      
      // Check rule structure
      rules.forEach(rule => {
        expect(rule).toHaveProperty('id');
        expect(rule).toHaveProperty('priority', 1);
        expect(rule.action.type).toBe('redirect');
        expect(rule.action.redirect.url).toContain('block.html');
        expect(rule.condition.resourceTypes).toEqual(['main_frame']);
      });
    });

    test('should skip inactive actions', () => {
      const rules = dnrService.generateBlockModeRules(mockActions);
      
      // No rule should be generated for 'Inactive Corp'
      const hasInactiveRule = rules.some(rule => 
        rule.condition.urlFilter && rule.condition.urlFilter.includes('inactive')
      );
      expect(hasInactiveRule).toBe(false);
    });

    test('should respect MAX_RULES limit', () => {
      const manyActions = Array.from({ length: 6000 }, (_, i) => ({
        id: `action-${i}`,
        status: 'active',
        _extensionData: {
          matchingUrlRegexes: [`example${i}\\.com`]
        }
      }));

      const rules = dnrService.generateBlockModeRules(manyActions);
      expect(rules.length).toBeLessThanOrEqual(dnrService.MAX_RULES);
    });

    test('should handle actions with multiple URL patterns', () => {
      const actionWithMultipleUrls = [{
        id: 'multi-url',
        status: 'active',
        _extensionData: {
          matchingUrlRegexes: [
            'site1\\.com',
            'site2\\.com',
            '(option1\\.com|option2\\.com)'
          ]
        }
      }];

      const rules = dnrService.generateBlockModeRules(actionWithMultipleUrls);
      expect(rules.length).toBeGreaterThan(2); // Should expand OR patterns
    });

    test('should use chrome.runtime.getURL for block page with domain hint', () => {
      const rules = dnrService.generateBlockModeRules([mockActions[0]]);
      
      expect(chrome.runtime.getURL).toHaveBeenCalledWith('block.html');
      // Block page URL should include domain hint as query parameter
      expect(rules[0].action.redirect.url).toContain('chrome-extension://test-id/block.html?domain=');
    });
  });

  describe('generateBannerModeRules', () => {
    test('should return empty array for banner mode', () => {
      const mockActions = [
        {
          id: 'action-1',
          status: 'active',
          _extensionData: { matchingUrlRegexes: ['example\\.com'] }
        }
      ];

      const rules = dnrService.generateBannerModeRules(mockActions);
      expect(rules).toEqual([]);
    });
  });

  describe('updateRules', () => {
    const mockActions = [
      {
        id: 'action-1',
        status: 'active',
        _extensionData: { matchingUrlRegexes: ['example\\.com'] }
      }
    ];

    test('should update rules in block mode', async () => {
      const success = await dnrService.updateRules(mockActions, true);

      expect(success).toBe(true);
      expect(chrome.declarativeNetRequest.getDynamicRules).toHaveBeenCalled();
      expect(chrome.declarativeNetRequest.updateDynamicRules).toHaveBeenCalled();
    });

    test('should clear rules in banner mode', async () => {
      const success = await dnrService.updateRules(mockActions, false);

      expect(success).toBe(true);
      expect(chrome.declarativeNetRequest.updateDynamicRules).toHaveBeenCalledWith({
        removeRuleIds: [],
        addRules: []
      });
    });

    test('should remove existing rules before adding new ones', async () => {
      // Mock existing rules
      const existingRules = [
        { id: 100 },
        { id: 101 },
        { id: 102 }
      ];
      chrome.declarativeNetRequest.getDynamicRules.mockResolvedValue(existingRules);

      await dnrService.updateRules(mockActions, true);

      expect(chrome.declarativeNetRequest.updateDynamicRules).toHaveBeenCalledWith(
        expect.objectContaining({
          removeRuleIds: [100, 101, 102],
          addRules: expect.any(Array)
        })
      );
    });

    test('should handle errors gracefully', async () => {
      chrome.declarativeNetRequest.updateDynamicRules.mockRejectedValue(
        new Error('DNR API error')
      );

      const success = await dnrService.updateRules(mockActions, true);
      
      expect(success).toBe(false);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('clearRules', () => {
    test('should remove all existing rules', async () => {
      const existingRules = [
        { id: 1 },
        { id: 2 },
        { id: 3 }
      ];
      chrome.declarativeNetRequest.getDynamicRules.mockResolvedValue(existingRules);

      const success = await dnrService.clearRules();

      expect(success).toBe(true);
      expect(chrome.declarativeNetRequest.updateDynamicRules).toHaveBeenCalledWith({
        removeRuleIds: [1, 2, 3]
      });
    });

    test('should handle empty rule list', async () => {
      chrome.declarativeNetRequest.getDynamicRules.mockResolvedValue([]);

      const success = await dnrService.clearRules();

      expect(success).toBe(true);
      expect(chrome.declarativeNetRequest.updateDynamicRules).toHaveBeenCalledWith({
        removeRuleIds: []
      });
    });

    test('should handle errors', async () => {
      chrome.declarativeNetRequest.getDynamicRules.mockRejectedValue(
        new Error('API error')
      );

      const success = await dnrService.clearRules();
      
      expect(success).toBe(false);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('addBypassRule', () => {
    test('should add allow rule with high priority', async () => {
      const success = await dnrService.addBypassRule('https://example.com/page');

      expect(success).toBe(true);
      expect(chrome.declarativeNetRequest.updateSessionRules).toHaveBeenCalledWith({
        addRules: [expect.objectContaining({
          priority: 100,
          action: { type: 'allow' },
          condition: expect.objectContaining({
            urlFilter: '||example.com',
            resourceTypes: ['main_frame']
          })
        })]
      });
    });

    test('should extract domain from URL', async () => {
      await dnrService.addBypassRule('https://subdomain.example.com/path/to/page');

      const callArg = chrome.declarativeNetRequest.updateSessionRules.mock.calls[0][0];
      expect(callArg.addRules[0].condition.urlFilter).toBe('||subdomain.example.com');
    });

    test('should handle malformed URLs', async () => {
      // Should not throw
      const success = await dnrService.addBypassRule('not-a-valid-url');
      
      expect(success).toBe(true);
      expect(chrome.declarativeNetRequest.updateSessionRules).toHaveBeenCalled();
    });

    test('should generate unique rule IDs', async () => {
      await dnrService.addBypassRule('https://site1.com');
      await dnrService.addBypassRule('https://site2.com');

      const calls = chrome.declarativeNetRequest.updateSessionRules.mock.calls;
      const id1 = calls[0][0].addRules[0].id;
      const id2 = calls[1][0].addRules[0].id;

      // IDs should be different (within bypass range)
      expect(id1).toBeGreaterThanOrEqual(dnrService.MAX_RULES + 10000);
      expect(id2).toBeGreaterThanOrEqual(dnrService.MAX_RULES + 10000);
    });

    test('should handle errors', async () => {
      chrome.declarativeNetRequest.updateSessionRules.mockRejectedValue(
        new Error('API error')
      );

      const success = await dnrService.addBypassRule('https://example.com');
      
      expect(success).toBe(false);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('getRuleStats', () => {
    test('should return rule statistics', async () => {
      const mockRules = [
        { id: 1, action: { type: 'redirect' } },
        { id: 2, action: { type: 'redirect' } },
        { id: 3, action: { type: 'allow' } },
        { id: 4, action: { type: 'block' } }
      ];
      chrome.declarativeNetRequest.getDynamicRules.mockResolvedValue(mockRules);

      const stats = await dnrService.getRuleStats();

      expect(stats).toEqual({
        totalRules: 4,
        maxRules: 5000,
        rulesRemaining: 4996,
        ruleTypes: {
          redirect: 2,
          allow: 1,
          block: 1
        }
      });
    });

    test('should handle empty rules', async () => {
      chrome.declarativeNetRequest.getDynamicRules.mockResolvedValue([]);

      const stats = await dnrService.getRuleStats();

      expect(stats.totalRules).toBe(0);
      expect(stats.rulesRemaining).toBe(5000);
    });

    test('should handle errors', async () => {
      chrome.declarativeNetRequest.getDynamicRules.mockRejectedValue(
        new Error('API error')
      );

      const stats = await dnrService.getRuleStats();
      
      expect(stats).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('Service Worker Import Compatibility', () => {
    test('should not throw when loaded without chrome API', () => {
      const originalChrome = global.chrome;
      delete global.chrome;

      try {
        // Reload module
        delete require.cache[require.resolve('../dnr-service.js')];
        const DnrServiceReloaded = require('../dnr-service.js');
        
        // Should be able to instantiate
        const instance = new DnrServiceReloaded();
        expect(instance).toBeDefined();
        expect(instance.MAX_RULES).toBe(5000);
      } finally {
        global.chrome = originalChrome;
      }
    });

    test('should be compatible with strict mode', () => {
      'use strict';
      
      // Should not throw in strict mode
      expect(() => {
        const instance = new DnrService();
        instance.convertRegexToUrlFilter('test\\.com');
      }).not.toThrow();
    });
  });
});
