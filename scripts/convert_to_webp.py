#!/usr/bin/env python3
"""
Script to convert existing images to WebP format.
Run this once to convert all JPG/PNG images in uploads folder.
"""
import os
import sys
from pathlib import Path

# Add backend to path for Pillow
sys.path.insert(0, str(Path(__file__).parent.parent / 'backend'))

from PIL import Image

UPLOADS_DIR = Path(__file__).parent.parent / 'docs' / 'assets' / 'uploads'
QUALITY = 85


def convert_image(input_path: Path, quality: int = QUALITY) -> tuple[Path, int, int]:
    """Convert image to WebP format and return new path, original size, new size"""
    original_size = input_path.stat().st_size

    img = Image.open(input_path)

    # Convert to RGB if necessary (for PNG with transparency, use RGBA)
    if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
        img = img.convert('RGBA')
    else:
        img = img.convert('RGB')

    # Create new filename with .webp extension
    output_path = input_path.with_suffix('.webp')

    # Save as WebP
    img.save(output_path, format='WEBP', quality=quality, method=6)

    new_size = output_path.stat().st_size

    return output_path, original_size, new_size


def main():
    if not UPLOADS_DIR.exists():
        print(f"Error: Uploads directory not found: {UPLOADS_DIR}")
        sys.exit(1)

    # Find all JPG and PNG files
    image_files = list(UPLOADS_DIR.glob('*.jpg')) + \
                  list(UPLOADS_DIR.glob('*.jpeg')) + \
                  list(UPLOADS_DIR.glob('*.png'))

    if not image_files:
        print("No JPG/PNG images found to convert")
        sys.exit(0)

    print(f"Found {len(image_files)} images to convert\n")

    total_original = 0
    total_new = 0
    converted_files = []

    for img_path in sorted(image_files):
        print(f"Converting: {img_path.name}")
        try:
            new_path, orig_size, new_size = convert_image(img_path)
            total_original += orig_size
            total_new += new_size

            savings = (1 - new_size / orig_size) * 100
            print(f"  → {new_path.name}: {orig_size:,} → {new_size:,} bytes ({savings:.1f}% saved)")

            converted_files.append((img_path, new_path))
        except Exception as e:
            print(f"  Error: {e}")

    # Remove original files after successful conversion
    print("\nRemoving original files...")
    for orig_path, new_path in converted_files:
        if new_path.exists():
            orig_path.unlink()
            print(f"  Removed: {orig_path.name}")

    print("\n" + "=" * 50)
    print(f"Total converted: {len(converted_files)} images")
    print(f"Original size:   {total_original:,} bytes ({total_original / 1024 / 1024:.2f} MB)")
    print(f"New size:        {total_new:,} bytes ({total_new / 1024 / 1024:.2f} MB)")
    print(f"Total saved:     {total_original - total_new:,} bytes ({(1 - total_new / total_original) * 100:.1f}%)")


if __name__ == '__main__':
    main()
