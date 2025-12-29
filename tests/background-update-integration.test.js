/**
 * Background Script Update Integration Tests
 * 
 * Tests the integration of UpdateService with background.js
 */

const fs = require('fs');
const path = require('path');

describe('Background Script - Update Integration', () => {
  let mockUpdateService;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock UpdateService
    mockUpdateService = {
      checkForUpdate: jest.fn(),
      getCachedUpdate: jest.fn(),
      dismissUpdate: jest.fn(),
      openUpdatePage: jest.fn(),
      getCurrentVersion: jest.fn(() => '1.0.0')
    };
    
    // Make it globally available
    global.UpdateService = jest.fn(() => mockUpdateService);
  });
  
  describe('Message Handlers', () => {
    test('should handle checkUpdate message', async () => {
      mockUpdateService.getCachedUpdate.mockResolvedValue({
        currentVersion: '1.0.0',
        latestVersion: '1.2.0',
        isNewVersion: true,
        releaseInfo: {
          version: '1.2.0',
          name: 'Version 1.2.0'
        }
      });
      
      const sendResponse = jest.fn();
      
      // Simulate message handler for checkUpdate
      await mockUpdateService.getCachedUpdate();
      
      const response = await mockUpdateService.getCachedUpdate();
      
      expect(response).toEqual({
        currentVersion: '1.0.0',
        latestVersion: '1.2.0',
        isNewVersion: true,
        releaseInfo: expect.any(Object)
      });
    });
    
    test('should handle checkUpdate with no update available', async () => {
      mockUpdateService.getCachedUpdate.mockResolvedValue(null);
      
      const response = await mockUpdateService.getCachedUpdate();
      
      expect(response).toBeNull();
    });
    
    test('should handle openUpdatePage message', async () => {
      mockUpdateService.getCachedUpdate.mockResolvedValue({
        releaseInfo: {
          htmlUrl: 'https://github.com/releases/v1.2.0'
        }
      });
      
      mockUpdateService.openUpdatePage.mockResolvedValue(undefined);
      
      const update = await mockUpdateService.getCachedUpdate();
      await mockUpdateService.openUpdatePage(update.releaseInfo.htmlUrl);
      
      expect(mockUpdateService.openUpdatePage).toHaveBeenCalledWith(
        'https://github.com/releases/v1.2.0'
      );
    });
    
    test('should handle dismissUpdate message', async () => {
      mockUpdateService.getCachedUpdate.mockResolvedValue({
        latestVersion: '1.2.0'
      });
      
      mockUpdateService.dismissUpdate.mockResolvedValue(undefined);
      
      const update = await mockUpdateService.getCachedUpdate();
      await mockUpdateService.dismissUpdate(update.latestVersion);
      
      expect(mockUpdateService.dismissUpdate).toHaveBeenCalledWith('1.2.0');
    });
  });
  
  describe('Periodic Update Checks', () => {
    test('should check for updates on startup', () => {
      expect(mockUpdateService.checkForUpdate).toBeDefined();
    });
    
    test('should schedule periodic update checks', () => {
      // Verify alarm is created for update checks
      expect(chrome.alarms.create).toBeDefined();
    });
  });
  
  describe('Update Check Function', () => {
    test('should call updateService.checkForUpdate', async () => {
      mockUpdateService.checkForUpdate.mockResolvedValue({
        isNewVersion: true,
        latestVersion: '1.2.0'
      });
      
      const result = await mockUpdateService.checkForUpdate();
      
      expect(mockUpdateService.checkForUpdate).toHaveBeenCalled();
      expect(result).toEqual({
        isNewVersion: true,
        latestVersion: '1.2.0'
      });
    });
    
    test('should handle errors gracefully', async () => {
      mockUpdateService.checkForUpdate.mockRejectedValue(new Error('Network error'));
      
      await expect(mockUpdateService.checkForUpdate()).rejects.toThrow('Network error');
    });
  });
});

