# Online Picket Line - Browser Extension

A cross-browser extension that helps users stay informed about labor actions and boycotts by integrating with the [Online Picketline API](https://github.com/online-picket-line/online-picketline). The extension notifies users when they visit websites associated with active labor actions.

## Features

- **Real-time Labor Action Tracking**: Integrates with Online Picketline API to fetch current labor actions
- **Two Display Modes**:
  - **Banner Mode** (Default): Shows an informational banner at the bottom of the page
  - **Block Mode**: Prevents access to the page with an interstitial screen
- **Smart URL Matching**: Compares current page URLs against labor action targets from employers, social media, and company websites
- **Automatic Updates**: Refreshes labor action data every 15 minutes (as recommended by API)
- **In-App Update Notifications**: Automatically checks for new extension versions from GitHub and notifies users
- **API Configuration**: Easy setup with your Online Picketline instance URL (no API key required)
- **Configurable Settings**: User-friendly popup interface for changing behavior
- **Multi-Browser Support**: Compatible with Chrome, Edge, Opera, Brave, Firefox, and Safari

## Prerequisites


Before using this extension, you need:

1. Access to an Online Picketline instance (e.g., `https://your-instance.com`)
2. No API key is required. The API is public and rate-limited (1 request per 2 minutes).


### API Access

**API key is required.** The API uses key-based authentication for external clients:

- **Public API Keys**: Safe for client-side code (browser extensions), 10 requests per 2 minutes per IP
- **Private API Keys**: Server-side only, 100 requests per 15 minutes

Get an API key from your instance administrator or through the API management interface.

## Installation



### Chromium Browsers (Chrome, Edge, Opera, Brave, Vivaldi, etc.)

The extension is fully compatible with all Chromium-based browsers, including Chrome, Edge, Opera, Brave, and Vivaldi.

1. Download or clone this repository
2. Open your Chromium browser and navigate to the extensions page:
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`
   - Opera: `opera://extensions/`
   - Brave: `brave://extensions/`
   - Vivaldi: `vivaldi://extensions/`
3. Enable "Developer mode" (or "Allow extensions from other stores" in Opera)
4. Click "Load unpacked"
5. Select the `opl-browser-plugin` directory
6. The extension should now be installed and work out of the box in any Chromium browser.

**Opera Note:** Opera supports Chrome/Chromium extensions natively. If prompted, enable "Allow extensions from other stores" in Opera's extensions page settings.

**Brave/Vivaldi Note:** These browsers support Chrome/Chromium extensions natively. Use the same installation steps as Chrome. If you encounter any issues, ensure "Developer mode" is enabled in the extensions page.

### Firefox

1. Download or clone this repository
2. Copy `manifest-v2.json` to `manifest.json` (Firefox uses Manifest V2)
   ```bash
   cp manifest-v2.json manifest.json
   ```
3. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
4. Click "Load Temporary Add-on"
5. Select any file in the `opl-browser-plugin` directory
6. The extension should now be installed

### Safari

Safari 14+ supports web extensions using the same WebExtensions API as Chrome and Firefox. The extension is fully compatible with Safari's Manifest V3 implementation.

#### Installation Methods

**Method 1: For Development/Testing (Recommended for trying the extension)**

1. Download or clone this repository
2. Open Terminal and navigate to the extension directory
3. Convert the extension to Safari App Extension format:
   ```bash
   xcrun safari-web-extension-converter . --app-name "Online Picket Line"
   ```
4. Open the generated Xcode project
5. Build and run the project (⌘R)
6. Safari will launch automatically with the extension enabled
7. In Safari, go to Preferences → Extensions and enable "Online Picket Line"

**Method 2: Manual Loading (Quick Testing)**

1. Download or clone this repository
2. Open Safari and go to Safari → Preferences → Advanced
3. Check "Show Develop menu in menu bar"
4. Go to Develop → Allow Unsigned Extensions
5. Go to Safari → Preferences → Extensions
6. Click the "+" button and select the extension directory

**Method 3: Distribution via Mac App Store**

For distributing to end users, the extension must be:
1. Converted using `xcrun safari-web-extension-converter`
2. Signed with an Apple Developer account
3. Submitted to the Mac App Store as part of a Mac app

For detailed instructions, see Apple's [Converting a Web Extension for Safari](https://developer.apple.com/documentation/safariservices/safari_web_extensions/converting_a_web_extension_for_safari) guide.

#### Safari-Specific Notes

- Safari 14+ (macOS Big Sur or later) is required for Manifest V3 support
- The extension uses a browser API polyfill for cross-browser compatibility
- All features work identically to Chrome/Edge versions
- Extension settings sync via iCloud if Safari sync is enabled
- Performance is optimized for Safari's energy efficiency requirements

**Need detailed Safari instructions?** See [SAFARI_SETUP.md](SAFARI_SETUP.md) for comprehensive setup, troubleshooting, and distribution guide.

## Configuration

After installation, you **must configure the extension** before it will work:

1. Click the extension icon in your browser toolbar
2. Enter your **API Base URL** (e.g., `https://your-instance.com`)
3. Enter your **API Key** (e.g., `opl_your_key_here`)
4. Click **Save Configuration**
5. Click **Test API Connection** to verify your setup
6. Click **Refresh Labor Actions** to load the current data

## Usage

### Basic Usage

Once configured, the extension works automatically:

1. When you visit a website associated with a labor action, you'll see either:
   - A red banner at the bottom of the page (Banner Mode)
   - A full-page block screen (Block Mode)

2. Click the extension icon in your browser toolbar to:
   - View the number of active labor actions
   - Switch between Banner and Block modes
   - Manually refresh the labor action database

### Configuration

Click the extension icon to open the popup and configure:

- **Show Banner**: Displays an informational banner (non-intrusive)
- **Block Access**: Prevents access to pages with labor actions

### Banner Mode

In Banner Mode, you'll see:
- Labor action title and description
- A "Learn More" link (if available)
- A close button to dismiss the banner

### Block Mode

In Block Mode, you'll see:
- Full details about the labor action
- Option to "Learn More" about the action
- Option to "Proceed Anyway" to bypass the block
- Option to "Go Back" to the previous page

## Development

### Project Structure

```
opl-browser-plugin/
├── manifest.json          # Chrome/Edge manifest (V3)
├── manifest-v2.json       # Firefox manifest (V2)
├── api-service.js         # API service for fetching labor actions
├── background.js          # Background service worker
├── content.js             # Content script for page injection
├── content.css            # Styles for banner
├── popup.html             # Extension popup UI
├── popup.js               # Popup logic
├── block.html             # Block page UI
├── block.js               # Block page logic
├── icons/                 # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── generate-icons.js      # Icon generation script
```

### Building Icons

If you need to regenerate the icons:

```bash
npm install
node generate-icons.js
```

### API Integration

The extension integrates with the [Online Picketline External API v3.0](https://github.com/online-picket-line/online-picketline/blob/main/API_DOCUMENTATION.md).

**API Endpoint**: `GET /api/blocklist.json`

**Authentication required:** API key via `X-API-Key` header

**Response Format:**
```json
{
  "Employer Name": {
    "moreInfoUrl": "https://example.com/info",
    "matchingUrlRegexes": [
      "example.com",
      "facebook.com/example"
    ],
    "actionDetails": {
      "id": "action-123",
      "organization": "Workers Union Local 456",
      "actionType": "strike",
      "status": "active",
      "description": "Workers striking for better wages",
      "demands": "15% wage increase, healthcare coverage",
      "location": "Detroit, MI",
      "urls": [
        {
          "url": "https://example.com/strike-info",
          "label": "Strike Information"
        }
      ]
    }
  },
  "_optimizedPatterns": {
    "Employer Name": "(example\\.com|facebook\\.com/example)"
  }
}
```

The extension transforms this API response into an internal format for URL matching and display. The `actionResources` field is now available for rich notifications and context.

**Caching**: The extension caches API responses for 5 minutes and automatically refreshes data to stay current with labor actions. The API uses content hash-based caching for efficiency. Rate limits:
- Public API keys: 10 requests per 2 minutes per IP
- Private API keys: 100 requests per 15 minutes

If rate-limited, the extension will use cached data and retry after the specified time.

### Customization

To customize the API endpoint, users can configure it in the extension popup:

1. Click the extension icon
2. Enter the API Base URL for your Online Picketline instance
3. Enter your API key
4. Click "Save Configuration"

For development/testing, you can also modify the default URL in `api-service.js`:

```javascript
const DEFAULT_API_BASE_URL = 'https://your-instance.com';
```

## Extension Updates

The extension includes an automatic update notification system:

- **Automatic Checks**: Checks for new versions once every 24 hours
- **GitHub Integration**: Fetches latest releases from the official repository
- **Update Notifications**: Shows a banner in the popup when updates are available
- **One-Click Updates**: Click "Update Now" to go directly to the download page
- **Dismissible**: Dismiss update notifications for specific versions

For more details about the update mechanism, see [UPDATE_MECHANISM.md](UPDATE_MECHANISM.md).

## Privacy

- The extension only communicates with the configured API endpoint and GitHub (for update checks)
- No personal browsing data is collected or transmitted
- All data is stored locally in your browser
- The extension only activates when visiting sites associated with labor actions
- Update checks use public GitHub API with no authentication required

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

ISC

## Support

For issues, questions, or feature requests, please open an issue on the GitHub repository.

## Acknowledgments

This extension supports worker rights and labor organizing by keeping users informed about ongoing labor actions.
