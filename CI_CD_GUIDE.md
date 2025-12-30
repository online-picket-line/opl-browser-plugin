# CI/CD Pipeline Documentation

This document describes the automated build and release pipeline for the Online Picket Line browser extension.

## Overview

The project uses **GitHub Actions** for continuous integration and automated releases. The pipeline produces store-ready packages for all supported browsers.

## Workflows

### 1. CI Workflow (`.github/workflows/ci.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**Jobs:**

#### Test Job
- Runs on: Ubuntu Latest
- Node.js: v20
- Steps:
  1. Checkout code
  2. Install dependencies
  3. Run unit tests
  4. Generate coverage report
  5. Upload coverage as artifact (30 days retention)

#### Build Job
- Runs on: Ubuntu Latest
- Requires: Test job to pass
- Node.js: v20
- Steps:
  1. Checkout code
  2. Install dependencies
  3. Generate icons
  4. Build extension packages (runs `package.sh`)
  5. Upload individual store packages (90 days retention):
     - `chrome-webstore-package` - For Chrome Web Store
     - `firefox-addons-package` - For Firefox Add-ons
     - `opera-addons-package` - For Opera Add-ons
     - `safari-package` - For Safari App Store
  6. Upload combined package with all browsers
  7. Display build summary with package sizes

**Artifacts Produced:**
- Individual `.zip` files ready for store submission
- Coverage reports for quality monitoring

### 2. Release Workflow (`.github/workflows/release.yml`)

**Triggers:**
- Push of version tags (e.g., `v1.0.0`, `v1.0.1`, `v2.0.0`)

**Jobs:**

#### Release Test Job
- Same as CI workflow
- Ensures all tests pass before creating release

#### Build and Release Job
- Runs on: Ubuntu Latest
- Requires: Test job to pass
- Permissions: Write to repository contents
- Node.js: v20
- Steps:
  1. Checkout code
  2. Install dependencies
  3. Generate icons
  4. Build extension packages
  5. Extract version from tag
  6. **Verify manifest version matches tag** (fails if mismatch)
  7. Create SHA256 checksums for all packages
  8. Generate release notes
  9. Create GitHub Release with:
     - All browser packages (`.zip` files)
     - Checksums file
     - Automated release notes
  10. Upload artifacts (365 days retention)
  11. Display release summary

**Artifacts Produced:**
- GitHub Release with downloadable packages
- Individual `.zip` files for each browser
- SHA256 checksums for verification
- Release notes with submission instructions

## Package.sh Script

The `package.sh` script creates store-ready packages for all browsers:

```bash
./package.sh
```

**Created Packages:**

1. **`opl-chrome-edge.zip`** - Chrome Web Store, Edge Add-ons, Brave
   - Uses `manifest.json` (Manifest V3)
   - Includes all extension files
   - Ready for direct upload to stores

2. **`opl-firefox.zip`** - Firefox Add-ons
   - Uses `manifest-v2.json` (temporarily renamed to `manifest.json`)
   - Includes all extension files
   - Ready for direct upload to Firefox Add-ons

3. **`opl-opera.zip`** - Opera Add-ons
   - Uses `manifest.json` (Manifest V3)
   - Identical to Chrome package
   - Ready for direct upload to Opera Add-ons

4. **`opl-safari.zip`** - Safari App Store
   - Uses `manifest.json` (Manifest V3)
   - Requires Xcode conversion after download
   - See [SAFARI_SETUP.md](SAFARI_SETUP.md) for conversion instructions

**Files Included in Packages:**
- `manifest.json` - Extension manifest
- `browser-polyfill.js` - Cross-browser compatibility
- `api-service.js` - Labor actions API
- `background.js` - Background service worker
- `content.js` - Content script
- `content.css` - Content styles
- `popup.html` - Extension popup UI
- `popup.js` - Popup logic
- `block.html` - Block page UI
- `block.js` - Block page logic
- `theme.css` - UI theme
- `icons/` - Extension icons

**Files Excluded:**
- `update-service.js` - ❌ Removed (using browser store updates)
- Test files
- Documentation
- Development files
- `.DS_Store` and swap files

## Releasing a New Version

### Step-by-Step Process

#### 1. Update Version Number

Edit both manifest files:

**manifest.json:**
```json
{
  "version": "1.0.1"
}
```

**manifest-v2.json:**
```json
{
  "version": "1.0.1"
}
```

#### 2. Commit Changes

```bash
git add manifest.json manifest-v2.json
git commit -m "Bump version to 1.0.1"
git push origin main
```

#### 3. Create and Push Tag

```bash
# Create annotated tag
git tag -a v1.0.1 -m "Release version 1.0.1"

# Push tag to trigger release workflow
git push origin v1.0.1
```

#### 4. Monitor Release Workflow

1. Go to **Actions** tab on GitHub
2. Watch the "Release" workflow run
3. Verify all steps complete successfully

#### 5. Download Packages

Once the workflow completes:
1. Go to **Releases** tab
2. Find the new release (e.g., "Release v1.0.1")
3. Download appropriate packages:
   - `opl-chrome-edge.zip` for Chrome Web Store
   - `opl-firefox.zip` for Firefox Add-ons
   - `opl-opera.zip` for Opera Add-ons
   - `opl-safari.zip` for Safari App Store

