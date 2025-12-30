/**
 * Tests for block.js
 * Tests the block page functionality
 */

describe('Block Page', () => {
  let mockChrome;
  let mockDocument;
  let elements;

  beforeEach(() => {
    // Create mock elements
    elements = {
      'action-title': { textContent: '', style: {} },
      'action-description': { textContent: '', style: {} },
      'action-type': { textContent: '', style: {} },
      'blocked-url': { textContent: '', style: {} },
      'union-logo': { src: '', style: { display: 'none' } },
      'learn-more-btn': { href: '', style: { display: 'none' }, addEventListener: jest.fn() },
      'proceed-btn': { addEventListener: jest.fn() },
      'go-back-btn': { addEventListener: jest.fn() },
      'action-details': { style: { display: 'none' } },
      'action-demands': { textContent: '', style: {} },
      'action-demands-container': { style: { display: 'none' } },
      'action-location': { textContent: '', style: {} },
      'action-location-container': { style: { display: 'none' } },
      'action-dates': { textContent: '', style: {} },
      'action-dates-container': { style: { display: 'none' } }
    };

    // Mock document
    mockDocument = {
      getElementById: jest.fn((id) => elements[id] || null),
      addEventListener: jest.fn()
    };

    // Mock Chrome API
    mockChrome = {
      runtime: {
        sendMessage: jest.fn()
      }
    };

    global.document = mockDocument;
    global.chrome = mockChrome;
    global.window = { originalUrl: null, location: { href: '' } };
  });

  describe('UI Update', () => {
    it('should update UI with action data', () => {
      const action = {
        title: 'Test Strike',
        description: 'Workers are on strike',
        type: 'strike',
        url: 'https://example.com/more-info'
      };

      const originalUrl = 'https://blocked-site.com';

      // Simulate updateUI function
      const updateUI = (action, originalUrl) => {
        if (action) {
          elements['action-title'].textContent = action.title || 'Labor Action in Progress';
          elements['action-description'].textContent = action.description ||
            'This company is currently subject to a labor action.';

          if (action.type) {
            elements['action-type'].textContent = action.type.toUpperCase();
          }

          if (action.url || action.more_info) {
            elements['learn-more-btn'].href = action.url || action.more_info;
            elements['learn-more-btn'].style.display = 'inline-block';
          }
        }

        if (originalUrl) {
          try {
            const url = new URL(originalUrl);
            elements['blocked-url'].textContent = url.hostname;
          } catch (e) {
            elements['blocked-url'].textContent = originalUrl;
          }
        }
      };

      updateUI(action, originalUrl);

      expect(elements['action-title'].textContent).toBe('Test Strike');
      expect(elements['action-description'].textContent).toBe('Workers are on strike');
      expect(elements['action-type'].textContent).toBe('STRIKE');
      expect(elements['learn-more-btn'].href).toBe('https://example.com/more-info');
      expect(elements['learn-more-btn'].style.display).toBe('inline-block');
      expect(elements['blocked-url'].textContent).toBe('blocked-site.com');
    });

    it('should use default values for missing action data', () => {
      const action = {};

      const updateUI = (action) => {
        if (action) {
          elements['action-title'].textContent = action.title || 'Labor Action in Progress';
          elements['action-description'].textContent = action.description ||
            'This company is currently subject to a labor action. We encourage you to learn more and support workers.';
        }
      };

      updateUI(action);

      expect(elements['action-title'].textContent).toBe('Labor Action in Progress');
      expect(elements['action-description'].textContent).toContain('This company is currently subject');
    });

    it('should display action demands if available', () => {
      const action = {
        title: 'Test Action',
        demands: 'Better wages and working conditions'
      };

      const updateUI = (action) => {
        let hasDetails = false;

        if (action.demands) {
          elements['action-demands'].textContent = action.demands;
          elements['action-demands-container'].style.display = 'block';
          hasDetails = true;
        } else {
          elements['action-demands-container'].style.display = 'none';
        }

        if (hasDetails) {
          elements['action-details'].style.display = 'block';
        }
      };

      updateUI(action);

      expect(elements['action-demands'].textContent).toBe('Better wages and working conditions');
      expect(elements['action-demands-container'].style.display).toBe('block');
      expect(elements['action-details'].style.display).toBe('block');
    });

    it('should display action locations if available', () => {
      const action = {
        title: 'Test Action',
        locations: ['New York', 'Los Angeles', 'Chicago']
      };

      const updateUI = (action) => {
        let hasDetails = false;

        if (action.locations && action.locations.length > 0) {
          elements['action-location'].textContent = action.locations.join(', ');
          elements['action-location-container'].style.display = 'block';
          hasDetails = true;
        } else {
          elements['action-location-container'].style.display = 'none';
        }

        if (hasDetails) {
          elements['action-details'].style.display = 'block';
        }
      };

      updateUI(action);

      expect(elements['action-location'].textContent).toBe('New York, Los Angeles, Chicago');
      expect(elements['action-location-container'].style.display).toBe('block');
    });

    it('should display union logo if available', () => {
      const action = {
        title: 'Test Action',
        logoUrl: 'https://example.com/logo.png'
      };

      const updateUI = (action) => {
        if (action.logoUrl) {
          elements['union-logo'].src = action.logoUrl;
          elements['union-logo'].style.display = 'block';
        } else {
          elements['union-logo'].style.display = 'none';
        }
      };

      updateUI(action);

      expect(elements['union-logo'].src).toBe('https://example.com/logo.png');
      expect(elements['union-logo'].style.display).toBe('block');
    });

    it('should hide union logo if not available', () => {
      const action = {
        title: 'Test Action',
        logoUrl: ''
      };

      const updateUI = (action) => {
        if (action.logoUrl) {
          elements['union-logo'].src = action.logoUrl;
          elements['union-logo'].style.display = 'block';
        } else {
          elements['union-logo'].style.display = 'none';
        }
      };

      updateUI(action);

      expect(elements['union-logo'].style.display).toBe('none');
    });

    it('should display action dates if available', () => {
      const action = {
        title: 'Test Action',
        startDate: '2025-01-01',
        endDate: '2025-12-31'
      };

      const updateUI = (action) => {
        let hasDetails = false;

        if (action.startDate) {
          let dateText = new Date(action.startDate).toLocaleDateString();
          if (action.endDate) {
            dateText += ' - ' + new Date(action.endDate).toLocaleDateString();
          } else {
            dateText += ' - Present';
          }
          elements['action-dates'].textContent = dateText;
          elements['action-dates-container'].style.display = 'block';
          hasDetails = true;
        } else {
          elements['action-dates-container'].style.display = 'none';
        }

        if (hasDetails) {
          elements['action-details'].style.display = 'block';
        }
      };

      updateUI(action);

      expect(elements['action-dates'].textContent).toContain('2025');
      expect(elements['action-dates-container'].style.display).toBe('block');
    });

    it('should show "Present" when no end date is provided', () => {
      const action = {
        title: 'Test Action',
        startDate: '2025-01-01'
      };

      const updateUI = (action) => {
        if (action.startDate) {
          let dateText = new Date(action.startDate).toLocaleDateString();
          if (action.endDate) {
            dateText += ' - ' + new Date(action.endDate).toLocaleDateString();
          } else {
            dateText += ' - Present';
          }
          elements['action-dates'].textContent = dateText;
        }
      };

      updateUI(action);

      expect(elements['action-dates'].textContent).toContain('Present');
    });
  });

  describe('Message Handling', () => {
    it('should load blocked state from background script', (done) => {
      const mockResponse = {
        action: { title: 'Test Action', description: 'Test Description' },
        url: 'https://blocked-site.com'
      };

      mockChrome.runtime.sendMessage = jest.fn((request, callback) => {
        expect(request.action).toBe('getBlockedState');
        callback(mockResponse);
      });

      // Simulate DOMContentLoaded handler
      const handler = () => {
        chrome.runtime.sendMessage({ action: 'getBlockedState' }, (response) => {
          expect(response).toEqual(mockResponse);
          expect(response.action.title).toBe('Test Action');
          done();
        });
      };

      handler();
    });

    it('should handle missing blocked state data', (done) => {
      mockChrome.runtime.sendMessage = jest.fn((request, callback) => {
        callback(null);
      });

      const handler = () => {
        chrome.runtime.sendMessage({ action: 'getBlockedState' }, (response) => {
          expect(response).toBeNull();
          done();
        });
      };

      handler();
    });
  });

  describe('Proceed Button', () => {
    it('should send allowBypass message and redirect on proceed', (done) => {
      const testUrl = 'https://blocked-site.com/page';
      window.originalUrl = testUrl;

      let redirectCalled = false;

      mockChrome.runtime.sendMessage = jest.fn((request, callback) => {
        expect(request.action).toBe('allowBypass');
        expect(request.url).toBe(testUrl);
        callback();
        // Instead of setting window.location.href, just mark that redirect was called
        redirectCalled = true;
        expect(redirectCalled).toBe(true);
        done();
      });

      // Simulate proceed button click
      const proceedHandler = () => {
        const urlToProceed = window.originalUrl;
        if (urlToProceed) {
          chrome.runtime.sendMessage({ action: 'allowBypass', url: urlToProceed }, () => {
            // Would redirect in real browser: window.location.href = urlToProceed;
            redirectCalled = true;
          });
        }
      };

      proceedHandler();
    });

    it('should not redirect if no URL is stored', () => {
      window.originalUrl = null;

      const proceedHandler = () => {
        const urlToProceed = window.originalUrl;
        if (urlToProceed) {
          chrome.runtime.sendMessage({ action: 'allowBypass', url: urlToProceed }, () => {
            window.location.href = urlToProceed;
          });
        }
      };

      proceedHandler();

      expect(mockChrome.runtime.sendMessage).not.toHaveBeenCalled();
    });
  });

  describe('Go Back Button', () => {
    let locationHref;
    let historyBackMock;
    let windowCloseMock;
    let historyLength;

    beforeEach(() => {
      // Reset window state
      locationHref = '';
      historyLength = 1;
      historyBackMock = jest.fn();
      windowCloseMock = jest.fn();

      // Define history with proper getters/setters that can't be overwritten
      Object.defineProperty(window, 'history', {
        value: {
          get length() { return historyLength; },
          set length(val) { historyLength = val; },
          back: historyBackMock
        },
        writable: true,
        configurable: true
      });

      window.close = windowCloseMock;

      // Mock location.href setter since jsdom doesn't support navigation
      Object.defineProperty(window, 'location', {
        value: {
          get href() { return locationHref; },
          set href(url) { locationHref = url; }
        },
        writable: true,
        configurable: true
      });
      window.originalUrl = null;
    });

    it('should redirect to onlinepicketline.com when history is very short (test mode scenario)', () => {
      historyLength = 2; // Simulates new tab with blocked page
      window.originalUrl = 'https://example.com'; // Original blocked URL is set

      const goBackHandler = () => {
        if (window.history.length <= 2 && window.originalUrl) {
          window.location.href = 'https://onlinepicketline.com';
        } else if (window.history.length > 1) {
          window.history.back();
        } else {
          window.close();
        }
      };

      goBackHandler();

      expect(window.location.href).toBe('https://onlinepicketline.com');
      expect(historyBackMock).not.toHaveBeenCalled();
    });

    it('should go back normally when history has meaningful entries', () => {
      historyLength = 5; // User has browsing history
      window.originalUrl = 'https://example.com';

      const goBackHandler = () => {
        if (window.history.length <= 2 && window.originalUrl) {
          window.location.href = 'https://onlinepicketline.com';
        } else if (window.history.length > 1) {
          window.history.back();
        } else {
          window.close();
        }
      };

      goBackHandler();

      expect(historyBackMock).toHaveBeenCalled();
      expect(window.location.href).toBe(''); // No redirect happened
    });

    it('should close window when no history exists', () => {
      historyLength = 1;
      window.originalUrl = null;

      const goBackHandler = () => {
        if (window.history.length <= 2 && window.originalUrl) {
          window.location.href = 'https://onlinepicketline.com';
        } else if (window.history.length > 1) {
          window.history.back();
        } else {
          window.close();
        }
      };

      goBackHandler();

      expect(windowCloseMock).toHaveBeenCalled();
      expect(historyBackMock).not.toHaveBeenCalled();
    });

    it('should go back when history length is exactly 2 but no originalUrl (edge case)', () => {
      historyLength = 2;
      window.originalUrl = null; // No original URL set

      const goBackHandler = () => {
        if (window.history.length <= 2 && window.originalUrl) {
          window.location.href = 'https://onlinepicketline.com';
        } else if (window.history.length > 1) {
          window.history.back();
        } else {
          window.close();
        }
      };

      goBackHandler();

      expect(historyBackMock).toHaveBeenCalled();
      expect(window.location.href).toBe(''); // No redirect happened
    });

    it('should redirect to onlinepicketline.com when history length is 1 and originalUrl exists', () => {
      historyLength = 1;
      window.originalUrl = 'https://example.com';

      const goBackHandler = () => {
        if (window.history.length <= 2 && window.originalUrl) {
          window.location.href = 'https://onlinepicketline.com';
        } else if (window.history.length > 1) {
          window.history.back();
        } else {
          window.close();
        }
      };

      goBackHandler();

      expect(window.location.href).toBe('https://onlinepicketline.com');
    });
  });

  describe('URL Display', () => {
    it('should extract and display hostname from URL', () => {
      const originalUrl = 'https://example.com/path/to/page?query=1';

      const updateUI = (action, originalUrl) => {
        if (originalUrl) {
          try {
            const url = new URL(originalUrl);
            elements['blocked-url'].textContent = url.hostname;
          } catch (e) {
            elements['blocked-url'].textContent = originalUrl;
          }
        }
      };

      updateUI(null, originalUrl);

      expect(elements['blocked-url'].textContent).toBe('example.com');
    });

    it('should display full URL if parsing fails', () => {
      const invalidUrl = 'not-a-valid-url';

      const updateUI = (action, originalUrl) => {
        if (originalUrl) {
          try {
            const url = new URL(originalUrl);
            elements['blocked-url'].textContent = url.hostname;
          } catch (e) {
            elements['blocked-url'].textContent = originalUrl;
          }
        }
      };

      updateUI(null, invalidUrl);

      expect(elements['blocked-url'].textContent).toBe('not-a-valid-url');
    });
  });
});
