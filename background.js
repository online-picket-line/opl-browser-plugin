// Background service worker
importScripts('browser-polyfill.js');
importScripts('api-service.js');
importScripts('dnr-service.js');

const apiService = new ApiService();
const dnrService = new DnrService();

const _allowedBypasses = new Map(); // tabId -> url (reserved for future use)
// We use chrome.storage.local for blocked states to persist across service worker restarts
// Key format: blocked_tab_${tabId}

// Refresh labor actions on installation and periodically
chrome.runtime.onInstalled.addListener(async () => {
  console.log('Extension installed, fetching labor actions...');
  await refreshLaborActions();

  // Set default settings
  chrome.storage.sync.get(['blockMode'], (result) => {
    if (result.blockMode === undefined) {
      chrome.storage.sync.set({ blockMode: false }); // Default to banner mode
    }
  });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'refreshLaborActions') {
    console.log('Periodic refresh of labor actions');
    refreshLaborActions();
  }
});

/**
 * Fetch and cache labor actions, then update DNR rules
 * @returns {Promise<boolean>} Success status
 */
async function refreshLaborActions() {
  try {
    const actions = await apiService.getLaborActions();
    console.log(`Fetched ${actions.length} labor actions`);

    // Store in local storage for quick access
    await chrome.storage.local.set({
      labor_actions: actions,
      connection_status: 'online',
      failure_count: 0
    });

    // Update DNR rules based on current mode
    const settings = await chrome.storage.sync.get(['blockMode']);
    const blockMode = settings.blockMode || false;
    
    await dnrService.updateRules(actions, blockMode);

    return actions.length > 0 || true; // Return true even if empty (successful fetch)
  } catch (error) {
    console.error('Failed to refresh labor actions:', error);

    // Get current failure count
    const result = await chrome.storage.local.get(['failure_count']);
    const currentFailures = (result.failure_count || 0) + 1;

    const updates = {
      failure_count: currentFailures
    };

    if (currentFailures >= 3) {
      updates.connection_status = 'offline';
    }

    await chrome.storage.local.set(updates);

    return false;
  }
}

/**
 * Check if a URL matches any labor actions using optimized extension format
 *
 * Uses the optimized pattern matching from API v3.0 extension format:
 * 1. Tests against optimized combined patterns first (fast)
 * 2. Falls back to individual pattern matching for accuracy
 * 3. Returns full action details for rich notifications
 *
 * @param {string} url - URL to check
 * @param {Array} actions - List of labor actions with _extensionData
 * @returns {Object|null} Matching action object or null if no match found
 */
function matchUrlToAction(url, actions) {
  if (!url || !actions || actions.length === 0) {
    return null;
  }

  try {
    const urlToTest = url.toLowerCase();

    // Check each action using extension format data if available
    for (const action of actions) {
      // Skip inactive actions
      if (action.status && action.status !== 'active') {
        continue;
      }

      // Use extension format data if available (preferred)
      if (action._extensionData && action._extensionData.matchingUrlRegexes) {
        for (const pattern of action._extensionData.matchingUrlRegexes) {
          try {
            const regex = new RegExp(pattern, 'i');
            if (regex.test(urlToTest)) {
              return action;
            }
          } catch (_e) {
            console.warn('Invalid regex pattern:', pattern);
            continue;
          }
        }
      } else {
        // Fallback to legacy target_urls matching
        const hostname = new URL(url).hostname.toLowerCase();
        const targets = action.target_urls || action.targets || action.domains || [];

        for (const target of targets) {
          const targetLower = target.toLowerCase();

          // Match exact domain or subdomain
          if (hostname === targetLower || hostname.endsWith('.' + targetLower)) {
            return action;
          }
        }

        // Fallback: check company name
        if (action.company) {
          const companyLower = action.company.toLowerCase().replace(/\s+/g, '');
          if (hostname.includes(companyLower)) {
            return action;
          }
        }
      }
    }
  } catch (error) {
    console.error('Error matching URL:', error);
  }

  return null;
}

// Listen for messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Banner mode: Check URL for content script
  if (request.action === 'checkUrlForBanner') {
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

    return true; // Async response
  }
  
  // Legacy support for old checkUrl action
  else if (request.action === 'checkUrl') {
    // Redirect to new handler
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

    return true;
  }
  
  // Refresh labor actions and update DNR rules
  else if (request.action === 'refreshActions') {
    refreshLaborActions().then((success) => {
      if (success) {
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false, error: 'Failed to fetch labor actions. Check API configuration.' });
      }
    });
    return true;
  }
  
  // Clear API cache
  else if (request.action === 'clearCache') {
    apiService.clearCache().then(() => {
      sendResponse({ success: true });
    });
    return true;
  }
  
  // Update DNR rules when mode changes
  else if (request.action === 'updateMode') {
    chrome.storage.sync.get(['blockMode'], async (settings) => {
      const blockMode = settings.blockMode || false;
      const result = await chrome.storage.local.get(['labor_actions']);
      const actions = result.labor_actions || [];
      
      await dnrService.updateRules(actions, blockMode);
      sendResponse({ success: true });
    });
    return true;
  }
});

// Initial fetch on startup
refreshLaborActions();
