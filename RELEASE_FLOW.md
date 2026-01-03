# 🚀 Release Workflow Quick Guide

## Visual Flow

```
┌─────────────────────────────────────────────────────────────┐
│  STEP 1: Update Version                                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Edit manifest.json:          Edit manifest-v2.json:         │
│  "version": "1.0.1"          "version": "1.0.1"             │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 2: Commit & Push                                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  $ git add manifest.json manifest-v2.json                    │
│  $ git commit -m "Bump version to 1.0.1"                     │
│  $ git push origin main                                      │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 3: Create & Push Tag                                   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  $ git tag -a v1.0.1 -m "Release version 1.0.1"             │
│  $ git push origin v1.0.1                                    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 4: GitHub Actions Automatically...                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  CI Workflow (triggered by tag):                             │
│  ✓ Runs security scans                                       │
│  ✓ Lints code                                                │
│  ✓ Runs all tests                                            │
│  ✓ Runs mutation tests                                       │
│  ✓ Builds all browser packages                               │
│  ✓ Uploads build artifacts                                   │
│                                                               │
│  Release Workflow (triggered by tag):                        │
│  ✓ Waits for CI build to complete                            │
│  ✓ Downloads pre-built artifacts from CI                     │
│  ✓ Validates version matches tag                             │
│  ✓ Creates SHA256 checksums                                  │
│  ✓ Creates GitHub Release                                    │
│  ✓ Uploads packages to release                               │
│                                                               │
│  ⏱️  Takes ~5-10 minutes (runs in parallel)                  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 5: Download from Releases Page                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  GitHub.com → Your Repo → Releases → v1.0.1                 │
│                                                               │
│  📦 opl-chrome-edge.zip    (Chrome Web Store)                │
│  📦 opl-firefox.zip        (Firefox Add-ons)                 │
│  📦 opl-opera.zip          (Opera Add-ons)                   │
│  📦 opl-safari.zip         (Safari App Store)                │
│  📄 checksums.txt          (Verification)                    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 6: Submit to Browser Stores                            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  🌐 Chrome:  chrome.google.com/webstore/devconsole          │
│  🦊 Firefox: addons.mozilla.org/developers/                  │
│  🔴 Opera:   addons.opera.com/developer/                     │
│  🧭 Safari:  Via Xcode / App Store Connect                   │
│                                                               │
│  Just upload the .zip file - no extraction needed!           │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 7: Wait for Store Approval                             │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Chrome:  Hours to 3 days                                    │
│  Firefox: Hours to 2 days                                    │
│  Opera:   1-3 days                                           │
│  Safari:  1-3 days                                           │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 8: Users Get Automatic Updates! 🎉                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ✓ Updates roll out within 24 hours                          │
│  ✓ No user action required                                   │
│  ✓ Silent background updates                                 │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Command Cheat Sheet

### Quick Release
```bash
# One-liner to release (after updating manifests)
git add manifest.json manifest-v2.json && \
git commit -m "Bump version to 1.0.1" && \
git push origin main && \
git tag -a v1.0.1 -m "Release v1.0.1" && \
git push origin v1.0.1
```

### Version Check
```bash
# Verify manifest version
jq '.version' manifest.json
jq '.version' manifest-v2.json

# List all tags
git tag -l

# Show latest tag
git describe --tags --abbrev=0
```

### Undo Tag
```bash
# Delete local tag
git tag -d v1.0.1

# Delete remote tag
git push origin :refs/tags/v1.0.1
```

### Build Locally
```bash
# Test build before release
./package.sh

# Check package sizes
ls -lh dist/

# Verify contents
unzip -l dist/opl-chrome-edge.zip
```

## Status Checks

### CI Status
```
✅ Green = All tests passed, packages built
❌ Red   = Tests failed or build error
🟡 Yellow = In progress
```

### Where to Check
- **Actions tab**: See workflow runs
- **Commits**: Check marks next to commits
- **Releases**: Published releases with packages

## File Checklist Before Release

```
Before pushing version tag:

[ ] manifest.json version updated
[ ] manifest-v2.json version updated
[ ] Both versions match
[ ] All tests passing locally (npm test)
[ ] Extension tested in Chrome
[ ] Extension tested in Firefox
[ ] No console errors
[ ] Committed and pushed to main
[ ] Ready to create tag
```

## Common Version Increments

```
Bug Fix:     1.0.0 → 1.0.1
Small Fix:   1.0.1 → 1.0.2
New Feature: 1.0.2 → 1.1.0
Major Update: 1.1.0 → 2.0.0
```

## What Gets Built

Each package contains:
```
✓ manifest.json
✓ browser-polyfill.js
✓ api-service.js
✓ background.js
✓ content.js
✓ content.css
✓ popup.html
✓ popup.js
✓ block.html
✓ block.js
✓ theme.css
✓ icons/

✗ update-service.js (removed - not needed!)
✗ tests/ (not included)
✗ docs/ (not included)
```

## Package Sizes (Approximate)

```
opl-chrome-edge.zip  ~50-100 KB
opl-firefox.zip      ~50-100 KB
opl-opera.zip        ~50-100 KB
opl-safari.zip       ~50-100 KB
```

## Links

- 📖 [Full CI/CD Guide](CI_CD_GUIDE.md)
- 🏪 [Store Submission Guide](STORE_UPDATE_GUIDE.md)
- ⚡ [Quick Reference](QUICK_REFERENCE.md)
- 🔄 [Migration Details](MIGRATION_TO_STORE_UPDATES.md)

## Need Help?

1. **Build fails?** Check [CI_CD_GUIDE.md](CI_CD_GUIDE.md) troubleshooting
2. **Store submission?** See [STORE_UPDATE_GUIDE.md](STORE_UPDATE_GUIDE.md)
3. **Version issues?** Ensure both manifests match

---

**That's it!** Three commands to release, automatic builds, download and submit. 🚀
