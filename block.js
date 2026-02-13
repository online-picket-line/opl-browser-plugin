// Block page script - DNR version
// This page is loaded via declarativeNetRequest redirect

// API base URL for resolving relative logo URLs
const API_BASE_URL = 'https://onlinepicketline.com';

document.addEventListener('DOMContentLoaded', async () => {
  const actionTitle = document.getElementById('action-title');
  const actionDescription = document.getElementById('action-description');
  const actionType = document.getElementById('action-type');
  const unionLogo = document.getElementById('union-logo');
  const learnMoreBtn = document.getElementById('learn-more-btn');
  const proceedBtn = document.getElementById('proceed-btn');
  const goBackBtn = document.getElementById('go-back-btn');

  // Detect if DNR API is available (MV3) or if we need webRequest approach (MV2)
  const hasDNR = typeof chrome !== 'undefined' && chrome.declarativeNetRequest;

  // Get the original URL from query params (preferred) or referrer (fallback)
  const urlParams = new URLSearchParams(window.location.search);
  const domainHint = urlParams.get('domain');
  const fullUrl = urlParams.get('url'); // Full URL passed by webRequest redirect
  const referrerUrl = document.referrer || null;
  
  // Reconstruct the original URL - prefer full URL, then domain hint, then referrer
  let originalUrl = null;
  if (fullUrl) {
    originalUrl = decodeURIComponent(fullUrl);
  } else if (domainHint) {
    // Build a basic URL from the domain hint
    originalUrl = `https://${domainHint}`;
  } else if (referrerUrl) {
    originalUrl = referrerUrl;
  }
  
  // Store for use in proceed button
  window.originalUrl = originalUrl;
  window.domainHint = domainHint;

  // Load labor actions from local storage and match against referrer
  try {
    const result = await new Promise((resolve) => {
      chrome.storage.local.get(['labor_actions'], resolve);
    });
    const actions = (result && result.labor_actions) || [];
    
    // Find matching action based on domain hint or original URL
    let matchedAction = null;
    if (domainHint) {
      matchedAction = findMatchingAction(`https://${domainHint}`, actions);
    }
    if (!matchedAction && originalUrl) {
      matchedAction = findMatchingAction(originalUrl, actions);
    }
    
    if (matchedAction) {
      updateUI(matchedAction, originalUrl || `https://${domainHint}`);
    } else {
      // Fallback - show generic message
      actionTitle.textContent = 'Labor Action in Progress';
      actionDescription.textContent = 'This website is currently subject to a labor action. Please consider supporting workers by not crossing this digital picket line.';
    }
  } catch (error) {
    console.error('Error loading labor action data:', error);
    actionTitle.textContent = 'Error Loading Data';
    actionDescription.textContent = 'Could not retrieve labor action details. Please try refreshing.';
  }
  
  /**
   * Find matching action for a URL
   */
  function findMatchingAction(url, actions) {
    if (!url || !actions || actions.length === 0) {
      return null;
    }
    
    const urlToTest = url.toLowerCase();
    
    for (const action of actions) {
      // Skip inactive actions
      if (action.status && action.status !== 'active') {
        continue;
      }
      
      // Check against URL patterns
      const patterns = action._extensionData?.matchingUrlRegexes || 
                      action.matchingUrlRegexes || 
                      action.target_urls || 
                      [];
      
      for (const pattern of patterns) {
        try {
          const regex = new RegExp(pattern, 'i');
          if (regex.test(urlToTest)) {
            return action;
          }
        } catch (_e) {
          // Invalid regex, skip
          continue;
        }
      }
    }
    
    return null;
  }

  function updateUI(action, _originalUrl) {
    if (action) {
      // Display union logo if available - check multiple locations and field names
      // API now returns unionLogoUrl (URLs only, not base64)
      const logoUrl = action.logoUrl || 
                     action._extensionData?.logoUrl || 
                     action._extensionData?.unionLogoUrl ||
                     action._extensionData?.actionDetails?.logoUrl || 
                     action._extensionData?.actionDetails?.unionLogoUrl ||
                     null;
      if (logoUrl) {
        // Handle relative URLs from API (e.g., /union_logos/uaw.png)
        const fullLogoUrl = logoUrl.startsWith('/') 
          ? `${API_BASE_URL}${logoUrl}` 
          : logoUrl;
        unionLogo.src = fullLogoUrl;
        unionLogo.style.display = 'block';
      } else {
        unionLogo.style.display = 'none';
      }

      // Update UI with action data
      actionTitle.textContent = action.title || 'Labor Action in Progress';
      actionDescription.textContent = action.description ||
        'This company is currently subject to a labor action. We encourage you to learn more and support workers.';

      if (action.type) {
        actionType.textContent = action.type.toUpperCase();
      }

      if (action.url || action.more_info) {
        learnMoreBtn.href = action.url || action.more_info;
        learnMoreBtn.style.display = 'inline-block';
      }

      // Show additional details if available
      const detailsContainer = document.getElementById('action-details');
      let hasDetails = false;

      if (action.demands) {
        document.getElementById('action-demands').textContent = action.demands;
        document.getElementById('action-demands-container').style.display = 'block';
        hasDetails = true;
      } else {
        document.getElementById('action-demands-container').style.display = 'none';
      }

      // Build employer name followed by location
      const employer = action.employer || action.employerName || action.employer_name || action.company;
      const location = (action.locations && action.locations.length > 0) ? action.locations.join(', ') : null;
      
      if (employer || location) {
        let displayText = '';
        if (employer && location) {
          displayText = `${employer} - ${location}`;
        } else if (employer) {
          displayText = employer;
        } else {
          displayText = location;
        }
        document.getElementById('action-employer-location').textContent = displayText;
        document.getElementById('action-employer-location-container').style.display = 'block';
        hasDetails = true;
      } else {
        document.getElementById('action-employer-location-container').style.display = 'none';
      }

      if (hasDetails) {
        detailsContainer.style.display = 'block';
      }
    }
  }

  // Handle proceed button - uses DNR session rules (MV3) or message to background (MV2)
  proceedBtn.addEventListener('click', async () => {
    // Get the URL to proceed to - prefer originalUrl, fall back to domain hint
    let urlToProceed = window.originalUrl;
    const domain = window.domainHint;
    
    // If we only have domain hint, construct full URL
    if (!urlToProceed && domain) {
      urlToProceed = `https://${domain}`;
    }
    
    if (urlToProceed) {
      try {
        // Extract domain from URL for bypass rule
        let targetDomain = domain;
        if (!targetDomain) {
          try {
            const url = new URL(urlToProceed);
            targetDomain = url.hostname;
          } catch (_e) {
            targetDomain = urlToProceed;
          }
        }
        
        if (hasDNR) {
          // MV3: Use DNR session rules for bypass
          const bypassRuleId = 990000 + Math.floor(Math.random() * 10000);
          
          await chrome.declarativeNetRequest.updateSessionRules({
            addRules: [{
              id: bypassRuleId,
              priority: 100,
              action: { type: 'allow' },
              condition: {
                urlFilter: `||${targetDomain}`,
                resourceTypes: ['main_frame']
              }
            }]
          });
        } else {
          // MV2/Firefox: Send message to background to add bypass
          await chrome.runtime.sendMessage({
            action: 'addBypass',
            domain: targetDomain,
            url: urlToProceed
          });
          
          // Also set sessionStorage flag for content script
          sessionStorage.setItem('opl_bypass', 'true');
          sessionStorage.setItem('opl_bypass_domain', targetDomain);
        }
        
        // Navigate to the original URL
        window.location.href = urlToProceed;
      } catch (error) {
        console.error('Error adding bypass rule:', error);
        // Fallback: set sessionStorage and try to navigate anyway
        sessionStorage.setItem('opl_bypass', 'true');
        window.location.href = urlToProceed;
      }
    } else {
      // No URL available, show an error or redirect to home
      console.warn('No URL to proceed to');
      window.location.href = 'https://onlinepicketline.com';
    }
  });

  // Handle go back button
  goBackBtn.addEventListener('click', () => {
    // Check if we have a meaningful history to go back to
    // If we came directly from a new tab (like test mode), redirect to onlinepicketline.com
    if (window.history.length <= 2 && window.originalUrl) {
      // History is too short (just the blocked page), go to onlinepicketline.com
      window.location.href = 'https://onlinepicketline.com';
    } else if (window.history.length > 1) {
      window.history.back();
    } else {
      window.close();
    }
  });
});
