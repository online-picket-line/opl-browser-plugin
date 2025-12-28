
// Background service worker (MV3 module)
const isJest = (typeof process !== 'undefined' && process.env && process.env.JEST_WORKER_ID !== undefined) ||
                (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'test');

// Only import browser polyfill and upgrade in production
if (!isJest) {
  await import('./browser-polyfill.js');
  await import('./upgrade.js');
}

import ApiService from './api-service.js';

// Lazy initialization for testability
let apiService;
function getApiService() {
  if (!apiService) {
    apiService = new ApiService();
  }
  return apiService;
}

const allowedBypasses = new Map(); // tabId -> url
// We use chrome.storage.local for blocked states to persist across service worker restarts
// Key format: blocked_tab_${tabId}

// Only register event listeners if not running in Jest
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
    const actions = await getApiService().getLaborActions();
    console.log(`Fetched ${actions.length} labor actions`);
    
    // Store in local storage for quick access
    await chrome.storage.local.set({ 
      labor_actions: actions,
      connection_status: 'online',
      failure_count: 0
    });
    
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
          } catch (e) {
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
    getApiService().clearCache().then(() => {
      sendResponse({ success: true });
    });
    return true;
  }
});

// Initial fetch on startup (skip during Jest tests)
if (typeof process === 'undefined' || !process.env || process.env.JEST_WORKER_ID === undefined) {
  refreshLaborActions();
}
