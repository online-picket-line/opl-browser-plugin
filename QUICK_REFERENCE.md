# Quick Reference: Publishing Extension Updates

## Update Process (3 Steps)

### 1. Update Version
Edit [manifest.json](manifest.json) and [manifest-v2.json](manifest-v2.json):
```json
"version": "1.0.1"  // Increment: 1.0.0 → 1.0.1 → 1.1.0 → 2.0.0
```

### 2. Package
```bash
./package.sh
```

### 3. Upload to Store(s)
- **Chrome Web Store:** https://chrome.google.com/webstore/devconsole
- **Firefox Add-ons:** https://addons.mozilla.org/developers/
- **Safari:** Via Xcode/App Store Connect

---

## Version Numbering

**Semantic Versioning:** `MAJOR.MINOR.PATCH`

- **Patch** (1.0.**0** → 1.0.**1**): Bug fixes
- **Minor** (1.**0**.1 → 1.**1**.0): New features
- **Major** (**1**.1.0 → **2**.0.0): Breaking changes

---

## What Happens After Upload?

1. **Review:** Hours to 3 days (varies by store)
2. **Approval:** Extension published automatically
3. **User Updates:** Automatic within 24 hours
4. **No user action needed!**

---

## Testing Before Publishing

```bash
# Chrome/Edge/Brave/Opera
1. Open chrome://extensions
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select extension directory
5. Test functionality

# Firefox
1. Open about:debugging#/runtime/this-firefox
2. Click "Load Temporary Add-on"
3. Select manifest.json
4. Test functionality
```

---

## Common Questions

**Q: Do I need special update code?**  
A: No! Browsers handle updates automatically.

**Q: How do users get updates?**  
A: Automatically, within 24 hours of approval.

**Q: Can I force an update for testing?**  
A: Yes:
- Chrome: `chrome://extensions` → Update button
- Firefox: `about:addons` → Gear icon → Check for Updates

**Q: What if review is rejected?**  
A: Fix the issues mentioned, increment version, and resubmit.

**Q: How long until approved?**  
A: Usually hours to 3 days. Updates are typically faster than initial submissions.

---

## Release Checklist

- [ ] Update version in manifest.json
- [ ] Update version in manifest-v2.json (if supporting Firefox)
- [ ] Test locally
- [ ] Run `./package.sh`
- [ ] Write release notes
- [ ] Upload to store(s)
- [ ] Monitor review status

---

## More Information

- **Complete Guide:** [STORE_UPDATE_GUIDE.md](STORE_UPDATE_GUIDE.md)
- **Migration Details:** [MIGRATION_TO_STORE_UPDATES.md](MIGRATION_TO_STORE_UPDATES.md)
