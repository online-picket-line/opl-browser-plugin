# Browser Store Update Guide

The Online Picket Line browser extension now uses the **standard browser store update mechanism** instead of a custom update service. This is the recommended approach for all browser extensions.

## How Browser Store Updates Work

### Automatic Updates
Modern browsers automatically update extensions without any custom code required:

1. **Chrome/Edge/Brave/Opera** (Chrome Web Store)
   - Extensions automatically update every few hours
   - Users can force an update via `chrome://extensions` → "Update" button
   - No code required in the extension

2. **Firefox** (Firefox Add-ons)
   - Extensions automatically update every 24 hours
   - Users can force an update via `about:addons` → gear icon → "Check for Updates"
   - No code required in the extension

3. **Safari** (App Store)
   - Extensions update with Safari updates or through the App Store
   - Updates follow Apple's App Store review process

## Publishing Updates

### Chrome Web Store

1. **Prepare the Update**
   ```bash
   # Update version in manifest.json
   # Example: "version": "1.0.0" → "version": "1.0.1"

   # Package the extension
   ./package.sh
   ```

2. **Upload to Chrome Web Store**
   - Go to [Chrome Web Store Developer Dashboard](<https://chrome.google.com/webstore/devconsole>)
   - Select your extension
   - Click "Upload new package"
   - Upload the `.zip` file
   - Fill in "What's new in this version?" (release notes)
   - Click "Submit for review"

3. **Review Process**
   - Initial review: Usually 1-3 days for first submission
   - Updates: Often within hours to 1 day
   - Once approved, users receive the update automatically

4. **Version Requirements**
   - Must increment version number (semantic versioning recommended)
   - Cannot re-upload same version number
   - Example progression: 1.0.0 → 1.0.1 → 1.1.0 → 2.0.0

### Firefox Add-ons

1. **Prepare the Update**
   ```bash
   # Update version in manifest.json or manifest-v2.json (for Firefox)
   # Package the extension
   ./package.sh
   ```

2. **Upload to Firefox Add-ons**
   - Go to [Firefox Add-on Developer Hub](<https://addons.mozilla.org/developers/>)
   - Select your add-on
   - Click "Upload New Version"
   - Upload the `.zip` file
   - Add release notes
   - Submit for review

3. **Review Process**
   - Automated review: Minutes to hours (for simple updates)
   - Manual review: May be required for significant changes (1-2 days)
   - Once approved, users receive the update automatically

### Safari App Store

1. **Prepare the Update**
   - Update version and build number in Xcode project
   - Update Safari extension manifest
   - Archive the app

2. **Submit via App Store Connect**
   - Use Xcode or App Store Connect web interface
   - Upload archive
   - Fill in "What's New" notes
   - Submit for review

3. **Review Process**
   - Typically 1-3 days
   - Follows standard iOS app review guidelines
   - Must comply with Safari extension policies

## Version Numbering

Use [Semantic Versioning (SemVer)](<https://semver.org/>):

```
MAJOR.MINOR.PATCH

1.0.0 → Initial release
1.0.1 → Bug fixes (backward compatible)
1.1.0 → New features (backward compatible)
2.0.0 → Breaking changes (not backward compatible)
```

### Examples
- Bug fix: `1.0.0` → `1.0.1`
- New feature: `1.0.1` → `1.1.0`
- Major rewrite: `1.1.0` → `2.0.0`

## manifest.json Configuration

**No special configuration needed!** The browser handles updates automatically.

Your manifest.json should have:
```json
{
  "manifest_version": 3,
  "name": "Online Picket Line - OPL",
  "version": "1.0.0",
  "description": "Browser extension to inform users about labor actions and boycotts..."
}
```

**Note:** The `update_url` field is **not needed** and should **not be included** when distributing through official stores.

## User Experience

### Chrome/Edge Users
- Extensions update silently in the background
- No user interaction required
- Can check version: `chrome://extensions` → Details → Version
- Can force update: `chrome://extensions` → Developer mode → "Update" button

### Firefox Users
- Extensions update once per day
- No user interaction required
- Can check version: `about:addons` → Extensions → Gear icon → Manage Extension
- Can force update: `about:addons` → Gear icon → "Check for Updates"

### Safari Users
- Extensions update with Safari or via App Store
- May require Safari restart
- Updates appear in App Store Updates tab

## Testing Updates

### Before Publishing

1. **Update manifest version**
   ```json
   "version": "1.0.1"  // Increment from previous version
   ```

2. **Test locally**
   ```bash
   # Package extension
   ./package.sh

   # Load unpacked in Chrome/Edge
   # - Go to chrome://extensions
   # - Enable "Developer mode"
   # - Click "Load unpacked"
   # - Select extension directory

   # Load temporarily in Firefox
   # - Go to about:debugging#/runtime/this-firefox
   # - Click "Load Temporary Add-on"
   # - Select manifest.json
   ```

3. **Verify functionality**
   - Test all features work correctly
   - Check console for errors
   - Test on multiple sites

### After Publishing

1. **Monitor review status** in developer dashboard
2. **Once approved**, install from store on a test browser
3. **Verify update** by checking version number
4. **Test updated functionality**

## Release Checklist

Before publishing an update:

- [ ] Update version number in `manifest.json`
- [ ] Update version in `manifest-v2.json` (if supporting Firefox with Manifest V2)
- [ ] Test extension locally
- [ ] Write clear release notes
- [ ] Package extension with `./package.sh`
- [ ] Upload to appropriate store(s)
- [ ] Monitor review process
- [ ] Test after approval

## Benefits of Store Updates

### Advantages over custom update mechanisms

1. **Security**
   - Stores review updates for malicious code
   - Signed by the browser vendor
   - No custom download/install code required

2. **Reliability**
   - Built into the browser
   - Well-tested infrastructure
   - Handles edge cases automatically

3. **User Trust**
   - Users expect updates from the store
   - No security warnings
   - Consistent with other extensions

4. **Simplicity**
   - No update code to maintain
   - No API calls or caching
   - No UI for update notifications
   - Smaller extension size

5. **Compatibility**
   - Works consistently across browsers
   - Follows platform conventions
   - Future-proof

## Common Issues

### Update Not Appearing

**Chrome/Edge:**
```bash
# Force check for updates
# 1. Go to chrome://extensions
# 2. Enable "Developer mode"
# 3. Click "Update" button
```

**Firefox:**
```bash
# Force check for updates
# 1. Go to about:addons
# 2. Click gear icon
# 3. Select "Check for Updates"
```

### Version Conflicts

- Ensure version number is higher than previous
- Use semantic versioning
- Cannot reuse version numbers

### Review Rejection

- Read rejection reason carefully
- Common issues:
  - Excessive permissions
  - Unclear description
  - Missing privacy policy (if collecting data)
  - Code obfuscation
- Fix issues and resubmit

## Migration Notes

### Removed Files
The following files were removed as they're no longer needed:
- `update-service.js` - Custom update checking service
- Update-related UI in `popup.html`
- Update handlers in `popup.js`
- Update message handlers in `background.js`

### Removed Features
- Update checking alarms
- GitHub API integration for releases
- Update notification banner in popup
- Manual update installation flow

### Benefits of Migration
- ~250 lines of code removed
- Simpler codebase to maintain
- Better security (no custom download URLs)
- Improved user experience (automatic updates)
- Reduced API calls and storage usage

## Support Resources

### Chrome Web Store
- [Developer Dashboard](<https://chrome.google.com/webstore/devconsole>)
- [Extension Guidelines](<https://developer.chrome.com/docs/webstore/program-policies/>)
- [Publishing Guide](<https://developer.chrome.com/docs/webstore/publish/>)

### Firefox Add-ons
- [Developer Hub](<https://addons.mozilla.org/developers/>)
- [Add-on Policies](<https://extensionworkshop.com/documentation/publish/add-on-policies/>)
- [Submission Guide](<https://extensionworkshop.com/documentation/publish/submitting-an-add-on/>)

### Safari Extensions
- [App Store Connect](<https://appstoreconnect.apple.com/>)
- [Safari Extension Guidelines](https://developer.apple.com/safari/extensions/)
- [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)

## Questions?

If you have questions about:
- **Publishing**: Check store documentation links above
- **Versioning**: Use semantic versioning (MAJOR.MINOR.PATCH)
- **Timing**: Updates typically roll out within 24 hours of approval
- **Issues**: Contact store support through developer dashboard
