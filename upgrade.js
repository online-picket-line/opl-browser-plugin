// Upgrade mechanism to check for new releases on GitHub

const REPO_OWNER = 'online-picket-line';
const REPO_NAME = 'opl-browser-plugin';
const GITHUB_API_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases/latest`;

/**
 * Check for updates from GitHub releases
 */
async function checkForUpdates() {
  console.log('Checking for updates...');
  try {
    const response = await fetch(GITHUB_API_URL);
    if (!response.ok) {
        console.warn('Update check failed:', response.statusText);
        return;
    }
    const data = await response.json();
    // Remove 'v' prefix if present
    const latestVersion = data.tag_name.replace(/^v/, '');
    const currentVersion = chrome.runtime.getManifest().version;

    console.log(`Current version: ${currentVersion}, Latest version: ${latestVersion}`);

    if (compareVersions(latestVersion, currentVersion) > 0) {
      notifyUpdateAvailable(data.html_url, latestVersion);
    }
  } catch (error) {
    console.error('Failed to check for updates:', error);
  }
}

/**
 * Compare two semantic version strings
 * @param {string} v1 - First version
 * @param {string} v2 - Second version
 * @returns {number} 1 if v1 > v2, -1 if v1 < v2, 0 if equal
 */
function compareVersions(v1, v2) {
  const v1Parts = v1.split('.').map(Number);
  const v2Parts = v2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
    const p1 = v1Parts[i] || 0;
    const p2 = v2Parts[i] || 0;
    if (p1 > p2) return 1;
    if (p1 < p2) return -1;
  }
  return 0;
}

/**
 * Notify the user about the update
 * @param {string} url - URL to the release page
 * @param {string} version - New version string
 */
function notifyUpdateAvailable(url, version) {
  chrome.notifications.create('update-available', {
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title: 'Update Available',
    message: `A new version (${version}) of Online Picket Line is available. Click to download.`,
    priority: 2
  });

  // Add listener for notification click
  // Note: This listener might be added multiple times if not careful, 
  // but since this runs in service worker context which might be transient, 
  // we should ensure we don't duplicate logic. 
  // However, chrome.notifications.onClicked is a global event.
  // A better way is to define the listener outside or ensure it handles the ID correctly.
}

// Handle notification clicks globally
chrome.notifications.onClicked.addListener((notificationId) => {
  if (notificationId === 'update-available') {
    // We need to get the URL. Since we can't pass it easily in the ID, 
    // we might need to fetch it again or store it.
    // Or we can just open the releases page.
    const releasesUrl = `https://github.com/${REPO_OWNER}/${REPO_NAME}/releases/latest`;
    chrome.tabs.create({ url: releasesUrl });
    chrome.notifications.clear(notificationId);
  }
});
