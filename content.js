// Content script - runs on all pages
(function() {
  'use strict';

  let currentBanner = null;

  /**
   * Check if current page matches any labor actions
   */
  function checkCurrentPage() {
    // Check if user has bypassed the block
    if (sessionStorage.getItem('opl_bypass') === 'true') {
      return;
    }

    chrome.runtime.sendMessage(
      { action: 'checkUrl', url: window.location.href },
      (response) => {
        if (response) {
          if (response.bypass) {
            // User just bypassed the block page, set session flag
            sessionStorage.setItem('opl_bypass', 'true');
            return;
          }

          if (response.match) {
            if (response.blockMode) {
              blockPage(response.match);
            } else {
              showBanner(response.match);
            }
          }
        }
      }
    );

    // Check for forced block on example.com
    if (window.location.hostname === 'example.com') {
      chrome.storage.local.get(['force_block_example'], (result) => {
        if (result.force_block_example) {
          // Clear the flag
          chrome.storage.local.remove(['force_block_example']);
          // Simulate action
          const simulatedAction = {
            title: 'Simulated Labor Action',
            description: 'This is a test block for example.com to demonstrate the blocking functionality.',
            type: 'test',
            url: 'https://onlinepicketline.com'
          };
          chrome.storage.sync.get(['blockMode'], (settings) => {
            if (settings.blockMode) {
              blockPage(simulatedAction);
            } else {
              showBanner(simulatedAction);
            }
          });
        }
      });
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
    const actionType = action.type || 'strike';
    const moreInfoUrl = action.url || action.more_info || '';
    
    // Construct details string
    let details = [];
    if (action.locations && action.locations.length > 0) details.push(action.locations[0]);
    if (action.startDate) details.push(`Since ${new Date(action.startDate).toLocaleDateString()}`);
    const detailsHtml = details.length > 0 ? `<p class="opl-banner-details" style="font-size: 0.8em; opacity: 0.9; margin-top: 2px;">${details.join(' • ')}</p>` : '';

    banner.innerHTML = `
      <div class="opl-banner-content">
        <div class="opl-banner-icon">⚠️</div>
        <div class="opl-banner-text">
          <strong class="opl-banner-title">${escapeHtml(title)}</strong>
          <p class="opl-banner-description">${escapeHtml(description)}</p>
          ${detailsHtml}
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
   * Block the page and redirect to block page
   * @param {Object} action - Labor action data
   */
  function blockPage(action) {
    // Send data to background script to store for the block page
    // We use background storage because sessionStorage is not shared between origins
    chrome.runtime.sendMessage({
      action: 'setBlockedState',
      data: action,
      url: window.location.href
    }, () => {
      // Redirect to block page after data is saved
      const blockPageUrl = chrome.runtime.getURL('block.html');
      window.location.href = blockPageUrl;
    });
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
