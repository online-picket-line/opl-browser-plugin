// Popup script

// Constants


document.addEventListener('DOMContentLoaded', () => {
  // Display extension version
  const versionDiv = document.getElementById('version-info');
  if (versionDiv && chrome.runtime && chrome.runtime.getManifest) {
    const version = chrome.runtime.getManifest().version;
    versionDiv.textContent = `Version: ${version}`;
  }
  const modeBannerRadio = document.getElementById('mode-banner');
  const modeBlockRadio = document.getElementById('mode-block');
  const statusDiv = document.getElementById('status');
  const statsContent = document.getElementById('stats-content');
  const connectionIndicator = document.getElementById('connection-indicator');
  const connectionText = document.getElementById('connection-text');

  // Load current settings
  chrome.storage.sync.get(['blockMode'], (result) => {
    const blockMode = result.blockMode || false;
    if (blockMode) {
      modeBlockRadio.checked = true;
    } else {
      modeBannerRadio.checked = true;
    }
  });

  // Load stats
  loadStats();

  // Save settings when radio buttons change
  modeBannerRadio.addEventListener('change', () => {
    if (modeBannerRadio.checked) {
      chrome.storage.sync.set({ blockMode: false });
      showStatus('Settings saved', 'success');
    }
  });

  modeBlockRadio.addEventListener('change', () => {
    if (modeBlockRadio.checked) {
      chrome.storage.sync.set({ blockMode: true });
      showStatus('Settings saved', 'success');
    }
  });

  /**
   * Show status message
   * @param {string} message - Status message
   * @param {string} type - Status type (success, error, warning)
   */
  function showStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    
    if (type !== 'warning') {
      setTimeout(() => {
        statusDiv.className = 'status';
      }, 5000);
    }
  }

  /**
   * Load and display stats
   */
  function loadStats() {
    chrome.storage.local.get(['labor_actions', 'cache_timestamp', 'connection_status'], (result) => {
      const actions = result.labor_actions || [];
      const timestamp = result.cache_timestamp;
      
      // Update connection indicator
      const status = result.connection_status || 'online';
      if (connectionIndicator && connectionText) {
        connectionIndicator.style.display = 'inline-flex';
        connectionIndicator.className = `connection-status status-${status}`;
        connectionText.textContent = status.charAt(0).toUpperCase() + status.slice(1);
      }

      const activeActions = actions.filter(a => !a.status || a.status === 'active').length;
      const totalUrls = actions.reduce((sum, a) => sum + (a.target_urls?.length || 0), 0);
      let statsHtml = `<strong>${activeActions}</strong> active labor action${activeActions !== 1 ? 's' : ''}`;
      if (totalUrls > 0) {
        statsHtml += `<br><strong>${totalUrls}</strong> URL${totalUrls !== 1 ? 's' : ''} monitored`;
      }
      if (timestamp) {
        const age = Date.now() - timestamp;
        const minutes = Math.floor(age / 60000);
        const hours = Math.floor(minutes / 60);
        let timeStr;
        if (hours > 0) {
          timeStr = `${hours} hour${hours !== 1 ? 's' : ''} ago`;
        } else if (minutes > 0) {
          timeStr = `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
        } else {
          timeStr = 'just now';
        }
        statsHtml += `<br>Last updated ${timeStr}`;
      } else if (activeActions === 0) {
        statsHtml = 'No data loaded yet<br>Configure API and refresh';
      }
      
      statsHtml += `<br><a href="https://onlinepicketline.com" target="_blank" style="color: inherit; text-decoration: underline; margin-top: 0.5rem; display: inline-block;">More Info at OnlinePicketLine.com</a>`;
      
      statsContent.innerHTML = statsHtml;
    });
  }
});
