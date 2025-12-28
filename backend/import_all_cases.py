#!/usr/bin/env python3
"""
Import all cases from static HTML files into the database via API.
"""
import os
import re
import json
import requests
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import unquote


# Configuration
API_BASE = os.getenv("API_BASE", "https://portfolio-saqh.onrender.com")
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "bugrov2025")

PROJECTS_DIR = Path(__file__).parent.parent / "docs" / "proekty"


class ProjectHTMLParser(HTMLParser):
    """Parse project HTML to extract all data."""

    def __init__(self):
        super().__init__()
        self.data = {
            "title": "",
            "category": "",
            "cover_image": "",
            "short_description": "",
            "specialization": "",
            "duration": "",
            "services": [],
            "year": "",
            "website_url": "",
            "description": "",
            "gallery": []
        }

        self._current_tag = ""
        self._current_class = ""
        self._in_title = False
        self._in_h1 = False
        self._in_pi_title = False
        self._last_pi_title = ""
        self._in_pi_value = False
        self._in_services_list = False
        self._in_service_item = False
        self._in_description = False
        self._in_gallery = False
        self._in_text_45 = False
        self._in_rtb = False
        self._rtb_content = []

    def handle_starttag(self, tag, attrs):
        self._current_tag = tag
        attrs_dict = dict(attrs)
        self._current_class = attrs_dict.get("class", "")

        if tag == "title":
            self._in_title = True

        elif tag == "meta":
            name = attrs_dict.get("name", "")
            prop = attrs_dict.get("property", "")
            content = attrs_dict.get("content", "")

            if name == "description":
                self.data["short_description"] = content
            elif prop == "og:image":
                self.data["cover_image"] = content

        elif tag == "h1" and "project-h1" in self._current_class:
            self._in_h1 = True

        elif tag == "div":
            if "pi-title" in self._current_class:
                self._in_pi_title = True
            elif self._last_pi_title and not self._in_pi_value:
                self._in_pi_value = True
            elif "text-45px" in self._current_class:
                self._in_text_45 = True
            elif "rtb" in self._current_class and "mw-700" in self._current_class:
                self._in_rtb = True
                self._rtb_content = []

        elif tag == "a":
            href = attrs_dict.get("href", "")
            class_name = attrs_dict.get("class", "")
            if "site-button" in class_name and "w-condition-invisible" not in class_name:
                if href and href != "#":
                    self.data["website_url"] = href

        elif tag == "section":
            if "project-s2-section" in self._current_class:
                self._in_gallery = True

        elif tag == "img" and self._in_gallery:
            src = attrs_dict.get("src", "")
            if src and "/Portfolio/assets/" in src:
                self.data["gallery"].append(src)

        elif tag == "p" and self._in_rtb:
            pass  # Will capture text

    def handle_endtag(self, tag):
        if tag == "title":
            self._in_title = False
        elif tag == "h1":
            self._in_h1 = False
        elif tag == "div":
            if self._in_pi_title:
                self._in_pi_title = False
            elif self._in_pi_value:
                self._in_pi_value = False
                self._last_pi_title = ""
            elif self._in_text_45:
                self._in_text_45 = False
            elif self._in_rtb:
                self._in_rtb = False
                self.data["description"] = "\n\n".join(self._rtb_content)
        elif tag == "section" and self._in_gallery:
            self._in_gallery = False

    def handle_data(self, data):
        data = data.strip()
        if not data:
            return

        if self._in_title:
            # Parse "Категория, Название"
            if ", " in data:
                parts = data.split(", ", 1)
                self.data["category"] = parts[0]
                self.data["title"] = parts[1] if len(parts) > 1 else parts[0]
            else:
                self.data["title"] = data

        elif self._in_h1:
            self.data["title"] = data

        elif self._in_pi_title:
            self._last_pi_title = data.lower()

        elif self._in_pi_value:
            if self._last_pi_title == "специализация":
                self.data["specialization"] = data
            elif self._last_pi_title == "срок":
                self.data["duration"] = data
            elif self._last_pi_title == "год":
                self.data["year"] = data
            elif self._last_pi_title == "услуги":
                if data not in self.data["services"]:
                    self.data["services"].append(data)

        elif self._in_text_45:
            self.data["short_description"] = data

        elif self._in_rtb and self._current_tag == "p":
            self._rtb_content.append(data)


def parse_project_html(html_path: Path) -> dict:
    """Parse a project HTML file and extract all data."""
    with open(html_path, "r", encoding="utf-8") as f:
        content = f.read()

    parser = ProjectHTMLParser()
    parser.feed(content)

    return parser.data


def get_auth_token() -> str:
    """Get JWT token from API."""
    response = requests.post(
        f"{API_BASE}/auth/login",
        json={"username": ADMIN_USERNAME, "password": ADMIN_PASSWORD}
    )
    response.raise_for_status()
    return response.json()["access_token"]


def create_project(token: str, project_data: dict) -> dict:
    """Create a project via API."""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(
        f"{API_BASE}/admin/projects",
        json=project_data,
        headers=headers
    )

    if response.status_code == 409:
        print(f"  Project '{project_data['slug']}' already exists, skipping...")
        return None

    response.raise_for_status()
    return response.json()


def main():
    """Main import function."""
    print(f"Importing projects from {PROJECTS_DIR}")
    print(f"API Base: {API_BASE}")
    print()

    # Get auth token
    print("Authenticating...")
    try:
        token = get_auth_token()
        print("Authentication successful!")
    except Exception as e:
        print(f"Authentication failed: {e}")
        return

    print()

    # Find all project directories
    project_dirs = [d for d in PROJECTS_DIR.iterdir()
                    if d.is_dir() and (d / "index.html").exists()]

    print(f"Found {len(project_dirs)} projects to import")
    print()

    imported = 0
    skipped = 0

    for project_dir in sorted(project_dirs):
        slug = project_dir.name
        html_path = project_dir / "index.html"

        print(f"Processing: {slug}")

        try:
            # Parse HTML
            data = parse_project_html(html_path)

            # Build project data
            project_data = {
                "slug": slug,
                "title": data["title"],
                "category": data["category"] or "Сайты",
                "cover_image": data["cover_image"],
                "enabled": True,
                "specialization": data["specialization"],
                "duration": data["duration"],
                "services": data["services"],
                "year": data["year"],
                "website_url": data["website_url"],
                "short_description": data["short_description"],
                "description": data["description"],
                "gallery": data["gallery"],
                "blocks": []
            }

            print(f"  Title: {project_data['title']}")
            print(f"  Category: {project_data['category']}")
            print(f"  Services: {', '.join(project_data['services'])}")
            print(f"  Gallery: {len(project_data['gallery'])} images")

            # Create project
            result = create_project(token, project_data)
            if result:
                print(f"  ✓ Imported successfully!")
                imported += 1
            else:
                skipped += 1

        except Exception as e:
            print(f"  ✗ Error: {e}")
            skipped += 1

        print()

    print("=" * 50)
    print(f"Import complete!")
    print(f"  Imported: {imported}")
    print(f"  Skipped: {skipped}")


if __name__ == "__main__":
    main()
