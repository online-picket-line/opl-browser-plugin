# Store Submission Checklist

**Version:** 2.0.0  
**Date:** January 24, 2026

This document tracks the submission status and requirements for all browser extension stores.

## Quick Status

| Store | Manifest | Assets Ready | Docs | Status |
|-------|----------|--------------|------|--------|
| Chrome Web Store | ✅ MV3 | ✅ Complete | ✅ Ready | 🟢 Ready |
| Firefox Add-ons | ✅ MV2 | ⚠️ Need 32/64 icons | ✅ Ready | 🟡 Almost Ready |
| Opera Add-ons | ✅ MV3 | ✅ Complete | ✅ Ready | 🟢 Ready |
| Safari/Mac App Store | ✅ MV3 | ⚠️ Need 1024 icon | ✅ Ready | 🟡 Almost Ready |

## Chrome Web Store

### Requirements

- [x] Manifest V3
- [x] Extension icon 128x128
- [x] Screenshots 1280x800 (1-5)
- [x] Small promo tile 440x280
- [x] Marquee promo 1400x560 (optional but included)
- [x] Privacy policy
- [x] Detailed permission justifications
- [x] Single-purpose description

### Assets Location

```
docs/chrome_plugin_store/
├── CHROME_WEB_STORE_SUBMISSION.md  # Full submission guide
├── store_icon.png                   # 128x128
├── popup.png                        # 640x400 screenshot
├── banner.png                       # 1280x800 screenshot
├── block.png                        # 1280x800 screenshot
├── promo.png                        # 440x280 (NEEDS RESIZE from 300x188)
└── marquee.png                      # 1400x560
```

### Action Items

- [ ] Resize promo.png from 300x188 to 440x280

### Build Command

```bash
cd /path/to/opl-browser-plugin
zip -r opl-chrome.zip . \
  -x "*.git*" \
  -x "node_modules/*" \
  -x "coverage/*" \
  -x "tests/*" \
  -x "docs/*" \
  -x "manifest-v2.json" \
  -x "*.md" \
  -x "stryker.conf.json" \
  -x "jest*.js" \
  -x "eslint*" \
  -x "package*.json" \
  -x "generate-icons.*" \
  -x "*.sh"
```

---

## Firefox Add-ons (Mozilla)

### Requirements

- [x] Manifest V2 (manifest-v2.json)
- [x] Add-on ID in manifest
- [x] Extension icons (16, 48, 128)
- [ ] Extension icons (32, 64) - **MISSING**
- [x] Screenshots 1280x800
- [x] Privacy policy
- [x] Description under 250 chars (short)

### Assets Location

```
docs/mozilla_plugin_store/
├── FIREFOX_ADDON_SUBMISSION.md     # Full submission guide
├── screenshot_popup.png            # To create
├── screenshot_banner.png           # To create
└── screenshot_block.png            # To create

icons/
├── icon16.png                      # ✅ Present
├── icon32.png                      # ❌ MISSING
├── icon48.png                      # ✅ Present
├── icon64.png                      # ❌ MISSING
└── icon128.png                     # ✅ Present
```

### Action Items

- [ ] Generate icon32.png (32x32)
- [ ] Generate icon64.png (64x64)
- [ ] Copy/create Firefox screenshots

### Build Command

```bash
cd /path/to/opl-browser-plugin

# Switch to MV2 manifest
cp manifest.json manifest.json.mv3.bak
cp manifest-v2.json manifest.json

# Create package
zip -r opl-firefox.zip . \
  -x "*.git*" \
  -x "node_modules/*" \
  -x "coverage/*" \
  -x "tests/*" \
  -x "docs/*" \
  -x "manifest.json.*.bak" \
  -x "*.md" \
  -x "stryker.conf.json" \
  -x "jest*.js" \
  -x "eslint*" \
  -x "package*.json" \
  -x "generate-icons.*" \
  -x "*.sh"

# Restore MV3 manifest
mv manifest.json.mv3.bak manifest.json
```

---

## Opera Add-ons

### Requirements

- [x] Manifest V3 (same as Chrome)
- [x] Extension icon 64x64
- [x] Extension icon 128x128
- [x] Screenshots (640x480 or 1280x800)
- [x] Privacy policy

