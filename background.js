// Background script - works as service worker (MV3) or background script (MV2)
console.log('OPL Background script starting...');

// ============================================================================
// INLINE WebRequestService for Firefox MV2 (avoids file loading issues)
// ============================================================================
function WebRequestService() {
  this.isListenerActive = false;
  this.laborActions = [];
  this.blockMode = false;
  this.bypassedDomains = {};
  this._boundHandler = null;
}

WebRequestService.prototype.isDomainBypassed = function(url) {
  try {
    var hostname = new URL(url).hostname.toLowerCase();
    for (var domain in this.bypassedDomains) {
      if (this.bypassedDomains.hasOwnProperty(domain)) {
        if (hostname === domain || hostname.endsWith('.' + domain)) {
          return true;
        }
      }
    }
  } catch (e) {}
  return false;
};

WebRequestService.prototype.addBypass = function(domain) {
  if (domain) {
    this.bypassedDomains[domain.toLowerCase()] = true;
    console.log('Added bypass for domain:', domain);
  }
};

WebRequestService.prototype.matchUrlToAction = function(url) {
  if (!url || !this.laborActions || this.laborActions.length === 0) return null;
  try {
    var urlToTest = url.toLowerCase();
    for (var i = 0; i < this.laborActions.length; i++) {
      var action = this.laborActions[i];
      if (action.status && action.status !== 'active') continue;
      
      if (action._extensionData && action._extensionData.matchingUrlRegexes) {
        var patterns = action._extensionData.matchingUrlRegexes;
        for (var j = 0; j < patterns.length; j++) {
          try {
            if (new RegExp(patterns[j], 'i').test(urlToTest)) return action;
          } catch (e) {}
        }
      } else {
        var hostname = new URL(url).hostname.toLowerCase();
        var targets = action.target_urls || action.targets || action.domains || [];
        for (var k = 0; k < targets.length; k++) {
          var target = targets[k].toLowerCase();
          if (hostname === target || hostname.endsWith('.' + target)) return action;
        }
      }
    }
  } catch (error) { console.error('Error matching URL:', error); }
  return null;
};

WebRequestService.prototype.handleRequest = function(details) {
  if (details.type !== 'main_frame') return;
  console.log('WebRequest intercepted:', details.url, 'blockMode:', this.blockMode);
  if (!this.blockMode) return;
  if (this.isDomainBypassed(details.url)) {
    console.log('Allowing bypassed URL:', details.url);
    return;
  }
  var match = this.matchUrlToAction(details.url);
  if (match) {
    console.log('BLOCKING URL:', details.url, 'Action:', match.title);
    var domain = '';
    try { domain = new URL(details.url).hostname; } catch (e) { domain = details.url.split('/')[2] || ''; }
    var api = (typeof browser !== 'undefined') ? browser : chrome;
    var blockPageUrl = api.runtime.getURL('block.html');
    return { redirectUrl: blockPageUrl + '?domain=' + encodeURIComponent(domain) + '&url=' + encodeURIComponent(details.url) };
  }
};

WebRequestService.prototype.updateRules = function(laborActions, blockMode) {
  this.laborActions = laborActions || [];
  this.blockMode = blockMode;
  console.log('WebRequest updateRules: ' + this.laborActions.length + ' actions, blockMode=' + blockMode);
  if (blockMode && !this.isListenerActive) {
    this.startListener();
  } else if (!blockMode && this.isListenerActive) {
    this.stopListener();
  }
  return Promise.resolve(true);
};

WebRequestService.prototype.startListener = function() {
  if (this.isListenerActive) return;
  console.log('Starting WebRequest listener...');
  var self = this;
  this._boundHandler = function(details) { return self.handleRequest(details); };
  var api = (typeof browser !== 'undefined' && browser.webRequest) ? browser.webRequest : chrome.webRequest;
  if (!api) { console.error('WebRequest API not available!'); return; }
  try {
    api.onBeforeRequest.addListener(this._boundHandler, { urls: ['<all_urls>'], types: ['main_frame'] }, ['blocking']);
    this.isListenerActive = true;
    console.log('WebRequest listener STARTED successfully');
  } catch (err) { console.error('Failed to start listener:', err); }
};

WebRequestService.prototype.stopListener = function() {
  if (!this.isListenerActive) return;
  var api = (typeof browser !== 'undefined' && browser.webRequest) ? browser.webRequest : chrome.webRequest;
  if (api && this._boundHandler) api.onBeforeRequest.removeListener(this._boundHandler);
  this.isListenerActive = false;
  this._boundHandler = null;
  console.log('WebRequest listener stopped');
};

WebRequestService.prototype.clearRules = function() { this.stopListener(); this.laborActions = []; return Promise.resolve(true); };
WebRequestService.prototype.addBypassRule = function(url) { try { this.addBypass(new URL(url).hostname); } catch(e){} return Promise.resolve(true); };
WebRequestService.prototype.getRuleStats = function() { return Promise.resolve({ totalRules: this.laborActions.length, listenerActive: this.isListenerActive, blockMode: this.blockMode }); };

// ============================================================================
// END WebRequestService
// ============================================================================

