/**
 * Tests for strike-injector.js module
 */

// We need to mock the global functions that strike-injector.js depends on
// before requiring it
global.findAdElements = jest.fn(() => []);
global.observeNewAds = jest.fn(() => ({ disconnect: jest.fn() }));
global.getAdSize = jest.fn(() => 'medium');
global.renderStrikeCard = jest.fn(() => {
  const card = {
    tagName: 'DIV',
    className: 'opl-strike-card',
    setAttribute: jest.fn(),
    getAttribute: jest.fn(() => 'true')
  };
  return card;
});

const {
  initStrikeInjector,
  stopStrikeInjector,
  isInjectorActive,
  replaceAdWithCard,
  processAdElements,
  getNextAction,
  _resetState
} = require('../strike-injector.js');

const mockActions = [
  {
    id: 'action-1',
    title: 'Strike at Company A',
    company: 'Company A',
    type: 'strike',
    more_info: 'https://example.com/a'
  },
  {
    id: 'action-2',
    title: 'Boycott of Company B',
    company: 'Company B',
    type: 'boycott',
    more_info: 'https://example.com/b'
  },
  {
    id: 'action-3',
    title: 'Picket at Company C',
    company: 'Company C',
    type: 'picket',
    more_info: 'https://example.com/c'
  }
];

describe('Strike Injector Module', () => {
  beforeEach(() => {
    _resetState();
    jest.clearAllMocks();

    // Mock document for DOM operations
    global.document = {
      body: {},
      querySelectorAll: jest.fn(() => []),
      createElement: jest.fn(() => ({
        className: '',
        innerHTML: '',
        style: {},
        appendChild: jest.fn(),
        setAttribute: jest.fn(),
        getAttribute: jest.fn(() => null)
      }))
    };
  });

  describe('getNextAction', () => {
    test('should return null for empty actions array', () => {
      expect(getNextAction([])).toBeNull();
      expect(getNextAction(null)).toBeNull();
    });

    test('should rotate through actions', () => {
      _resetState();
      const first = getNextAction(mockActions);
      expect(first.id).toBe('action-1');

      const second = getNextAction(mockActions);
      expect(second.id).toBe('action-2');

      const third = getNextAction(mockActions);
      expect(third.id).toBe('action-3');

      // Should wrap around
      const fourth = getNextAction(mockActions);
      expect(fourth.id).toBe('action-1');
    });
  });

  describe('replaceAdWithCard', () => {
    function createMockAdElement(width, height) {
      return {
        innerHTML: '<ad>original ad content</ad>',
        style: {},
        offsetWidth: width,
        offsetHeight: height,
        getBoundingClientRect: () => ({ width, height }),
        getAttribute: jest.fn(() => null),
        setAttribute: jest.fn(),
        appendChild: jest.fn()
      };
    }

    test('should replace ad element content', () => {
      const el = createMockAdElement(300, 250);
      const result = replaceAdWithCard(el, mockActions);
      expect(result).toBe(true);
      expect(el.innerHTML).toBe('');
      expect(el.appendChild).toHaveBeenCalled();
      expect(el.setAttribute).toHaveBeenCalledWith('data-opl-injected', 'true');
    });

    test('should skip elements already marked as injected', () => {
      const el = createMockAdElement(300, 250);
      el.getAttribute = jest.fn((attr) => attr === 'data-opl-injected' ? 'true' : null);
      const result = replaceAdWithCard(el, mockActions);
      expect(result).toBe(false);
    });

    test('should replace very small elements with medium card', () => {
      const el = createMockAdElement(20, 10);
      const result = replaceAdWithCard(el, mockActions);
      expect(result).toBe(true);
    });

    test('should return false when no actions available', () => {
      const el = createMockAdElement(300, 250);
      const result = replaceAdWithCard(el, []);
      expect(result).toBe(false);
    });

    test('should set overflow hidden on replaced element', () => {
      const el = createMockAdElement(300, 250);
      replaceAdWithCard(el, mockActions);
      expect(el.style.overflow).toBe('hidden');
    });
  });

  describe('processAdElements', () => {
    test('should process array of ad elements', () => {
      _resetState();
      const elements = [
        { element: {
          innerHTML: '', style: {}, offsetWidth: 300, offsetHeight: 250,
          getBoundingClientRect: () => ({ width: 300, height: 250 }),
          getAttribute: jest.fn(() => null), setAttribute: jest.fn(), appendChild: jest.fn()
        }},
        { element: {
          innerHTML: '', style: {}, offsetWidth: 728, offsetHeight: 90,
          getBoundingClientRect: () => ({ width: 728, height: 90 }),
          getAttribute: jest.fn(() => null), setAttribute: jest.fn(), appendChild: jest.fn()
        }}
      ];

      const count = processAdElements(elements, mockActions);
      expect(count).toBe(2);
    });

    test('should return 0 for empty elements array', () => {
      const count = processAdElements([], mockActions);
      expect(count).toBe(0);
    });
  });

  describe('initStrikeInjector', () => {
    test('should set injector as active', () => {
      expect(isInjectorActive()).toBe(false);
      initStrikeInjector(mockActions);
      expect(isInjectorActive()).toBe(true);
    });

    test('should call findAdElements for initial scan', () => {
      initStrikeInjector(mockActions);
      expect(global.findAdElements).toHaveBeenCalledWith(document);
    });

    test('should set up MutationObserver via observeNewAds', () => {
      initStrikeInjector(mockActions);
      expect(global.observeNewAds).toHaveBeenCalled();
    });

    test('should return handle with stop method', () => {
      const handle = initStrikeInjector(mockActions);
      expect(handle).toHaveProperty('stop');
      expect(typeof handle.stop).toBe('function');
    });

    test('should do nothing with empty actions', () => {
      const handle = initStrikeInjector([]);
      expect(isInjectorActive()).toBe(false);
      expect(global.findAdElements).not.toHaveBeenCalled();
    });

    test('should stop previous injector before starting new one', () => {
      initStrikeInjector(mockActions);
      expect(isInjectorActive()).toBe(true);

      // Start again
      initStrikeInjector(mockActions);
      expect(isInjectorActive()).toBe(true);
      // observeNewAds should have been called twice
      expect(global.observeNewAds).toHaveBeenCalledTimes(2);
    });
  });

  describe('stopStrikeInjector', () => {
    test('should set injector as inactive', () => {
      initStrikeInjector(mockActions);
      expect(isInjectorActive()).toBe(true);
      stopStrikeInjector();
      expect(isInjectorActive()).toBe(false);
    });

    test('should disconnect observer', () => {
      const mockDisconnect = jest.fn();
      global.observeNewAds = jest.fn(() => ({ disconnect: mockDisconnect }));

      initStrikeInjector(mockActions);
      stopStrikeInjector();
      expect(mockDisconnect).toHaveBeenCalled();
    });
  });
});
