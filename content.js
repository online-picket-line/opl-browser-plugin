// Content script - runs on all pages (banner mode only)
// Block mode is now handled by declarativeNetRequest for better performance
(function() {
  'use strict';

  // API base URL for resolving relative logo URLs
  const API_BASE_URL = 'https://onlinepicketline.com';

  let currentBanner = null;

  /**
   * Check if current page matches any labor actions (banner mode only)
   * In block mode, DNR handles the redirect before this script runs
   */
  function checkCurrentPage() {
    // Check if user has bypassed the block (from DNR session rule)
    if (sessionStorage.getItem('opl_bypass') === 'true') {
      return;
    }

    chrome.runtime.sendMessage(
      { action: 'checkUrlForBanner', url: window.location.href },
      (response) => {
        if (response && response.match && !response.blockMode) {
          // Only show banner in banner mode
          // Block mode is handled by DNR redirect
          showBanner(response.match);
        }
      }
    );
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
  function escapeHtml(text) {
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
      checkCurrentPage();
    }
  };

  history.replaceState = function() {
    originalReplaceState.apply(this, arguments);
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
      checkCurrentPage();
    }
  };
})();
