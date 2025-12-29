# CLAUDE.md - AI Assistant Guide for Portfolio Project

> **Purpose**: This document provides AI assistants with comprehensive context about this portfolio codebase to enable effective development assistance.

**Last Updated**: 2025-12-29
**Project Type**: Full-stack portfolio website
**Tech Stack**: FastAPI (backend) + Vanilla JS (frontend) + PostgreSQL/SQLite
**Deployment**: Render (backend) + GitHub Pages (frontend)

---

## Table of Contents

1. [Quick Reference](#quick-reference)
2. [Project Architecture](#project-architecture)
3. [Codebase Structure](#codebase-structure)
4. [Backend Deep Dive](#backend-deep-dive)
5. [Frontend Deep Dive](#frontend-deep-dive)
6. [Development Workflows](#development-workflows)
7. [Common Tasks & Patterns](#common-tasks--patterns)
8. [Deployment & Operations](#deployment--operations)
9. [Troubleshooting Guide](#troubleshooting-guide)
10. [AI Development Guidelines](#ai-development-guidelines)

---

## Quick Reference

### Essential Files to Read First

When assisting with this project, **always read these files first**:

1. **`.cursorrules`** (159 lines) - Project conventions, stack details, critical rules
2. **`backend/main.py`** (637 lines) - Core API with all routes, models, auth
3. **`docs/admin/index.html`** (1,877 lines) - Complete admin panel implementation
4. **`docs/api-config.js`** - API base URL configuration
5. **`backend/cases_data.json`** - Project seed data (13 projects)

### Key Commands

```bash
# Backend local dev
cd backend && uvicorn main:app --reload

# Frontend local dev
cd docs && python -m http.server 4173

# Test backend health
curl http://127.0.0.1:8000/health

# View API docs
open http://127.0.0.1:8000/docs
```

### Production URLs

- **Backend API**: `https://portfolio-saqh.onrender.com`
- **Frontend**: `https://aksenod.github.io/Portfolio/`
- **Admin Panel**: `https://aksenod.github.io/Portfolio/admin/`

### Current Git Branch

**Active Branch**: `claude/claude-md-mjqq4kifycoijcwz-IPz4U`
**Main Branch**: `main` (used for GitHub Pages deployment)

---

## Project Architecture

### High-Level Overview

```
┌──────────────────────────────────────────────────────────────┐
│                        GitHub Pages                          │
│  ┌─────────────────┐  ┌──────────────────┐  ┌─────────────┐ │
│  │   Static Pages  │  │   Admin Panel    │  │  API Config │ │
│  │  (Webflow HTML) │  │ (Vanilla JS SPA) │  │    (JS)     │ │
│  └────────┬────────┘  └────────┬─────────┘  └──────┬──────┘ │
│           │                    │                     │        │
│           └────────────────────┴─────────────────────┘        │
│                                 │                             │
└─────────────────────────────────┼─────────────────────────────┘
                                  │ HTTPS
                                  ▼
                    ┌─────────────────────────────┐
                    │      Render (Backend)       │
                    │  ┌────────────────────────┐ │
                    │  │   FastAPI + SQLModel   │ │
                    │  │    JWT Auth System     │ │
                    │  └──────────┬─────────────┘ │
                    │             │                │
                    │  ┌──────────▼─────────────┐ │
                    │  │  PostgreSQL Database   │ │
                    │  │  (Projects & Cases)    │ │
                    │  └────────────────────────┘ │
                    └─────────────────────────────┘
```

### Technology Stack

**Backend** (`backend/`):
- **Framework**: FastAPI 0.115.6
- **ORM**: SQLModel 0.0.22 (SQLAlchemy 2.0)
- **Database**: PostgreSQL (prod) / SQLite (dev)
- **Auth**: PyJWT 2.10.1 (HS256 algorithm)
- **Password Hashing**: bcrypt (recommended) or plain-text (dev only)
- **CORS**: FastAPI middleware
- **Python Version**: 3.12.8 (locked in `runtime.txt`)

**Frontend** (`docs/`):
- **Pages**: Webflow-generated HTML/CSS
- **Admin Panel**: Vanilla JavaScript (no framework)
- **Image Uploads**: ImgBB API
- **Styling**: Inline CSS + Webflow classes
- **Storage**: localStorage (JWT token)
- **Fonts**: CraftworkGrotesk (Regular, Medium, Bold, Heavy)

**Deployment**:
- **Backend**: Render Web Service (auto-deploy from `main` branch)
- **Frontend**: GitHub Pages (serves from `/docs` folder on `main` branch)

---

## Codebase Structure

### Directory Tree

```
Portfolio/
├── backend/                          # FastAPI backend service
│   ├── main.py                      # ⭐ Core API (637 lines)
│   ├── requirements.txt             # Python dependencies (8 packages)
│   ├── runtime.txt                  # Python 3.12.8 specification
│   ├── .env.example                 # Environment variable template
│   ├── app.db                       # SQLite database (local dev, gitignored)
│   ├── cases_data.json              # ⭐ Project seed data (22.2 KB)
│   ├── README.md                    # Backend setup instructions
│   ├── start.sh                     # Render startup script
│   ├── parse_cases.py               # HTML parser (generates cases_data.json)
│   ├── import_all_cases.py          # API-based bulk import script
│   ├── import_projects.py           # Direct DB import (local)
│   └── import_to_render.py          # Render deployment import
│
├── docs/                            # Frontend (GitHub Pages)
│   ├── index.html                   # Homepage (24.2 KB, Webflow)
│   ├── 404.html                     # Custom error page
│   ├── api-config.js                # ⭐ API base URL config
│   ├── _redirects                   # Render routing rules
│   │
│   ├── admin/
│   │   ├── index.html               # ⭐ Admin panel (1,877 lines)
│   │   └── cases_data.json          # Offline mode fallback data
│   │
│   ├── proekty/                     # Project case studies
│   │   ├── miroko/index.html
│   │   ├── fetratech/index.html
│   │   ├── actorsworld/index.html
│   │   ├── endymion/index.html
│   │   ├── svizraa/index.html
│   │   ├── taya-house/index.html
│   │   ├── ksl-ag/index.html
│   │   ├── the-mellows/index.html
│   │   ├── money-marketing/index.html
│   │   └── [13 projects total]
│   │
│   ├── about/index.html             # About page
│   ├── audit/index.html             # Audit page
│   ├── cases/index.html             # Cases listing
│   ├── contacts/index.html          # Contact page
│   ├── presentations/index.html     # Presentations
│   ├── rekomendacii/index.html      # Recommendations
│   ├── websites/index.html          # Websites category
│   │
│   └── assets/                      # Static assets
│       ├── 62797855494abeff5a9f1db0/
│       │   ├── css/bugrov.webflow.*.css
│       │   ├── js/webflow.*.js
│       │   └── fonts/*.ttf (CraftworkGrotesk)
│       └── external/                # Cached external assets
│
├── .cursorrules                     # ⭐ Development rules (159 lines)
├── .gitignore                       # Git ignore patterns
├── Procfile                         # Render process definition
├── README.md                        # Project overview
└── CLAUDE.md                        # This file
```

### Important File Locations

| File | Purpose | When to Read |
|------|---------|--------------|
| `backend/main.py` | All backend logic | Any backend task |
| `backend/cases_data.json` | Project seed data | Data migration, imports |
| `docs/admin/index.html` | Complete admin panel | Frontend admin work |
| `docs/api-config.js` | API URL configuration | API integration issues |
| `.cursorrules` | Project conventions | Before starting any task |
| `backend/.env.example` | Required env vars | Setup, deployment issues |

---

## Backend Deep Dive

### File: `backend/main.py` (637 lines)

**Critical Sections**:

1. **Lines 1-50**: Imports, environment setup, database engine creation
2. **Lines 51-150**: Data models (`Project`, `Case`, create/update schemas)
3. **Lines 151-200**: Database session management, JWT functions
4. **Lines 201-300**: Startup event (migrations, data import)
5. **Lines 301-400**: Public endpoints (`/health`, `/projects`, `/cases`)
6. **Lines 401-500**: Admin endpoints (CRUD for projects/cases)
7. **Lines 501-637**: Auth endpoints, utility functions, error handlers

### Data Models

**Project Model** (Primary Content Type):

```python
class Project(SQLModel, table=True):
    __tablename__ = "projects"

    # Primary fields
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    slug: str = Field(index=True, unique=True)  # URL-safe identifier
    title: str
    category: Literal["Сайты", "Презентации", "Брендинг", "Сервисы"]
    cover_image: str  # URL to cover image
    enabled: bool = Field(default=True)  # Publish flag

    # Metadata
    specialization: str = Field(default="")
    duration: str = Field(default="")
    services: str = Field(default="[]")  # JSON array as string
    year: str = Field(default="")
    website_url: str = Field(default="")

    # Content
    short_description: str = Field(default="")
    description: str = Field(default="")  # Markdown supported
    gallery: str = Field(default="[]")  # JSON array of image URLs
    blocks: str = Field(default="[]")  # Legacy polymorphic blocks

    # Timestamps
    created_at: datetime = Field(default_factory=_now_utc)
    updated_at: datetime = Field(default_factory=_now_utc)
```

**Important**:
- `services` and `gallery` are stored as JSON strings, not native arrays
- Always parse with `json.loads()` before using
- `slug` is indexed and unique (used for lookups)
- `enabled=True` means published (visible in public API)

**Case Model** (Legacy, Rarely Used):

```python
class Case(SQLModel, table=True):
    __tablename__ = "cases"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    title: str
    category: str
    url: str
    image: str
    enabled: bool = Field(default=True)
```

### Authentication System

**JWT Implementation**:

```python
# Location: backend/main.py:155-180

def _create_jwt(username: str) -> str:
    """Create JWT token with username claim"""
    payload = {
        "sub": username,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=JWT_EXPIRES_MINUTES)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

def _verify_jwt(token: str) -> str:
    """Verify JWT and return username"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return payload["sub"]
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

**Password Verification**:

```python
# Location: backend/main.py:140-153

def _verify_password(plain: str, hashed: str | None) -> bool:
    """Verify password (bcrypt hash or plain-text fallback)"""
    if not hashed:
        return False

    # Development: plain-text comparison
    if not hashed.startswith("$2"):
        return plain == hashed

    # Production: bcrypt hash
    import bcrypt
    return bcrypt.checkpw(plain.encode(), hashed.encode())
```

**Auth Dependency**:

```python
# Location: backend/main.py:185-195

async def require_auth(authorization: str | None = Header(None)) -> str:
    """Dependency: Extract and verify JWT from Authorization header"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing token")

    token = authorization.split(" ", 1)[1]
    return _verify_jwt(token)  # Returns username or raises 401
```

### API Endpoints Reference

**Public Endpoints** (No Auth Required):

| Method | Path | Purpose | Returns |
|--------|------|---------|---------|
| GET | `/health` | Health check | `{"status": "ok"}` |
| GET | `/version` | Deployment info | `{"python_version", "git_commit"}` |
| GET | `/projects` | List published projects | `[{Project}, ...]` (only enabled=true) |
| GET | `/projects/{slug}` | Get single project | `{Project}` or 404 |
| GET | `/cases` | List published cases | `[{Case}, ...]` (only enabled=true) |
| POST | `/force-update` | Sync from GitHub JSON | `{"updated": N, "created": M, "downloaded": bool}` |

**Admin Endpoints** (JWT Required via `Authorization: Bearer <token>`):

| Method | Path | Purpose | Returns | Notes |
|--------|------|---------|---------|-------|
| POST | `/auth/login` | Generate JWT | `{"access_token", "token_type"}` | Body: `{"username", "password"}` |
| GET | `/admin/projects` | List all projects | `[{Project}, ...]` | Includes disabled |
| POST | `/admin/projects` | Create project | `{Project}` | 201 Created |
| PATCH | `/admin/projects/{id}` | Update project | `{Project}` | Partial updates |
| DELETE | `/admin/projects/{id}` | Delete project | 204 No Content | Empty response |
| GET | `/admin/cases` | List all cases | `[{Case}, ...]` | Includes disabled |
| POST | `/admin/cases` | Create case | `{Case}` | 201 Created |
| PATCH | `/admin/cases/{id}` | Update case | `{Case}` | Partial updates |
| DELETE | `/admin/cases/{id}` | Delete case | 204 No Content | Empty response |

### Startup Logic

**Database Migrations** (`backend/main.py:210-250`):

On every startup, the backend:

1. **Adds missing columns** for backward compatibility:
   ```python
   ALTER TABLE projects ADD COLUMN IF NOT EXISTS specialization TEXT DEFAULT '';
   ALTER TABLE projects ADD COLUMN IF NOT EXISTS duration TEXT DEFAULT '';
   # ... etc for all new fields
   ```

2. **Creates all tables** (if not exist):
   ```python
   SQLModel.metadata.create_all(engine)
   ```

3. **Imports seed data** (if database is empty):
   ```python
   if len(existing_projects) == 0:
       _import_cases_from_json()  # Load from cases_data.json
   ```

4. **Updates existing projects** from GitHub:
   ```python
   _update_projects_from_json()  # Downloads fresh cases_data.json
   ```

**Important**: This means data migrations are automatic, and the backend is self-healing on startup.

### Environment Variables

**Required**:

```bash
JWT_SECRET=<32+ character random string>  # CRITICAL: Never commit!
```

**Optional** (with defaults):

```bash
ADMIN_USERNAME=admin                     # Default: "admin"
ADMIN_PASSWORD=bugrov2025               # Dev only: plain-text password
ADMIN_PASSWORD_HASH=<bcrypt hash>       # Prod: overrides ADMIN_PASSWORD
DATABASE_URL=sqlite:///./app.db         # Default: SQLite, Render sets PostgreSQL
FRONTEND_ORIGINS=http://localhost:4173  # Comma-separated CORS origins
JWT_EXPIRES_MINUTES=43200               # Default: 30 days (43200 minutes)
```

**Example `.env` file**:

```bash
# backend/.env (local development)
JWT_SECRET=dev-secret-key-change-in-production
ADMIN_USERNAME=admin
ADMIN_PASSWORD=bugrov2025
DATABASE_URL=sqlite:///./app.db
FRONTEND_ORIGINS=http://127.0.0.1:4173,http://localhost:4173
```

### Database Schema

**Tables**:

- `projects` - Main content table (13 rows in seed data)
- `cases` - Legacy case studies (rarely used)

**Indexes**:

- `projects.slug` (unique index for fast lookups)

**No Foreign Keys**: Both tables are independent.

### Common Backend Patterns

**UTC Timestamps**:

```python
# ALWAYS use UTC, never local time
def _now_utc() -> datetime:
    return datetime.now(timezone.utc)

# In models:
created_at: datetime = Field(default_factory=_now_utc)
```

**JSON Field Handling**:

```python
# Services and gallery are stored as JSON strings
services_list: list[str] = json.loads(project.services or "[]")
gallery_list: list[str] = json.loads(project.gallery or "[]")

# When updating:
project.services = json.dumps(["UX/UI Design", "Branding"])
```

**Database URL Normalization**:

```python
# Render provides postgres://, SQLAlchemy requires postgresql://
url = os.getenv("DATABASE_URL", "sqlite:///./app.db")
if url.startswith("postgres://"):
    url = url.replace("postgres://", "postgresql://", 1)
```

**CORS Origin Parsing**:

```python
# Comma-separated string → list of origins
origins_str = os.getenv("FRONTEND_ORIGINS", "")
origins = [o.strip() for o in origins_str.split(",") if o.strip()]
if not origins:
    origins = ["*"]  # Allow all if not specified (dev only!)
```

---

## Frontend Deep Dive

### File: `docs/admin/index.html` (1,877 lines)

**Structure**:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Admin Panel</title>
  <style>/* 200+ lines of inline CSS */</style>
</head>
<body>
  <!-- Login Screen (lines 50-100) -->
  <div id="login-screen">...</div>

  <!-- Admin Panel (lines 100-300) -->
  <div id="admin-panel" style="display: none;">
    <header>...</header>
    <main>
      <div id="projects-grid">...</div>
    </main>
  </div>

  <!-- Edit Modal (lines 300-600) -->
  <div id="edit-modal" class="modal">
    <form id="project-form">...</form>
  </div>

  <script>/* 1,200+ lines of vanilla JavaScript */</script>
</body>
</html>
```

**Critical JavaScript Sections**:

| Lines | Section | Purpose |
|-------|---------|---------|
| 600-650 | Global variables | `authToken`, `projects`, `currentServices`, etc. |
| 650-700 | API helpers | `apiRequest()`, `loadProjects()` |
| 700-800 | Authentication | `login()`, `logout()`, token management |
| 800-1000 | Project rendering | `renderProjects()`, card generation |
| 1000-1200 | Form handling | `openEditModal()`, `saveProject()` |
| 1200-1400 | Gallery management | Drag-and-drop, image uploads |
| 1400-1600 | Services tags | Add/remove tags |
| 1600-1800 | Error handling | Offline mode, 401 auto-logout |

### Admin Panel Features

**1. Authentication Flow**:

```javascript
// Login (lines 710-740)
async function login() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  const data = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });

  authToken = data.access_token;
  localStorage.setItem('adminToken', authToken);
  showAdminPanel();
}

// Auto-login on page load (lines 1750-1760)
authToken = localStorage.getItem('adminToken');
if (authToken) {
  showAdminPanel();
} else {
  showLoginScreen();
}
```

**2. Project CRUD Operations**:

```javascript
// Create (lines 1050-1100)
async function createProject() {
  const projectData = {
    title: document.getElementById('title').value,
    slug: document.getElementById('slug').value,
    category: document.getElementById('category').value,
    enabled: document.getElementById('enabled').checked,
    services: JSON.stringify(currentServices),
    gallery: JSON.stringify(currentGallery),
    // ... other fields
  };

  const project = await apiRequest('/admin/projects', {
    method: 'POST',
    body: JSON.stringify(projectData)
  });

  projects.push(project);
  renderProjects();
}

// Update (lines 1100-1150)
async function updateProject(id) {
  const projectData = { /* same as create */ };

  const updated = await apiRequest(`/admin/projects/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(projectData)
  });

  const index = projects.findIndex(p => p.id === id);
  projects[index] = updated;
  renderProjects();
}

// Delete (lines 1150-1200)
async function deleteProject(id) {
  if (!confirm('Удалить проект?')) return;

  await apiRequest(`/admin/projects/${id}`, {
    method: 'DELETE'
  });

  projects = projects.filter(p => p.id !== id);
  renderProjects();
}
```

**3. Offline Mode**:

```javascript
// Fallback to local JSON (lines 900-950)
async function loadLocalData() {
  try {
    const response = await fetch('./cases_data.json');
    const data = await response.json();

    // Transform JSON structure to match API
    return data.map((item, index) => ({
      id: `local-${index}`,
      ...item,
      services: JSON.stringify(item.services || []),
      gallery: JSON.stringify(item.gallery || [])
    }));
  } catch (error) {
    console.error('Failed to load local data:', error);
    return [];
  }
}

// Show offline warning (lines 800-820)
if (projects.length === 0) {
  projects = await loadLocalData();
  document.getElementById('offline-banner').style.display = 'block';
}
```

**4. Image Upload Integration**:

```javascript
// ImgBB API (lines 1300-1350)
async function uploadImage(file) {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch('https://api.imgbb.com/1/upload?key=YOUR_API_KEY', {
    method: 'POST',
    body: formData
  });

  const data = await response.json();
  return data.data.url;  // Direct image URL
}

// File input handler (lines 1350-1380)
document.getElementById('cover-upload').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const url = await uploadImage(file);
  document.getElementById('cover-image').value = url;
});
```

**5. Gallery Drag-and-Drop**:

```javascript
// Drag handlers (lines 1400-1500)
let draggedIndex = null;

function handleDragStart(e) {
  draggedIndex = parseInt(e.target.dataset.index);
  e.target.style.opacity = '0.5';
}

function handleDrop(e) {
  e.preventDefault();
  const dropIndex = parseInt(e.target.dataset.index);

  // Swap items
  const [removed] = currentGallery.splice(draggedIndex, 1);
  currentGallery.splice(dropIndex, 0, removed);

  renderGallery();  // Re-render with new order
}
```

### File: `docs/api-config.js` (1 line)

```javascript
window.__API_BASE = window.__API_BASE || 'https://portfolio-saqh.onrender.com';
```

**Usage in Admin Panel**:

```javascript
const API_BASE = window.__API_BASE || 'https://portfolio-saqh.onrender.com';

async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  // ... fetch request
}
```

**Override for Local Dev**:

```html
<!-- Add before api-config.js -->
<script>
  window.__API_BASE = 'http://127.0.0.1:8000';
</script>
<script src="../api-config.js"></script>
```

### Frontend Patterns

**Error Handling**:

```javascript
// 401 Auto-Logout (lines 670-690)
async function apiRequest(endpoint, options = {}) {
  try {
    const response = await fetch(url, options);

    if (response.status === 401) {
      localStorage.removeItem('adminToken');
      showLoginScreen();
      throw new Error('Сессия истекла. Войдите снова.');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || 'Ошибка запроса');
    }

    return response.json();
  } catch (error) {
    alert(`Ошибка: ${error.message}`);
    throw error;
  }
}
```

**Category Filtering**:

```javascript
// Filter logic (lines 850-880)
function filterByCategory(category) {
  currentCategory = category;
  renderProjects();
}

function renderProjects() {
  const filtered = currentCategory === 'all'
    ? projects
    : projects.filter(p => p.category === currentCategory);

  // Render filtered list
  const html = filtered.map(p => `<div class="project-card">...</div>`).join('');
  document.getElementById('projects-grid').innerHTML = html;
}
```

**Form State Management**:

```javascript
// Global state (lines 620-640)
let editingId = null;  // null = create, UUID = update
let currentServices = [];
let currentGallery = [];

// Open for editing (lines 1000-1050)
function openEditModal(project = null) {
  if (project) {
    editingId = project.id;
    currentServices = JSON.parse(project.services || "[]");
    currentGallery = JSON.parse(project.gallery || "[]");

    // Populate form fields
    document.getElementById('title').value = project.title;
    document.getElementById('slug').value = project.slug;
    // ... etc
  } else {
    editingId = null;
    currentServices = [];
    currentGallery = [];
    document.getElementById('project-form').reset();
  }

  renderServices();
  renderGallery();
  document.getElementById('edit-modal').style.display = 'block';
}
```

---

## Development Workflows

### Local Development Setup

**1. Backend Setup**:

```bash
# Navigate to backend
cd backend

# Create virtual environment (first time only)
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # macOS/Linux
# OR
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Edit .env with your values
nano .env
# Set: JWT_SECRET=dev-secret-key-12345
#      DATABASE_URL=sqlite:///./app.db
#      FRONTEND_ORIGINS=http://127.0.0.1:4173,http://localhost:4173

# Run development server with auto-reload
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Server starts at: http://127.0.0.1:8000
# API docs: http://127.0.0.1:8000/docs
# Health check: http://127.0.0.1:8000/health
```

**2. Frontend Setup**:

```bash
# Navigate to frontend
cd docs

# Start simple HTTP server
python3 -m http.server 4173

# OR use Node.js
npx http-server -p 4173

# Frontend available at: http://127.0.0.1:4173
# Admin panel: http://127.0.0.1:4173/admin/
```

**3. Verify Everything Works**:

```bash
# Test backend health
curl http://127.0.0.1:8000/health
# Expected: {"status":"ok"}

# Test projects endpoint
curl http://127.0.0.1:8000/projects
# Expected: JSON array of projects

# Test frontend loads
open http://127.0.0.1:4173

# Test admin panel
open http://127.0.0.1:4173/admin/
# Login: admin / bugrov2025 (from .env)
```

### Common Development Tasks

**Task 1: Add a New Project via Admin Panel**

1. Open `http://127.0.0.1:4173/admin/`
2. Login with credentials from `.env`
3. Click "Создать проект" (Create Project)
4. Fill form:
   - Title: "New Project"
   - Slug: "new-project" (URL-safe)
   - Category: "Сайты"
   - Enabled: ✓
   - Services: Add tags like "Web Design", "Development"
   - Gallery: Add image URLs
   - Descriptions: Fill short and full descriptions
5. Click "Сохранить" (Save)
6. Verify in grid view
7. Check backend database:
   ```bash
   # If using SQLite
   sqlite3 backend/app.db "SELECT title, slug FROM projects;"
   ```

**Task 2: Update `cases_data.json` from HTML**

```bash
cd backend

# Parse all HTML files in docs/proekty/*/index.html
python parse_cases.py

# Output: cases_data.json (overwrites existing)

# Review changes
git diff cases_data.json

# Commit if looks good
git add cases_data.json
git commit -m "Update cases_data.json from HTML parsing"
```

**Task 3: Import Projects to Database**

**Method A: API Import** (requires backend running):

```bash
cd backend

# Edit import_all_cases.py if needed (check API_URL and credentials)
python import_all_cases.py

# Output:
# ✓ Successfully created: Project Title
# ⚠ Already exists: Another Project
# ...
# Done: 13 projects processed
```

**Method B: Direct DB Import** (local only):

```bash
cd backend

# Directly insert into database (no API)
python import_projects.py

# Verify
sqlite3 app.db "SELECT COUNT(*) FROM projects;"
```

**Method C: Force Update via API** (production):

```bash
# Trigger sync from GitHub
curl -X POST https://portfolio-saqh.onrender.com/force-update

# Response:
# {"updated": 13, "created": 0, "downloaded": true}
```

**Task 4: Add a New API Endpoint**

1. Open `backend/main.py`
2. Add route function:
   ```python
   @app.get("/api/stats")
   async def get_stats(session: Session = Depends(get_session)):
       """Get project statistics"""
       projects = session.exec(select(Project)).all()
       return {
           "total": len(projects),
           "enabled": len([p for p in projects if p.enabled]),
           "by_category": {
               "Сайты": len([p for p in projects if p.category == "Сайты"]),
               # ... etc
           }
       }
   ```
3. Test locally:
   ```bash
   curl http://127.0.0.1:8000/api/stats
   ```
4. Update frontend to call new endpoint if needed

**Task 5: Change Admin Password**

**Development (plain-text)**:

```bash
# Edit backend/.env
ADMIN_PASSWORD=new-password-here

# Restart backend
# (auto-reloads if using uvicorn --reload)
```

**Production (bcrypt hash)**:

```python
# Generate hash
import bcrypt
password = "new-secure-password"
hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
print(hashed)
# Output: $2b$12$...

# Set in Render environment variables:
# ADMIN_PASSWORD_HASH=$2b$12$...
# (Remove ADMIN_PASSWORD if present)
```

### Data Migration Workflow

**Scenario**: Add a new field to `Project` model

**Steps**:

1. **Update Model** in `backend/main.py`:
   ```python
   class Project(SQLModel, table=True):
       # ... existing fields ...
       new_field: str = Field(default="")  # Add this
   ```

2. **Add Migration** in startup event:
   ```python
   @app.on_event("startup")
   async def startup_event():
       with engine.connect() as conn:
           # ... existing migrations ...
           conn.execute(text("""
               ALTER TABLE projects ADD COLUMN IF NOT EXISTS new_field TEXT DEFAULT ''
           """))
           conn.commit()
   ```

3. **Test Locally**:
   ```bash
   # Restart backend (migration runs automatically)
   uvicorn main:app --reload

   # Check database
   sqlite3 backend/app.db "PRAGMA table_info(projects);"
   # Should see new_field in column list
   ```

4. **Deploy to Production**:
   ```bash
   git add backend/main.py
   git commit -m "Add new_field to Project model"
   git push origin main

   # Render auto-deploys and runs startup migration
   ```

5. **Update Frontend** (if needed):
   ```html
   <!-- In docs/admin/index.html form -->
   <label for="new-field">New Field:</label>
   <input type="text" id="new-field" name="new_field">
   ```

**Important**: All migrations use `IF NOT EXISTS` to be idempotent (safe to run multiple times).

---

## Common Tasks & Patterns

### Pattern 1: Reading Projects from Database

```python
# Get all projects
from sqlmodel import select

with Session(engine) as session:
    projects = session.exec(select(Project)).all()

# Get enabled projects only
projects = session.exec(
    select(Project).where(Project.enabled == True)
).all()

# Get single project by slug
project = session.exec(
    select(Project).where(Project.slug == "miroko")
).first()

if not project:
    raise HTTPException(status_code=404, detail="Project not found")

# Parse JSON fields
services = json.loads(project.services or "[]")
gallery = json.loads(project.gallery or "[]")
```

### Pattern 2: Creating a New Project

```python
from uuid import uuid4

# From API request
project_data = {
    "title": "New Project",
    "slug": "new-project",
    "category": "Сайты",
    "services": ["Web Design", "Development"],
    "gallery": ["https://example.com/image1.jpg"],
    "enabled": True,
    # ... other fields
}

# Create model instance
project = Project(
    id=uuid4(),
    title=project_data["title"],
    slug=project_data["slug"],
    category=project_data["category"],
    services=json.dumps(project_data["services"]),  # Convert to JSON string
    gallery=json.dumps(project_data["gallery"]),
    enabled=project_data["enabled"],
    created_at=_now_utc(),
    updated_at=_now_utc()
)

# Save to database
with Session(engine) as session:
    # Check slug uniqueness
    existing = session.exec(
        select(Project).where(Project.slug == project.slug)
    ).first()

    if existing:
        raise HTTPException(status_code=409, detail="Slug already exists")

    session.add(project)
    session.commit()
    session.refresh(project)  # Get updated instance with auto-generated fields

return project
```

### Pattern 3: Updating a Project (Partial Updates)

```python
from uuid import UUID

# Parse update data
update_data = {
    "title": "Updated Title",
    "enabled": False,
    # Only fields that changed
}

project_id = UUID("123e4567-e89b-12d3-a456-426614174000")

with Session(engine) as session:
    # Get existing project
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Not found")

    # Update only provided fields
    for key, value in update_data.items():
        if hasattr(project, key):
            # Handle JSON fields
            if key in ("services", "gallery") and isinstance(value, list):
                value = json.dumps(value)

            setattr(project, key, value)

    project.updated_at = _now_utc()

    session.add(project)
    session.commit()
    session.refresh(project)

return project
```

### Pattern 4: Frontend API Request with Auth

```javascript
// In docs/admin/index.html

async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    ...(authToken && { Authorization: `Bearer ${authToken}` }),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  // Handle 401 (token expired)
  if (response.status === 401) {
    localStorage.removeItem('adminToken');
    showLoginScreen();
    throw new Error('Session expired. Please login again.');
  }

  // Handle 204 No Content (DELETE responses)
  if (response.status === 204) {
    return null;
  }

  // Handle errors
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Request failed: ${response.status}`);
  }

  return response.json();
}

// Usage examples:

// GET request
const projects = await apiRequest('/admin/projects');

// POST request
const newProject = await apiRequest('/admin/projects', {
  method: 'POST',
  body: JSON.stringify({
    title: 'New Project',
    slug: 'new-project',
    category: 'Сайты',
    enabled: true,
    services: JSON.stringify(['Design']),
    gallery: JSON.stringify([])
  })
});

// PATCH request
const updated = await apiRequest(`/admin/projects/${id}`, {
  method: 'PATCH',
  body: JSON.stringify({ enabled: false })
});

// DELETE request
await apiRequest(`/admin/projects/${id}`, {
  method: 'DELETE'
});
```

### Pattern 5: Image Upload to ImgBB

```javascript
// In docs/admin/index.html

const IMGBB_API_KEY = 'YOUR_API_KEY_HERE';  // Replace with actual key

async function uploadImage(file) {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    throw new Error('Image upload failed');
  }

  const data = await response.json();
  return data.data.url;  // Direct image URL
}

// Usage in file input handler:
document.getElementById('image-upload').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  try {
    const imageUrl = await uploadImage(file);
    document.getElementById('image-url-input').value = imageUrl;
    alert('Image uploaded successfully!');
  } catch (error) {
    alert(`Upload failed: ${error.message}`);
  }
});
```

---

## Deployment & Operations

### Render Deployment (Backend)

**Initial Setup**:

1. **Create Web Service** on Render dashboard
2. **Connect Repository**: Link GitHub repo `Aksenod/Portfolio`
3. **Configure Build**:
   - **Name**: `portfolio-backend`
   - **Root Directory**: `backend`
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `./start.sh` or `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. **Add Environment Variables**:
   ```
   JWT_SECRET=<generate-32-char-random-string>
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD_HASH=<bcrypt-hash-of-password>
   FRONTEND_ORIGINS=https://aksenod.github.io
   DATABASE_URL=<auto-provided-by-render-postgres>
   ```
5. **Create PostgreSQL Database**:
   - Add PostgreSQL add-on in Render dashboard
   - DATABASE_URL automatically injected
6. **Deploy**: Push to `main` branch triggers auto-deploy

**File: `backend/start.sh`**:

```bash
#!/bin/bash
uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
```

**Make executable**:

```bash
chmod +x backend/start.sh
git add backend/start.sh
git commit -m "Make start.sh executable"
```

**Monitoring**:

- **Logs**: Render dashboard → Service → Logs tab
- **Health Check**: `https://portfolio-saqh.onrender.com/health`
- **API Docs**: `https://portfolio-saqh.onrender.com/docs`

**Auto-Deploy Trigger**:

- Every push to `main` branch triggers deploy
- Build takes ~2-3 minutes
- Startup runs migrations automatically

### GitHub Pages Deployment (Frontend)

**Setup** (one-time):

1. Go to GitHub repo → Settings → Pages
2. **Source**: Deploy from a branch
3. **Branch**: `main`
4. **Folder**: `/docs`
5. Click Save

**Deployment**:

```bash
# Make changes to frontend
nano docs/admin/index.html

# Commit and push to main
git add docs/
git commit -m "Update admin panel UI"
git push origin main

# GitHub Actions builds and deploys automatically
# Live in ~1-2 minutes at:
# https://aksenod.github.io/Portfolio/
```

**Custom Domain** (optional):

- Add CNAME file in `docs/CNAME` with domain name
- Configure DNS A/CNAME records to GitHub Pages IPs

### Environment-Specific Configuration

**Local Development**:

```bash
# backend/.env
JWT_SECRET=dev-secret-key
ADMIN_PASSWORD=bugrov2025
DATABASE_URL=sqlite:///./app.db
FRONTEND_ORIGINS=http://127.0.0.1:4173,http://localhost:4173
```

**Production (Render)**:

```bash
# Set in Render dashboard environment variables
JWT_SECRET=<strong-random-32-char-string>
ADMIN_PASSWORD_HASH=<bcrypt-hash>
DATABASE_URL=postgresql://user:pass@host:5432/dbname  # Auto-provided
FRONTEND_ORIGINS=https://aksenod.github.io
PYTHON_VERSION=3.12.8  # Auto-set from runtime.txt
```

### Database Management

**Local (SQLite)**:

```bash
# Access database
sqlite3 backend/app.db

# List tables
.tables

# Query projects
SELECT title, slug, enabled FROM projects;

# Count projects by category
SELECT category, COUNT(*) FROM projects GROUP BY category;

# Exit
.quit
```

**Production (PostgreSQL on Render)**:

```bash
# Get connection string from Render dashboard
# Environment → DATABASE_URL

# Connect via psql
psql <DATABASE_URL>

# Or use Render Shell:
# Dashboard → Service → Shell tab

# List tables
\dt

# Query projects
SELECT title, slug, enabled FROM projects;

# Exit
\q
```

**Backup Database**:

```bash
# PostgreSQL (Render)
pg_dump <DATABASE_URL> > backup.sql

# Restore
psql <DATABASE_URL> < backup.sql

# SQLite (local)
sqlite3 backend/app.db .dump > backup.sql
```

### Rollback Procedure

**If deployment breaks**:

1. **Check Render logs**:
   - Dashboard → Service → Logs
   - Look for errors in startup or requests

2. **Revert to last working commit**:
   ```bash
   git log --oneline  # Find last working commit
   git revert <bad-commit-hash>
   git push origin main
   ```

3. **Or force rollback**:
   - Render Dashboard → Service → Manual Deploy
   - Select previous successful deploy

4. **Fix locally and re-deploy**:
   ```bash
   # Fix the issue
   git add .
   git commit -m "Fix deployment issue"
   git push origin main
   ```

---

## Troubleshooting Guide

### Backend Issues

**Problem**: `ImportError: No module named 'psycopg2'`

**Cause**: PostgreSQL driver not installed or wrong Python version

**Solution**:
```bash
# Check runtime.txt
cat backend/runtime.txt
# Should be: python-3.12.8

# Verify requirements.txt includes:
grep psycopg2 backend/requirements.txt
# Should be: psycopg2-binary==2.9.10

# Re-deploy or install locally:
pip install -r backend/requirements.txt
```

---

**Problem**: `sqlalchemy.exc.OperationalError: (psycopg2.OperationalError) could not connect to server`

**Cause**: DATABASE_URL incorrect or PostgreSQL not running

**Solution**:
```bash
# Check DATABASE_URL in Render dashboard
# Should start with: postgresql:// (not postgres://)

# Check if normalization is working in main.py:
# Line ~80: if url.startswith("postgres://"):
#               url = url.replace("postgres://", "postgresql://", 1)

# Test connection manually:
psql <DATABASE_URL>
```

---

**Problem**: `401 Unauthorized` on admin endpoints

**Cause**: JWT token expired, invalid, or missing

**Solution**:
```bash
# Check if JWT_SECRET is set
echo $JWT_SECRET  # Should be 32+ chars

# Test login endpoint:
curl -X POST http://127.0.0.1:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"bugrov2025"}'

# Should return: {"access_token": "...", "token_type": "bearer"}

# Use token in subsequent requests:
curl http://127.0.0.1:8000/admin/projects \
  -H "Authorization: Bearer <token>"
```

---

**Problem**: Password authentication fails

**Cause**: ADMIN_PASSWORD_HASH incorrectly formatted or re-hashed

**Solution**:
```python
# Generate correct bcrypt hash:
import bcrypt
password = "bugrov2025"
hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
print(hashed)
# Example: $2b$12$abcdefg...

# Set in environment:
# ADMIN_PASSWORD_HASH=$2b$12$abcdefg...
# (Remove ADMIN_PASSWORD if both are set)

# Test:
curl -X POST http://127.0.0.1:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"bugrov2025"}'
```

---

**Problem**: CORS errors in browser console

**Cause**: FRONTEND_ORIGINS doesn't include requesting origin

**Solution**:
```bash
# Check FRONTEND_ORIGINS in Render dashboard
# Should include: https://aksenod.github.io

# For local dev, add:
# http://127.0.0.1:4173,http://localhost:4173

# Restart backend after changing env vars
```

---

**Problem**: Database migrations fail on startup

**Cause**: SQL syntax error or incompatible database

**Solution**:
```bash
# Check Render logs for SQL errors
# Look for: "ALTER TABLE projects ADD COLUMN..."

# If SQLite locally, PostgreSQL in prod:
# Use IF NOT EXISTS syntax (already implemented)

# Test migration manually:
sqlite3 backend/app.db "ALTER TABLE projects ADD COLUMN IF NOT EXISTS new_field TEXT DEFAULT '';"

# Check table structure:
sqlite3 backend/app.db "PRAGMA table_info(projects);"
```

### Frontend Issues

**Problem**: Admin panel shows blank screen or "undefined"

**Cause**: API not accessible or returning errors

**Solution**:
```javascript
// Open browser console (F12)
// Check for errors

// Verify API_BASE is correct:
console.log(window.__API_BASE);
// Should be: https://portfolio-saqh.onrender.com (prod)
//         or http://127.0.0.1:8000 (dev)

// Test API manually:
fetch('https://portfolio-saqh.onrender.com/health')
  .then(r => r.json())
  .then(console.log);
// Should output: {status: "ok"}

// If CORS error: Check FRONTEND_ORIGINS in backend
```

---

**Problem**: Images not loading (404 errors)

**Cause**: Incorrect image URLs or missing files

**Solution**:
```javascript
// Check image URL format in project data:
console.log(projects[0].cover_image);
// Should be absolute URL: https://...

// If relative URL like /Portfolio/assets/...:
// Normalize in admin panel normalizeImageUrl() function

// Test image loads:
const img = new Image();
img.onload = () => console.log('✓ Image loaded');
img.onerror = () => console.error('✗ Image failed');
img.src = 'https://example.com/image.jpg';
```

---

**Problem**: "Режим просмотра (API недоступен)" warning

**Cause**: Backend is down or unreachable

**Solution**:
```bash
# Check backend health:
curl https://portfolio-saqh.onrender.com/health

# If down:
# 1. Check Render dashboard for errors
# 2. Check recent deploys
# 3. Restart service manually

# If using local backend:
# 1. Start backend: uvicorn main:app --reload
# 2. Check docs/api-config.js points to localhost
```

---

**Problem**: Drag-and-drop gallery not working

**Cause**: JavaScript event handlers not attached

**Solution**:
```javascript
// Check if renderGallery() is called after modal opens
// Location: docs/admin/index.html:1400-1500

// Verify draggable attributes:
// <div draggable="true" data-index="0" ...>

// Check event listeners are attached:
function renderGallery() {
  // ...
  items.forEach((item, index) => {
    const div = document.createElement('div');
    div.draggable = true;
    div.dataset.index = index;

    div.addEventListener('dragstart', handleDragStart);
    div.addEventListener('dragover', handleDragOver);
    div.addEventListener('drop', handleDrop);
    // ...
  });
}
```

---

**Problem**: Services tags not saving

**Cause**: Not converting array to JSON string

**Solution**:
```javascript
// In saveProject() function:
const projectData = {
  // ...
  services: JSON.stringify(currentServices),  // MUST stringify!
  gallery: JSON.stringify(currentGallery),
};

// NOT:
// services: currentServices,  // ✗ Wrong! Backend expects string

// Verify before sending:
console.log(typeof projectData.services);  // Should be "string"
console.log(projectData.services);  // Should be: '["Design","Development"]'
```

### Deployment Issues

**Problem**: Render build fails with "requirements.txt not found"

**Cause**: Root Directory not set to `backend`

**Solution**:
```bash
# In Render dashboard:
# Settings → Build & Deploy → Root Directory
# Set to: backend

# NOT: /backend or ./backend
# Just: backend
```

---

**Problem**: GitHub Pages shows 404 on every page

**Cause**: Pages not deployed from `/docs` folder

**Solution**:
```bash
# Check GitHub repo:
# Settings → Pages → Source
# Should be: Deploy from a branch
# Branch: main
# Folder: /docs (not / root)

# Verify docs/ folder exists in main branch:
git ls-tree -r main --name-only | grep docs/
# Should list: docs/index.html, docs/admin/index.html, etc.

# Push if missing:
git push origin main
```

---

**Problem**: Changes not appearing on live site

**Cause**: GitHub Pages cache or build delay

**Solution**:
```bash
# Check GitHub Actions:
# Repo → Actions tab → Look for "pages build and deployment"
# Should be green (✓) and recent

# Force refresh browser:
# Ctrl+Shift+R (Windows/Linux)
# Cmd+Shift+R (Mac)

# Clear GitHub Pages cache:
# Commit a small change and push again:
git commit --allow-empty -m "Trigger rebuild"
git push origin main
```

---

**Problem**: Fonts not loading (FOUT/FOIT)

**Cause**: Font files missing, wrong MIME type, or Git LFS pointers

**Solution**:
```bash
# Check font files are actual TTF files (not Git LFS pointers):
ls -lh docs/assets/*/fonts/*.ttf
# Should be ~50-100KB each, NOT 0.2KB

# If showing 0.2KB (LFS pointers):
cd docs/assets/.../fonts/
git lfs untrack "*.ttf"
git rm --cached *.ttf
git add *.ttf  # Re-add as regular files
git commit -m "Fix fonts: Remove Git LFS, commit as regular files"
git push origin main

# Verify in browser DevTools:
# Network tab → Filter "font" or "ttf"
# Status: 200 OK
# Size: ~50KB (not 135 bytes)
```

---

## AI Development Guidelines

### When Assisting with This Project

**1. Always Read Context First**:

Before making changes:
- Read `.cursorrules` (159 lines) for project rules
- Read `backend/main.py` if working on backend
- Read `docs/admin/index.html` if working on frontend
- Check recent commits: `git log --oneline -10`

**2. Preserve Exact User Specifications**:

- Do NOT change API endpoints without user request
- Do NOT refactor code unless explicitly asked
- Do NOT add features beyond the scope of the request
- Do NOT change environment variable names
- Keep Russian UI text in Russian (do not translate)

**3. Security Awareness**:

- NEVER commit `.env` files
- NEVER log JWT_SECRET or passwords
- Always use bcrypt for password hashing in production
- Verify CORS origins are restricted in production
- Check for SQL injection risks (use parameterized queries)

**4. Testing Recommendations**:

When making changes:
```bash
# Backend changes:
1. Start local backend: uvicorn main:app --reload
2. Test endpoint: curl http://127.0.0.1:8000/<endpoint>
3. Check Swagger docs: http://127.0.0.1:8000/docs
4. Run manual tests before committing

# Frontend changes:
1. Start local server: python -m http.server 4173
2. Open browser: http://127.0.0.1:4173/admin/
3. Test in DevTools console
4. Check Network tab for API requests
5. Verify on mobile viewport

# Full integration test:
1. Create a test project via admin panel
2. Verify it appears in public /projects endpoint
3. Toggle enabled=false, verify it disappears
4. Delete project, verify 204 response
```

**5. Russian Language Handling**:

This project uses Russian throughout:
- UI labels: "Создать", "Сохранить", "Удалить"
- Categories: "Сайты", "Презентации", "Брендинг", "Сервисы"
- Error messages: "Ошибка", "Проект не найден"

**Do NOT translate to English unless explicitly requested.**

**6. Common Pitfall Avoidance**:

❌ **Don't**:
- Re-hash already-hashed passwords
- Use `git push --force` on main branch
- Commit large files (images, fonts) via Git LFS
- Change database schema without migrations
- Use `SELECT *` in production queries
- Hardcode secrets in code

✅ **Do**:
- Use `IF NOT EXISTS` in all migrations
- Parse JSON fields with `json.loads(field or "[]")`
- Include both `created_at` and `updated_at` timestamps
- Use UTC for all datetime operations
- Validate slugs are URL-safe before saving
- Handle 204 No Content responses from DELETE

**7. Response Style for Russian Instructions**:

If user writes in Russian:
- Respond in Russian
- Keep code comments in English (standard practice)
- Preserve command syntax exactly (bash, SQL, etc.)
- Translate explanations, NOT commands

Example:
```
User: "Добавь новое поле в модель Project"
Assistant: "Добавляю поле в модель Project. Вот изменения:

```python
class Project(SQLModel, table=True):
    # ... existing fields ...
    new_field: str = Field(default="")
```

Также добавлю миграцию в startup event..."
```

**8. Debugging Approach**:

When user reports an error:
1. Ask for exact error message (full traceback if possible)
2. Check Render logs if production issue
3. Reproduce locally if possible
4. Verify environment variables are set
5. Check recent git commits for breaking changes
6. Test API endpoints with curl
7. Inspect browser console for frontend issues

**9. Code Style Preferences**:

This project follows:
- **Backend**: FastAPI conventions, type hints, underscore prefixes for private functions
- **Frontend**: Vanilla JS (no frameworks), inline styles OK, Russian UI text
- **Naming**: camelCase (JS), snake_case (Python), kebab-case (CSS classes)
- **Formatting**: 4 spaces (Python), 2 spaces (JS/HTML), LF line endings

**10. When to Use Each Tool/Script**:

| Task | Use | Don't Use |
|------|-----|-----------|
| Parse HTML → JSON | `parse_cases.py` | Manual editing |
| Import to local DB | `import_projects.py` | Direct SQL |
| Import via API | `import_all_cases.py` | curl loops |
| Sync production DB | `POST /force-update` | Manual DB edit |
| Add project via UI | Admin panel | Direct API calls |
| Change password | .env or Render vars | Database edit |

---

## Quick Reference Card

### Essential Commands

```bash
# Backend
cd backend && uvicorn main:app --reload              # Dev server
curl http://127.0.0.1:8000/health                   # Test health
curl http://127.0.0.1:8000/projects                 # Get projects
sqlite3 app.db "SELECT * FROM projects;"            # Query DB

# Frontend
cd docs && python -m http.server 4173               # Dev server
open http://127.0.0.1:4173/admin/                   # Admin panel

# Data
python backend/parse_cases.py                       # HTML → JSON
python backend/import_projects.py                   # JSON → DB
curl -X POST http://127.0.0.1:8000/force-update    # Sync from GitHub

# Git
git log --oneline -10                               # Recent commits
git diff backend/main.py                            # Show changes
git add . && git commit -m "msg" && git push       # Deploy
```

### File Locations Cheatsheet

```
⭐ backend/main.py              # All backend logic
⭐ backend/cases_data.json      # Seed data (13 projects)
⭐ docs/admin/index.html        # Admin panel
⭐ docs/api-config.js           # API URL config
⭐ .cursorrules                 # Project rules

📝 backend/.env.example         # Env var template
📝 backend/requirements.txt     # Python deps
📝 backend/runtime.txt          # Python 3.12.8
📝 Procfile                     # Render config

🔧 backend/parse_cases.py       # HTML parser
🔧 backend/import_projects.py   # DB import script
🔧 backend/import_all_cases.py  # API import script
```

### API Endpoints Quick Reference

```
Public:
  GET  /health                  # Health check
  GET  /version                 # Deployment info
  GET  /projects                # List enabled projects
  GET  /projects/{slug}         # Get single project
  GET  /cases                   # List enabled cases
  POST /force-update            # Sync from GitHub

Auth:
  POST /auth/login              # Get JWT token

Admin (requires JWT):
  GET    /admin/projects        # List all projects
  POST   /admin/projects        # Create project
  PATCH  /admin/projects/{id}   # Update project
  DELETE /admin/projects/{id}   # Delete project (204)
  GET    /admin/cases           # List all cases
  POST   /admin/cases           # Create case
  PATCH  /admin/cases/{id}      # Update case
  DELETE /admin/cases/{id}      # Delete case (204)
```

### Environment Variables

```bash
# Required
JWT_SECRET=<32-char-random-string>

# Optional (with defaults)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=bugrov2025              # Dev only
ADMIN_PASSWORD_HASH=<bcrypt-hash>      # Prod (overrides ADMIN_PASSWORD)
DATABASE_URL=sqlite:///./app.db        # Auto PostgreSQL on Render
FRONTEND_ORIGINS=http://localhost:4173 # Comma-separated
JWT_EXPIRES_MINUTES=43200              # 30 days
```

---

## Summary for AI Assistants

**This is a production portfolio website with:**

- **Backend**: 637-line FastAPI app (`backend/main.py`) with JWT auth, SQLModel ORM, PostgreSQL/SQLite
- **Frontend**: Webflow pages + 1,877-line vanilla JS admin panel (`docs/admin/index.html`)
- **Data**: 13 projects seeded from `cases_data.json`, managed via admin panel
- **Deploy**: Render (backend) + GitHub Pages (frontend)
- **Languages**: Python 3.12.8, JavaScript ES6, Russian UI
- **Auth**: JWT tokens, bcrypt passwords, 30-day expiration
- **Database**: Automatic migrations on startup, backward-compatible

**Key Principles**:
1. Read `.cursorrules` before any task
2. Never change Russian text to English
3. Always use UTC timestamps
4. Parse JSON fields (`services`, `gallery`) before use
5. Test locally before pushing to production
6. Use migrations with `IF NOT EXISTS`
7. Preserve exact user specifications
8. Security: Never commit secrets, use bcrypt in prod

**Most Common Tasks**:
- Add/edit projects → Use admin panel at `/admin/`
- Update seed data → Run `parse_cases.py`, commit `cases_data.json`
- Sync production → Call `POST /force-update` endpoint
- Change password → Update `.env` or Render environment variables
- Deploy → Push to `main` branch (auto-deploys both backend and frontend)

**When in Doubt**:
- Check Swagger docs: `http://127.0.0.1:8000/docs`
- Read source code: `backend/main.py` and `docs/admin/index.html`
- Test locally first: Backend + frontend on localhost
- Check Render logs for production issues

---

**Document Version**: 1.0
**Last Updated**: 2025-12-29
**Maintained By**: AI assistants (auto-generated from codebase exploration)

For questions or updates to this document, analyze the current codebase state and regenerate.
