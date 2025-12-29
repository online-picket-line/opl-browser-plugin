/**
 * Update Service
 * Checks for new releases from GitHub and manages update notifications
 */

class UpdateService {
  constructor() {
    this.GITHUB_REPO = 'online-picket-line/opl-browser-plugin';
    this.GITHUB_API = `https://api.github.com/repos/${this.GITHUB_REPO}/releases/latest`;
    this.CHECK_INTERVAL_HOURS = 24; // Check once per day
    this.STORAGE_KEY_LAST_CHECK = 'update_last_check';
    this.STORAGE_KEY_LATEST_VERSION = 'update_latest_version';
    this.STORAGE_KEY_DISMISSED_VERSION = 'update_dismissed_version';
  }

  /**
   * Get the current extension version from manifest
   * @returns {string} Current version
   */
  getCurrentVersion() {
    return chrome.runtime.getManifest().version;
  }

  /**
   * Parse version string into comparable parts
   * @param {string} version - Version string (e.g., "1.0.0")
   * @returns {Array<number>} Version parts as numbers
   */
  parseVersion(version) {
    return version.split('.').map(num => parseInt(num, 10));
  }

  /**
   * Compare two version strings
   * @param {string} v1 - First version
   * @param {string} v2 - Second version
   * @returns {number} 1 if v1 > v2, -1 if v1 < v2, 0 if equal
   */
  compareVersions(v1, v2) {
    const parts1 = this.parseVersion(v1);
    const parts2 = this.parseVersion(v2);
    
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const num1 = parts1[i] || 0;
      const num2 = parts2[i] || 0;
      
      if (num1 > num2) return 1;
      if (num1 < num2) return -1;
    }
    
    return 0;
  }

  /**
   * Check if enough time has passed since last check
   * @returns {Promise<boolean>} True if should check for updates
   */
  async shouldCheckForUpdate() {
    return new Promise((resolve) => {
      chrome.storage.local.get([this.STORAGE_KEY_LAST_CHECK], (result) => {
        const lastCheck = result[this.STORAGE_KEY_LAST_CHECK];
        
        if (!lastCheck) {
          resolve(true);
          return;
        }
        
        const hoursSinceCheck = (Date.now() - lastCheck) / (1000 * 60 * 60);
        resolve(hoursSinceCheck >= this.CHECK_INTERVAL_HOURS);
      });
    });
  }

  /**
   * Fetch latest release information from GitHub
   * @returns {Promise<Object|null>} Release data or null if failed
   */
  async fetchLatestRelease() {
    try {
      const response = await fetch(this.GITHUB_API, {
        headers: {
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!response.ok) {
        console.error('Failed to fetch release info:', response.status);
        return null;
      }

      const data = await response.json();
      
      return {
        version: data.tag_name.replace(/^v/, ''), // Remove 'v' prefix if present
        name: data.name,
        description: data.body,
        publishedAt: data.published_at,
        htmlUrl: data.html_url,
        downloadUrl: data.assets?.[0]?.browser_download_url || data.html_url
      };
    } catch (error) {
      console.error('Error fetching release info:', error);
      return null;
    }
  }

  /**
   * Check for updates and return update info if available
   * @param {boolean} force - Force check even if recently checked
   * @returns {Promise<Object|null>} Update info or null if no update available
   */
  async checkForUpdate(force = false) {
    try {
      // Check if we should check for updates
      if (!force && !(await this.shouldCheckForUpdate())) {
        console.log('Update check skipped (checked recently)');
        return null;
      }

      // Update last check timestamp
      await chrome.storage.local.set({
        [this.STORAGE_KEY_LAST_CHECK]: Date.now()
      });

      // Fetch latest release
      const release = await this.fetchLatestRelease();
      
      if (!release) {
        return null;
      }

      // Store latest version
      await chrome.storage.local.set({
        [this.STORAGE_KEY_LATEST_VERSION]: release
      });

      const currentVersion = this.getCurrentVersion();
      const comparison = this.compareVersions(release.version, currentVersion);

      // Check if there's a newer version
      if (comparison > 0) {
        console.log(`Update available: ${currentVersion} -> ${release.version}`);
        
        // Check if user dismissed this version
        const dismissed = await this.isDismissed(release.version);
        
        if (!dismissed) {
          return {
            currentVersion,
            latestVersion: release.version,
            releaseInfo: release,
            isNewVersion: true
          };
        } else {
          console.log(`Update ${release.version} was dismissed by user`);
        }
      } else {
        console.log(`Extension is up to date (${currentVersion})`);
      }

      return null;
    } catch (error) {
      console.error('Error checking for updates:', error);
      return null;
    }
  }

  /**
   * Check if a version has been dismissed by the user
   * @param {string} version - Version to check
   * @returns {Promise<boolean>} True if dismissed
   */
  async isDismissed(version) {
    return new Promise((resolve) => {
      chrome.storage.local.get([this.STORAGE_KEY_DISMISSED_VERSION], (result) => {
        const dismissedVersion = result[this.STORAGE_KEY_DISMISSED_VERSION];
        resolve(dismissedVersion === version);
      });
    });
  }

  /**
   * Mark a version as dismissed
   * @param {string} version - Version to dismiss
   * @returns {Promise<void>}
   */
  async dismissUpdate(version) {
    return chrome.storage.local.set({
      [this.STORAGE_KEY_DISMISSED_VERSION]: version
    });
  }

  /**
   * Clear dismissed version (so notification shows again)
   * @returns {Promise<void>}
   */
  async clearDismissed() {
    return chrome.storage.local.remove([this.STORAGE_KEY_DISMISSED_VERSION]);
  }

  /**
   * Get cached update information
   * @returns {Promise<Object|null>} Cached update info
   */
  async getCachedUpdate() {
    return new Promise((resolve) => {
      chrome.storage.local.get([this.STORAGE_KEY_LATEST_VERSION], (result) => {
        const release = result[this.STORAGE_KEY_LATEST_VERSION];
        
        if (!release) {
          resolve(null);
          return;
        }

        const currentVersion = this.getCurrentVersion();
        const comparison = this.compareVersions(release.version, currentVersion);

        if (comparison > 0) {
          resolve({
            currentVersion,
            latestVersion: release.version,
            releaseInfo: release,
            isNewVersion: true
          });
        } else {
          resolve(null);
        }
      });
    });
  }

  /**
   * Open the GitHub releases page or download URL
   * @param {string} url - URL to open (optional, uses latest release if not provided)
   */
  async openUpdatePage(url = null) {
    const targetUrl = url || `https://github.com/${this.GITHUB_REPO}/releases/latest`;
    chrome.tabs.create({ url: targetUrl });
  }
}

// Make it available to other scripts
// Service worker context uses 'self' instead of 'window'
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UpdateService;
}
