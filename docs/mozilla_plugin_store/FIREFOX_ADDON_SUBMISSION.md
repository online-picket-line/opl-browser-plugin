# Firefox Add-ons Submission Guide

## Extension Overview

**Name:** Online Picket Line  
**Version:** 2.0.0  
**Category:** Privacy & Security / Other  
**Add-on ID:** opl@onlinepicketline.org  
**License:** ISC (Open Source)

## Extension Description

### Short Description (250 characters max)

Informs users about active labor actions and boycotts. When you visit a website associated with a strike or boycott, the extension displays a notification to help you make informed decisions.

### Full Description

Online Picket Line is a privacy-first browser extension that helps users stay informed about ongoing labor actions and boycotts. When you visit websites associated with these actions, the extension notifies you with either an informational banner or a full-page notice.

**Key Features:**

🔔 **Real-time Notifications**: Automatically alerts you when visiting websites connected to active labor actions

🛡️ **Privacy-First Design**: 
- All URL matching happens locally in your browser
- No browsing history collection
- No personal data tracking
- Open source for transparency

⚙️ **Flexible Display Options**:
- **Banner Mode**: Non-intrusive notification at the bottom of the page
- **Block Mode**: Full-page notice with option to proceed

🔄 **Automatic Updates**: Fetches current labor action data every 15 minutes

🌐 **Cross-Browser**: Works on Firefox for Desktop and Android

**Use Cases:**
- Workers wanting to honor digital picket lines
- Union members staying informed about labor actions
- Consumers avoiding businesses with active boycotts
- Labor organizers spreading awareness

**Data Sources:**
Integrates with the Online Picketline API to provide current information about strikes, boycotts, and other labor organizing efforts.

**Open Source:**
This extension is open source. Review our code at: https://github.com/online-picket-line/opl-browser-plugin

## Technical Details

### Manifest Version

This extension uses **Manifest V2** for Firefox compatibility, with Manifest V3 support planned for Firefox's full MV3 implementation.

### Minimum Firefox Version

- **Firefox Desktop:** 140.0+
- **Firefox Android:** 142.0+

### Permissions Used

| Permission | Purpose |
|------------|---------|
| `storage` | Store user preferences and cache labor action data locally |
| `tabs` | Open informational links in new tabs when user clicks "Learn More" |
| `webRequest` | Detect navigation to labor action URLs (MV2) |
| `webRequestBlocking` | Redirect to informational page in block mode (MV2) |
| `alarms` | Schedule periodic data refresh every 15 minutes |
| `<all_urls>` | Monitor any website for labor action matches |

### Why `<all_urls>` is Required

Labor actions can affect ANY website:
- Employer corporate sites
- Social media pages (company Facebook/Twitter pages)
- E-commerce sites selling boycotted products
- News sites with company coverage

We cannot predict which domains will have labor actions, as new actions are added regularly targeting any company's web presence.

## Firefox-Specific Notes

### Browser Polyfill

The extension uses the WebExtension browser API polyfill for cross-browser compatibility. This allows us to use the Promise-based `browser.*` API while maintaining Chrome compatibility.

### Android Support

The extension is fully compatible with Firefox for Android:
- Responsive popup UI
- Touch-friendly banner design
- Optimized for mobile performance

### Privacy Features

Firefox users benefit from the same privacy guarantees:
- No tracking or analytics
- Local URL matching only
- No data transmitted except to configured API
- Open source code for verification

## Required Assets

### Icons

| Size | File | Usage |
|------|------|-------|
| 16x16 | `icons/icon16.png` | Toolbar icon |
| 32x32 | `icons/icon32.png` | Toolbar icon (high DPI) |
| 48x48 | `icons/icon48.png` | Extension management |
| 64x64 | `icons/icon64.png` | Add-ons Manager |
| 128x128 | `icons/icon128.png` | Installation dialog |

### Screenshots

Recommended: 1280x800 pixels, PNG format

1. **popup.png** - Extension popup showing settings
2. **banner.png** - Banner mode notification on a webpage
3. **block.png** - Block mode full-page notice

## Submission Checklist

### Before Submission

- [x] Manifest includes `browser_specific_settings.gecko.id`
- [x] Manifest specifies `strict_min_version`
- [x] All permissions are justified in description
- [x] Privacy policy URL is provided
- [x] Source code is not minified (no source submission required)
- [x] Extension tested on Firefox Desktop
- [x] Extension tested on Firefox Android

### Required Information

**Support Email:** support@onlinepicketline.org  
**Support Website:** https://onlinepicketline.com/support  
**Homepage:** https://onlinepicketline.com  
**Privacy Policy:** https://onlinepicketline.com/privacy  
**Source Code:** https://github.com/online-picket-line/opl-browser-plugin

### Categories

- **Desktop Primary:** Privacy & Security
- **Desktop Secondary:** Other
- **Android Primary:** Privacy & Security
- **Android Secondary:** Other

## Building for Firefox

### Using Manifest V2

Firefox requires using the Manifest V2 version of the extension:

```bash
# From the extension directory
cp manifest-v2.json manifest.json

# Create the extension package
zip -r opl-firefox.zip . -x "*.git*" -x "node_modules/*" -x "coverage/*" -x "tests/*" -x "*.md" -x "docs/*" -x "manifest.json.bak"
```

### Testing Locally

1. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select any file in the extension directory
4. Test all functionality

### Signing for Distribution

For distribution outside AMO, extensions must be signed:

```bash
# Using web-ext tool
npm install -g web-ext
web-ext sign --api-key=YOUR_KEY --api-secret=YOUR_SECRET
```

## Review Process Notes

### Expected Review Questions

**Q: Why do you need access to all websites?**
A: Labor actions can target any company's web presence. We cannot predict which domains will have active labor actions, as new strikes and boycotts begin regularly. The extension needs to check all URLs against the labor action database to notify users.

**Q: What data do you collect?**
A: We do not collect any user data. All URL matching happens locally. We only fetch public labor action data from our API. User preferences are stored locally and synced via browser sync if enabled.

**Q: Why webRequestBlocking?**
A: In block mode, we need to redirect users to an informational page before the target site loads. This provides a clear picket line experience where users must acknowledge the labor action before proceeding.

## Update Process

When submitting updates:

1. Increment version in `manifest-v2.json`
2. Update changelog in description
3. Submit new ZIP package
4. Previous version remains available during review

## Contact

For questions about this submission:
- Email: dev@onlinepicketline.org
- GitHub: https://github.com/online-picket-line/opl-browser-plugin/issues
