// Test setup for browser extension environment
global.chrome = {
  storage: {
    sync: {
      get: jest.fn(),
      set: jest.fn()
    },
    local: {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn()
    }
  },
  runtime: {
    sendMessage: jest.fn(),
    onMessage: {
      addListener: jest.fn()
    },
    getURL: jest.fn((path) => `chrome-extension://test-id/${path}`),
    getManifest: jest.fn(() => ({ version: '1.0.0', name: 'Online Picket Line - OPL' }))
  },
  alarms: {
    create: jest.fn(),
    onAlarm: {
      addListener: jest.fn()
    }
  },
  tabs: {
    create: jest.fn(),
    query: jest.fn(),
    update: jest.fn()
  },
  declarativeNetRequest: {
    getDynamicRules: jest.fn(() => Promise.resolve([])),
    updateDynamicRules: jest.fn(() => Promise.resolve()),
    updateSessionRules: jest.fn(() => Promise.resolve())
  }
};

// Mock fetch globally
global.fetch = jest.fn();

// Mock performance API for service worker compatibility tests
global.performance = global.performance || {
  now: jest.fn(() => Date.now())
};

// Mock URL constructor for browser compatibility
global.URL = URL || class URL {
  constructor(url) {
    const match = url.match(/^https?:\/\/([^/]+)/);
    this.hostname = match ? match[1] : url;
    this.href = url;
  }
};

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

// Reset all mocks after each test
afterEach(() => {
  jest.clearAllMocks();
});
