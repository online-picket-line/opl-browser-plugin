#!/usr/bin/env bash

# Package script for browser extensions
set -e

echo "Packaging Online Picket Line Browser Extension..."

# Create dist directory
mkdir -p dist


# Package for Chrome/Edge (Manifest V3)
echo "Creating Chrome/Edge package..."
zip -r dist/opl-chrome-edge.zip \
  manifest.json \
  browser-polyfill.js \
  api-service.js \
  update-service.js \
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
zip -r dist/opl-opera.zip \
  manifest.json \
  browser-polyfill.js \
  api-service.js \
  update-service.js \
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

zip -r dist/opl-firefox.zip \
  manifest.json \
  browser-polyfill.js \
  api-service.js \
  update-service.js \
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
zip -r dist/opl-safari.zip \
  manifest.json \
  browser-polyfill.js \
  api-service.js \
  update-service.js \
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
echo "- Chrome/Edge/Brave: Use opl-chrome-edge.zip"
echo "- Firefox: Use opl-firefox.zip"
echo "- Safari: Use opl-safari.zip (requires Xcode conversion)"
echo ""
echo "For Safari development, first extract opl-safari.zip, then convert:"
echo "  unzip dist/opl-safari.zip -d dist/opl-safari-unpacked"
echo "  xcrun safari-web-extension-converter dist/opl-safari-unpacked --app-name \"Online Picket Line\""
echo ""
echo "Or convert directly from the source directory:"
echo "  xcrun safari-web-extension-converter . --app-name \"Online Picket Line\""
echo ""
echo "For development, load the unpacked extension directory directly."

