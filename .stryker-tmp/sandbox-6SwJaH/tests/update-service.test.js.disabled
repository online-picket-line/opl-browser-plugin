/**
 * Update Service Unit Tests
 * 
 * Comprehensive Jest tests for the UpdateService class
 * Run with: npm test tests/update-service.test.js
 */

// Require the UpdateService class
const UpdateService = require('../update-service.js');

describe('UpdateService', () => {
  let updateService;
  
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup default mock for getManifest
    chrome.runtime.getManifest.mockReturnValue({
      version: '1.0.0',
      name: 'Online Picket Line - OPL'
    });
    
    // Create fresh UpdateService instance
    updateService = new UpdateService();
    
    // Setup default mock implementations
    chrome.storage.local.get.mockImplementation((keys, callback) => {
      callback({});
    });
    
    chrome.storage.local.set.mockImplementation((data, callback) => {
      if (callback) callback();
      return Promise.resolve();
    });
    
    chrome.storage.local.remove.mockImplementation((keys, callback) => {
      if (callback) callback();
      return Promise.resolve();
    });
  });
  
  describe('Constructor', () => {
    test('should initialize with correct properties', () => {
      expect(updateService.GITHUB_REPO).toBe('online-picket-line/opl-browser-plugin');
      expect(updateService.GITHUB_API).toContain('api.github.com');
      expect(updateService.CHECK_INTERVAL_HOURS).toBe(24);
    });
  });
  
  describe('getCurrentVersion', () => {
    test('should return current version from manifest', () => {
      const version = updateService.getCurrentVersion();
      expect(version).toBe('1.0.0');
      expect(chrome.runtime.getManifest).toHaveBeenCalled();
    });
  });
  
  describe('parseVersion', () => {
    test('should parse simple version correctly', () => {
      const parsed = updateService.parseVersion('1.2.3');
      expect(parsed).toEqual([1, 2, 3]);
    });
    
    test('should parse version with two parts', () => {
      const parsed = updateService.parseVersion('2.0');
      expect(parsed).toEqual([2, 0]);
    });
    
    test('should parse single digit version', () => {
      const parsed = updateService.parseVersion('5');
      expect(parsed).toEqual([5]);
    });
  });
  
  describe('compareVersions', () => {
    test('should return 1 when v1 > v2 (major)', () => {
      expect(updateService.compareVersions('2.0.0', '1.9.9')).toBe(1);
    });
    
    test('should return 1 when v1 > v2 (minor)', () => {
      expect(updateService.compareVersions('1.2.0', '1.1.9')).toBe(1);
    });
    
    test('should return 1 when v1 > v2 (patch)', () => {
      expect(updateService.compareVersions('1.0.1', '1.0.0')).toBe(1);
    });
    
    test('should return -1 when v1 < v2 (major)', () => {
      expect(updateService.compareVersions('1.9.9', '2.0.0')).toBe(-1);
    });
    
    test('should return -1 when v1 < v2 (minor)', () => {
      expect(updateService.compareVersions('1.1.0', '1.2.0')).toBe(-1);
    });
    
    test('should return -1 when v1 < v2 (patch)', () => {
      expect(updateService.compareVersions('1.0.0', '1.0.1')).toBe(-1);
    });
    
    test('should return 0 when versions are equal', () => {
      expect(updateService.compareVersions('1.0.0', '1.0.0')).toBe(0);
    });
    
    test('should handle versions with different lengths', () => {
      expect(updateService.compareVersions('1.0', '1.0.0')).toBe(0);
      expect(updateService.compareVersions('1.0.1', '1.0')).toBe(1);
      expect(updateService.compareVersions('1.0', '1.0.1')).toBe(-1);
    });
  });
  
  describe('shouldCheckForUpdate', () => {
    test('should return true when no previous check', async () => {
      chrome.storage.local.get.mockImplementation((keys, callback) => {
        callback({});
      });
      
      const should = await updateService.shouldCheckForUpdate();
      expect(should).toBe(true);
    });
    
    test('should return true when check is old enough', async () => {
      const oldTimestamp = Date.now() - (25 * 60 * 60 * 1000); // 25 hours ago
      
      chrome.storage.local.get.mockImplementation((keys, callback) => {
        callback({ update_last_check: oldTimestamp });
      });
      
      const should = await updateService.shouldCheckForUpdate();
      expect(should).toBe(true);
    });
    
    test('should return false when check is too recent', async () => {
      const recentTimestamp = Date.now() - (1 * 60 * 60 * 1000); // 1 hour ago
      
      chrome.storage.local.get.mockImplementation((keys, callback) => {
        callback({ update_last_check: recentTimestamp });
      });
      
      const should = await updateService.shouldCheckForUpdate();
      expect(should).toBe(false);
    });
  });
  
  describe('fetchLatestRelease', () => {
    test('should fetch and parse release data successfully', async () => {
      const mockRelease = {
        tag_name: 'v1.2.0',
        name: 'Version 1.2.0',
        body: 'Release notes here',
        published_at: '2025-12-28T00:00:00Z',
        html_url: 'https://github.com/online-picket-line/opl-browser-plugin/releases/tag/v1.2.0',
        assets: [
          { browser_download_url: 'https://github.com/download/v1.2.0.zip' }
        ]
      };
      
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => mockRelease
      });
      
      const release = await updateService.fetchLatestRelease();
      
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('api.github.com'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Accept': 'application/vnd.github.v3+json'
          })
        })
      );
      
      expect(release).toEqual({
        version: '1.2.0',
        name: 'Version 1.2.0',
        description: 'Release notes here',
        publishedAt: '2025-12-28T00:00:00Z',
        htmlUrl: 'https://github.com/online-picket-line/opl-browser-plugin/releases/tag/v1.2.0',
        downloadUrl: 'https://github.com/download/v1.2.0.zip'
      });
    });
    
    test('should handle release without v prefix', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          tag_name: '1.2.0',
          name: 'Version 1.2.0',
          body: 'Notes',
          published_at: '2025-12-28T00:00:00Z',
          html_url: 'https://github.com/release',
          assets: []
        })
      });
      
      const release = await updateService.fetchLatestRelease();
      expect(release.version).toBe('1.2.0');
    });
    
    test('should return null on fetch failure', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 404
      });
      
      const release = await updateService.fetchLatestRelease();
      expect(release).toBeNull();
    });
    
    test('should return null on network error', async () => {
      global.fetch.mockRejectedValue(new Error('Network error'));
      
      const release = await updateService.fetchLatestRelease();
      expect(release).toBeNull();
    });
  });
  
  describe('checkForUpdate', () => {
    beforeEach(() => {
      // Mock fetch for GitHub API
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          tag_name: 'v1.2.0',
          name: 'Version 1.2.0',
          body: 'New features',
          published_at: '2025-12-28T00:00:00Z',
          html_url: 'https://github.com/release',
          assets: []
        })
      });
    });
    
    test('should detect new version available', async () => {
      chrome.runtime.getManifest.mockReturnValue({ version: '1.0.0' });
      
      const update = await updateService.checkForUpdate(true);
      
      expect(update).toBeTruthy();
      expect(update.isNewVersion).toBe(true);
      expect(update.currentVersion).toBe('1.0.0');
      expect(update.latestVersion).toBe('1.2.0');
      expect(update.releaseInfo).toBeDefined();
    });
    
    test('should return null when already up to date', async () => {
      chrome.runtime.getManifest.mockReturnValue({ version: '1.2.0' });
      
      const update = await updateService.checkForUpdate(true);
      
      expect(update).toBeNull();
    });
    
    test('should return null when newer version installed', async () => {
      chrome.runtime.getManifest.mockReturnValue({ version: '2.0.0' });
      
      const update = await updateService.checkForUpdate(true);
      
      expect(update).toBeNull();
    });
    
    test('should respect dismissed versions', async () => {
      chrome.runtime.getManifest.mockReturnValue({ version: '1.0.0' });
      
      chrome.storage.local.get.mockImplementation((keys, callback) => {
        if (keys.includes('update_dismissed_version')) {
          callback({ update_dismissed_version: '1.2.0' });
        } else {
          callback({});
        }
      });
      
      const update = await updateService.checkForUpdate(true);
      
      expect(update).toBeNull();
    });
    
    test('should update last check timestamp', async () => {
      await updateService.checkForUpdate(true);
      
      expect(chrome.storage.local.set).toHaveBeenCalledWith(
        expect.objectContaining({
          update_last_check: expect.any(Number)
        })
      );
    });
    
    test('should store latest version in cache', async () => {
      await updateService.checkForUpdate(true);
      
      expect(chrome.storage.local.set).toHaveBeenCalledWith(
        expect.objectContaining({
          update_latest_version: expect.objectContaining({
            version: '1.2.0'
          })
        })
      );
    });
    
    test('should skip check if recently checked (force=false)', async () => {
      const recentTimestamp = Date.now() - (1 * 60 * 60 * 1000); // 1 hour ago
      
      chrome.storage.local.get.mockImplementation((keys, callback) => {
        callback({ update_last_check: recentTimestamp });
      });
      
      const update = await updateService.checkForUpdate(false);
      
      expect(update).toBeNull();
      expect(fetch).not.toHaveBeenCalled();
    });
  });
  
  describe('isDismissed', () => {
    test('should return true when version is dismissed', async () => {
      chrome.storage.local.get.mockImplementation((keys, callback) => {
        callback({ update_dismissed_version: '1.2.0' });
      });
      
      const dismissed = await updateService.isDismissed('1.2.0');
      expect(dismissed).toBe(true);
    });
    
    test('should return false when version is not dismissed', async () => {
      chrome.storage.local.get.mockImplementation((keys, callback) => {
        callback({ update_dismissed_version: '1.2.0' });
      });
      
      const dismissed = await updateService.isDismissed('1.3.0');
      expect(dismissed).toBe(false);
    });
    
    test('should return false when no version is dismissed', async () => {
      chrome.storage.local.get.mockImplementation((keys, callback) => {
        callback({});
      });
      
      const dismissed = await updateService.isDismissed('1.2.0');
      expect(dismissed).toBe(false);
    });
  });
  
  describe('dismissUpdate', () => {
    test('should store dismissed version', async () => {
      await updateService.dismissUpdate('1.2.0');
      
      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        update_dismissed_version: '1.2.0'
      });
    });
  });
  
  describe('clearDismissed', () => {
    test('should remove dismissed version', async () => {
      await updateService.clearDismissed();
      
      expect(chrome.storage.local.remove).toHaveBeenCalledWith([
        'update_dismissed_version'
      ]);
    });
  });
  
  describe('getCachedUpdate', () => {
    test('should return cached update when newer version exists', async () => {
      chrome.runtime.getManifest.mockReturnValue({ version: '1.0.0' });
      
      chrome.storage.local.get.mockImplementation((keys, callback) => {
        callback({
          update_latest_version: {
            version: '1.2.0',
            name: 'New Version',
            htmlUrl: 'https://github.com/release'
          }
        });
      });
      
      const update = await updateService.getCachedUpdate();
      
      expect(update).toBeTruthy();
      expect(update.isNewVersion).toBe(true);
      expect(update.latestVersion).toBe('1.2.0');
    });
    
    test('should return null when no cached update', async () => {
      chrome.storage.local.get.mockImplementation((keys, callback) => {
        callback({});
      });
      
      const update = await updateService.getCachedUpdate();
      expect(update).toBeNull();
    });
    
    test('should return null when cached version is not newer', async () => {
      chrome.runtime.getManifest.mockReturnValue({ version: '1.2.0' });
      
      chrome.storage.local.get.mockImplementation((keys, callback) => {
        callback({
          update_latest_version: {
            version: '1.0.0'
          }
        });
      });
      
      const update = await updateService.getCachedUpdate();
      expect(update).toBeNull();
    });
  });
  
  describe('openUpdatePage', () => {
    beforeEach(() => {
      chrome.tabs = {
        create: jest.fn()
      };
    });
    
    test('should open provided URL', async () => {
      const testUrl = 'https://github.com/releases/v1.2.0';
      await updateService.openUpdatePage(testUrl);
      
      expect(chrome.tabs.create).toHaveBeenCalledWith({
        url: testUrl
      });
    });
    
    test('should open default URL when no URL provided', async () => {
      await updateService.openUpdatePage();
      
      expect(chrome.tabs.create).toHaveBeenCalledWith({
        url: expect.stringContaining('releases/latest')
      });
    });
  });
  
  describe('Error Handling', () => {
    test('should handle storage errors gracefully', async () => {
      chrome.storage.local.get.mockImplementation(() => {
        throw new Error('Storage error');
      });
      
      // Should throw/reject
      await expect(updateService.shouldCheckForUpdate()).rejects.toThrow('Storage error');
    });
    
    test('should handle malformed release data', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          // Missing required fields
          tag_name: undefined
        })
      });
      
      const release = await updateService.fetchLatestRelease();
      expect(release).toBeNull(); // Should return null for bad data
    });
  });
});

