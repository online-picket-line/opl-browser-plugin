
import { jest } from '@jest/globals';
import fs from 'fs';
import path from 'path';

describe('Background Script Logic', () => {
  let mockChrome;
  let mockApiServiceInstance;
  
  beforeEach(() => {
    // Reset mocks
    jest.resetModules();
    
    // Mock ApiService
    mockApiServiceInstance = {
      getLaborActions: jest.fn().mockResolvedValue([]),
      clearCache: jest.fn()
    };
    
    global.ApiService = jest.fn(() => mockApiServiceInstance);
    
    // Mock importScripts
    global.importScripts = jest.fn();
    global.checkForUpdates = jest.fn();
    
    // Mock Chrome API
    mockChrome = {
      runtime: {
        onInstalled: { addListener: jest.fn() },
        onStartup: { addListener: jest.fn() },
        onMessage: { addListener: jest.fn() }
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

  async function loadBackgroundScript() {
    // ESM-compatible __dirname
    const __filename = new URL(import.meta.url).pathname;
    const __dirname = path.dirname(__filename);
    // Dynamically import the background script as an ES module
    const backgroundModule = await import(new URL('../background.js', import.meta.url));
    // Wait for any startup logic if needed (if background.js exports a promise or init function)
    // If refreshLaborActions is exported, return it
    if (backgroundModule.refreshLaborActions) {
      return backgroundModule.refreshLaborActions;
    }
    // Fallback: try to get from global if not exported
    if (typeof global.refreshLaborActions === 'function') {
      return global.refreshLaborActions;
    }
    throw new Error('refreshLaborActions not found in background.js');
  }

  it('should set status to online on successful fetch', async () => {
    const refreshLaborActions = await loadBackgroundScript();
    mockChrome.storage.local.set.mockClear();
    
    mockApiServiceInstance.getLaborActions.mockResolvedValue([{ id: 1 }]);
    
    await refreshLaborActions();
    
    expect(mockChrome.storage.local.set).toHaveBeenCalledWith(expect.objectContaining({
      connection_status: 'online',
      failure_count: 0
    }));
  });

  it('should increment failure count on error', async () => {
    const refreshLaborActions = await loadBackgroundScript();
    mockChrome.storage.local.set.mockClear();
    
    mockApiServiceInstance.getLaborActions.mockRejectedValue(new Error('Network error'));
    mockChrome.storage.local.get.mockResolvedValue({ failure_count: 0 });
    
    await refreshLaborActions();
    
    expect(mockChrome.storage.local.set).toHaveBeenCalledWith(expect.objectContaining({
      failure_count: 1
    }));
  });

  it('should set status to offline after 3 failures', async () => {
    const refreshLaborActions = await loadBackgroundScript();
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
    const refreshLaborActions = await loadBackgroundScript();
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
