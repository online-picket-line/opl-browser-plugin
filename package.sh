#!/usr/bin/env bash

# Package script for browser extensions
set -e

echo "Packaging Online Picket Line Browser Extension..."

# Create dist directory
mkdir -p dist


# Package for Chromium-based browsers (Chrome, Edge, Opera, Brave, Vivaldi, etc.)
echo "Creating Chromium package..."
zip -r dist/opl-chromium.zip \
  manifest.json \
  browser-polyfill.js \
  api-service.js \
  dnr-service.js \
  background.js \
  content.js \
  content.css \
  popup.html \
  popup.js \
  block.html \
  block.js \
  theme.css \
  disable-pwa.webmanifest \
  icons/ \
  -x "*.DS_Store" "*.swp"

# Package for Firefox (Manifest V2)
echo "Creating Firefox package..."
# Copy manifest-v2 as manifest.json temporarily
cp manifest.json manifest-v3-backup.json
cp manifest-v2.json manifest.json

zip -r dist/opl-firefox.zip \
  manifest.json \
  browser-polyfill.js \
  api-service.js \
  dnr-service.js \
  background.js \
  content.js \
  content.css \
  popup.html \
  popup.js \
  block.html \
  block.js \
  theme.css \
  disable-pwa.webmanifest \
  icons/ \
  -x "*.DS_Store" "*.swp"

# Restore original manifest
mv manifest-v3-backup.json manifest.json

echo "✓ Packages created in dist/ directory:"
ls -lh dist/

echo ""
echo "Installation instructions:"
echo "- Chrome/Edge/Opera/Brave/Vivaldi: Use opl-chromium.zip"
echo "- Firefox: Use opl-firefox.zip"
echo "- Safari: Use opl-chromium.zip (requires Xcode conversion)"
echo ""
echo "For Safari development, first extract opl-chromium.zip, then convert:"
echo "  unzip dist/opl-chromium.zip -d dist/opl-safari-unpacked"
echo "  xcrun safari-web-extension-converter dist/opl-safari-unpacked --app-name \"Online Picket Line\""
echo ""
echo "Or convert directly from the source directory:"
echo "  xcrun safari-web-extension-converter . --app-name \"Online Picket Line\""
echo ""
echo "For development, load the unpacked extension directory directly."

