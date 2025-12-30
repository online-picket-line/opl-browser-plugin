# In-App Update Mechanism

The Online Picket Line browser extension now includes an automatic update checker that notifies users when a new version is available.

## Features

### Automatic Update Checking
- **Periodic Checks**: The extension automatically checks for updates once every 24 hours
- **Startup Check**: Update check runs when the extension is first installed or updated
- **GitHub Integration**: Checks the official GitHub repository releases at `github.com/online-picket-line/opl-browser-plugin`

### User Interface

- **Update Banner**: When a new version is available, a prominent banner appears in the popup
- **Version Information**: Shows current version and latest available version
- **Quick Actions**:
  - **Update Now**: Opens the GitHub releases page where users can download the latest version
  - **Dismiss**: Hides the notification for the current update version

### Smart Notifications
- **Dismissed Updates**: If a user dismisses an update, they won't see the notification again for that specific version
- **Cached Information**: Update information is cached to avoid excessive API calls
- **Rate Limiting**: Respects GitHub API rate limits by checking only once per day

## Architecture

### Files

- **`update-service.js`**: Core service that handles all update checking logic
- **`popup.html`**: Updated with update notification banner UI
- **`popup.js`**: Updated to display update notifications and handle user actions
- **`background.js`**: Integrated with update service for periodic checks
- **`manifest.json`** & **`manifest-v2.json`**: Updated to include update-service.js

### Update Service API

#### Key Methods

**`getCurrentVersion()`**

- Returns the current extension version from manifest

**`checkForUpdate(force = false)`**

- Checks GitHub for the latest release
- Compares with current version
- Returns update info if a new version is available
- Respects 24-hour check interval unless `force` is true

**`getCachedUpdate()`**

- Returns cached update information without making API calls
- Used by popup to display notifications

**`dismissUpdate(version)`**

- Marks a specific version as dismissed by the user
- Prevents repeated notifications for the same version

**`openUpdatePage(url)`**

- Opens the GitHub releases page in a new tab
- Uses the specific release URL if available

## User Flow

1. **Extension is Running**: Background service periodically checks for updates (every 24 hours)
2. **Update Found**: If a newer version exists on GitHub, it's cached locally
3. **User Opens Popup**: Popup queries for cached update information
4. **Notification Displayed**: If an update is available (and not dismissed), banner appears
5. **User Action**:
   - Click "Update Now" → Opens GitHub releases page
   - Click "Dismiss" → Hides notification for this version

## GitHub API Integration

The update checker uses the GitHub REST API v3:

- **Endpoint**: `https://api.github.com/repos/online-picket-line/opl-browser-plugin/releases/latest`
- **Authentication**: Not required (uses public API)
- **Rate Limit**: 60 requests/hour for unauthenticated requests (more than enough for daily checks)

### Release Data Structure
```javascript
{
  version: "1.1.0",           // Parsed from tag_name
  name: "Release Name",        // Release title
  description: "...",          // Release notes (body)
  publishedAt: "2025-01-01",  // Publication date
  htmlUrl: "https://...",      // GitHub release page URL
  downloadUrl: "https://..."   // Direct download link (if available)
}
```

## Version Comparison

The service uses semantic versioning (semver) comparison:

- Versions are split into parts: `[major, minor, patch]`
- Compared part by part from left to right
- Examples:
  - `1.1.0` > `1.0.0` ✅ (newer)
  - `2.0.0` > `1.9.9` ✅ (newer)
  - `1.0.1` > `1.0.0` ✅ (newer)
  - `1.0.0` = `1.0.0` (same)

## Storage

### Local Storage Keys

- `update_last_check`: Timestamp of last update check
- `update_latest_version`: Cached information about the latest release
- `update_dismissed_version`: Version number that was dismissed by user

## Testing

### Manual Testing

1. **Test Update Detection**:

   ```javascript
   // In browser console (extension context):
   chrome.runtime.sendMessage({action: 'checkUpdate'}, console.log);
   ```

2. **Force Update Check**:

   - Temporarily change the version in `manifest.json` to a lower number (e.g., "0.9.0")
   - Reload the extension
   - Open the popup - should see update notification

3. **Test Dismiss Function**:

   - Click "Dismiss" on the update banner
   - Close and reopen popup - banner should not appear
   - Check storage: `chrome.storage.local.get(['update_dismissed_version'], console.log)`

4. **Test Update Page Opening**:

   - Click "Update Now" button
   - Should open GitHub releases page in new tab

### Automated Testing

Create a test file to verify the UpdateService:

```javascript
// Example test structure
const updateService = new UpdateService();

// Test version comparison
console.assert(updateService.compareVersions("1.1.0", "1.0.0") === 1);
console.assert(updateService.compareVersions("1.0.0", "1.1.0") === -1);
console.assert(updateService.compareVersions("1.0.0", "1.0.0") === 0);

// Test current version
console.log("Current version:", updateService.getCurrentVersion());
```

## Future Enhancements

Possible improvements for future versions:

1. **Auto-Download**: Support automatic download of updates (where browser APIs allow)
2. **Release Notes**: Display release notes in the popup
3. **Beta Channel**: Option to check for pre-release versions
4. **Update History**: Show changelog of what's new in each version
5. **Update Reminder**: Configurable reminder frequency
6. **Update Badge**: Show badge on extension icon when update is available

## Browser Compatibility

The update mechanism works in all supported browsers:

- ✅ Chrome/Chromium (Manifest V3)
- ✅ Firefox (Manifest V2)
- ✅ Edge (Manifest V3)
- ✅ Opera (Manifest V3)
- ✅ Brave (Manifest V3)
- ⚠️ Safari (May require additional WebExtension polyfills)

## Troubleshooting

### Updates Not Showing
- Check if 24 hours have passed since last check
- Verify internet connection
- Check browser console for errors
- Manually trigger: `chrome.runtime.sendMessage({action: 'checkUpdate'}, console.log)`

### GitHub API Rate Limit
- Limit: 60 requests/hour per IP (unauthenticated)
- Current usage: ~1 request per day (well within limits)
- If rate limited, wait 1 hour for reset

### Notification Not Dismissing
- Check browser storage permissions
- Verify storage quota not exceeded
- Clear extension storage and retry

## Privacy & Security

- **No User Data**: Update checker only communicates with GitHub API
- **No Tracking**: No analytics or tracking of update checks
- **No Automatic Updates**: Users must manually download and install updates
- **HTTPS Only**: All API calls use secure HTTPS connections
