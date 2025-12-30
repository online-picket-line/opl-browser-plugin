// @ts-nocheck
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, 'icons', 'icon.svg');
const sizes = [16, 48, 128];

async function generateIcons() {
  const svgBuffer = fs.readFileSync(svgPath);

  for (const size of sizes) {
    const outputPath = path.join(__dirname, 'icons', `icon${size}.png`);

    await sharp(svgBuffer)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(outputPath);

    console.log(`Generated ${outputPath}`);
  }

  console.log('All icons generated successfully!');
}

generateIcons().catch(console.error);