describe('UpdateService Integration', () => {
  test('full update check workflow', async () => {
    const service = new UpdateService();
    
    chrome.runtime.getManifest.mockReturnValue({ version: '1.0.0' });
    
    // Mock GitHub API response
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        tag_name: 'v1.2.0',
        name: 'Version 1.2.0',
        body: 'New features',
        published_at: '2025-12-28T00:00:00Z',
        html_url: 'https://github.com/release',
        assets: []
      })
    });
    
    // Step 1: Check for update
    const update = await service.checkForUpdate(true);
    expect(update).toBeTruthy();
    expect(update.latestVersion).toBe('1.2.0');
    
    // Step 2: Dismiss the update
    await service.dismissUpdate('1.2.0');
    expect(chrome.storage.local.set).toHaveBeenCalledWith(
      expect.objectContaining({
        update_dismissed_version: '1.2.0'
      })
    );
    
    // Step 3: Clear dismissed
    await service.clearDismissed();
    expect(chrome.storage.local.remove).toHaveBeenCalledWith([
      'update_dismissed_version'
    ]);
  });

  describe('Service Worker Compatibility', () => {
    test('should not reference window object (service worker compatibility)', () => {
      const fs = require('fs');
      const path = require('path');
      
      // Read the update-service.js file
      const filePath = path.join(__dirname, '..', 'update-service.js');
      const fileContent = fs.readFileSync(filePath, 'utf8');
      
      // Check that the file doesn't contain problematic window references
      // Allow 'window' in comments but not in actual code
      const codeLines = fileContent.split('\n')
        .filter(line => !line.trim().startsWith('//') && !line.trim().startsWith('*'));
      const codeOnly = codeLines.join('\n');
      
      // Should not have typeof window checks or window assignments in the module export section
      expect(codeOnly).not.toMatch(/typeof\s+window\s*!==\s*['"]undefined['"]/);
      expect(codeOnly).not.toMatch(/window\.UpdateService/);
      
      // Verify the file ends with proper module.exports only (no window fallback)
      const lastLines = fileContent.trim().split('\n').slice(-10).join('\n');
      expect(lastLines).toContain('module.exports');
      expect(lastLines).not.toMatch(/window\.UpdateService\s*=/);
    });

    test('should be loadable in a simulated service worker environment', () => {
      // Simulate service worker global scope (no window object)
      const originalWindow = global.window;
      delete global.window;
      
      try {
        // Try to require/reload the module
        delete require.cache[require.resolve('../update-service.js')];
        const UpdateServiceReloaded = require('../update-service.js');
        
        // Should successfully create an instance
        const instance = new UpdateServiceReloaded();
        expect(instance).toBeDefined();
        expect(instance.GITHUB_REPO).toBe('online-picket-line/opl-browser-plugin');
      } finally {
        // Restore window if it existed
        if (originalWindow !== undefined) {
          global.window = originalWindow;
        }
      }
    });

    test('UpdateService class should be available via module.exports', () => {
      const UpdateServiceExported = require('../update-service.js');
      expect(UpdateServiceExported).toBeDefined();
      expect(typeof UpdateServiceExported).toBe('function');
      expect(UpdateServiceExported.name).toBe('UpdateService');
    });
  });
});
