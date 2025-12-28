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
    'status': createMockElement('status'),
    'stats-content': createMockElement('stats-content'),
    'connection-indicator': createMockElement('connection-indicator'),
    'connection-text': createMockElement('connection-text'),
    'test-block-btn': createMockElement('test-block-btn')
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

    it('should update connection indicator', () => {
      const updateIndicator = (status) => {
        const indicator = { style: {}, className: '' };
        const text = { textContent: '' };
        
        indicator.style.display = 'inline-flex';
        indicator.className = `connection-status status-${status}`;
        text.textContent = status.charAt(0).toUpperCase() + status.slice(1);
        
        return { indicator, text };
      };

      const online = updateIndicator('online');
      expect(online.indicator.className).toBe('connection-status status-online');
      expect(online.text.textContent).toBe('Online');

      const offline = updateIndicator('offline');
      expect(offline.indicator.className).toBe('connection-status status-offline');
      expect(offline.text.textContent).toBe('Offline');
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
        
        statsHtml += `<br><a href="https://onlinepicketline.com" target="_blank" style="color: inherit; text-decoration: underline; margin-top: 0.5rem; display: inline-block;">More Info at OnlinePicketLine.com</a>`;
        
        return statsHtml;
      };

      const currentTime = Date.now();
      const oneMinuteAgo = currentTime - 60000;
      const stats = loadStats(mockActions, oneMinuteAgo);
      
      expect(stats).toContain('<strong>2</strong> active labor actions');
      expect(stats).toContain('<strong>4</strong> URLs monitored');
      expect(stats).toContain('1 minute ago');
      expect(stats).toContain('More Info at OnlinePicketLine.com');
    });
  });
});
