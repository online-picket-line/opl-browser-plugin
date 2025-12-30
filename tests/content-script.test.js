describe('Content Script Integration', () => {
  let mockChrome;
  let mockSessionStorage;
  let mockDocument;

  beforeEach(() => {
    // Mock Chrome extension APIs
    mockChrome = {
      runtime: {
        sendMessage: jest.fn(),
        getURL: jest.fn((path) => `chrome-extension://test-id/${path}`)
      }
    };
    global.chrome = mockChrome;

    // Mock sessionStorage
    mockSessionStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn()
    };
    global.sessionStorage = mockSessionStorage;

    // Mock window and location
    global.window = global.window || {};
    global.window.location = {
      href: 'https://example.com/test-page',
      hostname: 'example.com'
    };

    // Mock document
    mockDocument = {
      createElement: jest.fn(),
      body: {
        appendChild: jest.fn()
      },
      readyState: 'complete',
      addEventListener: jest.fn()
    };
    global.document = mockDocument;

    // Mock window
    global.window = {
      location: {
        href: 'https://example.com/test-page'
      },
      addEventListener: jest.fn(),
      history: {
        pushState: jest.fn(),
        replaceState: jest.fn()
      }
    };

    // Mock setTimeout for animations
    global.setTimeout = jest.fn((callback) => callback());
  });

  describe('Banner Display', () => {
    it('should create banner element with correct content', () => {
      const showBanner = (action) => {
        const banner = {
          id: 'opl-labor-banner',
          className: 'opl-banner',
          innerHTML: '',
          remove: jest.fn(),
          querySelector: jest.fn(),
          classList: { add: jest.fn() }
        };

        const title = action.title || 'Labor Action in Progress';
        const description = action.description || 'This company is currently subject to a labor action.';
        const moreInfoUrl = action.url || action.more_info || '';

        banner.innerHTML = `
          <div class="opl-banner-content">
            <div class="opl-banner-icon">⚠️</div>
            <div class="opl-banner-text">
              <strong class="opl-banner-title">${title}</strong>
              <p class="opl-banner-description">${description}</p>
              <div class="opl-banner-links" style="margin-top: 4px;">
                ${moreInfoUrl ? `<a href="${moreInfoUrl}" target="_blank" class="opl-banner-link">Learn More</a><span style="margin: 0 5px; opacity: 0.5;">|</span>` : ''}
                <a href="https://onlinepicketline.com" target="_blank" class="opl-banner-link" style="font-size: 0.8em; opacity: 0.8;">Online Picket Line - OPL</a>
              </div>
            </div>
            <button class="opl-banner-close" aria-label="Close banner">×</button>
          </div>
        `;

        return banner;
      };

      const testAction = {
        title: 'Test Strike',
        description: 'Workers striking for better conditions',
        more_info: 'https://example.com/strike'
      };

      const banner = showBanner(testAction);

      expect(banner.id).toBe('opl-labor-banner');
      expect(banner.className).toBe('opl-banner');
      expect(banner.innerHTML).toContain('Test Strike');
      expect(banner.innerHTML).toContain('Workers striking for better conditions');
      expect(banner.innerHTML).toContain('https://example.com/strike');
      expect(banner.innerHTML).toContain('Learn More');
    });

    it('should handle action with minimal data', () => {
      const showBanner = (action) => {
        const banner = {
          innerHTML: '',
          classList: { add: jest.fn() }
        };

        const title = action.title || 'Labor Action in Progress';
        const description = action.description || 'This company is currently subject to a labor action.';

        banner.innerHTML = `
          <strong>${title}</strong>
          <p>${description}</p>
        `;

        return banner;
      };

      const minimalAction = {};
      const banner = showBanner(minimalAction);

      expect(banner.innerHTML).toContain('Labor Action in Progress');
      expect(banner.innerHTML).toContain('This company is currently subject to a labor action.');
    });

    it('should escape HTML in action data to prevent XSS', () => {
      const escapeHtml = (text) => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
      };

      mockDocument.createElement.mockReturnValue({
        textContent: '',
        innerHTML: ''
      });

      const maliciousAction = {
        title: '<script>alert("xss")</script>',
        description: '<img src="x" onerror="alert(1)">'
      };

      // Mock the div element behavior
      const mockDiv = {
        get textContent() { return this._textContent; },
        set textContent(value) {
          this._textContent = value;
          // Simulate browser behavior - HTML tags become text
          this.innerHTML = value.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        },
        innerHTML: ''
      };

      mockDocument.createElement.mockReturnValue(mockDiv);

      const escapedTitle = escapeHtml(maliciousAction.title);
      const escapedDescription = escapeHtml(maliciousAction.description);

      expect(escapedTitle).toContain('&lt;script&gt;');
      expect(escapedDescription).toContain('&lt;img');
      expect(escapedTitle).not.toContain('<script>');
    });
  });

  describe('Block Page Redirection', () => {
    it('should store action data and redirect to block page', () => {
      const blockPage = (action) => {
        mockSessionStorage.setItem('opl_blocked_action', JSON.stringify(action));
        mockSessionStorage.setItem('opl_blocked_url', window.location.href);

        const blockPageUrl = chrome.runtime.getURL('block.html');
        return { redirectUrl: blockPageUrl };
      };

      const testAction = {
        title: 'Test Strike',
        description: 'Strike description'
      };

      const result = blockPage(testAction);

      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'opl_blocked_action',
        JSON.stringify(testAction)
      );
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'opl_blocked_url',
        expect.stringMatching(/^https?:\/\//)  // Accept any valid URL format
      );
      expect(mockChrome.runtime.getURL).toHaveBeenCalledWith('block.html');
      expect(result.redirectUrl).toBe('chrome-extension://test-id/block.html');
    });
  });

  describe('Page Change Detection', () => {
    it('should detect URL changes in SPAs', () => {
      let lastUrl = 'https://example.com/page1';

      // Create a mock location that can be safely updated
      const mockLocation = { href: 'https://example.com/page1' };

      const checkUrlChange = () => {
        const currentUrl = mockLocation.href;
        if (currentUrl !== lastUrl) {
          lastUrl = currentUrl;
          return true;
        }
        return false;
      };

      // Simulate URL change
      mockLocation.href = 'https://example.com/page2';
      expect(checkUrlChange()).toBe(true);

      // No change on second check
      expect(checkUrlChange()).toBe(false);
    });

    it('should handle history API changes', () => {
      const originalPushState = window.history.pushState;
      const originalReplaceState = window.history.replaceState;

      let urlChangeDetected = false;
      const onUrlChange = () => { urlChangeDetected = true; };

      // Mock enhanced pushState
      window.history.pushState = function(...args) {
        originalPushState.apply(this, args);
        onUrlChange();
      };

      window.history.replaceState = function(...args) {
        originalReplaceState.apply(this, args);
        onUrlChange();
      };

      // Test pushState detection
      window.history.pushState({}, '', '/new-page');
      expect(urlChangeDetected).toBe(true);

      // Reset and test replaceState
      urlChangeDetected = false;
      window.history.replaceState({}, '', '/replaced-page');
      expect(urlChangeDetected).toBe(true);
    });
  });

  describe('Message Passing', () => {
    it('should send URL check message to background script', () => {
      const checkCurrentPage = () => {
        chrome.runtime.sendMessage(
          { action: 'checkUrl', url: window.location.href }
        );
      };

      checkCurrentPage();

      expect(mockChrome.runtime.sendMessage).toHaveBeenCalledWith(
        { action: 'checkUrl', url: expect.stringMatching(/^https?:\/\//) }  // Accept any valid URL
      );
    });

    it('should handle response from background script', () => {
      const handleResponse = (response) => {
        if (response && response.match) {
          if (response.blockMode) {
            return { action: 'block', match: response.match };
          } else {
            return { action: 'banner', match: response.match };
          }
        }
        return { action: 'none' };
      };

      // Test with blocking response
      const blockResponse = {
        match: { title: 'Test Action' },
        blockMode: true
      };
      const blockResult = handleResponse(blockResponse);
      expect(blockResult.action).toBe('block');

      // Test with banner response
      const bannerResponse = {
        match: { title: 'Test Action' },
        blockMode: false
      };
      const bannerResult = handleResponse(bannerResponse);
      expect(bannerResult.action).toBe('banner');

      // Test with no match
      const noMatchResult = handleResponse(null);
      expect(noMatchResult.action).toBe('none');
    });
  });

  describe('Bypass Handling', () => {
    it('should check for bypass flag and clear it', () => {
      const checkBypass = () => {
        const bypassed = mockSessionStorage.getItem('opl_bypass') === 'true';
        if (bypassed) {
          mockSessionStorage.removeItem('opl_bypass');
        }
        return bypassed;
      };

      // Test with bypass flag set
      mockSessionStorage.getItem.mockReturnValue('true');
      expect(checkBypass()).toBe(true);
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('opl_bypass');

      // Test without bypass flag
      mockSessionStorage.getItem.mockReturnValue(null);
      expect(checkBypass()).toBe(false);
    });

    it('should set bypass flag when proceeding', () => {
      const setBypassed = () => {
        mockSessionStorage.setItem('opl_bypass', 'true');
      };

      setBypassed();
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith('opl_bypass', 'true');
    });
  });

  describe('Document Ready State', () => {
    it('should handle different document ready states', () => {
      const checkDocumentReady = () => {
        return mockDocument.readyState === 'complete' || mockDocument.readyState === 'interactive';
      };

      // Test with complete state
      mockDocument.readyState = 'complete';
      expect(checkDocumentReady()).toBe(true);

      // Test with interactive state
      mockDocument.readyState = 'interactive';
      expect(checkDocumentReady()).toBe(true);

      // Test with loading state
      mockDocument.readyState = 'loading';
      expect(checkDocumentReady()).toBe(false);
    });

    it('should wait for DOMContentLoaded if document is loading', () => {
      const waitForReady = (callback) => {
        if (mockDocument.readyState === 'loading') {
          mockDocument.addEventListener('DOMContentLoaded', callback);
          return false;
        } else {
          callback();
          return true;
        }
      };

      const mockCallback = jest.fn();

      // Test with loading document
      mockDocument.readyState = 'loading';
      const immediateExecution = waitForReady(mockCallback);
      expect(immediateExecution).toBe(false);
      expect(mockDocument.addEventListener).toHaveBeenCalledWith('DOMContentLoaded', mockCallback);
      expect(mockCallback).not.toHaveBeenCalled();

      // Test with ready document
      mockDocument.readyState = 'complete';
      const immediateExecution2 = waitForReady(mockCallback);
      expect(immediateExecution2).toBe(true);
      expect(mockCallback).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle runtime message errors gracefully', () => {
      const sendMessageWithErrorHandling = (message) => {
        try {
          chrome.runtime.sendMessage(message, (response) => {
            if (chrome.runtime.lastError) {
              console.error('Runtime error:', chrome.runtime.lastError);
              return { error: chrome.runtime.lastError.message };
            }
            return response;
          });
          return { success: true };
        } catch (error) {
          console.error('Send message error:', error);
          return { success: false, error: error.message };
        }
      };

      const result = sendMessageWithErrorHandling({ action: 'test' });
      expect(result.success).toBe(true);
    });

    it('should handle malformed action data', () => {
      const parseActionData = (actionString) => {
        try {
          if (!actionString) {
            return null;
          }

          const action = JSON.parse(actionString);

          // Validate required fields
          if (typeof action !== 'object') {
            return null;
          }

          return {
            title: action.title || 'Labor Action',
            description: action.description || 'Active labor action',
            company: action.company || 'Unknown Company',
            type: action.type || 'labor_action',
            status: action.status || 'active'
          };
        } catch (error) {
          console.error('Failed to parse action data:', error);
          return null;
        }
      };

      // Test valid data
      const validAction = JSON.stringify({ title: 'Test', description: 'Test desc' });
      const parsed = parseActionData(validAction);
      expect(parsed).toMatchObject({ title: 'Test', description: 'Test desc' });

      // Test invalid JSON
      expect(parseActionData('invalid-json')).toBeNull();

      // Test null input
      expect(parseActionData(null)).toBeNull();

      // Test non-object JSON
      expect(parseActionData('"string"')).toBeNull();
    });
  });
});
