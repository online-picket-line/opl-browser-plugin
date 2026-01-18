# Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Install the Extension

**Chrome/Edge:**
1. Go to `chrome://extensions/` or `edge://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select this directory

**Firefox:**
1. Run: `cp manifest-v2.json manifest.json`
2. Go to `about:debugging#/runtime/this-firefox`
3. Click "Load Temporary Add-on"
4. Select any file in this directory

**Safari:**
1. Open Terminal and navigate to this directory
2. Run: `xcrun safari-web-extension-converter . --app-name "Online Picket Line"`
3. Open the generated Xcode project and run (⌘R)
4. In Safari: Preferences → Extensions → Enable "Online Picket Line"

### Step 2: Choose Your Mode

**Banner Mode** (Recommended for first-time users)
- Shows a red informational banner at the bottom of pages
- Non-intrusive and dismissible
- Educates about labor actions

**Block Mode** (For committed supporters)
- Prevents access to pages with labor actions
- Shows full-page interstitial with details
- Option to "Proceed Anyway" if needed

---

## 📊 What It Does

When you visit a website associated with an active labor action:

### Banner Mode Display
```
┌─────────────────────────────────────────────────────────────┐
│ Your webpage content                                         │
│ ...                                                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│ ⚠️  Labor Action: Tech Workers Strike at Example Corp     ✕ │
│     Workers are striking for better wages and conditions.   │
│     Learn More →                                             │
└─────────────────────────────────────────────────────────────┘
```

### Block Mode Display
```
┌─────────────────────────────────────────────────────────────┐
│                          ⚠️                                  │
│                  Access Blocked                              │
│     This page is currently subject to a labor action        │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ STRIKE                                               │   │
│  │ Labor Action: Tech Workers Strike                   │   │
│  │ Workers at Example Corp are striking for better     │   │
│  │ wages, improved working conditions, and union       │   │
│  │ recognition.                                         │   │
│  │                                                      │   │
│  │ example.com                                          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  [ Learn More ]  [ Proceed Anyway ]  [ Go Back ]           │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Troubleshooting

**"No data loaded yet"**
→ Click Refresh to load the latest labor action data

**"Connection failed"**
→ Check your internet connection and try again

**Banner not showing**
→ The current website may not be in the labor action database

---

## 📝 Testing

To test the extension:

1. **Test the extension:** The extension connects automatically to the Online Picketline API and will display banners or blocks when you visit sites with active labor actions

2. **Check the console:** Open browser DevTools (F12) to see debug messages about loaded labor actions

3. **View stats:** Click the extension icon to see:
   - Number of active labor actions
   - Total URLs monitored
   - Last update time

---

## 🎯 Example Use Cases

**As a labor supporter:**
- Keep informed about ongoing strikes and boycotts
- Avoid crossing digital picket lines
- Learn more about why workers are taking action

**As an organizer:**
- Deploy to your team/community
- Track which companies have active campaigns

**As a developer:**
- Fork and customize for your needs
- Integrate with other labor action databases
- Add features specific to your use case

---

## 📚 More Information

- **Full Documentation:** See `README.md`
- **Testing Guide:** See `TESTING.html`
- **Implementation Details:** See `IMPLEMENTATION_SUMMARY.md`
- **API Documentation:** https://github.com/online-picket-line/online-picketline/blob/main/API_DOCUMENTATION.md

---

## 🤝 Support

For help or questions:
1. Check the troubleshooting section above
2. Review the full README.md
3. Open an issue on the GitHub repository

---

**Made with ✊ to support workers' rights and labor organizing**
