import { jest } from '@jest/globals';

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
    getURL: jest.fn()
  },
  alarms: {
    create: jest.fn(),
    onAlarm: {
      addListener: jest.fn()
    }
  },
  notifications: {
    create: jest.fn(),
    clear: jest.fn(),
    onClicked: {
      addListener: jest.fn()
    }
  },
  tabs: {
    create: jest.fn()
  }
};

// Mock fetch globally
global.fetch = jest.fn();

// Mock URL constructor for browser compatibility
global.URL = URL || class URL {
  constructor(url) {
    const match = url.match(/^https?:\/\/([^\/]+)/);
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