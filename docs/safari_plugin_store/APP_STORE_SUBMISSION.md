# Safari App Store Submission Guide

## Overview

Safari web extensions are distributed through the **Mac App Store** as part of a native macOS application. This requires:

1. Apple Developer Program membership ($99/year)
2. Xcode for building the app wrapper
3. App Store Connect account for submission

**Name:** Online Picket Line  
**Version:** 2.0.0  
**Bundle Identifier:** org.onlinepicketline.opl-browser-extension  
**Category:** Utilities or Productivity

## App Store Requirements

### Account Setup

1. **Apple Developer Program**
   - Enroll at https://developer.apple.com/programs/
   - $99/year individual or $299/year organization
   - Required for App Store distribution

2. **App Store Connect**
   - Access at https://appstoreconnect.apple.com
   - Create app record for the extension
   - Configure pricing (Free)

### Required Assets

#### App Icon (1024x1024)

**File:** `docs/safari_plugin_store/app_icon_1024.png`

Requirements:
- 1024x1024 pixels
- PNG format
- Square (iOS rounds corners automatically)
- No transparency
- sRGB color space

Generate from existing icon:
```bash
# Using the SVG source
convert icons/icon.svg -resize 1024x1024 docs/safari_plugin_store/app_icon_1024.png

# Or using sharp in Node.js
node -e "
  const sharp = require('sharp');
  sharp('icons/opl-logo.svg')
    .resize(1024, 1024)
    .png()
    .toFile('docs/safari_plugin_store/app_icon_1024.png');
"
```

#### Screenshots

**Mac Screenshots (Required)**

| Size | Retina | Usage |
|------|--------|-------|
| 1280x800 | Standard | Minimum required |
| 2560x1600 | Retina | Recommended |
| 2880x1800 | Retina | 15" MacBook Pro |

Capture screenshots showing:
1. Extension popup with settings
2. Banner mode on a webpage
3. Block mode full-page notice

**iOS Screenshots (If supporting iOS Safari)**

| Device | Size |
|--------|------|
| iPhone 6.7" | 1290x2796 |
| iPhone 6.5" | 1242x2688 |
| iPad 12.9" | 2048x2732 |

### App Store Listing

#### App Name (30 characters max)

```
Online Picket Line
```

#### Subtitle (30 characters max)

```
Labor Action Awareness
```

#### Description

```
Online Picket Line is a privacy-focused Safari extension that helps you stay informed about labor actions and boycotts. When you visit websites associated with strikes or boycotts, the extension notifies you with clear, actionable information.

KEY FEATURES

• Real-time Notifications
Get instantly notified when visiting websites connected to active labor actions, strikes, or boycotts.

• Privacy-First Design
All URL matching happens locally in your browser. We don't collect your browsing history or personal data. The code is open source for full transparency.

• Flexible Display Options
Choose between non-intrusive banner notifications or full-page notices. You always have the option to proceed to any website.

• Automatic Updates
Labor action data updates automatically every 15 minutes from the Online Picketline API, ensuring you always have current information.

• Cross-Platform Sync
Your preferences sync across your Apple devices via iCloud when Safari sync is enabled.

DESIGNED FOR

• Workers honoring digital picket lines
• Union members staying informed about labor actions
• Consumers making informed purchasing decisions
• Labor organizers spreading awareness

PRIVACY COMMITMENT

We believe in privacy by design:
- No browsing history collection
- No personal data tracking
- No analytics or advertising
- Local URL matching only
- Open source code

DATA USAGE

The extension only connects to:
- Online Picketline API (configurable) - to fetch labor action data
- GitHub API - to check for extension updates

No user data is ever collected or transmitted.

For support, privacy policy, and source code, visit onlinepicketline.com
```

#### Keywords (100 characters total)

```
labor,union,boycott,strike,workers,rights,privacy,notification,picket,activism,solidarity
```

#### What's New (for updates)

```
Version 2.0.0
- New declarativeNetRequest architecture for better performance
- Improved privacy with browser-level URL matching
- Updated UI with better accessibility
- Automatic update notifications
- Bug fixes and performance improvements
```

#### Privacy Policy URL (Required)

```
https://onlinepicketline.com/privacy
```

#### Support URL (Required)

```
https://onlinepicketline.com/support
```

#### Marketing URL

```
https://onlinepicketline.com
```

#### Categories

