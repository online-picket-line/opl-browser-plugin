
import { jest } from '@jest/globals';

// Mock dependencies BEFORE importing background
global.checkForUpdates = jest.fn();

// Increase Jest timeout for all tests in this file
jest.setTimeout(30000);

// Import after mocks are set
import { refreshLaborActions } from '../background.js';

describe('Background Script Logic', () => {
  let mockChrome;
  let mockApiServiceInstance;
  
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Mock ApiService instance
    mockApiServiceInstance = {
      getLaborActions: jest.fn().mockResolvedValue([]),
      clearCache: jest.fn()
    };
    
    // Replace the global ApiService constructor
    global.ApiService = jest.fn(() => mockApiServiceInstance);
    
    // Mock Chrome API
    mockChrome = {
      runtime: {
        onInstalled: { addListener: jest.fn() },
        onStartup: { addListener: jest.fn() },
        onMessage: { addListener: jest.fn() },
        getManifest: jest.fn(() => ({ version: '1.0.0' }))
      },
      alarms: {
        create: jest.fn(),
        onAlarm: { addListener: jest.fn() }
      },
      storage: {
        local: {
          set: jest.fn().mockImplementation((data) => Promise.resolve()),
          get: jest.fn().mockImplementation((keys) => Promise.resolve({}))
        },
        sync: {
          get: jest.fn().mockImplementation((keys) => Promise.resolve({})),
          set: jest.fn().mockImplementation((data) => Promise.resolve())
        }
      },
      notifications: {
        create: jest.fn(),
        onClicked: { addListener: jest.fn() },
        clear: jest.fn()
      },
      tabs: {
        create: jest.fn()
      }
    };
    global.chrome = mockChrome;
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({}), status: 200, headers: { get: () => null } });
  });

  it('should set status to online on successful fetch', async () => {
    mockApiServiceInstance.getLaborActions.mockResolvedValue([{ id: 1 }]);
    
    await refreshLaborActions();
    
    expect(mockChrome.storage.local.set).toHaveBeenCalledWith(expect.objectContaining({
      connection_status: 'online',
      failure_count: 0
    }));
  });

  it('should increment failure count on error', async () => {
    mockChrome.storage.local.set.mockClear();
    
    mockApiServiceInstance.getLaborActions.mockRejectedValue(new Error('Network error'));
    mockChrome.storage.local.get.mockResolvedValue({ failure_count: 0 });
    
    await refreshLaborActions();
    
    expect(mockChrome.storage.local.set).toHaveBeenCalledWith(expect.objectContaining({
      failure_count: 1
    }));
  });

  it('should set status to offline after 3 failures', async () => {
    mockChrome.storage.local.set.mockClear();
    
    mockApiServiceInstance.getLaborActions.mockRejectedValue(new Error('Network error'));
    mockChrome.storage.local.get.mockResolvedValue({ failure_count: 2 });
    
    await refreshLaborActions();
    
    expect(mockChrome.storage.local.set).toHaveBeenCalledWith(expect.objectContaining({
      failure_count: 3,
      connection_status: 'offline'
    }));
  });
  
  it('should not set offline status if failures < 3', async () => {
    mockChrome.storage.local.set.mockClear();
    
    mockApiServiceInstance.getLaborActions.mockRejectedValue(new Error('Network error'));
    mockChrome.storage.local.get.mockResolvedValue({ failure_count: 1 });
    
    await refreshLaborActions();
    
    expect(mockChrome.storage.local.set).toHaveBeenCalledWith(expect.objectContaining({
      failure_count: 2
    }));
    
    // Should NOT contain connection_status: 'offline'
    const setCall = mockChrome.storage.local.set.mock.calls[0][0];
    expect(setCall).not.toHaveProperty('connection_status');
  });
});
