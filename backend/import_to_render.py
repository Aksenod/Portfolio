#!/usr/bin/env python3
"""
Import projects to Render backend via API.
"""

import os
import re
import requests
from pathlib import Path
from typing import List, Dict, Optional

API_BASE = "https://portfolio-saqh.onrender.com"
ADMIN_LOGIN = "admin"
ADMIN_PASSWORD = "bugrov2025"


def slugify(text: str) -> str:
    """Convert text to slug (lowercase, hyphens, alphanumeric)."""
    # Remove special chars, keep cyrillic and latin
    text = re.sub(r"[^\w\s-]", "", text.lower())
    # Replace spaces and multiple hyphens with single hyphen
    text = re.sub(r"[-\s]+", "-", text)
    # Remove leading/trailing hyphens
    return text.strip("-")


def get_auth_token() -> str:
    """Get JWT token from admin login."""
    response = requests.post(f"{API_BASE}/auth/login", json={
        "username": ADMIN_LOGIN,
        "password": ADMIN_PASSWORD
    })
    
    if response.status_code != 200:
        raise Exception(f"Login failed: {response.status_code} - {response.text}")
    
    return response.json()["access_token"]


def parse_project_html(project_dir: Path) -> Optional[Dict]:
    """Parse project HTML to extract basic info."""
    index_file = project_dir / "index.html"
    if not index_file.exists():
        return None
    
    with open(index_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract title
    title_match = re.search(r'<title[^>]*>([^<]+)</title>', content, re.IGNORECASE)
    title = title_match.group(1).strip() if title_match else project_dir.name
    
    # Extract description
    desc_match = re.search(r'<meta[^>]+name=["\']description["\'][^>]+content=["\']([^"\']+)["\']', content, re.IGNORECASE)
    description = desc_match.group(1).strip() if desc_match else ""
    
    # Extract category from path or content
    category = "Сайты"  # default
    if "branding" in content.lower() or "брендинг" in content.lower():
        category = "Брендинг"
    elif "presentation" in content.lower() or "презентация" in content.lower():
        category = "Презентации"
    
    # Extract cover image
    cover_image = ""
    img_match = re.search(r'<img[^>]+src=["\']([^"\']+)["\']', content, re.IGNORECASE)
    if img_match:
        cover_image = img_match.group(1).strip()
    
    return {
        "slug": slugify(project_dir.name),
        "title": title,
        "category": category,
        "cover_image": cover_image,
        "description": description,
    }


def import_projects():
    """Import all projects to Render backend via API."""
    projects_dir = Path(__file__).parent.parent / "docs" / "proekty"
    if not projects_dir.exists():
        print(f"Projects directory not found: {projects_dir}")
        return
    
    # Get auth token
    print("Getting auth token...")
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    imported = 0
    skipped = 0
    
    # Get existing projects
    print("Getting existing projects...")
    existing_response = requests.get(f"{API_BASE}/projects", headers=headers)
    existing_slugs = set()
    if existing_response.status_code == 200:
        for project in existing_response.json():
            existing_slugs.add(project["slug"])
    
    print(f"Found {len(existing_slugs)} existing projects")
    
    # Import projects
    for project_dir in projects_dir.iterdir():
        if not project_dir.is_dir() or project_dir.name.startswith("."):
            continue
        
        project_data = parse_project_html(project_dir)
        if not project_data:
            print(f"Skipping {project_dir.name}: could not parse")
            skipped += 1
            continue
        
        # Check if already exists
        if project_data["slug"] in existing_slugs:
            print(f"Skipping {project_data['slug']}: already exists")
            skipped += 1
            continue
        
        # Create project via API
        response = requests.post(f"{API_BASE}/admin/projects", 
                               json=project_data, 
                               headers=headers)
        
        if response.status_code == 201:
            print(f"Imported: {project_data['slug']} ({project_data['category']})")
            imported += 1
        else:
            print(f"Failed to import {project_data['slug']}: {response.status_code} - {response.text}")
            skipped += 1
    
    print(f"\nImport complete: {imported} imported, {skipped} skipped")


if __name__ == "__main__":
    import_projects()
