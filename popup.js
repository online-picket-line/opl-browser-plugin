// Popup script
document.addEventListener('DOMContentLoaded', () => {
  const modeBannerRadio = document.getElementById('mode-banner');
  const modeBlockRadio = document.getElementById('mode-block');
  const refreshBtn = document.getElementById('refresh-btn');
  const statusDiv = document.getElementById('status');
  const statsContent = document.getElementById('stats-content');

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

  // Refresh labor actions
  refreshBtn.addEventListener('click', () => {
    refreshBtn.disabled = true;
    refreshBtn.textContent = 'Refreshing...';
    
    chrome.runtime.sendMessage({ action: 'refreshActions' }, (response) => {
      if (response && response.success) {
        showStatus('Labor actions refreshed successfully', 'success');
        loadStats();
      } else {
        showStatus('Failed to refresh labor actions', 'error');
      }
      
      refreshBtn.disabled = false;
      refreshBtn.textContent = 'Refresh Labor Actions';
    });
  });

  /**
   * Show status message
   * @param {string} message - Status message
   * @param {string} type - Status type (success, error)
   */
  function showStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    
    setTimeout(() => {
      statusDiv.className = 'status';
    }, 3000);
  }

  /**
   * Load and display stats
   */
  function loadStats() {
    chrome.storage.local.get(['labor_actions', 'cache_timestamp'], (result) => {
      const actions = result.labor_actions || [];
      const timestamp = result.cache_timestamp;
      
      const activeActions = actions.filter(a => !a.status || a.status === 'active').length;
      
      let statsHtml = `<strong>${activeActions}</strong> active labor action${activeActions !== 1 ? 's' : ''}`;
      
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
      }
      
      statsContent.innerHTML = statsHtml;
    });
  }
});
