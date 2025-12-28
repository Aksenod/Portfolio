#!/usr/bin/env python3
"""
Import existing projects from /proekty/*/index.html into the new Project model.
Run this once after backend is deployed to populate the database.
"""

import os
import re
import uuid
from pathlib import Path
from typing import List, Dict, Optional

from sqlmodel import Session, select
from main import Project, engine, CategoryType


def slugify(text: str) -> str:
    """Convert text to slug (lowercase, hyphens, alphanumeric)."""
    # Remove special chars, keep cyrillic and latin
    text = re.sub(r"[^\w\s-]", "", text.lower())
    return re.sub(r"[-\s]+", "-", text).strip("-")


def parse_project_html(project_dir: Path) -> Optional[Dict]:
    """Parse project HTML to extract title, description, category, cover image."""
    index_file = project_dir / "index.html"
    if not index_file.exists():
        return None

    with open(index_file, "r", encoding="utf-8") as f:
        content = f.read()

    # Extract title from <title> tag
    title_match = re.search(r"<title>([^<]+)</title>", content)
    title = title_match.group(1) if title_match else project_dir.name

    # Extract description from meta description
    desc_match = re.search(r'<meta content="([^"]+)" name="description"', content)
    description = desc_match.group(1) if desc_match else ""

    # Extract og:image for cover
    og_image_match = re.search(r'<meta content="([^"]+)" property="og:image"', content)
    cover_image = og_image_match.group(1) if og_image_match else ""

    # Determine category from title or description
    category = "Сайты"  # default
    title_lower = title.lower()
    desc_lower = description.lower()
    
    if "презентация" in title_lower or "презентации" in title_lower:
        category = "Презентации"
    elif "бренд" in title_lower or "фирменный стиль" in desc_lower:
        category = "Брендинг"
    elif "аудит" in title_lower or "проверка" in desc_lower:
        category = "Аудит"
    elif "рекомендац" in title_lower:
        category = "Рекомендации"

    return {
        "slug": slugify(project_dir.name),
        "title": title,
        "category": category,
        "cover_image": cover_image,
        "description": description,
    }


def import_projects():
    """Import all projects from /docs/proekty directory into database."""
    projects_dir = Path(__file__).parent.parent / "docs" / "proekty"
    if not projects_dir.exists():
        print(f"Projects directory not found: {projects_dir}")
        return

    imported = 0
    skipped = 0

    with Session(engine) as session:
        for project_dir in projects_dir.iterdir():
            if not project_dir.is_dir() or project_dir.name.startswith("."):
                continue

            project_data = parse_project_html(project_dir)
            if not project_data:
                print(f"Skipping {project_dir.name}: could not parse")
                skipped += 1
                continue

            # Check if project with this slug already exists
            existing = session.exec(select(Project).where(Project.slug == project_data["slug"])).first()
            if existing:
                print(f"Skipping {project_data['slug']}: already exists")
                skipped += 1
                continue

            # Create project with empty blocks (will be filled later in admin)
            project = Project(
                slug=project_data["slug"],
                title=project_data["title"],
                category=project_data["category"],
                cover_image=project_data["cover_image"],
                enabled=True,
                blocks=[],  # Empty blocks for now
            )

            session.add(project)
            session.commit()
            session.refresh(project)

            print(f"Imported: {project_data['slug']} ({project_data['category']})")
            imported += 1

    print(f"\nImport complete: {imported} imported, {skipped} skipped")


if __name__ == "__main__":
    import_projects()
