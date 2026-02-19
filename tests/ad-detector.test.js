/**
 * Tests for ad-detector.js module
 */
const { AD_SELECTORS, getAdSize, findAdElements, observeNewAds, MAX_AD_WIDTH, MAX_AD_HEIGHT, _isFullPageTakeover, _hasOverlayAncestor } = require('../ad-detector.js');

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

    test('should skip zero-dimension elements (tracking pixels, hidden interstitials)', () => {
      const el = document.createElement('div');
      Object.defineProperty(el, 'offsetWidth', { value: 0 });
      Object.defineProperty(el, 'offsetHeight', { value: 0 });
      el.getBoundingClientRect = () => ({ width: 0, height: 0 });

      const spy = jest.spyOn(window, 'getComputedStyle').mockReturnValue({ display: 'block', visibility: 'visible' });

      const mockRoot = {
        querySelectorAll: jest.fn(() => [el])
      };
      const result = findAdElements(mockRoot);
      expect(result).toEqual([]);
      spy.mockRestore();
    });

    test('should skip 1x1 tracking pixel elements', () => {
      const el = document.createElement('div');
      Object.defineProperty(el, 'offsetWidth', { value: 1 });
      Object.defineProperty(el, 'offsetHeight', { value: 1 });
      el.getBoundingClientRect = () => ({ width: 1, height: 1 });

      const spy = jest.spyOn(window, 'getComputedStyle').mockReturnValue({ display: 'block', visibility: 'visible' });

      const mockRoot = { querySelectorAll: jest.fn(() => [el]) };
      const result = findAdElements(mockRoot);
      expect(result).toEqual([]);
      spy.mockRestore();
    });

    test('should skip elements smaller than 50x40 minimum', () => {
      const el = document.createElement('div');
      Object.defineProperty(el, 'offsetWidth', { value: 30 });
      Object.defineProperty(el, 'offsetHeight', { value: 20 });
      el.getBoundingClientRect = () => ({ width: 30, height: 20 });

      const spy = jest.spyOn(window, 'getComputedStyle').mockReturnValue({ display: 'block', visibility: 'visible' });

      const mockRoot = { querySelectorAll: jest.fn(() => [el]) };
      const result = findAdElements(mockRoot);
      expect(result).toEqual([]);
      spy.mockRestore();
    });

    test('should skip structural elements like HTML and BODY', () => {
      // Create a mock element that looks like the <html> element
      const htmlEl = document.createElement('div');
      // Override tagName to simulate <html>
      Object.defineProperty(htmlEl, 'tagName', { value: 'HTML' });
      Object.defineProperty(htmlEl, 'offsetWidth', { value: 970 });
      Object.defineProperty(htmlEl, 'offsetHeight', { value: 600 });
      htmlEl.getBoundingClientRect = () => ({ width: 970, height: 600 });

      const spy = jest.spyOn(window, 'getComputedStyle').mockReturnValue({ display: 'block', visibility: 'visible' });

      const mockRoot = { querySelectorAll: jest.fn(() => [htmlEl]) };
      const result = findAdElements(mockRoot);
      expect(result).toEqual([]);
      spy.mockRestore();
    });

    test('should skip HEADER, FOOTER, NAV, MAIN structural elements', () => {
      const tags = ['HEADER', 'FOOTER', 'NAV', 'MAIN'];
      const spy = jest.spyOn(window, 'getComputedStyle').mockReturnValue({ display: 'block', visibility: 'visible' });

      for (const tag of tags) {
        const el = document.createElement('div');
        Object.defineProperty(el, 'tagName', { value: tag });
        Object.defineProperty(el, 'offsetWidth', { value: 300 });
        Object.defineProperty(el, 'offsetHeight', { value: 250 });
        el.getBoundingClientRect = () => ({ width: 300, height: 250 });

        const mockRoot = { querySelectorAll: jest.fn(() => [el]) };
        const result = findAdElements(mockRoot);
        expect(result).toEqual([]);
      }
      spy.mockRestore();
    });

    test('should skip detached elements with no parentElement', () => {
      // Create a detached element (not appended to any parent)
      const el = document.createElement('div');
      Object.defineProperty(el, 'offsetWidth', { value: 300 });
      Object.defineProperty(el, 'offsetHeight', { value: 250 });
      el.getBoundingClientRect = () => ({ width: 300, height: 250 });
      // Detached: parentElement is null
      Object.defineProperty(el, 'parentElement', { value: null, configurable: true });

      const spy = jest.spyOn(window, 'getComputedStyle').mockReturnValue({ display: 'block', visibility: 'visible' });

      const mockRoot = { querySelectorAll: jest.fn(() => [el]) };
      const result = findAdElements(mockRoot);
      expect(result).toEqual([]);
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
      document.body.appendChild(el);
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
      document.body.removeChild(el);
    });

    test('should handle querySelectorAll errors gracefully', () => {
      const mockRoot = {
        querySelectorAll: jest.fn(() => { throw new Error('Invalid selector'); })
      };
      const result = findAdElements(mockRoot);
      expect(result).toEqual([]);
    });

    test('should skip elements that contain already-injected children', () => {
      const parent = document.createElement('div');
      const child = document.createElement('div');
      child.setAttribute('data-opl-injected', 'true');
      parent.appendChild(child);
      Object.defineProperty(parent, 'offsetWidth', { value: 300 });
      Object.defineProperty(parent, 'offsetHeight', { value: 250 });
      parent.getBoundingClientRect = () => ({ width: 300, height: 250 });

      const spy = jest.spyOn(window, 'getComputedStyle').mockReturnValue({ display: 'block', visibility: 'visible', position: 'static' });
      const mockRoot = { querySelectorAll: jest.fn(() => [parent]) };
      const result = findAdElements(mockRoot);
      expect(result).toEqual([]);
      spy.mockRestore();
    });

    test('should skip full-page takeover overlays (position:fixed + viewport size)', () => {
      const el = document.createElement('div');
      Object.defineProperty(el, 'offsetWidth', { value: 1920 });
      Object.defineProperty(el, 'offsetHeight', { value: 1080 });
      el.getBoundingClientRect = () => ({ width: 1920, height: 1080 });

      const spy = jest.spyOn(window, 'getComputedStyle').mockReturnValue({ display: 'block', visibility: 'visible', position: 'fixed' });
      // Set viewport dimensions
      Object.defineProperty(window, 'innerWidth', { value: 1920, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: 1080, writable: true });

      const mockRoot = { querySelectorAll: jest.fn(() => [el]) };
      const result = findAdElements(mockRoot);
      expect(result).toEqual([]);
      spy.mockRestore();
    });
  });

  describe('_isFullPageTakeover', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'innerWidth', { value: 1920, writable: true, configurable: true });
      Object.defineProperty(window, 'innerHeight', { value: 1080, writable: true, configurable: true });
    });

    test('should return true for fixed-position viewport-sized element', () => {
      const el = document.createElement('div');
      el.getBoundingClientRect = () => ({ width: 1920, height: 1080 });
      const style = { position: 'fixed' };
      expect(_isFullPageTakeover(el, style)).toBe(true);
    });

    test('should return true for absolute-position viewport-sized element', () => {
      const el = document.createElement('div');
      el.getBoundingClientRect = () => ({ width: 1920, height: 1080 });
      const style = { position: 'absolute' };
      expect(_isFullPageTakeover(el, style)).toBe(true);
    });

    test('should return false for static-position elements even at viewport size', () => {
      const el = document.createElement('div');
      el.getBoundingClientRect = () => ({ width: 1920, height: 1080 });
      const style = { position: 'static' };
      expect(_isFullPageTakeover(el, style)).toBe(false);
    });

    test('should return false for fixed-position small elements', () => {
      const el = document.createElement('div');
      el.getBoundingClientRect = () => ({ width: 300, height: 250 });
      const style = { position: 'fixed' };
      expect(_isFullPageTakeover(el, style)).toBe(false);
    });

    test('should detect near-viewport elements (>80% coverage)', () => {
      const el = document.createElement('div');
      // 85% of viewport = takeover
      el.getBoundingClientRect = () => ({ width: 1632, height: 918 });
      const style = { position: 'fixed' };
      expect(_isFullPageTakeover(el, style)).toBe(true);
    });
  });

  describe('MAX_AD constants', () => {
    test('MAX_AD_WIDTH should be defined', () => {
      expect(MAX_AD_WIDTH).toBe(970);
    });

    test('MAX_AD_HEIGHT should be defined', () => {
      expect(MAX_AD_HEIGHT).toBe(600);
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

  describe('_hasOverlayAncestor', () => {
    test('should return false when no overlay ancestor exists', () => {
      const parent = document.createElement('div');
      const child = document.createElement('div');
      parent.appendChild(child);
      document.body.appendChild(parent);

      const spy = jest.spyOn(window, 'getComputedStyle').mockReturnValue({ position: 'static', zIndex: 'auto' });
      expect(_hasOverlayAncestor(child)).toBe(false);
      spy.mockRestore();
      document.body.removeChild(parent);
    });

    test('should return true when any ancestor has position:fixed', () => {
      const overlay = document.createElement('div');
      const child = document.createElement('div');
      overlay.appendChild(child);
      document.body.appendChild(overlay);

      // Even a small fixed-position ancestor means interstitial
      const spy = jest.spyOn(window, 'getComputedStyle').mockImplementation((el) => {
        if (el === child) return { position: 'static', zIndex: 'auto' };
        return { position: 'fixed', zIndex: 'auto' };
      });
      expect(_hasOverlayAncestor(child)).toBe(true);
      spy.mockRestore();
      document.body.removeChild(overlay);
    });

    test('should return true when element itself has position:fixed', () => {
      const el = document.createElement('div');
      document.body.appendChild(el);

      const spy = jest.spyOn(window, 'getComputedStyle').mockReturnValue({ position: 'fixed', zIndex: 'auto' });
      expect(_hasOverlayAncestor(el)).toBe(true);
      spy.mockRestore();
      document.body.removeChild(el);
    });

    test('should return true when ancestor has high z-index', () => {
      const wrapper = document.createElement('div');
      const child = document.createElement('div');
      wrapper.appendChild(child);
      document.body.appendChild(wrapper);

      const spy = jest.spyOn(window, 'getComputedStyle').mockImplementation((el) => {
        if (el === child) return { position: 'static', zIndex: 'auto' };
        return { position: 'relative', zIndex: '9999' };
      });
      expect(_hasOverlayAncestor(child)).toBe(true);
      spy.mockRestore();
      document.body.removeChild(wrapper);
    });

    test('should return false when ancestor has low z-index', () => {
      const wrapper = document.createElement('div');
      const child = document.createElement('div');
      wrapper.appendChild(child);
      document.body.appendChild(wrapper);

      const spy = jest.spyOn(window, 'getComputedStyle').mockImplementation((el) => {
        return { position: 'relative', zIndex: '5' };
      });
      expect(_hasOverlayAncestor(child)).toBe(false);
      spy.mockRestore();
      document.body.removeChild(wrapper);
    });

    test('should return false for static ancestors with high z-index', () => {
      // z-index only applies to positioned elements
      const wrapper = document.createElement('div');
      const child = document.createElement('div');
      wrapper.appendChild(child);
      document.body.appendChild(wrapper);

      const spy = jest.spyOn(window, 'getComputedStyle').mockImplementation((el) => {
        if (el === child) return { position: 'static', zIndex: 'auto' };
        return { position: 'static', zIndex: '9999' };
      });
      expect(_hasOverlayAncestor(child)).toBe(false);
      spy.mockRestore();
      document.body.removeChild(wrapper);
    });
  });
});
