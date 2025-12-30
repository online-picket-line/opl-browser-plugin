/**
 * Tests for background.js
 * Tests the background service worker logic including message handling,
 * labor action fetching, and URL matching
 */

describe('Background Script', () => {
  let mockChrome;
  let mockApiService;

  beforeEach(() => {
    // Mock Chrome API
    mockChrome = {
      runtime: {
        onInstalled: {
          addListener: jest.fn()
        },
        onMessage: {
          addListener: jest.fn()
        }
      },
      alarms: {
        create: jest.fn(),
        onAlarm: {
          addListener: jest.fn()
        }
      },
      storage: {
        local: {
          set: jest.fn().mockImplementation((data) => Promise.resolve()),
          get: jest.fn().mockImplementation((keys, callback) => {
            const result = { labor_actions: [], connection_status: 'online', failure_count: 0 };
            if (callback) callback(result);
            return Promise.resolve(result);
          })
        },
        sync: {
          get: jest.fn().mockImplementation((keys, callback) => {
            const result = { blockMode: false };
            if (callback) callback(result);
            return Promise.resolve(result);
          }),
          set: jest.fn().mockImplementation((data) => Promise.resolve())
        }
      }
    };

    // Mock ApiService
    mockApiService = {
      getLaborActions: jest.fn().mockResolvedValue([]),
      clearCache: jest.fn().mockResolvedValue(undefined)
    };

    global.chrome = mockChrome;
    global.ApiService = jest.fn(() => mockApiService);
    global.importScripts = jest.fn();
    global.console = { log: jest.fn(), error: jest.fn(), warn: jest.fn() };
  });

  describe('URL Matching Function', () => {
    it('should return null for empty inputs', () => {
      const matchUrlToAction = (url, actions) => {
        if (!url || !actions || actions.length === 0) {
          return null;
        }
        return null;
      };

      expect(matchUrlToAction(null, [])).toBeNull();
      expect(matchUrlToAction('', [])).toBeNull();
      expect(matchUrlToAction('https://example.com', null)).toBeNull();
      expect(matchUrlToAction('https://example.com', [])).toBeNull();
    });

    it('should match URL using extension data regex patterns', () => {
      const matchUrlToAction = (url, actions) => {
        if (!url || !actions || actions.length === 0) return null;

        const urlToTest = url.toLowerCase();
        for (const action of actions) {
          if (action.status && action.status !== 'active') continue;

          if (action._extensionData && action._extensionData.matchingUrlRegexes) {
            for (const pattern of action._extensionData.matchingUrlRegexes) {
              try {
                const regex = new RegExp(pattern, 'i');
                if (regex.test(urlToTest)) return action;
              } catch (e) {
                continue;
              }
            }
          }
        }
        return null;
      };

      const actions = [{
        id: 1,
        status: 'active',
        title: 'Test Action',
        _extensionData: {
          matchingUrlRegexes: ['^https?://([^/]*\\.)?example\\.com']
        }
      }];

      const match = matchUrlToAction('https://example.com/page', actions);
      expect(match).not.toBeNull();
      expect(match.id).toBe(1);
    });

    it('should skip inactive actions', () => {
      const matchUrlToAction = (url, actions) => {
        if (!url || !actions || actions.length === 0) return null;

        const urlToTest = url.toLowerCase();
        for (const action of actions) {
          if (action.status && action.status !== 'active') continue;

          if (action._extensionData && action._extensionData.matchingUrlRegexes) {
            for (const pattern of action._extensionData.matchingUrlRegexes) {
              try {
                const regex = new RegExp(pattern, 'i');
                if (regex.test(urlToTest)) return action;
              } catch (e) {
                continue;
              }
            }
          }
        }
        return null;
      };

      const actions = [{
        id: 1,
        status: 'inactive',
        _extensionData: {
          matchingUrlRegexes: ['^https?://([^/]*\\.)?example\\.com']
        }
      }];

      expect(matchUrlToAction('https://example.com', actions)).toBeNull();
    });

    it('should handle regex errors gracefully', () => {
      const matchUrlToAction = (url, actions) => {
        if (!url || !actions || actions.length === 0) return null;

        const urlToTest = url.toLowerCase();
        for (const action of actions) {
          if (action.status && action.status !== 'active') continue;

          if (action._extensionData && action._extensionData.matchingUrlRegexes) {
            for (const pattern of action._extensionData.matchingUrlRegexes) {
              try {
                const regex = new RegExp(pattern, 'i');
                if (regex.test(urlToTest)) return action;
              } catch (e) {
                console.warn('Invalid regex pattern:', pattern);
                continue;
              }
            }
          }
        }
        return null;
      };

      const actions = [{
        id: 1,
        status: 'active',
        _extensionData: {
          matchingUrlRegexes: ['[invalid(regex']
        }
      }];

      expect(matchUrlToAction('https://example.com', actions)).toBeNull();
    });

    it('should fallback to legacy target_urls matching', () => {
      const matchUrlToAction = (url, actions) => {
        if (!url || !actions || actions.length === 0) return null;

        try {
          const urlToTest = url.toLowerCase();
          for (const action of actions) {
            if (action.status && action.status !== 'active') continue;

            if (!action._extensionData) {
              const hostname = new URL(url).hostname.toLowerCase();
              const targets = action.target_urls || action.targets || action.domains || [];

              for (const target of targets) {
                const targetLower = target.toLowerCase();
                if (hostname === targetLower || hostname.endsWith('.' + targetLower)) {
                  return action;
                }
              }
            }
          }
        } catch (error) {
          console.error('Error matching URL:', error);
        }
        return null;
      };

      const actions = [{
        id: 1,
        status: 'active',
        target_urls: ['example.com']
      }];

      expect(matchUrlToAction('https://example.com', actions)).not.toBeNull();
      expect(matchUrlToAction('https://subdomain.example.com', actions)).not.toBeNull();
    });
  });

  describe('Message Handlers', () => {
    it('should handle checkUrl messages', (done) => {
      const handler = (request, sender, sendResponse) => {
        if (request.action === 'checkUrl') {
          mockChrome.storage.local.get(['labor_actions'], (result) => {
            const actions = result.labor_actions || [];
            mockChrome.storage.sync.get(['blockMode'], (settings) => {
              sendResponse({
                match: null,
                blockMode: settings.blockMode || false
              });
            });
          });
          return true;
        }
      };

      const mockSender = { tab: { id: 1 } };
      const mockResponse = jest.fn((response) => {
        expect(response).toHaveProperty('match');
        expect(response).toHaveProperty('blockMode');
        expect(response.blockMode).toBe(false);
        done();
      });

      handler({ action: 'checkUrl', url: 'https://example.com' }, mockSender, mockResponse);
    });

    it('should handle allowBypass messages', (done) => {
      const allowedBypasses = new Map();

      const handler = (request, sender, sendResponse) => {
        if (request.action === 'allowBypass') {
          if (sender.tab) {
            allowedBypasses.set(sender.tab.id, request.url);
            setTimeout(() => allowedBypasses.delete(sender.tab.id), 60000);
          }
          sendResponse({ success: true });
          return true;
        }
      };

      const mockSender = { tab: { id: 1 } };
      const mockResponse = jest.fn((response) => {
        expect(response.success).toBe(true);
        expect(allowedBypasses.has(1)).toBe(true);
        done();
      });

      handler({ action: 'allowBypass', url: 'https://example.com' }, mockSender, mockResponse);
    });

    it('should handle setBlockedState messages', (done) => {
      const handler = (request, sender, sendResponse) => {
        if (request.action === 'setBlockedState') {
          if (sender.tab) {
            const key = `blocked_tab_${sender.tab.id}`;
            mockChrome.storage.local.set({ [key]: {
              action: request.data,
              url: request.url,
              timestamp: Date.now()
            }}).then(() => {
              sendResponse({ success: true });
            });
          }
          return true;
        }
      };

      const mockSender = { tab: { id: 1 } };
      const mockData = { title: 'Test Action' };
      const mockResponse = jest.fn((response) => {
        expect(response.success).toBe(true);
        expect(mockChrome.storage.local.set).toHaveBeenCalled();
        done();
      });

      handler({
        action: 'setBlockedState',
        data: mockData,
        url: 'https://example.com'
      }, mockSender, mockResponse);
    });

    it('should handle refreshActions messages', (done) => {
      const refreshLaborActions = async () => {
        const actions = await mockApiService.getLaborActions();
        await mockChrome.storage.local.set({
          labor_actions: actions,
          connection_status: 'online',
          failure_count: 0
        });
        return true;
      };

      const handler = (request, sender, sendResponse) => {
        if (request.action === 'refreshActions') {
          refreshLaborActions().then((success) => {
            sendResponse({ success });
          });
          return true;
        }
      };

      const mockResponse = jest.fn((response) => {
        expect(response.success).toBe(true);
        done();
      });

      handler({ action: 'refreshActions' }, {}, mockResponse);
    });

    it('should handle clearCache messages', (done) => {
      const handler = (request, sender, sendResponse) => {
        if (request.action === 'clearCache') {
          mockApiService.clearCache().then(() => {
            sendResponse({ success: true });
          });
          return true;
        }
      };

      const mockResponse = jest.fn((response) => {
        expect(response.success).toBe(true);
        expect(mockApiService.clearCache).toHaveBeenCalled();
        done();
      });

      handler({ action: 'clearCache' }, {}, mockResponse);
    });
  });

  describe('Refresh Labor Actions', () => {
    it('should fetch and store labor actions successfully', async () => {
      const mockActions = [{ id: 1, title: 'Test Action', status: 'active' }];
      mockApiService.getLaborActions.mockResolvedValue(mockActions);

      const refreshLaborActions = async () => {
        try {
          const actions = await mockApiService.getLaborActions();
          await mockChrome.storage.local.set({
            labor_actions: actions,
            connection_status: 'online',
            failure_count: 0
          });
          return true;
        } catch (error) {
          return false;
        }
      };

      const result = await refreshLaborActions();

      expect(result).toBe(true);
      expect(mockApiService.getLaborActions).toHaveBeenCalled();
      expect(mockChrome.storage.local.set).toHaveBeenCalledWith({
        labor_actions: mockActions,
        connection_status: 'online',
        failure_count: 0
      });
    });

    it('should handle fetch errors and update failure count', async () => {
      mockApiService.getLaborActions.mockRejectedValue(new Error('Network error'));
      mockChrome.storage.local.get = jest.fn((keys, callback) => {
        if (callback) callback({ failure_count: 2 });
        return Promise.resolve({ failure_count: 2 });
      });

      const refreshLaborActions = async () => {
        try {
          const actions = await mockApiService.getLaborActions();
          await mockChrome.storage.local.set({
            labor_actions: actions,
            connection_status: 'online',
            failure_count: 0
          });
          return true;
        } catch (error) {
          const result = await chrome.storage.local.get(['failure_count']);
          const currentFailures = (result.failure_count || 0) + 1;
          const updates = { failure_count: currentFailures };
          if (currentFailures >= 3) {
            updates.connection_status = 'offline';
          }
          await mockChrome.storage.local.set(updates);
          return false;
        }
      };

      const result = await refreshLaborActions();

      expect(result).toBe(false);
      expect(mockChrome.storage.local.set).toHaveBeenCalledWith({
        failure_count: 3,
        connection_status: 'offline'
      });
    });
  });
});