### Assets Location

```
docs/opera_plugin_store/
├── OPERA_ADDON_SUBMISSION.md       # Full submission guide
├── icon.png                        # 64x64 ✅
├── opl.png                         # Promo image
└── promo.png                       # Promo image
```

### Action Items

- [x] All assets ready

### Build Command

Same as Chrome - Opera accepts Chrome extension format.

---

## Safari / Mac App Store

### Requirements

- [x] Manifest V3
- [x] Xcode project (generated via xcrun)
- [ ] App icon 1024x1024 - **MISSING**
- [x] Screenshots (Mac-specific sizes)
- [x] Privacy policy URL
- [x] Support URL
- [ ] Apple Developer account ($99/year)

### Assets Location

```
docs/safari_plugin_store/
├── SAFARI_SETUP.md                 # Development setup
├── APP_STORE_SUBMISSION.md         # App Store submission guide
├── app_icon_1024.png               # ❌ MISSING - need to generate
└── promo.png                       # Promo image
```

### Action Items

- [ ] Generate 1024x1024 app icon
- [ ] Create Mac-specific screenshots (2560x1600)
- [ ] Enroll in Apple Developer Program
- [ ] Build Xcode project

### Build Command

```bash
# Convert to Safari extension
xcrun safari-web-extension-converter /path/to/opl-browser-plugin \
  --app-name "Online Picket Line" \
  --bundle-identifier org.onlinepicketline.opl-browser-extension

# Then build in Xcode
```

---

## Icon Generation Script

Run this to generate missing icons:

```bash
cd /path/to/opl-browser-plugin

# Using Node.js with sharp (already in devDependencies)
node generate-icons.js

# Or manually with ImageMagick
convert icons/icon.svg -resize 32x32 icons/icon32.png
convert icons/icon.svg -resize 64x64 icons/icon64.png
convert icons/icon.svg -resize 1024x1024 docs/safari_plugin_store/app_icon_1024.png

# Resize Chrome promo tile
convert docs/chrome_plugin_store/promo.png -resize 440x280! docs/chrome_plugin_store/promo_440x280.png
```

---

## Pre-Submission Testing

### All Browsers

- [ ] Extension loads without errors
- [ ] Popup opens and displays correctly
- [ ] Settings save and persist
- [ ] API connection works
- [ ] Labor actions load
- [ ] Banner mode works
- [ ] Block mode works
- [ ] "Proceed Anyway" bypasses block
- [ ] No console errors

### Chrome-Specific

- [ ] Service worker activates correctly
- [ ] declarativeNetRequest rules apply
- [ ] Alarms fire as expected

### Firefox-Specific

- [ ] webRequest blocking works
- [ ] Works on Firefox Android
- [ ] Browser polyfill works correctly

### Safari-Specific

- [ ] Native app wrapper opens
- [ ] Extension appears in preferences
- [ ] Works on both Intel and Apple Silicon

---

## Submission Timeline

| Task | Estimated Time |
|------|----------------|
| Generate missing assets | 30 minutes |
| Test on all browsers | 2-4 hours |
| Submit to Chrome | 15 minutes |
| Submit to Firefox | 15 minutes |
| Submit to Opera | 15 minutes |
| Build Safari app | 1-2 hours |
| Submit to Mac App Store | 30 minutes |
| **Chrome Review** | 1-3 days |
| **Firefox Review** | 1-5 days |
| **Opera Review** | 2-7 days |
| **Apple Review** | 1-7 days |

---

## Contact Information for Submissions

**Developer Name:** Online Picket Line Project  
**Support Email:** support@onlinepicketline.org  
**Developer Email:** dev@onlinepicketline.org  
**Website:** https://onlinepicketline.com  
**Privacy Policy:** https://onlinepicketline.com/privacy  
**Source Code:** https://github.com/online-picket-line/opl-browser-plugin

---

## Post-Submission

After approval:

1. Update README with store links
2. Create GitHub release v2.0.0
3. Announce on social media
4. Monitor reviews and feedback
5. Set up automatic update checking
