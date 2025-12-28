#!/usr/bin/env bash

# Package script for browser extensions
set -e

echo "Packaging Online Picket Line Browser Extension..."

# --- Versioning (aligned with main) ---
# Get version from git describe
# Expected formats: v1.0.0, v1.0.0-5-g12345, v1.0, v1
# If no tags exist, it returns the short hash (e.g. a1b2c3d)
GIT_VERSION=$(git describe --tags --always 2>/dev/null || echo "0.0.0")
echo "Git version: $GIT_VERSION"

# Strip 'v' prefix
CLEAN_VERSION=$(echo "$GIT_VERSION" | sed 's/^v//')

# Parse: TAG-COMMITS-gHASH or just TAG/HASH
if [[ "$CLEAN_VERSION" =~ ^(.*)-([0-9]+)-g([0-9a-f]+)$ ]]; then
  TAG_PART="${BASH_REMATCH[1]}"
  COMMITS="${BASH_REMATCH[2]}"
  HASH="${BASH_REMATCH[3]}"
else
  TAG_PART="$CLEAN_VERSION"
  COMMITS="0"
  HASH=""
fi

# Parse TAG_PART into Major.Minor.Patch
if [[ "$TAG_PART" =~ ^([0-9]+)\.([0-9]+)\.([0-9]+)$ ]]; then
  MAJOR="${BASH_REMATCH[1]}"
  MINOR="${BASH_REMATCH[2]}"
  PATCH="${BASH_REMATCH[3]}"
elif [[ "$TAG_PART" =~ ^([0-9]+)\.([0-9]+)$ ]]; then
  MAJOR="${BASH_REMATCH[1]}"
  MINOR="${BASH_REMATCH[2]}"
  PATCH="0"
elif [[ "$TAG_PART" =~ ^([0-9]+)$ ]]; then
  MAJOR="${BASH_REMATCH[1]}"
  MINOR="0"
  PATCH="0"
else
  echo "WARNING: Could not parse semantic version from '$TAG_PART'. Defaulting to 0.0.0."
  MAJOR="0"
  MINOR="0"
  PATCH="0"
  COMMITS=$(git rev-list --count HEAD 2>/dev/null || echo "0")
  HASH=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
fi

# Ensure hash when commits exist
if [ "$COMMITS" != "0" ] && [ -z "$HASH" ]; then
  HASH=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
fi

# Construct versions
# Manifest version must be 1-4 integers: X.Y.Z.Build
MANIFEST_VERSION="${MAJOR}.${MINOR}.${PATCH}.${COMMITS}"

# Package version (SemVer): X.Y.Z-Build
if [ "$COMMITS" == "0" ]; then
  PACKAGE_VERSION="${MAJOR}.${MINOR}.${PATCH}"
else
  PACKAGE_VERSION="${MAJOR}.${MINOR}.${PATCH}-${COMMITS}-g${HASH}"
fi

echo "Setting version to: Manifest=$MANIFEST_VERSION, Package=$PACKAGE_VERSION"

# Temp files cleanup
tmp_pkg=$(mktemp -t oplpkg.XXXXXX)
tmp_manifest=$(mktemp -t oplpkg.XXXXXX)
tmp_manifest_v2=$(mktemp -t oplpkg.XXXXXX)
cleanup() {
  rm -f "$tmp_pkg" "$tmp_manifest" "$tmp_manifest_v2"
}
trap cleanup EXIT

# Update package.json
if [ -f package.json ]; then
  jq --arg v "$PACKAGE_VERSION" '.version = $v' package.json > "$tmp_pkg" && mv "$tmp_pkg" package.json
fi

# Update manifest.json
if [ -f manifest.json ]; then
  jq --arg v "$MANIFEST_VERSION" '.version = $v' manifest.json > "$tmp_manifest" && mv "$tmp_manifest" manifest.json
fi

# Update manifest-v2.json
if [ -f manifest-v2.json ]; then
  jq --arg v "$MANIFEST_VERSION" '.version = $v' manifest-v2.json > "$tmp_manifest_v2" && mv "$tmp_manifest_v2" manifest-v2.json
fi
# ------------------

# Create dist directory
rm -rf ./dist
mkdir -p dist

ZIP_SUFFIX="${PACKAGE_VERSION}"

# Package for Chrome/Edge (Manifest V3)
echo "Creating Chrome/Edge package..."
zip -r "dist/opl-chrome-edge-${ZIP_SUFFIX}.zip" \
  manifest.json \
  browser-polyfill.js \
  api-service.js \
  background.js \
  content.js \
  content.css \
  popup.html \
  popup.js \
  block.html \
  block.js \
  icons/ \
  -x "*.DS_Store" "*.swp"

# Package for Opera (Manifest V3, same as Chrome)
echo "Creating Opera package..."
zip -r "dist/opl-opera-${ZIP_SUFFIX}.zip" \
  manifest.json \
  browser-polyfill.js \
  api-service.js \
  background.js \
  content.js \
  content.css \
  popup.html \
  popup.js \
  block.html \
  block.js \
  icons/ \
  -x "*.DS_Store" "*.swp"

# Package for Firefox (Manifest V2)
echo "Creating Firefox package..."
# Copy manifest-v2 as manifest.json temporarily
cp manifest.json manifest-v3-backup.json
cp manifest-v2.json manifest.json

zip -r "dist/opl-firefox-${ZIP_SUFFIX}.zip" \
  manifest.json \
  browser-polyfill.js \
  api-service.js \
  background.js \
  content.js \
  content.css \
  popup.html \
  popup.js \
  block.html \
  block.js \
  icons/ \
  -x "*.DS_Store" "*.swp"

# Restore original manifest
mv manifest-v3-backup.json manifest.json

# Package for Safari (Manifest V3)
echo "Creating Safari package..."
zip -r "dist/opl-safari-${ZIP_SUFFIX}.zip" \
  manifest.json \
  browser-polyfill.js \
  api-service.js \
  background.js \
  content.js \
  content.css \
  popup.html \
  popup.js \
  block.html \
  block.js \
  icons/ \
  -x "*.DS_Store" "*.swp"

echo "✓ Packages created in dist/ directory:"
ls -lh dist/

echo ""
echo "Installation instructions:"
echo "- Chrome/Edge/Brave: Use opl-chrome-edge-${ZIP_SUFFIX}.zip"
echo "- Firefox: Use opl-firefox-${ZIP_SUFFIX}.zip"
echo "- Safari: Use opl-safari-${ZIP_SUFFIX}.zip (requires Xcode conversion)"
echo ""
echo "For Safari development, first extract opl-safari-${ZIP_SUFFIX}.zip, then convert:"
echo "  unzip dist/opl-safari-${ZIP_SUFFIX}.zip -d dist/opl-safari-unpacked"
echo "  xcrun safari-web-extension-converter dist/opl-safari-unpacked --app-name \"Online Picket Line\""
echo ""
echo "Or convert directly from the source directory:"
echo "  xcrun safari-web-extension-converter . --app-name \"Online Picket Line\""
echo ""
echo "For development, load the unpacked extension directory directly."