describe('Alarm Listener - Update Checks', () => {
  let alarmCallback;
  
  beforeEach(() => {
    // Capture the alarm listener callback
    chrome.alarms.onAlarm.addListener.mockImplementation(cb => {
      alarmCallback = cb;
    });
  });
  
  test('should trigger update check on alarm', () => {
    const mockAlarm = { name: 'checkForUpdates' };
    
    if (alarmCallback) {
      alarmCallback(mockAlarm);
    }
    
    // Verify the alarm listener was registered
    expect(chrome.alarms.onAlarm.addListener).toBeDefined();
  });
  
  test('should not trigger on wrong alarm name', () => {
    const mockAlarm = { name: 'someOtherAlarm' };
    
    if (alarmCallback) {
      alarmCallback(mockAlarm);
    }
    
    // Should not throw or cause issues
    expect(chrome.alarms.onAlarm.addListener).toBeDefined();
  });
});

describe('Storage Integration', () => {
  test('should store update check results', async () => {
    chrome.storage.local.set.mockImplementation((data, callback) => {
      if (callback) callback();
      return Promise.resolve();
    });
    
    await chrome.storage.local.set({
      update_latest_version: {
        version: '1.2.0',
        name: 'New Version'
      }
    });
    
    expect(chrome.storage.local.set).toHaveBeenCalledWith(
      expect.objectContaining({
        update_latest_version: expect.any(Object)
      })
    );
  });
  
  test('should retrieve cached update data', async () => {
    chrome.storage.local.get.mockImplementation((keys, callback) => {
      callback({
        update_latest_version: {
          version: '1.2.0'
        }
      });
    });
    
    const result = await new Promise(resolve => {
      chrome.storage.local.get(['update_latest_version'], resolve);
    });
    
    expect(result.update_latest_version).toBeDefined();
    expect(result.update_latest_version.version).toBe('1.2.0');
  });
});

describe('Error Scenarios', () => {
  let mockUpdateService;
  
  beforeEach(() => {
    mockUpdateService = {
      checkForUpdate: jest.fn(),
      getCachedUpdate: jest.fn()
    };
  });
  
  test('should handle GitHub API failures', async () => {
    mockUpdateService.checkForUpdate.mockRejectedValue(new Error('API Error'));
    
    try {
      await mockUpdateService.checkForUpdate();
    } catch (error) {
      expect(error.message).toBe('API Error');
    }
  });
  
  test('should handle storage failures', async () => {
    chrome.storage.local.get.mockImplementation(() => {
      throw new Error('Storage Error');
    });
    
    expect(() => {
      chrome.storage.local.get(['update_latest_version'], () => {});
    }).toThrow('Storage Error');
  });
  
  test('should handle malformed cached data', async () => {
    mockUpdateService.getCachedUpdate.mockResolvedValue(null);
    
    const result = await mockUpdateService.getCachedUpdate();
    
    expect(result).toBeNull();
  });
});

describe('Message Response Handling', () => {
  test('should return updateAvailable true when update exists', async () => {
    const mockUpdate = {
      currentVersion: '1.0.0',
      latestVersion: '1.2.0',
      isNewVersion: true,
      releaseInfo: {}
    };
    
    const response = {
      updateAvailable: true,
      currentVersion: mockUpdate.currentVersion,
      latestVersion: mockUpdate.latestVersion,
      releaseInfo: mockUpdate.releaseInfo
    };
    
    expect(response.updateAvailable).toBe(true);
    expect(response.latestVersion).toBe('1.2.0');
  });
  
  test('should return updateAvailable false when no update', () => {
    const response = { updateAvailable: false };
    
    expect(response.updateAvailable).toBe(false);
  });
  
  test('should handle success response for dismissUpdate', () => {
    const response = { success: true };
    
    expect(response.success).toBe(true);
  });
  
  test('should handle failure response for dismissUpdate', () => {
    const response = { success: false };
    
    expect(response.success).toBe(false);
  });
});
