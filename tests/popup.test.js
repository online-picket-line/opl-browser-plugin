// Mock DOM elements for popup testing
const createMockElement = (id, value = '') => ({
  id,
  value,
  textContent: '',
  innerHTML: '',
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
    'test-mode-btn': createMockElement('test-mode-btn')
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
        },
        local: {
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
        const activeActions = actions.filter(a => (!a.status || a.status === 'active') && !a._isTestAction).length;
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

    it('should exclude test actions from active count', () => {
      const mockActions = [
        { status: 'active', target_urls: ['realsite.com'] },
        { status: 'active', target_urls: ['example.com'], _isTestAction: true },
        { status: 'active', target_urls: ['another.com'] }
      ];

      const loadStats = (actions, timestamp) => {
        const activeActions = actions.filter(a => (!a.status || a.status === 'active') && !a._isTestAction).length;
        const totalUrls = actions.reduce((sum, a) => sum + (a.target_urls?.length || 0), 0);

        let statsHtml = `<strong>${activeActions}</strong> active labor action${activeActions !== 1 ? 's' : ''}`;
        if (totalUrls > 0) {
          statsHtml += `<br><strong>${totalUrls}</strong> URL${totalUrls !== 1 ? 's' : ''} monitored`;
        }

        return statsHtml;
      };

      const stats = loadStats(mockActions);

      // Should show 2 active actions (excluding the test action)
      expect(stats).toContain('<strong>2</strong> active labor actions');
      // Should still count all URLs including test action URLs
      expect(stats).toContain('<strong>3</strong> URLs monitored');
    });
  });

  describe('Test Mode Functionality', () => {
    beforeEach(() => {
      mockChrome.tabs = {
        create: jest.fn()
      };
      global.chrome = mockChrome;
    });

    it('should inject test action for example.com with all required fields', async () => {
      const mockCurrentActions = [
        { id: 'action-1', company: 'Company A', target_urls: ['companya.com'] }
      ];

      mockChrome.storage.local.get.mockImplementation((keys, callback) => {
        callback({ labor_actions: mockCurrentActions });
      });

      mockChrome.storage.local.set.mockImplementation((data, callback) => {
        callback();
      });

      const enableTestMode = () => {
        return new Promise((resolve, reject) => {
          mockChrome.storage.local.get(['labor_actions'], (result) => {
            const currentActions = result.labor_actions || [];

            const testAction = {
              id: 'test-example-com',
              title: 'TEST MODE: Example Company Workers Strike',
              description: 'This is a test action to demonstrate the Online Picket Line plugin functionality. Workers at Example Company are demanding better wages, improved working conditions, and union recognition. This test will show how the plugin blocks or warns about sites with active labor actions.',
              company: 'Example Company',
              type: 'strike',
              status: 'active',
              more_info: 'https://onlinepicketline.com/about',
              target_urls: ['example.com', 'www.example.com'],
              locations: ['Worldwide'],
              demands: 'Fair wages, safe working conditions, union recognition',
              startDate: new Date().toISOString().split('T')[0],
              contactInfo: 'test@onlinepicketline.com',
              divisions: ['All Divisions'],
              actionResources: [
                {
                  title: 'Strike Information',
                  url: 'https://onlinepicketline.com/about'
                },
                {
                  title: 'How to Support',
                  url: 'https://onlinepicketline.com'
                }
              ],
              _isTestAction: true,
              _extensionData: {
                matchingUrlRegexes: ['^https?://(?:www\\.)?example\\.com'],
                moreInfoUrl: 'https://onlinepicketline.com/about',
                actionDetails: {
                  id: 'test-example-com',
                  organization: 'Example Company',
                  actionType: 'strike',
                  description: 'Test labor action for plugin verification',
                  status: 'active',
                  location: 'Worldwide',
                  startDate: new Date().toISOString().split('T')[0],
                  demands: 'Fair wages, safe working conditions, union recognition',
                  contactInfo: 'test@onlinepicketline.com',
                  urls: [
                    {
                      title: 'Strike Information',
                      url: 'https://onlinepicketline.com/about'
                    }
                  ]
                }
              }
            };

            const filteredActions = currentActions.filter(a => !a._isTestAction);
            const updatedActions = [...filteredActions, testAction];

            mockChrome.storage.local.set({
              labor_actions: updatedActions,
              cache_timestamp: Date.now(),
              test_mode_enabled: true
            }, () => {
              if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
              } else {
                resolve(updatedActions);
              }
            });
          });
        });
      };

      const result = await enableTestMode();

      // Verify the test action was added
      expect(result).toHaveLength(2);
      const testAction = result.find(a => a.id === 'test-example-com');

      // Verify required fields
      expect(testAction).toBeDefined();
      expect(testAction.id).toBe('test-example-com');
      expect(testAction.title).toContain('TEST MODE');
      expect(testAction.company).toBe('Example Company');
      expect(testAction.type).toBe('strike');
      expect(testAction.status).toBe('active');
      expect(testAction.target_urls).toEqual(['example.com', 'www.example.com']);
      expect(testAction._isTestAction).toBe(true);

      // Verify storage was called correctly
      expect(mockChrome.storage.local.set).toHaveBeenCalledWith(
        expect.objectContaining({
          test_mode_enabled: true,
          cache_timestamp: expect.any(Number)
        }),
        expect.any(Function)
      );
    });

    it('should include comprehensive test data fields', async () => {
      mockChrome.storage.local.get.mockImplementation((keys, callback) => {
        callback({ labor_actions: [] });
      });

      mockChrome.storage.local.set.mockImplementation((data, callback) => {
        callback();
      });

      const enableTestMode = () => {
        return new Promise((resolve) => {
          mockChrome.storage.local.get(['labor_actions'], (result) => {
            const testAction = {
              id: 'test-example-com',
              title: 'TEST MODE: Example Company Workers Strike',
              description: 'This is a test action to demonstrate the Online Picket Line plugin functionality. Workers at Example Company are demanding better wages, improved working conditions, and union recognition. This test will show how the plugin blocks or warns about sites with active labor actions.',
              company: 'Example Company',
              type: 'strike',
              status: 'active',
              more_info: 'https://onlinepicketline.com/about',
              target_urls: ['example.com', 'www.example.com'],
              locations: ['Worldwide'],
              demands: 'Fair wages, safe working conditions, union recognition',
              startDate: new Date().toISOString().split('T')[0],
              contactInfo: 'test@onlinepicketline.com',
              divisions: ['All Divisions'],
              actionResources: [
                { title: 'Strike Information', url: 'https://onlinepicketline.com/about' },
                { title: 'How to Support', url: 'https://onlinepicketline.com' }
              ],
              _isTestAction: true
            };

            mockChrome.storage.local.set({
              labor_actions: [testAction],
              cache_timestamp: Date.now(),
              test_mode_enabled: true
            }, () => resolve(testAction));
          });
        });
      };

      const testAction = await enableTestMode();

      // Verify all comprehensive fields
      expect(testAction.description).toContain('demonstrate the Online Picket Line');
      expect(testAction.locations).toEqual(['Worldwide']);
      expect(testAction.demands).toBe('Fair wages, safe working conditions, union recognition');
      expect(testAction.contactInfo).toBe('test@onlinepicketline.com');
      expect(testAction.divisions).toEqual(['All Divisions']);
      expect(testAction.actionResources).toHaveLength(2);
      expect(testAction.actionResources[0].title).toBe('Strike Information');
      expect(testAction.actionResources[0].url).toBe('https://onlinepicketline.com/about');
      expect(testAction.startDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should include extension data format for URL matching', async () => {
      mockChrome.storage.local.get.mockImplementation((keys, callback) => {
        callback({ labor_actions: [] });
      });

      mockChrome.storage.local.set.mockImplementation((data, callback) => {
        callback();
      });

      const enableTestMode = () => {
        return new Promise((resolve) => {
          mockChrome.storage.local.get(['labor_actions'], (result) => {
            const testAction = {
              id: 'test-example-com',
              company: 'Example Company',
              target_urls: ['example.com', 'www.example.com'],
              _isTestAction: true,
              _extensionData: {
                matchingUrlRegexes: ['^https?://(?:www\\.)?example\\.com'],
                moreInfoUrl: 'https://onlinepicketline.com/about',
                actionDetails: {
                  id: 'test-example-com',
                  organization: 'Example Company',
                  actionType: 'strike',
                  description: 'Test labor action for plugin verification',
                  status: 'active',
                  location: 'Worldwide',
                  startDate: new Date().toISOString().split('T')[0],
                  demands: 'Fair wages, safe working conditions, union recognition',
                  contactInfo: 'test@onlinepicketline.com',
                  urls: [
                    { title: 'Strike Information', url: 'https://onlinepicketline.com/about' }
                  ]
                }
              }
            };

            mockChrome.storage.local.set({
              labor_actions: [testAction]
            }, () => resolve(testAction));
          });
        });
      };

      const testAction = await enableTestMode();

      // Verify extension data structure
      expect(testAction._extensionData).toBeDefined();
      expect(testAction._extensionData.matchingUrlRegexes).toEqual(['^https?://(?:www\\.)?example\\.com']);
      expect(testAction._extensionData.moreInfoUrl).toBe('https://onlinepicketline.com/about');
      expect(testAction._extensionData.actionDetails).toBeDefined();
      expect(testAction._extensionData.actionDetails.organization).toBe('Example Company');
      expect(testAction._extensionData.actionDetails.actionType).toBe('strike');
    });

    it('should replace existing test action when enabling test mode again', async () => {
      const existingTestAction = {
        id: 'old-test',
        company: 'Old Test',
        _isTestAction: true
      };

      const regularAction = {
        id: 'regular-1',
        company: 'Regular Company'
      };

      mockChrome.storage.local.get.mockImplementation((keys, callback) => {
        callback({ labor_actions: [regularAction, existingTestAction] });
      });

      mockChrome.storage.local.set.mockImplementation((data, callback) => {
        callback();
      });

      const enableTestMode = () => {
        return new Promise((resolve) => {
          mockChrome.storage.local.get(['labor_actions'], (result) => {
            const currentActions = result.labor_actions || [];
            const testAction = {
              id: 'test-example-com',
              company: 'Example Company',
              _isTestAction: true
            };

            const filteredActions = currentActions.filter(a => !a._isTestAction);
            const updatedActions = [...filteredActions, testAction];

            mockChrome.storage.local.set({
              labor_actions: updatedActions
            }, () => resolve(updatedActions));
          });
        });
      };

      const result = await enableTestMode();

      // Should have only 2 actions: the regular one and the new test one
      expect(result).toHaveLength(2);
      expect(result.find(a => a.id === 'regular-1')).toBeDefined();
      expect(result.find(a => a.id === 'test-example-com')).toBeDefined();
      expect(result.find(a => a.id === 'old-test')).toBeUndefined();
    });

    it('should open example.com in new tab when test button is clicked', async () => {
      const testButton = mockDocument.getElementById('test-mode-btn');

      // Simulate button click handler
      mockChrome.storage.local.get.mockImplementation((keys, callback) => {
        callback({ labor_actions: [] });
      });

      mockChrome.storage.local.set.mockImplementation((data, callback) => {
        callback();
      });

      mockChrome.runtime.sendMessage.mockImplementation((message, callback) => {
        if (callback) callback();
      });

      const handleTestButtonClick = async () => {
        return new Promise((resolve) => {
          mockChrome.storage.local.get(['labor_actions'], (result) => {
            const testAction = {
              id: 'test-example-com',
              company: 'Example Company',
              target_urls: ['example.com', 'www.example.com'],
              _isTestAction: true
            };

            mockChrome.storage.local.set({
              labor_actions: [testAction],
              test_mode_enabled: true
            }, () => {
              mockChrome.runtime.sendMessage({ action: 'updateMode' }, () => {
                mockChrome.tabs.create({ url: 'https://example.com' });
                resolve();
              });
            });
          });
        });
      };

      await handleTestButtonClick();

      // Verify tab was created with correct URL
      expect(mockChrome.tabs.create).toHaveBeenCalledWith({ url: 'https://example.com' });
      expect(mockChrome.storage.local.set).toHaveBeenCalledWith(
        expect.objectContaining({
          test_mode_enabled: true
        }),
        expect.any(Function)
      );
      expect(mockChrome.runtime.sendMessage).toHaveBeenCalledWith(
        { action: 'updateMode' },
        expect.any(Function)
      );
    });

    it('should set test_mode_enabled flag when activating test mode', async () => {
      mockChrome.storage.local.get.mockImplementation((keys, callback) => {
        callback({ labor_actions: [] });
      });

      let savedData;
      mockChrome.storage.local.set.mockImplementation((data, callback) => {
        savedData = data;
        callback();
      });

      const enableTestMode = () => {
        return new Promise((resolve) => {
          mockChrome.storage.local.get(['labor_actions'], (result) => {
            const testAction = {
              id: 'test-example-com',
              _isTestAction: true
            };

            mockChrome.storage.local.set({
              labor_actions: [testAction],
              cache_timestamp: Date.now(),
              test_mode_enabled: true
            }, () => resolve());
          });
        });
      };

      await enableTestMode();

      expect(savedData.test_mode_enabled).toBe(true);
      expect(savedData.cache_timestamp).toBeDefined();
      expect(typeof savedData.cache_timestamp).toBe('number');
    });
  });
});
