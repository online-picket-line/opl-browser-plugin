# Opera Add-ons Submission Guide

## Extension Overview

**Name:** Online Picket Line - OPL  
**Version:** 2.0.0  
**Category:** Privacy & Security  
**Developer:** Online Picket Line Project

## Extension Description

### Short Description

Informs users about active labor actions and boycotts when visiting associated websites.

### Full Description

Online Picket Line is a browser extension that helps users stay informed about ongoing labor actions and boycotts. The extension integrates with the Online Picketline API to provide real-time information about strikes, boycotts, and other labor organizing efforts.

**Features:**

✅ Real-time labor action notifications using modern declarativeNetRequest API  
✅ Two display modes: informational banner or full-page notification  
✅ Automatic updates of labor action data every 15 minutes  
✅ Privacy-focused: browser-level URL matching, no tracking  
✅ High performance: compiled rules, zero JavaScript overhead  
✅ "Proceed Anyway" option to bypass any blocked page  

**How It Works:**

1. The extension fetches current labor action data from the Online Picketline API
2. When you visit a website associated with an active labor action, you're notified
3. Choose Banner Mode for non-intrusive notifications, or Block Mode for full awareness
4. All URL matching happens locally in your browser - no tracking

**Use Cases:**

- Workers honoring digital picket lines
- Union members staying informed
- Consumers making informed purchasing decisions
- Labor organizers spreading awareness

**Privacy:**

- No browsing history collection
- No personal data tracking
- All URL matching happens locally
- Open source code for transparency

## Opera-Specific Considerations

### Chrome Extension Compatibility

Opera uses the Chromium engine and supports Chrome extensions (Manifest V3). The Online Picket Line extension works natively in Opera without modifications.

### Opera GX Compatibility

The extension is fully compatible with Opera GX:
- Works with GX's CPU/RAM limiters
- Respects Opera GX's gaming focus (minimal resource usage)
- Compatible with Flow and other Opera features

### Sidebar Integration

While the extension primarily uses a popup interface, it can be pinned to Opera's sidebar for quick access.

## Technical Details

### Manifest Version

This extension uses **Manifest V3** with the declarativeNetRequest API, which is fully supported by Opera.

### Permissions

| Permission | Purpose |
|------------|---------|
| `storage` | Store user preferences and cache labor action data |
| `alarms` | Schedule periodic data refresh |
| `declarativeNetRequest` | Browser-level URL matching for block mode |
| `declarativeNetRequestWithHostAccess` | Enable rules on all URLs |
| `host_permissions: <all_urls>` | Access any website for labor action detection |

### Why This Architecture?

**declarativeNetRequest Benefits:**
- Zero JavaScript overhead on non-matching pages
- URL matching at browser engine level
- Cannot access page content (privacy by design)
- Better performance than webRequest
- Required by modern browser store policies

## Required Assets

### Icons

| Size | File | Required |
|------|------|----------|
| 16x16 | `icons/icon16.png` | ✅ Toolbar |
| 48x48 | `icons/icon48.png` | ✅ Extension page |
| 64x64 | `icons/icon64.png` | ✅ Store listing |
| 128x128 | `icons/icon128.png` | ✅ Installation dialog |

### Screenshots

Recommended dimensions: 640x480 or 1280x800 pixels

1. **Extension Popup** (`popup.png`) - Shows settings interface
2. **Banner Mode** (`banner.png`) - Informational banner on webpage
3. **Block Mode** (`block.png`) - Full-page labor action notice

### Promotional Image

- **Small Promo:** 440x280 pixels (recommended)
- Format: PNG or JPG

## Store Listing Content

### Summary (Short)

Stay informed about labor actions and boycotts. Get notified when visiting websites associated with strikes or boycotts.

### Detailed Description

[Use the full description from above]

### Tags/Keywords

- labor
- union
- boycott
- strike
- worker rights
- activism
- privacy
- notification

### Category

Privacy & Security

### Support Information

**Website:** https://onlinepicketline.com  
**Support Email:** support@onlinepicketline.org  
**Privacy Policy:** https://onlinepicketline.com/privacy

## Building for Opera

Opera accepts the same extension package as Chrome.

### Build Steps

```bash
# From the extension directory
cd /path/to/opl-browser-plugin

# Ensure manifest.json is the MV3 version (it should be by default)

# Create ZIP package
zip -r opl-opera.zip . \
  -x "*.git*" \
  -x "node_modules/*" \
  -x "coverage/*" \
  -x "tests/*" \
  -x "*.md" \
  -x "docs/*" \
  -x "manifest-v2.json" \
  -x "stryker.conf.json" \
  -x "jest.stryker.config.js" \
  -x "eslint.config.js"
```

### Testing Locally

1. Open Opera and go to `opera://extensions`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the extension directory
5. Test all functionality

## Submission Checklist

### Pre-Submission

- [x] Extension works in Opera (Manifest V3)
- [x] All icons present and correct sizes
- [x] Screenshots prepared (640x480 or 1280x800)
- [x] Privacy policy URL active
- [x] Support email configured
- [x] No minified/obfuscated code

### Store Listing

- [x] Short description (under 132 characters)
- [x] Full description with features
- [x] Category selected
- [x] Screenshots uploaded
- [x] Promotional image uploaded

### Permissions Justified

Each permission has clear documentation explaining:
- Why it's needed
- What data it accesses
- How it protects user privacy

## Review Process

### Timeline

Opera typically reviews extensions within 2-7 business days.

### Common Review Issues

1. **Excessive Permissions:** We justify each permission in documentation
2. **Privacy Concerns:** Our privacy policy is comprehensive
3. **Performance Issues:** declarativeNetRequest ensures optimal performance
4. **Code Quality:** Source is clean, well-documented, not minified

### Responding to Feedback

If Opera requests changes:
1. Address all feedback points
2. Update version number
3. Resubmit with detailed changelog
4. Respond to reviewer comments

## Post-Publication

### Updates

1. Increment version in `manifest.json`
2. Build new ZIP package
3. Upload to Opera Add-ons
4. Wait for review (usually faster for updates)

### Analytics

Opera provides basic installation/user statistics in the developer dashboard.

### User Support

Monitor:
- Opera Add-ons reviews
- GitHub issues
- Support email

## Differences from Chrome Web Store

| Aspect | Chrome | Opera |
|--------|--------|-------|
| Review Time | 1-3 days | 2-7 days |
| Developer Fee | $5 one-time | Free |
| MV3 Required | Yes | Yes |
| Auto-updates | Yes | Yes |

## Contact

For questions about this submission:
- Email: dev@onlinepicketline.org
- GitHub: https://github.com/online-picket-line/opl-browser-plugin/issues