#### 6. Submit to Stores

Follow the [STORE_UPDATE_GUIDE.md](STORE_UPDATE_GUIDE.md) for detailed submission instructions.

## Versioning Strategy

Use **Semantic Versioning (SemVer)**: `MAJOR.MINOR.PATCH`

```
v1.0.0 → Initial release
v1.0.1 → Bug fix
v1.1.0 → New feature
v2.0.0 → Breaking change
```

### Examples

**Bug Fix Release:**
```bash
# 1.0.0 → 1.0.1
# Update manifests, commit, then:
git tag -a v1.0.1 -m "Fix: Resolved banner display issue"
git push origin v1.0.1
```

**Feature Release:**
```bash
# 1.0.1 → 1.1.0
# Update manifests, commit, then:
git tag -a v1.1.0 -m "Feature: Add support for multiple languages"
git push origin v1.1.0
```

**Major Release:**
```bash
# 1.1.0 → 2.0.0
# Update manifests, commit, then:
git tag -a v2.0.0 -m "Major: Complete UI redesign"
git push origin v2.0.0
```

## Artifact Retention

**CI Workflow Artifacts:**
- Coverage reports: 30 days
- Browser packages: 90 days

**Release Workflow Artifacts:**
- Browser packages: 365 days
- Available in GitHub Releases permanently

## Quality Gates

### Automated Checks

1. **Unit Tests** - Must pass before building
2. **Version Verification** - Tag must match manifest.json version
3. **Build Validation** - All packages must build successfully
4. **Checksum Generation** - For package integrity verification

### Manual Checks (Recommended)

Before creating a release tag:
- [ ] All tests passing locally
- [ ] Extension tested in Chrome
- [ ] Extension tested in Firefox
- [ ] No console errors
- [ ] Version numbers updated in both manifests
- [ ] CHANGELOG updated (if maintained)

## Troubleshooting

### Release Workflow Fails: Version Mismatch

**Error:**
```
❌ Error: manifest.json version (1.0.0) does not match tag version (1.0.1)
```

**Solution:**
```bash
# Update manifest.json and manifest-v2.json
# Commit the changes
git add manifest.json manifest-v2.json
git commit -m "Bump version to 1.0.1"
git push origin main

# Delete the incorrect tag (locally and remotely)
git tag -d v1.0.1
git push origin :refs/tags/v1.0.1

# Create new tag with correct version
git tag -a v1.0.1 -m "Release version 1.0.1"
git push origin v1.0.1
```

### Build Fails: Missing Files

**Error:**
```
zip warning: name not matched: theme.css
```

**Solution:**
Ensure all required files exist in the repository root.

### GitHub Actions Permission Denied

**Error:**
```
Resource not accessible by integration
```

**Solution:**
The release workflow needs write permissions. Check repository settings:
1. Go to **Settings** → **Actions** → **General**
2. Under "Workflow permissions", select "Read and write permissions"
3. Save and re-run the workflow

## CI/CD Best Practices

### DO ✅

- **Always update both manifests** (manifest.json and manifest-v2.json)
- **Test locally before pushing** tags
- **Use semantic versioning** for tags
- **Write descriptive tag messages**
- **Review the release** on GitHub before submitting to stores
- **Keep the main branch stable** - use feature branches for development

### DON'T ❌

- **Don't push tags without testing**
- **Don't reuse version numbers** - Always increment
- **Don't skip CI checks** - Let the pipeline validate everything
- **Don't manually edit releases** - Use the automated workflow
- **Don't commit build artifacts** - Let CI generate them

## Local Development

### Running Builds Locally

```bash
# Install dependencies
npm install

# Generate icons
node generate-icons.js

# Build all packages
./package.sh

# Check dist/ directory
ls -lh dist/
```

### Testing Before Release

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Build packages
./package.sh

# Test in Chrome
# 1. Extract package: unzip dist/opl-chrome-edge.zip -d test-build
# 2. Load: chrome://extensions → Load unpacked → select test-build

# Test in Firefox
# 1. Go to: about:debugging#/runtime/this-firefox
# 2. Click: Load Temporary Add-on
# 3. Select: dist/opl-firefox.zip
```

## Monitoring

### Check CI Status

**Badge in README:**
Add to your README.md:
```markdown
![CI Status](https://github.com/online-picket-line/opl-browser-plugin/workflows/CI/badge.svg)
```

**GitHub Actions Tab:**
- View all workflow runs
- Check logs for failures
- Download artifacts

### Check Release Status

**Releases Page:**
- View all published releases
- Download packages
- Check release notes
- Verify checksums

## Additional Resources

- [STORE_UPDATE_GUIDE.md](STORE_UPDATE_GUIDE.md) - Store submission instructions
- [MIGRATION_TO_STORE_UPDATES.md](MIGRATION_TO_STORE_UPDATES.md) - Migration details
- [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Quick release reference
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Semantic Versioning Spec](https://semver.org/)

## Summary

The CI/CD pipeline automates:
- ✅ Testing on every push/PR
- ✅ Building store-ready packages
- ✅ Creating GitHub releases
- ✅ Version validation
- ✅ Package checksums
- ✅ Artifact retention

**Result:** Fast, reliable releases with minimal manual work. Simply push a version tag, and the pipeline handles the rest!
