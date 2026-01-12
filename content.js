// Content script - runs on all pages (banner mode only)
// Block mode is now handled by declarativeNetRequest for better performance
(function() {
  'use strict';

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
    // Check multiple locations and field names for logoUrl
    const logoUrl = action.logoUrl || 
                   action._extensionData?.logoUrl || 
                   action._extensionData?.unionImageUrl ||
                   action._extensionData?.actionDetails?.logoUrl ||
                   action._extensionData?.actionDetails?.unionImageUrl ||
                   '';

    // Construct details string
    let details = [];
    
    // Add employer
    const employer = action.employer || action.employerName || action.employer_name;
    if (employer) details.push(employer);
    
    // Add location
    if (action.locations && action.locations.length > 0) details.push(action.locations[0]);
    
    const detailsHtml = details.length > 0 ? `<p class="opl-banner-details" style="font-size: 0.8em; opacity: 0.9; margin-top: 2px;">${details.join(' • ')}</p>` : '';
    
    // Add demands if available
    const demandsHtml = action.demands ? `<p class="opl-banner-demands" style="font-size: 0.85em; margin-top: 4px; opacity: 0.95;"><strong>Demands:</strong> ${escapeHtml(action.demands)}</p>` : '';

    // Build logo HTML if available
    const logoHtml = logoUrl ? `<img src="${escapeHtml(logoUrl)}" alt="Union logo" class="opl-banner-logo" />` : `<div class="opl-banner-icon">⚠️</div>`;

    banner.innerHTML = `
      <div class="opl-banner-content">
        ${logoHtml}
        <div class="opl-banner-text">
          <strong class="opl-banner-title">${escapeHtml(title)}</strong>
          <p class="opl-banner-description">${escapeHtml(description)}</p>
          ${detailsHtml}
          ${demandsHtml}
          <div class="opl-banner-links" style="margin-top: 4px;">
            ${moreInfoUrl ? `<a href="${escapeHtml(moreInfoUrl)}" target="_blank" class="opl-banner-link">Learn More</a><span style="margin: 0 5px; opacity: 0.5;">|</span>` : ''}
            <a href="https://onlinepicketline.com" target="_blank" class="opl-banner-link" style="font-size: 0.8em; opacity: 0.8;">Online Picket Line - OPL</a>
          </div>
        </div>
        <button class="opl-banner-close" aria-label="Close banner">×</button>
      </div>
    `;

    // Add close button functionality
    const closeBtn = banner.querySelector('.opl-banner-close');
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
