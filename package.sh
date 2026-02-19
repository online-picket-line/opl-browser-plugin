#!/usr/bin/env bash

# Package script for browser extensions
# Single universal MV3 package works on Chrome, Firefox, Edge, Opera, Brave, etc.
set -e

echo "Packaging Online Picket Line Browser Extension..."

# Create dist directory
mkdir -p dist

# Build universal MV3 package (works on all browsers)
echo "Creating universal MV3 package..."
zip -r dist/opl-extension.zip \
  manifest.json \
  browser-polyfill.js \
  api-service.js \
  ad-networks.js \
  dnr-service.js \
  ad-detector.js \
  strike-card.js \
  strike-injector.js \
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

echo "✓ Package created in dist/ directory:"
ls -lh dist/

echo ""
echo "Installation instructions:"
echo "- Chrome/Edge/Opera/Brave/Vivaldi: Use opl-extension.zip"
echo "- Firefox: Use opl-extension.zip"
echo "- Safari: Extract and convert with Xcode:"
echo "    unzip dist/opl-extension.zip -d dist/opl-safari-unpacked"
echo "    xcrun safari-web-extension-converter dist/opl-safari-unpacked --app-name \"Online Picket Line\""
echo ""
echo "Or convert directly from the source directory:"
echo "  xcrun safari-web-extension-converter . --app-name \"Online Picket Line\""
echo ""
echo "For development, load the unpacked extension directory directly."

