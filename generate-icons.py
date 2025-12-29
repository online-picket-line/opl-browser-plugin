#!/usr/bin/env python3
"""Generate PNG icons from SVG with proper aspect ratio handling."""

import os
from pathlib import Path

try:
    from PIL import Image
    import cairosvg
except ImportError:
    print("Installing required packages...")
    import subprocess
    subprocess.check_call(['pip', 'install', '--user', 'pillow', 'cairosvg'])
    from PIL import Image
    import cairosvg

# Paths
SCRIPT_DIR = Path(__file__).parent
SVG_PATH = SCRIPT_DIR / 'icons' / 'icon.svg'
SIZES = [16, 48, 128]

def generate_icons():
    """Generate PNG icons from SVG with transparent background."""
    for size in SIZES:
        output_path = SCRIPT_DIR / 'icons' / f'icon{size}.png'
        
        # Convert SVG to PNG with proper aspect ratio (fit contain)
        png_data = cairosvg.svg2png(
            url=str(SVG_PATH),
            output_width=size,
            output_height=size
        )
        
        # Open with PIL to ensure transparency
        img = Image.open(io.BytesIO(png_data))
        
        # Save with transparency
        img.save(output_path, 'PNG')
        print(f'Generated {output_path}')
    
    print('All icons generated successfully!')

if __name__ == '__main__':
    import io
    generate_icons()
