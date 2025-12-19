# Safari Setup Guide

This guide provides detailed instructions for setting up the Online Picket Line extension in Safari.

## Prerequisites

- **macOS Big Sur (11.0) or later** - Required for Safari 14+ with Manifest V3 support
- **Xcode 12 or later** - Required for converting and building the extension
- **Safari 14 or later** - The extension uses Manifest V3 features

## Quick Start for Development

The fastest way to test the extension in Safari during development:

1. **Clone or download** this repository to your Mac

2. **Open Terminal** and navigate to the extension directory:
   ```bash
   cd /path/to/opl-browser-plugin
   ```

3. **Convert the extension** to Safari format:
   ```bash
   xcrun safari-web-extension-converter . --app-name "Online Picket Line"
   ```
   
   This creates a new directory called "Online Picket Line" with an Xcode project.

4. **Open the Xcode project**:
   ```bash
   open "Online Picket Line/Online Picket Line.xcodeproj"
   ```

5. **Build and Run** in Xcode:
   - Press ⌘R or click the Run button
   - Safari will launch with the extension loaded
   - The app will appear in your dock (you can quit it after enabling the extension)

6. **Enable the extension** in Safari:
   - Go to Safari → Preferences (⌘,)
   - Click the "Extensions" tab
   - Check the box next to "Online Picket Line"
   - Grant the requested permissions when prompted

7. **Configure the extension**:
   - Click the extension icon in Safari's toolbar
   - Enter your Online Picketline API URL and API key
   - Click "Save Configuration"
   - Click "Test API Connection" to verify

## Alternative: Manual Loading for Quick Testing

If you just want to quickly test without Xcode:

1. **Enable Developer Mode** in Safari:
   - Go to Safari → Preferences → Advanced
   - Check "Show Develop menu in menu bar"

2. **Allow Unsigned Extensions**:
   - Go to Develop → Allow Unsigned Extensions

3. **Load the Extension**:
   - Go to Safari → Preferences → Extensions
   - The extension should appear if you've run the Xcode project once
   - Alternatively, enable "Web Inspector" in Develop menu for debugging

## Distribution via Mac App Store

To distribute the extension to end users through the Mac App Store:

1. **Convert the extension** (if not already done):
   ```bash
   xcrun safari-web-extension-converter . --app-name "Online Picket Line" --bundle-identifier "com.yourcompany.opl-browser-plugin"
   ```

2. **Configure signing** in Xcode:
   - Open the Xcode project
   - Select the project in the navigator
   - Go to "Signing & Capabilities"
   - Select your development team
   - Xcode will automatically manage provisioning profiles

3. **Configure the app**:
   - Update bundle identifier, version, and other metadata
   - Add an app icon (required for Mac App Store)
   - Configure app category (Utilities or Productivity)

4. **Archive and submit**:
   - Build the app for release (Product → Archive)
   - Use Xcode's Organizer to upload to App Store Connect
   - Submit for review following Apple's guidelines

For detailed distribution instructions, see [Apple's Safari Web Extensions documentation](https://developer.apple.com/documentation/safariservices/safari_web_extensions/distributing_your_safari_web_extension).

## Safari-Specific Features

### Compatibility

The Online Picket Line extension is fully compatible with Safari's implementation of the WebExtensions API:

- ✅ **Manifest V3** - Uses the latest manifest format
- ✅ **Storage API** - Settings sync via iCloud when enabled
- ✅ **Background Service Workers** - Efficient background processing
- ✅ **Content Scripts** - Full page interaction support
- ✅ **Web Request API** - URL monitoring for labor actions
- ✅ **Alarms API** - Periodic updates every 15 minutes

### Browser API Polyfill

The extension includes `browser-polyfill.js` which ensures compatibility across all browsers. Safari supports both `chrome.*` and `browser.*` namespaces, but the polyfill guarantees consistent behavior.

### Performance

Safari extensions are optimized for:
- **Energy efficiency** - Minimal battery impact on MacBooks
- **Memory usage** - Low memory footprint
- **Privacy** - No data leaves your device except API calls to your configured instance

## Troubleshooting

### Extension Not Appearing in Safari

1. Make sure you've run the Xcode project at least once
2. Check Safari → Preferences → Extensions
3. Try rebuilding the Xcode project
4. Restart Safari

### "Extension Could Not Be Loaded"

1. Ensure Safari 14+ (macOS Big Sur or later)
2. Check that "Allow Unsigned Extensions" is enabled (Develop menu)
3. Rebuild the extension in Xcode
4. Check Console.app for error messages

### Extension Icon Not Showing

1. Make sure the extension is enabled in Safari Preferences
2. The icon appears in Safari's toolbar (you may need to customize the toolbar)
3. Try disabling and re-enabling the extension

### API Connection Fails

1. Verify your API URL is correct (should start with https://)
2. Check your API key starts with `opk_`
3. Ensure your Mac has internet connectivity
4. Try testing the API URL in a browser first

### Banner/Block Not Showing

1. Click the extension icon to verify labor actions are loaded
2. Check that you're visiting a site in the blocklist
3. Open Safari's Web Inspector (Develop → Show Web Inspector) and check the console for errors
4. Try clicking "Refresh Labor Actions" in the extension popup

## Development Tips

### Debugging

1. **Enable Web Inspector**:
   - Develop → Show Web Inspector
   - Console will show extension logs

2. **Inspect Extension Pages**:
   - Right-click the extension icon → Inspect Extension
   - Debug popup, background, and content scripts

3. **Reload Extension**:
   - Make code changes
   - Rebuild in Xcode (⌘B)
   - Disable and re-enable in Safari Preferences

### File Structure After Conversion

```
Online Picket Line/
├── Online Picket Line.xcodeproj    # Xcode project
├── Online Picket Line (macOS)/     # macOS app wrapper
│   ├── AppDelegate.swift
│   ├── ViewController.swift
│   └── Resources/
└── Shared (Extension)/              # Extension files
    ├── manifest.json
    ├── browser-polyfill.js
    ├── api-service.js
    ├── background.js
    ├── content.js
    ├── popup.html
    └── ...
```

### Making Changes

1. Edit files in the original `opl-browser-plugin` directory
2. Delete the generated "Online Picket Line" directory
3. Re-run the converter command
4. Rebuild in Xcode

## Resources

- [Safari Web Extensions Documentation](https://developer.apple.com/documentation/safariservices/safari_web_extensions)
- [Converting Web Extensions](https://developer.apple.com/documentation/safariservices/safari_web_extensions/converting_a_web_extension_for_safari)
- [Safari Extensions Gallery](https://developer.apple.com/safari/extensions/)
- [WebExtensions API Compatibility](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Browser_support_for_JavaScript_APIs)

## Getting Help

If you encounter issues:

1. Check this guide's troubleshooting section
2. Review the main README.md
3. Check the browser console for error messages
4. Open an issue on the GitHub repository with:
   - Safari version (Help → About Safari)
   - macOS version (Apple menu → About This Mac)
   - Error messages from Console.app or Web Inspector
   - Steps to reproduce the issue

---

**Made with ✊ to support workers' rights and labor organizing**
