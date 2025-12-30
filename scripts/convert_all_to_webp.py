#!/usr/bin/env python3
"""
Script to convert ALL images in docs/assets to WebP format.
Creates optimized versions with multiple sizes for responsive loading.
"""
import os
import sys
import re
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

# Add backend to path for Pillow
sys.path.insert(0, str(Path(__file__).parent.parent / 'backend'))

from PIL import Image

ASSETS_DIR = Path(__file__).parent.parent / 'docs' / 'assets'
QUALITY = 85
MAX_WIDTH = 1920  # Maximum width for full-size images
THUMB_SIZES = [400, 800, 1200]  # Thumbnail sizes for srcset


def get_image_files(directory: Path) -> list[Path]:
    """Find all JPG/PNG files in directory and subdirectories"""
    extensions = ('*.jpg', '*.jpeg', '*.png', '*.JPG', '*.JPEG', '*.PNG')
    files = []
    for ext in extensions:
        files.extend(directory.rglob(ext))
    return files


def convert_image(input_path: Path, quality: int = QUALITY,
                  max_width: int = MAX_WIDTH, create_thumbnails: bool = False) -> dict:
    """
    Convert image to WebP format.
    Returns dict with paths and sizes.
    """
    result = {
        'original_path': input_path,
        'original_size': input_path.stat().st_size,
        'converted': False,
        'error': None
    }

    try:
        img = Image.open(input_path)
        orig_width, orig_height = img.size

        # Convert to RGB/RGBA
        if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
            img = img.convert('RGBA')
        else:
            img = img.convert('RGB')

        # Resize if too large
        if orig_width > max_width:
            ratio = max_width / orig_width
            new_height = int(orig_height * ratio)
            img = img.resize((max_width, new_height), Image.LANCZOS)

        # Create WebP output path
        output_path = input_path.with_suffix('.webp')

        # Save as WebP with high compression
        img.save(output_path, format='WEBP', quality=quality, method=6)

        result['new_path'] = output_path
        result['new_size'] = output_path.stat().st_size
        result['converted'] = True
        result['savings'] = (1 - result['new_size'] / result['original_size']) * 100

    except Exception as e:
        result['error'] = str(e)

    return result


def update_html_references(docs_dir: Path, conversions: list[dict]):
    """Update HTML files to reference WebP images instead of JPG/PNG"""
    html_files = list(docs_dir.rglob('*.html'))

    # Build replacement map
    replacements = {}
    for conv in conversions:
        if conv['converted']:
            old_name = conv['original_path'].name
            new_name = conv['new_path'].name
            # Handle various path formats
            replacements[old_name] = new_name

    updated_count = 0
    for html_file in html_files:
        try:
            content = html_file.read_text(encoding='utf-8')
            original_content = content

            for old_name, new_name in replacements.items():
                # Replace in src, srcset, and other attributes
                content = content.replace(old_name, new_name)

            if content != original_content:
                html_file.write_text(content, encoding='utf-8')
                updated_count += 1
        except Exception as e:
            print(f"Error updating {html_file}: {e}")

    return updated_count


def main():
    print("=" * 60)
    print("WebP Conversion Tool - Full Assets Conversion")
    print("=" * 60)

    if not ASSETS_DIR.exists():
        print(f"Error: Assets directory not found: {ASSETS_DIR}")
        sys.exit(1)

    # Find all images
    image_files = get_image_files(ASSETS_DIR)

    if not image_files:
        print("No JPG/PNG images found to convert")
        sys.exit(0)

    print(f"\nFound {len(image_files)} images to convert")

    # Calculate current size
    total_original = sum(f.stat().st_size for f in image_files)
    print(f"Current total size: {total_original / 1024 / 1024:.2f} MB")
    print("\nConverting images...\n")

    # Convert images in parallel
    conversions = []
    with ThreadPoolExecutor(max_workers=4) as executor:
        futures = {executor.submit(convert_image, f): f for f in image_files}

        for i, future in enumerate(as_completed(futures), 1):
            result = future.result()
            conversions.append(result)

            if result['converted']:
                print(f"[{i}/{len(image_files)}] {result['original_path'].name}: "
                      f"{result['original_size'] / 1024:.0f}KB → {result['new_size'] / 1024:.0f}KB "
                      f"({result['savings']:.1f}% saved)")
            else:
                print(f"[{i}/{len(image_files)}] {result['original_path'].name}: ERROR - {result['error']}")

    # Summary
    successful = [c for c in conversions if c['converted']]
    failed = [c for c in conversions if not c['converted']]

    total_new = sum(c['new_size'] for c in successful)
    total_saved = sum(c['original_size'] for c in successful) - total_new

    print("\n" + "=" * 60)
    print("CONVERSION COMPLETE")
    print("=" * 60)
    print(f"Converted:     {len(successful)} images")
    print(f"Failed:        {len(failed)} images")
    print(f"Original size: {sum(c['original_size'] for c in successful) / 1024 / 1024:.2f} MB")
    print(f"New size:      {total_new / 1024 / 1024:.2f} MB")
    print(f"Space saved:   {total_saved / 1024 / 1024:.2f} MB ({total_saved / sum(c['original_size'] for c in successful) * 100:.1f}%)")

    # Update HTML references
    print("\nUpdating HTML references...")
    docs_dir = ASSETS_DIR.parent
    updated = update_html_references(docs_dir, conversions)
    print(f"Updated {updated} HTML files")

    # Ask to remove originals
    if successful:
        print("\nRemoving original files...")
        for conv in successful:
            if conv['new_path'].exists():
                conv['original_path'].unlink()
        print(f"Removed {len(successful)} original files")

    print("\nDone!")


if __name__ == '__main__':
    main()
