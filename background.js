  }

const apiService = new ApiService();
const allowedBypasses = new Map(); // tabId -> url
// We use chrome.storage.local for blocked states to persist across service worker restarts
// Key format: blocked_tab_${tabId}

// Only register event listeners if not running in Jest
const isJest = typeof process !== 'undefined' && process.env && process.env.JEST_WORKER_ID !== undefined;
if (!isJest) {
  // Check for updates on startup
  chrome.runtime.onStartup.addListener(() => {
    checkForUpdates();
  });

  // Refresh labor actions on installation and periodically
  chrome.runtime.onInstalled.addListener(async () => {
    console.log('Extension installed, fetching labor actions...');
    checkForUpdates(); // Also check on install/update
    await refreshLaborActions();
    // Set default settings
    chrome.storage.sync.get(['blockMode'], (result) => {
      if (result.blockMode === undefined) {
        chrome.storage.sync.set({ blockMode: false }); // Default to banner mode
      }
    });
  });

  // Refresh labor actions periodically (every 15 minutes as recommended by API)
  chrome.alarms.create('refreshLaborActions', { periodInMinutes: 15 });

  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'refreshLaborActions') {
      console.log('Periodic refresh of labor actions');
      refreshLaborActions();
    }
  });
}

/**
 * Fetch and cache labor actions
 * @returns {Promise<boolean>} Success status
 */
export async function refreshLaborActions() {
  try {
    const actions = await apiService.getLaborActions();
    console.log(`Fetched ${actions.length} labor actions`);
    
    // Only register event listeners if not running in Jest
    const isJest = typeof process !== 'undefined' && process.env && process.env.JEST_WORKER_ID !== undefined;

    if (!isJest) {
      // Check for updates on startup
      chrome.runtime.onStartup.addListener(() => {
        checkForUpdates();
      });

      // Refresh labor actions on installation and periodically
      chrome.runtime.onInstalled.addListener(async () => {
        console.log('Extension installed, fetching labor actions...');
        checkForUpdates(); // Also check on install/update
        await refreshLaborActions();
        // Set default settings
        chrome.storage.sync.get(['blockMode'], (result) => {
          if (result.blockMode === undefined) {
            chrome.storage.sync.set({ blockMode: false }); // Default to banner mode
          }
        });
      });

      // Refresh labor actions periodically (every 15 minutes as recommended by API)
      chrome.alarms.create('refreshLaborActions', { periodInMinutes: 15 });

      chrome.alarms.onAlarm.addListener((alarm) => {
        if (alarm.name === 'refreshLaborActions') {
          console.log('Periodic refresh of labor actions');
          refreshLaborActions();
        }
      });

      // Listen for messages from content scripts
      chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'checkUrl') {
          // Check for bypass
          if (sender.tab && allowedBypasses.has(sender.tab.id)) {
            const bypassedUrl = allowedBypasses.get(sender.tab.id);
            if (request.url === bypassedUrl || request.url.startsWith(bypassedUrl)) {
              allowedBypasses.delete(sender.tab.id);
              sendResponse({ bypass: true });
              return true;
            }
          }

          chrome.storage.local.get(['labor_actions'], (result) => {
            const actions = result.labor_actions || [];
            const match = matchUrlToAction(request.url, actions);
            chrome.storage.sync.get(['blockMode'], (settings) => {
              sendResponse({
                match: match,
                blockMode: settings.blockMode || false
              });
            });
          });
          // Return true to indicate async response
          return true;
        } else if (request.action === 'allowBypass') {
          if (sender.tab) {
            allowedBypasses.set(sender.tab.id, request.url);
            // Clear after 1 minute to prevent memory leaks
            setTimeout(() => allowedBypasses.delete(sender.tab.id), 60000);
          }
          sendResponse({ success: true });
          return true;
        } else if (request.action === 'setBlockedState') {
          if (sender.tab) {
            const key = `blocked_tab_${sender.tab.id}`;
            chrome.storage.local.set({ [key]: {
              action: request.data,
              url: request.url,
              timestamp: Date.now()
            }}).then(() => {
              sendResponse({ success: true });
            });
          }
          return true;
        } else if (request.action === 'getBlockedState') {
          if (sender.tab) {
            const key = `blocked_tab_${sender.tab.id}`;
            chrome.storage.local.get([key], (result) => {
              sendResponse(result[key] || null);
            });
          }
          return true;
        } else if (request.action === 'refreshActions') {
          refreshLaborActions().then((success) => {
            if (success) {
              sendResponse({ success: true });
            } else {
              sendResponse({ success: false, error: 'Failed to fetch labor actions. Check API configuration.' });
            }
          });
          return true;
        } else if (request.action === 'clearCache') {
          apiService.clearCache().then(() => {
            sendResponse({ success: true });
          });
          return true;
        }


