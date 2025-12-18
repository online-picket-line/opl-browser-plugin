// Background service worker
importScripts('api-service.js');

const apiService = new ApiService();

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

// Refresh labor actions periodically (every hour)
chrome.alarms.create('refreshLaborActions', { periodInMinutes: 60 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'refreshLaborActions') {
    console.log('Periodic refresh of labor actions');
    refreshLaborActions();
  }
});

/**
 * Fetch and cache labor actions
 */
async function refreshLaborActions() {
  try {
    const actions = await apiService.getLaborActions();
    console.log(`Fetched ${actions.length} labor actions`);
    
    // Store in local storage for quick access
    await chrome.storage.local.set({ labor_actions: actions });
  } catch (error) {
    console.error('Failed to refresh labor actions:', error);
  }
}

/**
 * Check if a URL matches any labor actions
 * @param {string} url - URL to check
 * @param {Array} actions - List of labor actions
 * @returns {Object|null} Matching action or null
 */
function matchUrlToAction(url, actions) {
  if (!url || !actions || actions.length === 0) {
    return null;
  }

  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    // Check each action
    for (const action of actions) {
      // Skip inactive actions
      if (action.status && action.status !== 'active') {
        continue;
      }

      // Check if action has target URLs or domains
      const targets = action.target_urls || action.targets || action.domains || [];
      
      for (const target of targets) {
        const targetLower = target.toLowerCase();
        
        // Match exact domain or subdomain
        if (hostname === targetLower || hostname.endsWith('.' + targetLower)) {
          return action;
        }
        
        // Match if target includes protocol
        if (target.includes('://')) {
          try {
            const targetUrl = new URL(target);
            if (hostname === targetUrl.hostname.toLowerCase()) {
              return action;
            }
          } catch (e) {
            // Invalid URL in target, skip
            continue;
          }
        }
      }
      
      // Fallback: check company name if domain not specified
      if (action.company) {
        const companyLower = action.company.toLowerCase().replace(/\s+/g, '');
        if (hostname.includes(companyLower)) {
          return action;
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
  } else if (request.action === 'refreshActions') {
    refreshLaborActions().then(() => {
      sendResponse({ success: true });
    });
    return true;
  }
});

// Initial fetch on startup
refreshLaborActions();
