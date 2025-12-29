#!/usr/bin/env python3
"""
Migration script to update image URLs from JPG/PNG to WebP format in the database.
Run this on the server after deploying the WebP conversion changes.

Usage:
  python scripts/migrate_image_urls.py

This script updates:
- Project.cover_image
- Project.gallery[]
- Case.image
"""
import os
import re
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent / 'backend'))

from sqlmodel import Session, select
from main import engine, Project, Case


def update_url_extension(url: str) -> str:
    """Replace .jpg/.png with .webp in uploads URLs"""
    if '/uploads/' in url:
        # Match pattern like: /uploads/abc123.jpg or /uploads/abc123.png
        return re.sub(r'(/uploads/[a-f0-9]+)\.(jpg|jpeg|png)$', r'\1.webp', url, flags=re.IGNORECASE)
    return url


def migrate_projects(session: Session) -> int:
    """Update image URLs in all projects"""
    count = 0
    projects = session.exec(select(Project)).all()

    for project in projects:
        updated = False

        # Update cover_image
        if project.cover_image:
            new_url = update_url_extension(project.cover_image)
            if new_url != project.cover_image:
                print(f"  Project '{project.slug}' cover: {project.cover_image} -> {new_url}")
                project.cover_image = new_url
                updated = True

        # Update gallery
        if project.gallery:
            new_gallery = []
            for url in project.gallery:
                new_url = update_url_extension(url)
                if new_url != url:
                    print(f"  Project '{project.slug}' gallery: {url} -> {new_url}")
                    updated = True
                new_gallery.append(new_url)
            if updated:
                project.gallery = new_gallery

        if updated:
            session.add(project)
            count += 1

    return count


def migrate_cases(session: Session) -> int:
    """Update image URLs in all cases"""
    count = 0
    cases = session.exec(select(Case)).all()

    for case in cases:
        if case.image:
            new_url = update_url_extension(case.image)
            if new_url != case.image:
                print(f"  Case '{case.slug}' image: {case.image} -> {new_url}")
                case.image = new_url
                session.add(case)
                count += 1

    return count


def main():
    print("=" * 60)
    print("Image URL Migration: JPG/PNG -> WebP")
    print("=" * 60)

    with Session(engine) as session:
        print("\nMigrating Projects...")
        project_count = migrate_projects(session)

        print("\nMigrating Cases...")
        case_count = migrate_cases(session)

        if project_count > 0 or case_count > 0:
            print(f"\nCommitting changes...")
            session.commit()
            print(f"✓ Updated {project_count} projects and {case_count} cases")
        else:
            print("\n✓ No URLs need to be updated")

    print("\nMigration complete!")


if __name__ == '__main__':
    main()
