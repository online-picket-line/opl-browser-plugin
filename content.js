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
      sessionStorage.removeItem('opl_bypass');
      return;
    }

    chrome.runtime.sendMessage(
      { action: 'checkUrl', url: window.location.href },
      (response) => {
        if (response && response.match) {
          if (response.blockMode) {
            blockPage(response.match);
          } else {
            showBanner(response.match);
          }
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
    const actionType = action.type || 'strike';
    const moreInfoUrl = action.url || action.more_info || '';
    
    banner.innerHTML = `
      <div class="opl-banner-content">
        <div class="opl-banner-icon">⚠️</div>
        <div class="opl-banner-text">
          <strong class="opl-banner-title">${escapeHtml(title)}</strong>
          <p class="opl-banner-description">${escapeHtml(description)}</p>
          ${moreInfoUrl ? `<a href="${escapeHtml(moreInfoUrl)}" target="_blank" class="opl-banner-link">Learn More</a>` : ''}
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
    // Store action data for block page
    sessionStorage.setItem('opl_blocked_action', JSON.stringify(action));
    sessionStorage.setItem('opl_blocked_url', window.location.href);
    
    // Redirect to block page
    const blockPageUrl = chrome.runtime.getURL('block.html');
    window.location.href = blockPageUrl;
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
