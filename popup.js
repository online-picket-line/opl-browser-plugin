// Popup script

// Constants


document.addEventListener('DOMContentLoaded', () => {
  const modeBannerRadio = document.getElementById('mode-banner');
  const modeBlockRadio = document.getElementById('mode-block');
  const refreshBtn = document.getElementById('refresh-btn');
  const testConfigBtn = document.getElementById('test-config-btn');
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

  // Test API connection
  testConfigBtn.addEventListener('click', () => {
    const apiUrl = 'https://onlinepicketline.com';
    const apiKey = 'opl_02cafecc3361fb5ee303832dde26e3c67f47b94476b55f10b464ba20bfec4f1c';
    
    testConfigBtn.disabled = true;
    testConfigBtn.textContent = 'Testing...';
    statusDiv.className = 'status';
    
    // Test the API connection with required authentication
    fetch(`${apiUrl}/api/blocklist.json?format=extension`, {
      headers: {
        'Accept': 'application/json',
        'X-API-Key': apiKey
      }
    })
      .then(response => {
        if (response.status === 401) {
          throw new Error('Invalid API key');
        }
        if (response.status === 403) {
          throw new Error('API key lacks required permissions');
        }
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After') || '120';
          throw new Error(`Rate limited. Retry after ${retryAfter} seconds`);
        }
        if (!response.ok) {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        const orgCount = Object.keys(data).filter(key => key !== '_optimizedPatterns').length;
        showStatus(`✓ Connected! Found ${orgCount} organizations in Extension format`, 'success');
      })
      .catch(error => {
        showStatus(`✗ Connection failed: ${error.message}`, 'error');
      })
      .finally(() => {
        testConfigBtn.disabled = false;
        testConfigBtn.textContent = 'Test API Connection';
      });
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
        showStatus(response?.error || 'Failed to refresh labor actions', 'error');
      }
      
      refreshBtn.disabled = false;
      refreshBtn.textContent = 'Refresh Labor Actions';
    });
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
    chrome.storage.local.get(['labor_actions', 'cache_timestamp'], (result) => {
      const actions = result.labor_actions || [];
      const timestamp = result.cache_timestamp;
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
      statsContent.innerHTML = statsHtml;
    });
  }
});
