# Online Picket Line - Browser Extension

A cross-browser extension that helps users stay informed about labor actions and boycotts. This extension queries an API to get current labor actions and notifies users when they visit websites associated with those actions.

## Features

- **Real-time Labor Action Tracking**: Automatically fetches and caches current labor actions
- **Two Display Modes**:
  - **Banner Mode** (Default): Shows an informational banner at the bottom of the page
  - **Block Mode**: Prevents access to the page with an interstitial screen
- **Smart URL Matching**: Compares current page URLs against labor action targets
- **Automatic Updates**: Refreshes labor action data hourly
- **Configurable Settings**: Easy-to-use popup interface for changing behavior
- **Multi-Browser Support**: Compatible with Chrome, Edge, Firefox, and Safari

## Installation

### Chrome / Edge (Chromium-based browsers)

1. Download or clone this repository
2. Open Chrome/Edge and navigate to `chrome://extensions/` (or `edge://extensions/`)
3. Enable "Developer mode" in the top right
4. Click "Load unpacked"
5. Select the `opl-browser-plugin` directory
6. The extension should now be installed and active

### Firefox

1. Download or clone this repository
2. Copy `manifest-v2.json` to `manifest.json` (Firefox uses Manifest V2)
   ```bash
   cp manifest-v2.json manifest.json
   ```
3. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
4. Click "Load Temporary Add-on"
5. Select any file in the `opl-browser-plugin` directory
6. The extension should now be installed and active

### Safari

Safari requires additional steps for extension packaging:

1. Use Xcode's `xcrun safari-web-extension-converter` tool to convert the extension
2. Follow Apple's official guide for [Converting a Web Extension for Safari](https://developer.apple.com/documentation/safariservices/safari_web_extensions/converting_a_web_extension_for_safari)

## Usage

### Basic Usage

Once installed, the extension works automatically:

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

The extension expects the labor actions API to return data in this format:

```json
[
  {
    "id": "unique-id",
    "title": "Strike at Company X",
    "description": "Workers are striking for better wages and conditions",
    "type": "strike",
    "status": "active",
    "company": "Company X",
    "target_urls": ["example.com", "www.example.com"],
    "url": "https://example.org/more-info",
    "more_info": "https://example.org/more-info"
  }
]
```

**API Endpoint**: `https://api.oplfun.org/labor-actions`

### Customization

To customize the API endpoint, edit `api-service.js`:

```javascript
const API_BASE_URL = 'https://your-api-endpoint.com';
```

## Privacy

- The extension only communicates with the configured API endpoint
- No personal browsing data is collected or transmitted
- All data is stored locally in your browser
- The extension only activates when visiting sites associated with labor actions

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
