#!/bin/bash

# Package script for browser extensions
set -e

echo "Packaging Online Picket Line Browser Extension..."

# Create dist directory
mkdir -p dist

# Package for Chrome/Edge (Manifest V3)
echo "Creating Chrome/Edge package..."
zip -r dist/opl-chrome-edge.zip \
  manifest.json \
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

zip -r dist/opl-firefox.zip \
  manifest.json \
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

echo "✓ Packages created in dist/ directory:"
ls -lh dist/

echo ""
echo "Installation instructions:"
echo "- Chrome/Edge: Use opl-chrome-edge.zip"
echo "- Firefox: Use opl-firefox.zip"
echo ""
echo "For development, load the unpacked extension directory directly."
