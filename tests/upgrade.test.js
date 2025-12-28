
import { jest } from '@jest/globals';
import fs from 'fs';
import path from 'path';

describe('Upgrade Logic', () => {
    afterEach(() => {
      // Clean up global.chrome and global.fetch
      delete global.chrome;
      delete global.fetch;
      // Remove checkForUpdates from global
      delete global.checkForUpdates;
      // Remove all listeners from chrome.notifications.onClicked if possible
      if (mockChrome && mockChrome.notifications && mockChrome.notifications.onClicked && mockChrome.notifications.onClicked.addListener.mockClear) {
        mockChrome.notifications.onClicked.addListener.mockClear();
      }
    });
  let mockChrome;
  
  beforeEach(() => {
    jest.resetModules();
    // Mock Chrome API
    mockChrome = {
      runtime: {
        getManifest: jest.fn().mockReturnValue({ version: '1.0.0' })
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
    // Always mock fetch for safety
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ tag_name: 'v1.0.0', html_url: 'http://example.com/release' }) });
  });

  function loadUpgradeScript() {
    // ESM-compatible __dirname
    const __filename = new URL(import.meta.url).pathname;
    const __dirname = path.dirname(__filename);
    const upgradePath = path.join(__dirname, '../upgrade.js');
    let content = fs.readFileSync(upgradePath, 'utf8');
    // Wrap in an IIFE to avoid global scope pollution and allow re-execution
    // We also need to expose the function we want to test
    content = `
      (function() {
        ${content}
        global.checkForUpdates = checkForUpdates;
      })();
    `;
    // Execute in the current scope
    eval(content);
  }

  it('should notify when a newer version is available', async () => {
    await loadUpgradeScript();
    // Mock fetch response for a newer version
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ tag_name: 'v1.1.0', html_url: 'http://example.com/release' })
    });
    await checkForUpdates();
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('releases/latest'));
    expect(mockChrome.notifications.create).toHaveBeenCalledWith(
      'update-available',
      expect.objectContaining({
        title: 'Update Available',
        message: expect.stringContaining('1.1.0')
      })
    );
  });

  it('should not notify when version is same or older', async () => {
    await loadUpgradeScript();
    // Mock fetch response for same version
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ tag_name: 'v1.0.0', html_url: 'http://example.com/release' })
    });
    await checkForUpdates();
    expect(mockChrome.notifications.create).not.toHaveBeenCalled();
  });

  it('should handle fetch errors gracefully', async () => {
    await loadUpgradeScript();
    global.fetch.mockRejectedValueOnce(new Error('Network error'));
    await checkForUpdates();
    expect(mockChrome.notifications.create).not.toHaveBeenCalled();
  });

  it('should open release page when notification is clicked', async () => {
    // We need to capture the listener callback
    let notificationCallback;
    mockChrome.notifications.onClicked.addListener.mockImplementation((cb) => {
      notificationCallback = cb;
    });

    await loadUpgradeScript();

    // Verify listener was registered
    expect(mockChrome.notifications.onClicked.addListener).toHaveBeenCalled();
    expect(notificationCallback).toBeDefined();

    // Simulate click
    notificationCallback('update-available');

    expect(mockChrome.tabs.create).toHaveBeenCalledWith(
      expect.objectContaining({ url: expect.stringContaining('releases/latest') })
    );
    expect(mockChrome.notifications.clear).toHaveBeenCalledWith('update-available');
  });
});
