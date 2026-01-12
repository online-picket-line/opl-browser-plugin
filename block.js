// Block page script - DNR version
// This page is loaded via declarativeNetRequest redirect
document.addEventListener('DOMContentLoaded', async () => {
  const actionTitle = document.getElementById('action-title');
  const actionDescription = document.getElementById('action-description');
  const actionType = document.getElementById('action-type');
  const blockedUrl = document.getElementById('blocked-url');
  const unionLogo = document.getElementById('union-logo');
  const learnMoreBtn = document.getElementById('learn-more-btn');
  const proceedBtn = document.getElementById('proceed-btn');
  const goBackBtn = document.getElementById('go-back-btn');

  // Get the original URL from query params (preferred) or referrer (fallback)
  const urlParams = new URLSearchParams(window.location.search);
  const domainHint = urlParams.get('domain');
  const referrerUrl = document.referrer || null;
  
  // Reconstruct the original URL from domain hint
  let originalUrl = null;
  if (domainHint) {
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
    const result = await chrome.storage.local.get(['labor_actions']);
    const actions = result.labor_actions || [];
    
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
      const displayUrl = domainHint || originalUrl;
      if (displayUrl) {
        try {
          const url = new URL(displayUrl.startsWith('http') ? displayUrl : `https://${displayUrl}`);
          blockedUrl.textContent = url.hostname;
        } catch (_e) {
          blockedUrl.textContent = displayUrl;
        }
      }
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

  function updateUI(action, originalUrl) {
    if (action) {
      // Display union logo if available - check multiple locations and field names
      const logoUrl = action.logoUrl || 
                     action._extensionData?.logoUrl || 
                     action._extensionData?.unionImageUrl ||
                     action._extensionData?.actionDetails?.logoUrl || 
                     action._extensionData?.actionDetails?.unionImageUrl ||
                     '';
      if (logoUrl) {
        unionLogo.src = logoUrl;
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

      if (action.employer || action.employerName || action.employer_name) {
        const employer = action.employer || action.employerName || action.employer_name;
        document.getElementById('action-employer').textContent = employer;
        document.getElementById('action-employer-container').style.display = 'block';
        hasDetails = true;
      } else {
        document.getElementById('action-employer-container').style.display = 'none';
      }

      if (action.locations && action.locations.length > 0) {
        document.getElementById('action-location').textContent = action.locations.join(', ');
        document.getElementById('action-location-container').style.display = 'block';
        hasDetails = true;
      } else {
        document.getElementById('action-location-container').style.display = 'none';
      }

      if (hasDetails) {
        detailsContainer.style.display = 'block';
      }
    }

    if (originalUrl) {
      try {
        const url = new URL(originalUrl);
        blockedUrl.textContent = url.hostname;
      } catch (_e) {
        blockedUrl.textContent = originalUrl;
      }
    }
  }

  // Handle proceed button - uses DNR session rules for bypass
  proceedBtn.addEventListener('click', async () => {
    // Get the URL to proceed to - prefer domain hint, fall back to originalUrl
    let urlToProceed = window.originalUrl;
    const domain = window.domainHint;
    
    // If we only have domain hint, construct full URL
    if (!urlToProceed && domain) {
      urlToProceed = `https://${domain}`;
    }
    
    if (urlToProceed) {
      try {
        // Extract domain from URL for DNR rule
        let targetDomain = domain;
        if (!targetDomain) {
          try {
            const url = new URL(urlToProceed);
            targetDomain = url.hostname;
          } catch (_e) {
            targetDomain = urlToProceed;
          }
        }
        
        // Generate unique ID for this bypass rule
        const bypassRuleId = 990000 + Math.floor(Math.random() * 10000);
        
        // Add temporary session rule with high priority to allow access
        await chrome.declarativeNetRequest.updateSessionRules({
          addRules: [{
            id: bypassRuleId,
            priority: 100, // Much higher than block rules (which have priority 1)
            action: { type: 'allow' },
            condition: {
              urlFilter: `||${targetDomain}`, // Match domain and all subpaths
              resourceTypes: ['main_frame']
            }
          }]
        });
        
        // Navigate to the original URL
        window.location.href = urlToProceed;
      } catch (error) {
        console.error('Error adding bypass rule:', error);
        // Fallback: try to navigate anyway
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
