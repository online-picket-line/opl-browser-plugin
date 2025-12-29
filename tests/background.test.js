const fs = require('fs');
const path = require('path');

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
    
    // Mock Chrome API
    mockChrome = {
      runtime: {
        onInstalled: { addListener: jest.fn() },
        onMessage: { addListener: jest.fn() }
      },
      alarms: {
        create: jest.fn(),
        onAlarm: { addListener: jest.fn() }
      },
      storage: {
        local: {
          set: jest.fn().mockResolvedValue(undefined),
          get: jest.fn().mockResolvedValue({})
        },
        sync: {
          get: jest.fn(),
          set: jest.fn()
        }
      }
    };
    global.chrome = mockChrome;
  });

  async function loadBackgroundScript() {
    const backgroundPath = path.join(__dirname, '../background.js');
    const content = fs.readFileSync(backgroundPath, 'utf8');
    
    // Execute the script in the global scope
    // The last statement is refreshLaborActions(), so eval returns its promise
    const startupPromise = eval(content);
    
    // Wait for startup to finish so it doesn't interfere with tests
    try {
      await startupPromise;
    } catch (e) {
      // Ignore startup errors
    }
    
    return refreshLaborActions; 
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