// Detect environment
var isMV3 = typeof importScripts === 'function';
var hasDNR = isMV3 && typeof chrome !== 'undefined' && chrome.declarativeNetRequest && typeof chrome.declarativeNetRequest.updateDynamicRules === 'function';

console.log('Environment: isMV3=' + isMV3 + ', hasDNR=' + hasDNR);

// Load dependencies for MV3
if (isMV3) {
  importScripts('browser-polyfill.js');
  importScripts('api-service.js');
  if (hasDNR) {
    importScripts('dnr-service.js');
  }
}

var apiService = new ApiService();

// Select blocking service
var blockingService;
if (hasDNR && typeof DnrService !== 'undefined') {
  blockingService = new DnrService();
  console.log('Using DNR service (MV3)');
} else {
  // Use inline WebRequestService for MV2/Firefox
  blockingService = new WebRequestService();
  console.log('Using WebRequest service (MV2/Firefox) - INLINE VERSION');
}

// Refresh labor actions on installation
chrome.runtime.onInstalled.addListener(function() {
  console.log('Extension installed, fetching labor actions...');
  refreshLaborActions();
  chrome.storage.sync.get(['blockMode'], function(result) {
    if (result.blockMode === undefined) {
      chrome.storage.sync.set({ blockMode: false });
    }
  });
});

chrome.alarms.onAlarm.addListener(function(alarm) {
  if (alarm.name === 'refreshLaborActions') {
    console.log('Periodic refresh of labor actions');
    refreshLaborActions();
  }
});

function refreshLaborActions() {
  apiService.getLaborActions().then(function(actions) {
    console.log('Fetched ' + actions.length + ' labor actions');
    chrome.storage.local.set({
      labor_actions: actions,
      connection_status: 'online',
      failure_count: 0
    }, function() {
      chrome.storage.sync.get(['blockMode'], function(settings) {
        var blockMode = (settings && settings.blockMode) || false;
        console.log('Current blockMode:', blockMode);
        blockingService.updateRules(actions, blockMode);
      });
    });
  }).catch(function(error) {
    console.error('Failed to refresh labor actions:', error);
    chrome.storage.local.get(['failure_count'], function(result) {
      var currentFailures = ((result && result.failure_count) || 0) + 1;
      var updates = { failure_count: currentFailures };
      if (currentFailures >= 3) updates.connection_status = 'offline';
      chrome.storage.local.set(updates);
    });
  });
}

function matchUrlToAction(url, actions) {
  if (!url || !actions || actions.length === 0) return null;
  try {
    var urlToTest = url.toLowerCase();
    for (var i = 0; i < actions.length; i++) {
      var action = actions[i];
      if (action.status && action.status !== 'active') continue;
      if (action._extensionData && action._extensionData.matchingUrlRegexes) {
        var patterns = action._extensionData.matchingUrlRegexes;
        for (var j = 0; j < patterns.length; j++) {
          try { if (new RegExp(patterns[j], 'i').test(urlToTest)) return action; } catch(e){}
        }
      } else {
        var hostname = new URL(url).hostname.toLowerCase();
        var targets = action.target_urls || action.targets || action.domains || [];
        for (var k = 0; k < targets.length; k++) {
          var target = targets[k].toLowerCase();
          if (hostname === target || hostname.endsWith('.' + target)) return action;
        }
        if (action.company) {
          var companyLower = action.company.toLowerCase().replace(/\s+/g, '');
          if (hostname.indexOf(companyLower) !== -1) return action;
        }
      }
    }
  } catch (error) { console.error('Error matching URL:', error); }
  return null;
}

// Message listener
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'checkUrlForBanner' || request.action === 'checkUrl') {
    chrome.storage.local.get(['labor_actions'], function(result) {
      var actions = (result && result.labor_actions) || [];
      var match = matchUrlToAction(request.url, actions);
      chrome.storage.sync.get(['blockMode'], function(settings) {
        sendResponse({ match: match, blockMode: (settings && settings.blockMode) || false });
      });
    });
    return true;
  }
  
  if (request.action === 'refreshActions') {
    refreshLaborActions();
    sendResponse({ success: true });
    return true;
  }
  
  if (request.action === 'clearCache') {
    apiService.clearCache().then(function() { sendResponse({ success: true }); });
    return true;
  }
  
  if (request.action === 'updateMode') {
    chrome.storage.sync.get(['blockMode'], function(settings) {
      var blockMode = (settings && settings.blockMode) || false;
      chrome.storage.local.get(['labor_actions'], function(result) {
        var actions = (result && result.labor_actions) || [];
        blockingService.updateRules(actions, blockMode).then(function() {
          sendResponse({ success: true });
        });
      });
    });
    return true;
  }
  
  if (request.action === 'addBypass') {
    if (blockingService.addBypass) blockingService.addBypass(request.domain);
    sendResponse({ success: true });
    return true;
  }
});

// Initial fetch on startup
refreshLaborActions();

// Check if blockMode is already enabled
chrome.storage.sync.get(['blockMode'], function(result) {
  if (result && result.blockMode) {
    console.log('Block mode already enabled at startup');
    chrome.storage.local.get(['labor_actions'], function(localResult) {
      var actions = (localResult && localResult.labor_actions) || [];
      blockingService.updateRules(actions, true);
    });
  }
});
