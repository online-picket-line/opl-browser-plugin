const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, 'icons', 'icon.svg');

// All required icon sizes for all stores
// Chrome: 16, 48, 128
// Firefox: 16, 32, 48, 64, 128
// Opera: 16, 48, 64, 128
// Safari App: 1024
const sizes = [16, 32, 48, 64, 128, 1024];

async function generateIcons() {
  const svgBuffer = fs.readFileSync(svgPath);

  for (const size of sizes) {
    let outputPath;
    
    // 1024 icon goes to Safari store folder
    if (size === 1024) {
      outputPath = path.join(__dirname, 'docs', 'safari_plugin_store', 'app_icon_1024.png');
    } else {
      outputPath = path.join(__dirname, 'icons', `icon${size}.png`);
    }

    await sharp(svgBuffer)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(outputPath);

    console.log(`Generated ${outputPath}`);
  }

  console.log('\nAll icons generated successfully!');
  console.log('\nIcon sizes generated:');
  console.log('  - 16x16:   Toolbar icon (all browsers)');
  console.log('  - 32x32:   Firefox high-DPI toolbar');
  console.log('  - 48x48:   Extension management page');
  console.log('  - 64x64:   Firefox/Opera add-ons manager');
  console.log('  - 128x128: Chrome Web Store, installation dialog');
  console.log('  - 1024x1024: Mac App Store (Safari)');
}

generateIcons().catch(console.error);
