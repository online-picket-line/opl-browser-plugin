// Mock DOM elements for popup testing
const createMockElement = (id, value = '') => ({
  id,
  value,
  textContent: '',
  disabled: false,
  checked: false,
  style: { display: '' },
  className: '',
  addEventListener: jest.fn(),
  click: jest.fn()
});

const createMockDocument = () => {
  const elements = {
    'mode-banner': createMockElement('mode-banner'),
    'mode-block': createMockElement('mode-block'),
    'api-url': createMockElement('api-url'),
    'api-key': createMockElement('api-key'),
    'save-config-btn': createMockElement('save-config-btn'),
    'refresh-btn': createMockElement('refresh-btn'),
    'test-config-btn': createMockElement('test-config-btn'),
    'status': createMockElement('status'),
    'stats-content': createMockElement('stats-content'),
    'toggle-config': createMockElement('toggle-config'),
    'config-help': createMockElement('config-help')
  };

  return {
    getElementById: jest.fn((id) => elements[id] || null),
    addEventListener: jest.fn()
  };
};

describe('Popup Configuration', () => {
  let mockDocument;
  let mockChrome;

  beforeEach(() => {
    mockDocument = createMockDocument();
    global.document = mockDocument;

    mockChrome = {
      storage: {
        sync: {
          get: jest.fn(),
          set: jest.fn()
        }
      },
      runtime: {
        sendMessage: jest.fn()
      }
    };
    global.chrome = mockChrome;
    global.fetch = jest.fn();
  });

  describe('API Key Validation', () => {
    it('should validate API key format', () => {
      const validateApiKey = (key) => {
        return key.trim().startsWith('opl_');
      };

      expect(validateApiKey('opl_test_key_12345')).toBe(true);
      expect(validateApiKey('opl_valid_key')).toBe(true);
      expect(validateApiKey('invalid_key')).toBe(false);
      expect(validateApiKey('opk_wrong_prefix')).toBe(false);
      expect(validateApiKey('')).toBe(false);
      expect(validateApiKey('   opl_key_with_spaces   ')).toBe(true);
    });

    it('should reject empty API key', () => {
      const validateApiKey = (key) => {
        const trimmed = (key || '').trim();
        return trimmed.length > 0 && trimmed.startsWith('opl_');
      };

      expect(validateApiKey('')).toBe(false);
      expect(validateApiKey('   ')).toBe(false);
      expect(validateApiKey('opl_')).toBe(true); // Minimal valid key
    });

    it('should handle special characters in API key', () => {
      const validateApiKey = (key) => {
        return key.trim().startsWith('opl_');
      };

      expect(validateApiKey('opl_key-with-dashes')).toBe(true);
      expect(validateApiKey('opl_key_with_underscores')).toBe(true);
      expect(validateApiKey('opl_key123numbers')).toBe(true);
      expect(validateApiKey('opl_key.with.dots')).toBe(true);
    });
  });

  describe('URL Validation', () => {
    const validateUrl = (urlString) => {
      try {
        const url = new URL(urlString);
        return url.protocol === 'https:' || url.protocol === 'http:';
      } catch (e) {
        return false;
      }
    };

    it('should validate URL format', () => {
      expect(validateUrl('https://example.com')).toBe(true);
      expect(validateUrl('http://example.com')).toBe(true);
      expect(validateUrl('https://sub.example.com')).toBe(true);
      expect(validateUrl('https://example.com:8080')).toBe(true);
      
      expect(validateUrl('invalid-url')).toBe(false);
      expect(validateUrl('ftp://example.com')).toBe(false);
      expect(validateUrl('example.com')).toBe(false);
      expect(validateUrl('')).toBe(false);
    });

    it('should handle URL with paths and parameters', () => {
      expect(validateUrl('https://example.com/path')).toBe(true);
      expect(validateUrl('https://example.com/path/subpath')).toBe(true);
      expect(validateUrl('https://example.com?param=value')).toBe(true);
      expect(validateUrl('https://example.com#fragment')).toBe(true);
    });

    it('should handle trailing slashes', () => {
      const normalizeUrl = (urlString) => {
        return urlString.endsWith('/') ? urlString.slice(0, -1) : urlString;
      };

      expect(normalizeUrl('https://example.com/')).toBe('https://example.com');
      expect(normalizeUrl('https://example.com')).toBe('https://example.com');
      expect(normalizeUrl('https://example.com/path/')).toBe('https://example.com/path');
    });
  });

  describe('Configuration Storage', () => {
    it('should save valid configuration', async () => {
      const saveConfig = (apiUrl, apiKey) => {
        return new Promise((resolve, reject) => {
          if (!apiUrl.trim()) {
            reject(new Error('API URL is required'));
            return;
          }
          if (!apiKey.trim().startsWith('opl_')) {
            reject(new Error('Invalid API key format'));
            return;
          }

          chrome.storage.sync.set({ apiUrl, apiKey }, () => {
            resolve('Configuration saved');
          });
        });
      };

      mockChrome.storage.sync.set.mockImplementation((data, callback) => {
        callback();
      });

      await expect(saveConfig('https://example.com', 'opl_test_key'))
        .resolves.toBe('Configuration saved');
      
      expect(mockChrome.storage.sync.set).toHaveBeenCalledWith(
        { apiUrl: 'https://example.com', apiKey: 'opl_test_key' },
        expect.any(Function)
      );
    });

    it('should reject invalid configurations', async () => {
      const saveConfig = (apiUrl, apiKey) => {
        return new Promise((resolve, reject) => {
          if (!apiUrl.trim()) {
            reject(new Error('API URL is required'));
            return;
          }
          if (!apiKey.trim().startsWith('opl_')) {
            reject(new Error('Invalid API key format'));
            return;
          }

          resolve('Configuration saved');
        });
      };

      await expect(saveConfig('', 'opl_test_key'))
        .rejects.toThrow('API URL is required');
      
      await expect(saveConfig('https://example.com', 'invalid_key'))
        .rejects.toThrow('Invalid API key format');
      
      await expect(saveConfig('https://example.com', ''))
        .rejects.toThrow('Invalid API key format');
    });

    it('should load existing configuration', () => {
      const mockSettings = {
        apiUrl: 'https://existing.com',
        apiKey: 'opl_existing_key',
        blockMode: true
      };

      mockChrome.storage.sync.get.mockImplementation((keys, callback) => {
        callback(mockSettings);
      });

      const loadConfig = () => {
        return new Promise((resolve) => {
          chrome.storage.sync.get(['blockMode', 'apiUrl', 'apiKey'], (result) => {
            resolve({
              blockMode: result.blockMode || false,
              apiUrl: result.apiUrl || '',
              apiKey: result.apiKey || ''
            });
          });
        });
      };

      return loadConfig().then(config => {
        expect(config).toEqual({
          blockMode: true,
          apiUrl: 'https://existing.com',
          apiKey: 'opl_existing_key'
        });
      });
    });
  });

  describe('API Connection Testing', () => {
    it('should test API connection successfully', async () => {
      const testConnection = (apiUrl, apiKey) => {
        return fetch(`${apiUrl}/api/blocklist.json?format=extension`, {
          headers: {
            'Accept': 'application/json',
            'X-API-Key': apiKey
          }
        }).then(response => {
          if (response.status === 401) {
            throw new Error('Invalid API key');
          }
          if (response.status === 403) {
            throw new Error('API key lacks required permissions');
          }
          if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
          }
          return response.json();
        });
      };

      const mockResponse = {
        status: 200,
        ok: true,
        json: () => Promise.resolve({
          'Test Org': { matchingUrlRegexes: ['test.com'] },
          '_optimizedPatterns': {}
        })
      };

      global.fetch.mockResolvedValue(mockResponse);

      const result = await testConnection('https://test.com', 'opl_test_key');
      expect(result).toBeDefined();
      expect(fetch).toHaveBeenCalledWith(
        'https://test.com/api/blocklist.json?format=extension',
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-API-Key': 'opl_test_key'
          })
        })
      );
    });

    it('should handle authentication errors', async () => {
      const testConnection = (apiUrl, apiKey) => {
        return fetch(`${apiUrl}/api/blocklist.json?format=extension`, {
          headers: {
            'Accept': 'application/json',
            'X-API-Key': apiKey
          }
        }).then(response => {
          if (response.status === 401) {
            throw new Error('Invalid API key');
          }
          if (response.status === 403) {
            throw new Error('API key lacks required permissions');
          }
          return response.json();
        });
      };

      global.fetch.mockResolvedValue({
        status: 401,
        ok: false,
        statusText: 'Unauthorized'
      });

      await expect(testConnection('https://test.com', 'invalid_key'))
        .rejects.toThrow('Invalid API key');
    });

    it('should handle rate limiting', async () => {
      const testConnection = (apiUrl, apiKey) => {
        return fetch(`${apiUrl}/api/blocklist.json?format=extension`, {
          headers: {
            'Accept': 'application/json',
            'X-API-Key': apiKey
          }
        }).then(response => {
          if (response.status === 429) {
            const retryAfter = response.headers.get('Retry-After') || '120';
            throw new Error(`Rate limited. Retry after ${retryAfter} seconds`);
          }
          return response.json();
        });
      };

      global.fetch.mockResolvedValue({
        status: 429,
        ok: false,
        headers: {
          get: (name) => name === 'Retry-After' ? '120' : null
        }
      });

      await expect(testConnection('https://test.com', 'opl_test_key'))
        .rejects.toThrow('Rate limited. Retry after 120 seconds');
    });
  });

  describe('Status Display', () => {
    it('should display success status', () => {
      const showStatus = (message, type) => {
        return { message, type, className: `status ${type}` };
      };

      const status = showStatus('Configuration saved successfully', 'success');
      expect(status.message).toBe('Configuration saved successfully');
      expect(status.type).toBe('success');
      expect(status.className).toBe('status success');
    });

    it('should display error status', () => {
      const showStatus = (message, type) => {
        return { message, type, className: `status ${type}` };
      };

      const status = showStatus('Invalid API key format', 'error');
      expect(status.message).toBe('Invalid API key format');
      expect(status.type).toBe('error');
      expect(status.className).toBe('status error');
    });

    it('should display warning status', () => {
      const showStatus = (message, type) => {
        return { message, type, className: `status ${type}` };
      };

      const status = showStatus('Please configure your API settings', 'warning');
      expect(status.message).toBe('Please configure your API settings');
      expect(status.type).toBe('warning');
      expect(status.className).toBe('status warning');
    });
  });

  describe('Stats Loading', () => {
    it('should load and display statistics', () => {
      const mockActions = [
        { status: 'active', target_urls: ['example.com', 'test.com'] },
        { status: 'active', target_urls: ['another.com'] },
        { status: 'completed', target_urls: ['old.com'] }
      ];

      const loadStats = (actions, timestamp) => {
        const activeActions = actions.filter(a => !a.status || a.status === 'active').length;
        const totalUrls = actions.reduce((sum, a) => sum + (a.target_urls?.length || 0), 0);
        
        let statsHtml = `<strong>${activeActions}</strong> active labor action${activeActions !== 1 ? 's' : ''}`;
        if (totalUrls > 0) {
          statsHtml += `<br><strong>${totalUrls}</strong> URL${totalUrls !== 1 ? 's' : ''} monitored`;
        }
        
        if (timestamp) {
          const age = Date.now() - timestamp;
          const minutes = Math.floor(age / 60000);
          const timeStr = minutes > 0 ? `${minutes} minute${minutes !== 1 ? 's' : ''} ago` : 'just now';
          statsHtml += `<br>Last updated ${timeStr}`;
        }
        
        return statsHtml;
      };

      const currentTime = Date.now();
      const oneMinuteAgo = currentTime - 60000;
      const stats = loadStats(mockActions, oneMinuteAgo);
      
      expect(stats).toContain('<strong>2</strong> active labor actions');
      expect(stats).toContain('<strong>4</strong> URLs monitored');
      expect(stats).toContain('1 minute ago');
    });

    it('should handle empty stats', () => {
      const loadStats = (actions) => {
        const activeActions = actions.filter(a => !a.status || a.status === 'active').length;
        
        if (activeActions === 0) {
          return 'No data loaded yet<br>Configure API and refresh';
        }
        
        return `<strong>${activeActions}</strong> active labor action${activeActions !== 1 ? 's' : ''}`;
      };

      const stats = loadStats([]);
      expect(stats).toBe('No data loaded yet<br>Configure API and refresh');
    });
  });
});