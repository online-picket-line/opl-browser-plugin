/**
 * Tests for ad-detector.js module
 */
const { AD_SELECTORS, getAdSize, findAdElements, observeNewAds } = require('../ad-detector.js');

describe('Ad Detector Module', () => {
  describe('AD_SELECTORS', () => {
    test('should be a non-empty string', () => {
      expect(typeof AD_SELECTORS).toBe('string');
      expect(AD_SELECTORS.length).toBeGreaterThan(0);
    });

    test('should include Google AdSense selectors', () => {
      expect(AD_SELECTORS).toContain('ins.adsbygoogle');
      expect(AD_SELECTORS).toContain('[id^="div-gpt-ad"]');
    });

    test('should include Amazon ad selectors', () => {
      expect(AD_SELECTORS).toContain('[id^="amzn-assoc"]');
    });

    test('should include Taboola selectors', () => {
      expect(AD_SELECTORS).toContain('[id^="taboola-"]');
    });

    test('should include Outbrain selectors', () => {
      expect(AD_SELECTORS).toContain('.OUTBRAIN');
    });

    test('should include generic ad selectors', () => {
      expect(AD_SELECTORS).toContain('[data-ad-slot]');
    });

    test('should include broader generic ad selectors', () => {
      expect(AD_SELECTORS).toContain('.advertisement');
      expect(AD_SELECTORS).toContain('[data-ad]');
      expect(AD_SELECTORS).toContain('[data-ad-region]');
    });

    test('should include programmatic/native ad container selectors', () => {
      expect(AD_SELECTORS).toContain('[class*="nativo"]');
      expect(AD_SELECTORS).toContain('[class*="connatix"]');
      expect(AD_SELECTORS).toContain('[class*="teads"]');
    });

    test('should include DFP selectors', () => {
      expect(AD_SELECTORS).toContain('[class*="dfp"]');
      expect(AD_SELECTORS).toContain('[id*="dfp"]');
    });
  });

  describe('getAdSize', () => {
    function createMockElement(width, height) {
      return {
        getBoundingClientRect: () => ({ width, height }),
        offsetWidth: width,
        offsetHeight: height
      };
    }

    test('should return "large" for 300x250 rectangle', () => {
      expect(getAdSize(createMockElement(300, 250))).toBe('large');
    });

    test('should return "large" for 728x250 leaderboard', () => {
      expect(getAdSize(createMockElement(728, 250))).toBe('large');
    });

    test('should return "small" for narrow elements', () => {
      expect(getAdSize(createMockElement(120, 30))).toBe('small');
    });

    test('should return "small" for short elements', () => {
      expect(getAdSize(createMockElement(300, 50))).toBe('small');
    });

    test('should return "medium" for in-between sizes', () => {
      expect(getAdSize(createMockElement(250, 100))).toBe('medium');
    });

    test('should return "medium" for 468x60 banner', () => {
      // Width >= 200 but height < 200 so not large; height >= 60 so not small
      expect(getAdSize(createMockElement(468, 60))).toBe('medium');
    });

    test('should use offsetWidth as fallback when getBoundingClientRect returns 0', () => {
      const el = {
        getBoundingClientRect: () => ({ width: 0, height: 0 }),
        offsetWidth: 300,
        offsetHeight: 250
      };
      // When rect returns 0, it falls back to offsetWidth/offsetHeight
      // 0 || 300 = 300, 0 || 250 = 250 → large
      expect(getAdSize(el)).toBe('large');
    });
  });

  describe('findAdElements', () => {
    test('should return empty array when no ads found', () => {
      const mockRoot = {
        querySelectorAll: jest.fn(() => [])
      };
      const result = findAdElements(mockRoot);
      expect(result).toEqual([]);
    });

    test('should skip elements with data-opl-injected attribute', () => {
      const mockElement = {
        getAttribute: jest.fn((attr) => attr === 'data-opl-injected' ? 'true' : null),
        offsetWidth: 300,
        offsetHeight: 250,
        getBoundingClientRect: () => ({ width: 300, height: 250 })
      };
      const mockRoot = {
        querySelectorAll: jest.fn(() => [mockElement])
      };
      const result = findAdElements(mockRoot);
      expect(result).toEqual([]);
    });

    test('should include zero-dimension elements with medium size default', () => {
      const el = document.createElement('div');
      Object.defineProperty(el, 'offsetWidth', { value: 0 });
      Object.defineProperty(el, 'offsetHeight', { value: 0 });
      el.getBoundingClientRect = () => ({ width: 0, height: 0 });

      const spy = jest.spyOn(window, 'getComputedStyle').mockReturnValue({ display: 'block', visibility: 'visible' });

      const mockRoot = {
        querySelectorAll: jest.fn(() => [el])
      };
      const result = findAdElements(mockRoot);
      expect(result.length).toBe(1);
      expect(result[0].size).toBe('medium');
      spy.mockRestore();
    });

    test('should skip elements hidden by CSS', () => {
      // Use real DOM elements so getComputedStyle works in jsdom
      const el = document.createElement('div');
      Object.defineProperty(el, 'offsetWidth', { value: 300 });
      Object.defineProperty(el, 'offsetHeight', { value: 250 });
      el.getBoundingClientRect = () => ({ width: 300, height: 250 });

      // Spy on getComputedStyle to simulate hidden element
      const spy = jest.spyOn(window, 'getComputedStyle').mockReturnValue({ display: 'none', visibility: 'visible' });

      const mockRoot = {
        querySelectorAll: jest.fn(() => [el])
      };
      const result = findAdElements(mockRoot);
      expect(result).toEqual([]);
      spy.mockRestore();
    });

    test('should return visible ad elements with size info', () => {
      const el = document.createElement('div');
      Object.defineProperty(el, 'offsetWidth', { value: 300 });
      Object.defineProperty(el, 'offsetHeight', { value: 250 });
      el.getBoundingClientRect = () => ({ width: 300, height: 250 });

      const spy = jest.spyOn(window, 'getComputedStyle').mockReturnValue({ display: 'block', visibility: 'visible' });

      const mockRoot = {
        querySelectorAll: jest.fn(() => [el])
      };
      const result = findAdElements(mockRoot);
      expect(result).toHaveLength(1);
      expect(result[0].element).toBe(el);
      expect(result[0].size).toBe('large');
      expect(result[0].rect.width).toBe(300);
      expect(result[0].rect.height).toBe(250);
      spy.mockRestore();
    });

    test('should handle querySelectorAll errors gracefully', () => {
      const mockRoot = {
        querySelectorAll: jest.fn(() => { throw new Error('Invalid selector'); })
      };
      const result = findAdElements(mockRoot);
      expect(result).toEqual([]);
    });
  });

  describe('observeNewAds', () => {
    test('should return handle with disconnect method', () => {
      // Mock MutationObserver
      const mockDisconnect = jest.fn();
      global.MutationObserver = jest.fn(() => ({
        observe: jest.fn(),
        disconnect: mockDisconnect
      }));
      global.document = {
        body: {},
        documentElement: {}
      };

      const handle = observeNewAds(jest.fn());
      expect(handle).toHaveProperty('disconnect');
      expect(typeof handle.disconnect).toBe('function');
    });

    test('should disconnect observer when disconnect is called', () => {
      const mockDisconnect = jest.fn();
      global.MutationObserver = jest.fn(() => ({
        observe: jest.fn(),
        disconnect: mockDisconnect
      }));
      global.document = {
        body: {},
        documentElement: {}
      };

      const handle = observeNewAds(jest.fn());
      handle.disconnect();
      expect(mockDisconnect).toHaveBeenCalled();
    });

    test('should return noop handle when MutationObserver is not available', () => {
      delete global.MutationObserver;
      const handle = observeNewAds(jest.fn());
      expect(handle).toHaveProperty('disconnect');
      // Should not throw
      handle.disconnect();
    });
  });
});
