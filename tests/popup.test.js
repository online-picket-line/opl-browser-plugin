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
    'refresh-btn': createMockElement('refresh-btn'),
    'test-config-btn': createMockElement('test-config-btn'),
    'status': createMockElement('status'),
    'stats-content': createMockElement('stats-content')
  };

  return {
    getElementById: jest.fn((id) => elements[id] || null),
    addEventListener: jest.fn()
  };
};

describe('Popup Functionality', () => {
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

  describe('API Connection Testing', () => {
    it('should test API connection successfully', async () => {
      const testConnection = () => {
        const apiUrl = 'https://onlinepicketline.com';
        const apiKey = 'opl_02cafecc3361fb5ee303832dde26e3c67f47b94476b55f10b464ba20bfec4f1c';

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

      const result = await testConnection();
      expect(result).toBeDefined();
      expect(fetch).toHaveBeenCalledWith(
        'https://onlinepicketline.com/api/blocklist.json?format=extension',
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-API-Key': 'opl_02cafecc3361fb5ee303832dde26e3c67f47b94476b55f10b464ba20bfec4f1c'
          })
        })
      );
    });

    it('should handle authentication errors', async () => {
      const testConnection = () => {
        const apiUrl = 'https://onlinepicketline.com';
        const apiKey = 'opl_02cafecc3361fb5ee303832dde26e3c67f47b94476b55f10b464ba20bfec4f1c';

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

      await expect(testConnection())
        .rejects.toThrow('Invalid API key');
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
  });
});
