# Online Picket Line - Browser Extension

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/online-picket-line/opl-browser-plugin/releases)
[![License](https://img.shields.io/badge/license-ISC-green.svg)](LICENSE)
[![Tests](https://img.shields.io/badge/tests-219%20passed-brightgreen.svg)](tests/)

A cross-browser extension that helps users stay informed about labor actions and boycotts by integrating with the [Online Picketline API](https://github.com/online-picket-line/online-picketline). The extension notifies users when they visit websites associated with active labor actions.

## Features

- **Real-time Labor Action Tracking**: Automatically fetches current labor actions
- **Two Display Modes**:
  - **Banner Mode** (Default): Shows an informational banner at the bottom of the page
  - **Block Mode**: Prevents access to the page with an interstitial screen
- **Smart URL Matching**: Compares current page URLs against labor action targets from employers, social media, and company websites
- **Automatic Updates**: Refreshes labor action data every 15 minutes
- **In-App Update Notifications**: Automatically checks for new extension versions and notifies users
- **Configurable Settings**: User-friendly popup interface for changing behavior
- **Multi-Browser Support**: Compatible with Chrome, Edge, Opera, Brave, Firefox, and Safari

## Prerequisites

No setup required! The extension connects automatically to the Online Picketline API at `https://onlinepicketline.com`. The API is public and rate-limited to ensure fair usage.

## Installation

### Chrome Web Store (Recommended)

**[Install from Chrome Web Store](https://chromewebstore.google.com/detail/online-picket-line-opl/pmfdobekpboegaedaejoepnphopacfog)** - Works with Chrome, Edge, Brave, and other Chromium-based browsers.

### Firefox Add-ons

**[Install from Firefox Add-ons](https://addons.mozilla.org/firefox/addon/online-picket-line/)** - Works with Firefox Desktop and Firefox for Android.

### Opera Add-ons

**[Install from Opera Add-ons](https://addons.opera.com/extensions/details/online-picket-line/)** - Works with Opera and Opera GX.

### Safari (Mac App Store)

**[Download from Mac App Store](https://apps.apple.com/app/online-picket-line/)** - Requires macOS Big Sur (11.0) or later.

### Manual Installation (Development)

#### Chrome/Edge/Brave (Manifest V3)

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the `opl-browser-plugin` directory

#### Firefox (Manifest V3)

1. Download or clone this repository
2. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
3. Click "Load Temporary Add-on"
4. Select `manifest.json` in the `opl-browser-plugin` directory

#### Safari (Development)

1. Download or clone this repository
2. Open Terminal and navigate to the extension directory
3. Convert to Safari App Extension format:
   ```bash
   xcrun safari-web-extension-converter . --app-name "Online Picket Line"
   ```
4. Open the generated Xcode project
5. Build and run the project (⌘R)
6. In Safari, go to Preferences → Extensions and enable "Online Picket Line"

**For detailed Safari instructions, see [SAFARI_SETUP.md](docs/safari_plugin_store/SAFARI_SETUP.md)**

## Setup

After installation:

1. Click the extension icon in your browser toolbar
2. The extension comes pre-configured and connects automatically
3. Click **Refresh Labor Actions** to load the current data
4. Choose your preferred mode (Banner or Block)

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

### Settings

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

## Extension Updates

The extension includes an automatic update notification system:

- **Automatic Checks**: Checks for new versions once every 24 hours
- **GitHub Integration**: Fetches latest releases from the official repository
- **Update Notifications**: Shows a banner in the popup when updates are available
- **One-Click Updates**: Click "Update Now" to go directly to the download page
- **Dismissible**: Dismiss update notifications for specific versions

For more details about the update mechanism, see [UPDATE_MECHANISM.md](docs/UPDATE_MECHANISM.md).

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
