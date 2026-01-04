// Popup script

// Constants


document.addEventListener('DOMContentLoaded', () => {
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

  // Test mode button
  const testModeBtn = document.getElementById('test-mode-btn');
  if (testModeBtn) {
    testModeBtn.addEventListener('click', async () => {
      try {
        // Enable test mode and inject test data
        await enableTestMode();
        showStatus('Test mode enabled! Opening example.com...', 'success');

        // Open example.com in a new tab
        chrome.tabs.create({ url: 'https://example.com' });
      } catch (error) {
        console.error('Error enabling test mode:', error);
        showStatus('Failed to enable test mode', 'error');
      }
    });
  }

  // Save settings when radio buttons change
  modeBannerRadio.addEventListener('change', () => {
    if (modeBannerRadio.checked) {
      chrome.storage.sync.set({ blockMode: false }, () => {
        // Update DNR rules when mode changes
        chrome.runtime.sendMessage({ action: 'updateMode' }, (response) => {
          if (response && response.success) {
            showStatus('Banner mode enabled', 'success');
          } else {
            showStatus('Settings saved (rules update pending)', 'success');
          }
        });
      });
    }
  });

  modeBlockRadio.addEventListener('change', () => {
    if (modeBlockRadio.checked) {
      chrome.storage.sync.set({ blockMode: true }, () => {
        // Update DNR rules when mode changes
        chrome.runtime.sendMessage({ action: 'updateMode' }, (response) => {
          if (response && response.success) {
            showStatus('Block mode enabled', 'success');
          } else {
            showStatus('Settings saved (rules update pending)', 'success');
          }
        });
      });
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
    chrome.storage.local.get(['labor_actions', 'cache_timestamp', 'connection_status', 'upgrade_needed'], (result) => {
      const actions = result.labor_actions || [];
      const timestamp = result.cache_timestamp;
      const upgradeNeeded = result.upgrade_needed || false;

      // Update connection indicator
      const status = result.connection_status || 'online';
      if (connectionIndicator && connectionText) {
        connectionIndicator.style.display = 'inline-flex';
        
        if (upgradeNeeded || status === 'upgrade_needed') {
          connectionIndicator.className = 'connection-status status-upgrade';
          connectionText.textContent = 'Update Available';
        } else {
          connectionIndicator.className = `connection-status status-${status}`;
          connectionText.textContent = status.charAt(0).toUpperCase() + status.slice(1);
        }
      }

      // Show upgrade banner if needed
      if (upgradeNeeded || status === 'upgrade_needed') {
        statsContent.innerHTML = `
          <div class="upgrade-notice">
            <strong>⚠️ Update Required</strong><br>
            <p>A new version of the Online Picket Line extension is available with important updates.</p>
            <p>Please update to continue receiving labor action alerts.</p>
            <a href="https://onlinepicketline.com/extension" target="_blank" class="upgrade-link">
              Get the Latest Version →
            </a>
          </div>
        `;
        return;
      }

      const activeActions = actions.filter(a => (!a.status || a.status === 'active') && !a._isTestAction).length;
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

  /**
   * Enable test mode by injecting test data for example.com
   */
  async function enableTestMode() {
    return new Promise((resolve, reject) => {
      // Get current labor actions
      chrome.storage.local.get(['labor_actions'], (result) => {
        const currentActions = result.labor_actions || [];

        // Create test action for example.com
        const testAction = {
          id: 'test-example-com',
          title: 'TEST MODE: Example Company Workers Strike',
          description: 'This is a test action to demonstrate the Online Picket Line plugin functionality. Workers at Example Company are demanding better wages, improved working conditions, and union recognition. This test will show how the plugin blocks or warns about sites with active labor actions.',
          company: 'Example Company',
          type: 'strike',
          status: 'active',
          more_info: 'https://onlinepicketline.com/about',
          target_urls: ['example.com', 'www.example.com'],
          locations: ['Worldwide'],
          demands: 'Fair wages, safe working conditions, union recognition',
          startDate: new Date().toISOString().split('T')[0],
          contactInfo: 'test@onlinepicketline.com',
          divisions: ['All Divisions'],
          actionResources: [
            {
              title: 'Strike Information',
              url: 'https://onlinepicketline.com/about'
            },
            {
              title: 'How to Support',
              url: 'https://onlinepicketline.com'
            }
          ],
          _isTestAction: true,
          _extensionData: {
            matchingUrlRegexes: ['^https?://(?:www\\.)?example\\.com'],
            moreInfoUrl: 'https://onlinepicketline.com/about',
            actionDetails: {
              id: 'test-example-com',
              organization: 'Example Company',
              actionType: 'strike',
              description: 'Test labor action for plugin verification',
              status: 'active',
              location: 'Worldwide',
              startDate: new Date().toISOString().split('T')[0],
              demands: 'Fair wages, safe working conditions, union recognition',
              contactInfo: 'test@onlinepicketline.com',
              urls: [
                {
                  title: 'Strike Information',
                  url: 'https://onlinepicketline.com/about'
                }
              ]
            }
          }
        };

        // Remove any existing test action and add new one
        const filteredActions = currentActions.filter(a => !a._isTestAction);
        const updatedActions = [...filteredActions, testAction];

        // Save updated actions
        chrome.storage.local.set({
          labor_actions: updatedActions,
          cache_timestamp: Date.now(),
          test_mode_enabled: true
        }, () => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            // Update DNR rules to ensure blocking works immediately
            chrome.runtime.sendMessage({ action: 'updateMode' }, () => {
              // Reload stats to show the new test action
              loadStats();
              resolve();
            });
          }
        });
      });
    });
  }
});