- **Primary:** Utilities
- **Secondary:** Productivity

#### Age Rating

- **4+** (No objectionable content)

## Building for App Store

### Step 1: Convert Extension

```bash
cd /path/to/opl-browser-plugin

xcrun safari-web-extension-converter . \
  --app-name "Online Picket Line" \
  --bundle-identifier org.onlinepicketline.opl-browser-extension \
  --project-location ~/Desktop
```

### Step 2: Configure Xcode Project

1. Open the generated `.xcodeproj` file

2. **Signing & Capabilities**
   - Select your Apple Developer team
   - Enable automatic signing
   - Set bundle identifier

3. **Build Settings**
   - Set deployment target to macOS 11.0 (Big Sur)
   - Configure architectures (arm64, x86_64)

4. **App Icon**
   - Open Assets.xcassets
   - Drag 1024x1024 icon to AppIcon

5. **Info.plist**
   - Update version to 2.0.0
   - Set bundle identifier
   - Add privacy usage descriptions

### Step 3: Test Locally

```bash
# Build and run
# Press ⌘R in Xcode

# Or command line
xcodebuild -project "Online Picket Line.xcodeproj" \
  -scheme "Online Picket Line (macOS)" \
  -configuration Debug \
  build
```

### Step 4: Archive for Distribution

1. In Xcode: Product → Archive
2. Wait for archive to complete
3. Organizer window opens automatically

### Step 5: Submit to App Store

1. In Organizer, click "Distribute App"
2. Select "App Store Connect"
3. Follow prompts to upload
4. Complete submission in App Store Connect

## App Store Review Guidelines

### Extension-Specific Requirements

1. **Single Purpose**: Extension has one clear function (labor action awareness)
2. **Native Wrapper**: App contains meaningful functionality (settings, help)
3. **No Hidden Features**: All functionality is documented
4. **Privacy**: Clear privacy policy, no undisclosed data collection

### Common Rejection Reasons

1. **Insufficient App Wrapper**
   - Add Settings screen in native app
   - Include Help/About information
   - Provide clear value beyond just the extension

2. **Missing Privacy Policy**
   - Privacy policy URL must be active
   - Must accurately describe data practices

3. **Unclear Functionality**
   - Clearly explain what the extension does
   - Include screenshots showing functionality

### Responding to Rejections

1. Read rejection reason carefully
2. Address ALL issues mentioned
3. Provide detailed explanation of changes
4. Include screenshots if helpful
5. Resubmit through App Store Connect

## Native App Content

The Safari extension wrapper app should include:

### Main View

- Extension status (enabled/disabled)
- Quick access to Safari preferences
- Help documentation link

### Settings View

- API configuration (if applicable)
- Display mode preference
- About/version information

### Help View

- Quick start guide
- FAQ
- Support contact information

## Testing Checklist

### Before Submission

- [ ] Extension loads correctly in Safari
- [ ] Banner mode displays properly
- [ ] Block mode redirects correctly
- [ ] "Proceed Anyway" works
- [ ] Settings persist across sessions
- [ ] API updates fetch correctly
- [ ] No console errors
- [ ] App wrapper opens correctly
- [ ] Help content is accurate
- [ ] Privacy policy link works
- [ ] Support URL works

### Device Testing

- [ ] Intel Mac (x86_64)
- [ ] Apple Silicon Mac (arm64)
- [ ] macOS Big Sur (11.0)
- [ ] macOS Monterey (12.0)
- [ ] macOS Ventura (13.0)
- [ ] macOS Sonoma (14.0)

## Post-Publication

### Updates

1. Update version in manifest.json
2. Rebuild in Xcode
3. Archive and upload
4. Add "What's New" text
5. Submit for review

### Monitoring

- Monitor App Store reviews
- Respond to user feedback
- Track crash reports in Xcode Organizer
- Check App Store Connect analytics

## Timeline Expectations

| Phase | Duration |
|-------|----------|
| Apple Developer enrollment | 1-2 days |
| App build and testing | 1-3 days |
| App Store review | 1-7 days |
| Total | ~2 weeks |

## Resources

- [Safari Web Extensions](https://developer.apple.com/safari/web-extensions/)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [App Store Connect Help](https://help.apple.com/app-store-connect/)
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)

## Support

For submission questions:
- Email: dev@onlinepicketline.org
- GitHub: https://github.com/online-picket-line/opl-browser-plugin/issues
