// Content script - runs on all pages and all frames
// Block mode is now handled by declarativeNetRequest for better performance
(function() {
  'use strict';

  // Detect if we're running inside an iframe (ad frame)
  var isIframe = false;
  try {
    isIframe = (window.self !== window.top);
  } catch (_e) {
    // Cross-origin iframe — treat as iframe
    isIframe = true;
  }

  // Skip everything in iframes — ad blocker and banner only run in top frame
  if (isIframe) {
    return;
  }

  // API base URL for resolving relative logo URLs
  const API_BASE_URL = 'https://onlinepicketline.com';

  let currentBanner = null;
  let currentInjector = null;

  /**
   * Check if current page matches any labor actions (banner mode only)
   * In block mode, DNR handles the redirect before this script runs
   */
  function checkCurrentPage() {
    // Check if user has bypassed the block (from DNR session rule)
    if (sessionStorage.getItem('opl_bypass') === 'true') {
      return;
    }

    // Start ad blocker independently — read settings + actions directly from storage
    // This avoids depending on the background service worker being awake
    startAdBlockerFromStorage();

    // Check banner via background (needs URL matching logic)
    chrome.runtime.sendMessage(
      { action: 'checkUrlForBanner', url: window.location.href },
      (response) => {
        if (chrome.runtime.lastError) {
          console.log('OPL: Error checking URL:', chrome.runtime.lastError.message);
          return;
        }
        if (!response) return;
        
        var mode = response.mode || (response.blockMode ? 'block' : 'banner');
        
        if (mode === 'banner' && response.match) {
          showBanner(response.match);
        }
      }
    );
  }

  /**
   * Start the ad blocker by reading settings and actions directly from chrome.storage.
   * This is independent of the background service worker — no message round-trip needed.
   */
  function startAdBlockerFromStorage() {
    chrome.storage.sync.get(['adBlockerEnabled'], function(syncResult) {
      if (chrome.runtime.lastError) {
        console.log('OPL Ad Blocker: Error reading settings:', chrome.runtime.lastError.message);
        return;
      }

      var enabled = syncResult && syncResult.adBlockerEnabled === true;
      console.log('OPL Ad Blocker: enabled=' + enabled);

      if (!enabled) return;

      // Read labor actions directly from local storage — no background needed
      chrome.storage.local.get(['labor_actions'], function(localResult) {
        if (chrome.runtime.lastError) {
          console.log('OPL Ad Blocker: Error reading actions:', chrome.runtime.lastError.message);
          return;
        }

        var allActions = (localResult && localResult.labor_actions) || [];
        var actions = allActions.filter(function(a) {
          return !a.status || a.status === 'approved' || a.status === 'active';
        });

        console.log('OPL Ad Blocker: ' + actions.length + ' actions available');

        if (actions.length === 0) {
          console.log('OPL Ad Blocker: No actions in storage. Trying to refresh via background...');
          // Trigger a refresh in the background and retry once
          chrome.runtime.sendMessage({ action: 'refreshActions' }, function() {
            if (chrome.runtime.lastError) return;
            // Retry reading after a short delay
            setTimeout(function() {
              chrome.storage.local.get(['labor_actions'], function(retryResult) {
                if (chrome.runtime.lastError) return;
                var retryActions = ((retryResult && retryResult.labor_actions) || []).filter(function(a) {
                  return !a.status || a.status === 'approved' || a.status === 'active';
                });
                if (retryActions.length > 0) {
                  console.log('OPL Ad Blocker: Got ' + retryActions.length + ' actions after refresh');
                  startInjector(retryActions);
                }
              });
            }, 2000);
          });
          return;
        }

        startInjector(actions);
      });
    });
  }

  /**
   * Start the strike injector with the given actions.
   */
  function startInjector(actions) {
    // Stop any previous injector instance
    if (currentInjector) {
      if (typeof stopStrikeInjector === 'function') {
        stopStrikeInjector();
      }
      currentInjector = null;
    }

    if (typeof initStrikeInjector === 'function') {
      currentInjector = initStrikeInjector(actions);
    } else {
      console.log('OPL Ad Blocker: initStrikeInjector function not available');
    }
  }

  /**
   * Show banner with labor action information
   * @param {Object} action - Labor action data
   */
  function showBanner(action) {
    // Remove existing banner if any
    if (currentBanner) {
      currentBanner.remove();
    }

    // Create banner element
    const banner = document.createElement('div');
    banner.id = 'opl-labor-banner';
    banner.className = 'opl-banner';

    const title = action.title || 'Labor Action in Progress';
    const description = action.description || 'This company is currently subject to a labor action.';
    // const actionType = action.type || 'strike';  // Currently unused
    const moreInfoUrl = action.url || action.more_info || '';
    
    // Check for logoUrl in stored data - handle both direct URL and nested locations
    // API now returns URLs (not base64), which may be relative paths
    let storedLogoUrl = action.logoUrl || 
                        action._extensionData?.logoUrl || 
                        action._extensionData?.unionLogoUrl ||
                        action._extensionData?.actionDetails?.logoUrl || 
                        action._extensionData?.actionDetails?.unionLogoUrl ||
                        '';
    
    // Handle relative URLs from API (e.g., /union_logos/uaw.png)
    if (storedLogoUrl && storedLogoUrl.startsWith('/')) {
      storedLogoUrl = `${API_BASE_URL}${storedLogoUrl}`;
    }

    // Construct employer and location values
    const employer = action.employer || action.employerName || action.employer_name || action.company;
    const location = (action.locations && action.locations.length > 0) ? action.locations[0] : null;

    // Build banner content using safe DOM methods
    const bannerContent = document.createElement('div');
    bannerContent.className = 'opl-banner-content';
    
    // Create logo placeholder (will be filled async if needed)
    const logoContainer = document.createElement('div');
    logoContainer.className = 'opl-banner-logo-container';
    
    // Add logo or icon
    if (storedLogoUrl) {
      // We have a URL stored, use it directly (already resolved above)
      const logo = document.createElement('img');
      logo.src = storedLogoUrl;
      logo.alt = 'Union logo';
      logo.className = 'opl-banner-logo';
      logoContainer.appendChild(logo);
    } else {
      // No stored URL - add placeholder icon, then try to fetch from background
      const iconDiv = document.createElement('div');
      iconDiv.className = 'opl-banner-icon';
      iconDiv.textContent = '⚠️';
      logoContainer.appendChild(iconDiv);
      
      // Request logo from background script (memory cache)
      // Try company first, then title as fallback (title may contain org name)
      const company = action.company || action.title;
      if (company) {
        chrome.runtime.sendMessage({ action: 'getLogo', company: company }, (response) => {
          if (response && response.logo) {
            // Replace icon with logo - handle relative URLs
            let logoUrl = response.logo;
            if (logoUrl.startsWith('/')) {
              logoUrl = `${API_BASE_URL}${logoUrl}`;
            }
            logoContainer.innerHTML = '';
            const logo = document.createElement('img');
            logo.src = logoUrl;
            logo.alt = 'Union logo';
            logo.className = 'opl-banner-logo';
            logoContainer.appendChild(logo);
          }
        });
      }
    }
    bannerContent.appendChild(logoContainer);
    
    // Build text container
    const textDiv = document.createElement('div');
    textDiv.className = 'opl-banner-text';
    
    // Title
    const titleEl = document.createElement('strong');
    titleEl.className = 'opl-banner-title';
    titleEl.textContent = title;
    textDiv.appendChild(titleEl);
    
    // Employer/Location
    if (employer || location) {
      const locationP = document.createElement('p');
      locationP.className = 'opl-banner-employer-location';
      locationP.style.cssText = 'font-size: 0.9em; font-weight: 600; margin-top: 4px;';
      if (employer && location) {
        locationP.textContent = `${employer} - ${location}`;
      } else {
        locationP.textContent = employer || location;
      }
      textDiv.appendChild(locationP);
    }
    
    // Demands
    if (action.demands) {
      const demandsP = document.createElement('p');
      demandsP.className = 'opl-banner-demands';
      demandsP.style.cssText = 'font-size: 0.85em; margin-top: 4px; opacity: 0.95;';
      const demandsStrong = document.createElement('strong');
      demandsStrong.textContent = 'Demands: ';
      demandsP.appendChild(demandsStrong);
      demandsP.appendChild(document.createTextNode(action.demands));
      textDiv.appendChild(demandsP);
    }
    
    // Description
    const descP = document.createElement('p');
    descP.className = 'opl-banner-description';
    descP.style.cssText = 'margin-top: 4px;';
    const descStrong = document.createElement('strong');
    descStrong.textContent = 'Description: ';
    descP.appendChild(descStrong);
    descP.appendChild(document.createTextNode(description));
    textDiv.appendChild(descP);
    
    // Links container
    const linksDiv = document.createElement('div');
    linksDiv.className = 'opl-banner-links';
    linksDiv.style.cssText = 'margin-top: 4px;';
    
    if (moreInfoUrl) {
      const learnMoreLink = document.createElement('a');
      learnMoreLink.href = moreInfoUrl;
      learnMoreLink.target = '_blank';
      learnMoreLink.className = 'opl-banner-link';
      learnMoreLink.textContent = 'Learn More';
      linksDiv.appendChild(learnMoreLink);
      
      const separator = document.createElement('span');
      separator.style.cssText = 'margin: 0 5px; opacity: 0.5;';
      separator.textContent = '|';
      linksDiv.appendChild(separator);
    }
    
    const oplLink = document.createElement('a');
    oplLink.href = 'https://onlinepicketline.com';
    oplLink.target = '_blank';
    oplLink.className = 'opl-banner-link';
    oplLink.style.cssText = 'font-size: 0.8em; opacity: 0.8;';
    oplLink.textContent = 'Online Picket Line - OPL';
    linksDiv.appendChild(oplLink);
    
    textDiv.appendChild(linksDiv);
    bannerContent.appendChild(textDiv);
    
    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'opl-banner-close';
    closeBtn.setAttribute('aria-label', 'Close banner');
    closeBtn.textContent = '×';
    bannerContent.appendChild(closeBtn);
    
    banner.appendChild(bannerContent);

    // Add close button functionality
    closeBtn.addEventListener('click', () => {
      banner.remove();
      currentBanner = null;
    });

    // Append to body
    document.body.appendChild(banner);
    currentBanner = banner;

    // Animate in
    setTimeout(() => {
      banner.classList.add('opl-banner-visible');
    }, 100);
  }

  /**
   * Escape HTML to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  function _escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Check page when content script loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkCurrentPage);
  } else {
    checkCurrentPage();
  }

  // Listen for URL changes in SPAs using a more efficient approach
  // Only monitor for history state changes rather than all DOM mutations
  let lastUrl = window.location.href;

  // Modern approach: use popstate for history changes
  window.addEventListener('popstate', () => {
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
      // Clean up injector on navigation
      if (currentInjector && typeof stopStrikeInjector === 'function') {
        stopStrikeInjector();
        currentInjector = null;
      }
      checkCurrentPage();
    }
  });

  // Also monitor pushState and replaceState for SPAs
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  history.pushState = function() {
    originalPushState.apply(this, arguments);
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
      if (currentInjector && typeof stopStrikeInjector === 'function') {
        stopStrikeInjector();
        currentInjector = null;
      }
      checkCurrentPage();
    }
  };

  history.replaceState = function() {
    originalReplaceState.apply(this, arguments);
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
      if (currentInjector && typeof stopStrikeInjector === 'function') {
        stopStrikeInjector();
        currentInjector = null;
      }
      checkCurrentPage();
    }
  };
})();
