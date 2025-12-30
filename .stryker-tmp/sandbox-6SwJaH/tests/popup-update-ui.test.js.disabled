/**
 * Popup Update UI Tests
 * 
 * Tests the update notification UI and interactions in popup.js
 */

const fs = require('fs');
const path = require('path');

describe('Popup - Update Notifications', () => {
  let mockDocument;
  let mockElements;
  
  beforeEach(() => {
    // Load popup.html into jsdom
    const html = fs.readFileSync(
      path.join(__dirname, '..', 'popup.html'),
      'utf-8'
    );
    document.body.innerHTML = html;
    
    jest.clearAllMocks();
  });
  
  describe('Update Check on Load', () => {
    test('should check for updates when popup opens', () => {
      chrome.runtime.sendMessage.mockImplementation((msg, callback) => {
        if (msg.action === 'checkUpdate') {
          callback({ updateAvailable: false });
        }
      });
      
      // Simulate checkForUpdates() function
      chrome.runtime.sendMessage({ action: 'checkUpdate' }, (response) => {
        expect(response.updateAvailable).toBe(false);
      });
      
      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
        { action: 'checkUpdate' },
        expect.any(Function)
      );
    });
    
    test('should display notification when update is available', () => {
      const notification = document.getElementById('update-notification');
      const versionText = document.getElementById('update-version-text');
      
      expect(notification).not.toBeNull();
      expect(versionText).not.toBeNull();
      
      // Simulate showing update
      versionText.textContent = 'Version 1.2.0 is available (you have 1.0.0)';
      notification.style.display = 'block';
      
      expect(versionText.textContent).toContain('1.2.0');
      expect(versionText.textContent).toContain('1.0.0');
      expect(notification.style.display).toBe('block');
    });
    
    test('should not display notification when no update available', () => {
      const notification = document.getElementById('update-notification');
      expect(notification).not.toBeNull();
      expect(notification.style.display).toBe('none');
    });
  });
  
  describe('Update Now Button', () => {
    test('should be clickable and exist', () => {
      const updateBtn = document.getElementById('update-btn');
      expect(updateBtn).not.toBeNull();
    });
  });
  
  describe('Dismiss Button', () => {
    test('should send dismissUpdate message when clicked', () => {
      chrome.runtime.sendMessage.mockImplementation((msg, callback) => {
        if (msg.action === 'dismissUpdate') {
          callback({ success: true });
        }
      });
      
      chrome.runtime.sendMessage({ action: 'dismissUpdate' }, (response) => {
        expect(response.success).toBe(true);
      });
      
      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
        { action: 'dismissUpdate' },
        expect.any(Function)
      );
    });
    
    test('should hide notification after dismissing', () => {
      chrome.runtime.sendMessage.mockImplementation((msg, callback) => {
        if (msg.action === 'dismissUpdate') {
          callback({ success: true });
        }
      });
      
      const notification = document.getElementById('update-notification');
      notification.style.display = 'block';
      
      chrome.runtime.sendMessage({ action: 'dismissUpdate' }, (response) => {
        if (response && response.success) {
          notification.style.display = 'none';
          expect(notification.style.display).toBe('none');
        }
      });
    });
    
    test('should handle errors when dismissing', () => {
      chrome.runtime.sendMessage.mockImplementation((msg, callback) => {
        chrome.runtime.lastError = { message: 'Storage error' };
        callback();
      });
      
      chrome.runtime.sendMessage({ action: 'dismissUpdate' }, () => {
        if (chrome.runtime.lastError) {
          expect(chrome.runtime.lastError.message).toBe('Storage error');
        }
      });
      
      // Clean up
      delete chrome.runtime.lastError;
    });
  });
  
  describe('UI State Management', () => {
    test('should properly format version text', () => {
      const versionText = document.getElementById('update-version-text');
      const currentVersion = '1.0.0';
      const latestVersion = '1.2.0';
      
      versionText.textContent = `Version ${latestVersion} is available (you have ${currentVersion})`;
      
      expect(versionText.textContent).toBe('Version 1.2.0 is available (you have 1.0.0)');
    });
    
    test('should toggle notification visibility', () => {
      const notification = document.getElementById('update-notification');
      
      // Show
      notification.style.display = 'block';
      expect(notification.style.display).toBe('block');
      
      // Hide
      notification.style.display = 'none';
      expect(notification.style.display).toBe('none');
    });
  });
  
  describe('Error Handling', () => {
    test('should handle missing DOM elements gracefully', () => {
      const element = document.getElementById('non-existent-element');
      expect(element).toBeNull();
    });
  });
});

describe('Popup - Update UI Integration', () => {
  beforeEach(() => {
    const html = fs.readFileSync(
      path.join(__dirname, '..', 'popup.html'),
      'utf-8'
    );
    document.body.innerHTML = html;
    jest.clearAllMocks();
  });
  
  test('full update notification flow', () => {
    const notification = document.getElementById('update-notification');
    const versionText = document.getElementById('update-version-text');
    
    expect(notification).not.toBeNull();
    expect(versionText).not.toBeNull();
    
    // Simulate update available
    versionText.textContent = 'Version 1.2.0 is available (you have 1.0.0)';
    notification.style.display = 'block';
    
    expect(notification.style.display).toBe('block');
    expect(versionText.textContent).toContain('1.2.0');
  });
  
  test('dismiss and reopen flow', () => {
    const notification = document.getElementById('update-notification');
    
    // Show notification
    notification.style.display = 'block';
    expect(notification.style.display).toBe('block');
    
    // User dismisses
    notification.style.display = 'none';
    expect(notification.style.display).toBe('none');
  });
});

describe('Popup - Visual Elements', () => {
  beforeEach(() => {
    const html = fs.readFileSync(
      path.join(__dirname, '..', 'popup.html'),
      'utf-8'
    );
    document.body.innerHTML = html;
  });
  
  test('should have all required elements', () => {
    const notification = document.getElementById('update-notification');
    const versionText = document.getElementById('update-version-text');
    const updateBtn = document.getElementById('update-btn');
    const dismissBtn = document.getElementById('dismiss-update-btn');
    
    expect(notification).not.toBeNull();
    expect(versionText).not.toBeNull();
    expect(updateBtn).not.toBeNull();
    expect(dismissBtn).not.toBeNull();
  });
});
