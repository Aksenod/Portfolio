import os
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional, Union

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlmodel import Field, Session, SQLModel, create_engine, select, JSON
from typing import List, Literal

JWT_ALGORITHM = "HS256"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer(auto_error=False)


def _now_utc() -> datetime:
    return datetime.now(timezone.utc)


def _get_env_required(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise RuntimeError(f"Missing required env var: {name}")
    return value


def _parse_origins(value: str) -> list[str]:
    origins = [o.strip() for o in (value or "").split(",")]
    return [o for o in origins if o]


def _get_database_url() -> str:
    # Force SQLite for Python 3.13 compatibility
    url = "sqlite:///./app.db"
    # Render Postgres often uses postgres:// which SQLAlchemy expects as postgresql://
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)
    return url


def _create_db_engine():
    url = _get_database_url()
    if url.startswith("sqlite"):
        return create_engine(url, connect_args={"check_same_thread": False})
    return create_engine(url)


engine = _create_db_engine()


def _admin_username() -> str:
    return os.getenv("ADMIN_USERNAME", "admin")


def _compute_admin_password_hash() -> str:
    # Temporary: use plain text comparison for debugging
    password = os.getenv("ADMIN_PASSWORD")
    if not password:
        password = "bugrov2025"
    return password  # Plain text for now


ADMIN_PASSWORD_HASH = _compute_admin_password_hash()


CategoryType = Literal["Сайты", "Презентации", "Брендинг", "Сервисы"]

BlockType = Literal["hero", "text", "image", "gallery", "quote"]

class BlockBase(SQLModel):
    type: BlockType

class HeroBlock(BlockBase):
    type: Literal["hero"] = "hero"
    title: str
    subtitle: str = ""
    coverImage: str = ""

class TextBlock(BlockBase):
    type: Literal["text"] = "text"
    markdown: str

class ImageBlock(BlockBase):
    type: Literal["image"] = "image"
    src: str
    alt: str = ""

class GalleryBlock(BlockBase):
    type: Literal["gallery"] = "gallery"
    images: List[dict]  # [{"src": "...", "alt": "..."}]

class QuoteBlock(BlockBase):
    type: Literal["quote"] = "quote"
    text: str
    author: str = ""

Block = Union[HeroBlock, TextBlock, ImageBlock, GalleryBlock, QuoteBlock]

class ProjectBase(SQLModel):
    slug: str = Field(index=True, unique=True)
    title: str
    category: str = "Сайты"
    cover_image: str = ""
    enabled: bool = True
    # Metadata fields
    specialization: str = ""  # Специализация (e.g., "Онлайн-сервис")
    duration: str = ""  # Срок (e.g., "2 недели")
    services: List[str] = Field(default_factory=list, sa_type=JSON)  # Услуги
    year: str = ""  # Год
    website_url: str = ""  # Ссылка на сайт (опционально)
    # Content fields
    short_description: str = ""  # Краткое описание для карточки и мета
    description: str = ""  # Полное описание проекта (markdown)
    # Gallery
    gallery: List[str] = Field(default_factory=list, sa_type=JSON)  # Список URL изображений
    # Legacy blocks (для обратной совместимости)
    blocks: List[dict] = Field(default_factory=list, sa_type=JSON)

class Project(ProjectBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime = Field(default_factory=_now_utc)
    updated_at: datetime = Field(default_factory=_now_utc)

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(SQLModel):
    slug: Optional[str] = None
    title: Optional[str] = None
    category: Optional[CategoryType] = None
    cover_image: Optional[str] = None
    enabled: Optional[bool] = None
    # Metadata fields
    specialization: Optional[str] = None
    duration: Optional[str] = None
    services: Optional[List[str]] = None
    year: Optional[str] = None
    website_url: Optional[str] = None
    # Content fields
    short_description: Optional[str] = None
    description: Optional[str] = None
    # Gallery
    gallery: Optional[List[str]] = None
    # Legacy blocks
    blocks: Optional[List[Block]] = None

class CaseBase(SQLModel):
    title: str
    category: str = "Без категории"
    url: str
    image: str = ""
    enabled: bool = True

class Case(CaseBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime = Field(default_factory=_now_utc)
    updated_at: datetime = Field(default_factory=_now_utc)

class CaseCreate(CaseBase):
    pass

class CaseUpdate(SQLModel):
    title: Optional[str] = None
    category: Optional[str] = None
    url: Optional[str] = None
    image: Optional[str] = None
    enabled: Optional[bool] = None


class LoginRequest(SQLModel):
    username: str
    password: str


class TokenResponse(SQLModel):
    access_token: str
    token_type: str = "bearer"


app = FastAPI(title="Bugrov.space API")

origins = _parse_origins(os.getenv("FRONTEND_ORIGINS", "http://localhost:4173,http://127.0.0.1:4173"))
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins or ["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _import_cases_from_json() -> None:
    """Import cases from JSON file if database is empty."""
    import json
    from pathlib import Path

    json_path = Path(__file__).parent / "cases_data.json"
    if not json_path.exists():
        print("No cases_data.json found, skipping import")
        return

    with Session(engine) as session:
        # Check if there are already projects
        existing = session.exec(select(Project)).first()
        if existing:
            print("Database already has projects, skipping import")
            return

        # Load and import cases
        with open(json_path, "r", encoding="utf-8") as f:
            cases = json.load(f)

        print(f"Importing {len(cases)} cases from JSON...")

        for case_data in cases:
            project = Project(
                slug=case_data["slug"],
                title=case_data["title"],
                category=case_data.get("category", "Сайты"),
                cover_image=case_data.get("cover_image", ""),
                enabled=case_data.get("enabled", True),
                specialization=case_data.get("specialization", ""),
                duration=case_data.get("duration", ""),
                services=case_data.get("services", []),
                year=case_data.get("year", ""),
                website_url=case_data.get("website_url", ""),
                short_description=case_data.get("short_description", ""),
                description=case_data.get("description", ""),
                gallery=case_data.get("gallery", []),
                blocks=case_data.get("blocks", []),
            )
            session.add(project)
            print(f"  Imported: {project.title}")

        session.commit()
        print("Import complete!")


def _update_existing_projects_from_json() -> None:
    """Update existing projects with data from JSON file (for migrations)."""
    import json
    from pathlib import Path

    json_path = Path(__file__).parent / "cases_data.json"
    if not json_path.exists():
        print("No cases_data.json found, skipping update")
        return

    with open(json_path, "r", encoding="utf-8") as f:
        cases = json.load(f)

    # Create a lookup by slug
    cases_by_slug = {c["slug"]: c for c in cases}

    with Session(engine) as session:
        projects = session.exec(select(Project)).all()
        updated_count = 0

        for project in projects:
            case_data = cases_by_slug.get(project.slug)
            if not case_data:
                continue

            # Check if project needs updating (has empty metadata fields)
            needs_update = (
                not project.specialization and case_data.get("specialization") or
                not project.duration and case_data.get("duration") or
                not project.services and case_data.get("services") or
                not project.year and case_data.get("year") or
                not project.short_description and case_data.get("short_description") or
                not project.description and case_data.get("description") or
                not project.gallery and case_data.get("gallery")
            )
            
            # Force update description if it's empty in DB but exists in JSON
            if not needs_update and not project.description and case_data.get("description"):
                needs_update = True

            if needs_update:
                # Update fields that are empty but have data in JSON
                if not project.specialization:
                    project.specialization = case_data.get("specialization", "")
                if not project.duration:
                    project.duration = case_data.get("duration", "")
                if not project.services:
                    project.services = case_data.get("services", [])
                if not project.year:
                    project.year = case_data.get("year", "")
                if not project.website_url:
                    project.website_url = case_data.get("website_url", "")
                if not project.short_description:
                    project.short_description = case_data.get("short_description", "")
                if not project.description:
                    project.description = case_data.get("description", "")
                if not project.gallery:
                    project.gallery = case_data.get("gallery", [])
                if not project.cover_image:
                    project.cover_image = case_data.get("cover_image", "")

                project.updated_at = _now_utc()
                session.add(project)
                updated_count += 1
                print(f"  Updated: {project.title}")

        if updated_count > 0:
            session.commit()
            print(f"Updated {updated_count} projects with data from JSON")
        else:
            print("All projects already have complete data")


def _migrate_database() -> None:
    """Add missing columns to existing tables for SQLite compatibility."""
    from sqlalchemy import inspect, text

    inspector = inspect(engine)

    # Check if project table exists
    if "project" not in inspector.get_table_names():
        return  # Table will be created by create_all

    # Get existing columns
    existing_columns = {col["name"] for col in inspector.get_columns("project")}

    # Define new columns that might be missing (column_name, type, default)
    new_columns = [
        ("specialization", "TEXT", "''"),
        ("duration", "TEXT", "''"),
        ("services", "TEXT", "'[]'"),  # JSON stored as TEXT in SQLite
        ("year", "TEXT", "''"),
        ("website_url", "TEXT", "''"),
        ("short_description", "TEXT", "''"),
        ("description", "TEXT", "''"),
        ("gallery", "TEXT", "'[]'"),  # JSON stored as TEXT in SQLite
    ]

    with engine.connect() as conn:
        for col_name, col_type, default in new_columns:
            if col_name not in existing_columns:
                print(f"Adding missing column: {col_name}")
                conn.execute(text(f"ALTER TABLE project ADD COLUMN {col_name} {col_type} DEFAULT {default}"))
        conn.commit()

    print("Database migration complete!")


@app.on_event("startup")
def _startup() -> None:
    # First, run migrations to add any missing columns
    _migrate_database()
    # Then create any new tables
    SQLModel.metadata.create_all(engine)
    # Import new cases or update existing ones with data from JSON
    _import_cases_from_json()
    _update_existing_projects_from_json()


def get_session():
    with Session(engine) as session:
        yield session


def _verify_admin_password(password: str) -> bool:
    # Temporary: plain text comparison for debugging
    return password == ADMIN_PASSWORD_HASH


def _create_access_token(sub: str) -> str:
    secret = _get_env_required("JWT_SECRET")
    expires_minutes = int(os.getenv("JWT_EXPIRES_MINUTES", "43200"))
    expire = _now_utc() + timedelta(minutes=expires_minutes)
    payload = {"sub": sub, "exp": expire}
    return jwt.encode(payload, secret, algorithm=JWT_ALGORITHM)


def _get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    token = credentials.credentials
    secret = _get_env_required("JWT_SECRET")

    try:
        payload = jwt.decode(token, secret, algorithms=[JWT_ALGORITHM])
        sub = payload.get("sub")
        if sub != _admin_username():
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        return sub
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")


@app.get("/health")
def health() -> dict:
    return {"ok": True, "ts": _now_utc().isoformat()}


@app.post("/auth/login", response_model=TokenResponse)
def login(body: LoginRequest) -> TokenResponse:
    if body.username != _admin_username() or not _verify_admin_password(body.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")

    token = _create_access_token(body.username)
    return TokenResponse(access_token=token)


@app.get("/projects", response_model=list[Project])
def list_public_projects(session: Session = Depends(get_session)) -> list[Project]:
    statement = select(Project).where(Project.enabled == True).order_by(Project.created_at.desc())
    return list(session.exec(statement).all())

@app.get("/projects/{slug}", response_model=Project)
def get_public_project(slug: str, session: Session = Depends(get_session)) -> Project:
    project = session.exec(select(Project).where(Project.slug == slug, Project.enabled == True)).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project

@app.get("/admin/projects", response_model=list[Project])
def list_projects(_admin: str = Depends(_get_current_admin), session: Session = Depends(get_session)) -> list[Project]:
    statement = select(Project).order_by(Project.created_at.desc())
    return list(session.exec(statement).all())

@app.post("/admin/projects", response_model=Project, status_code=status.HTTP_201_CREATED)
def create_project(
    body: ProjectCreate,
    _admin: str = Depends(_get_current_admin),
    session: Session = Depends(get_session),
) -> Project:
    existing = session.exec(select(Project).where(Project.slug == body.slug)).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Project with this slug already exists")

    p = Project(
        slug=body.slug,
        title=body.title,
        category=body.category,
        cover_image=body.cover_image,
        enabled=body.enabled,
        specialization=body.specialization,
        duration=body.duration,
        services=body.services,
        year=body.year,
        website_url=body.website_url,
        short_description=body.short_description,
        description=body.description,
        gallery=body.gallery,
        blocks=body.blocks,
    )
    session.add(p)
    session.commit()
    session.refresh(p)
    return p

@app.patch("/admin/projects/{project_id}", response_model=Project)
def update_project(
    project_id: uuid.UUID,
    body: ProjectUpdate,
    _admin: str = Depends(_get_current_admin),
    session: Session = Depends(get_session),
) -> Project:
    p = session.get(Project, project_id)
    if not p:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    if body.slug and body.slug != p.slug:
        existing = session.exec(select(Project).where(Project.slug == body.slug)).first()
        if existing:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Project with this slug already exists")

    data = body.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(p, k, v)
    p.updated_at = _now_utc()

    session.add(p)
    session.commit()
    session.refresh(p)
    return p

@app.delete("/admin/projects/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: uuid.UUID,
    _admin: str = Depends(_get_current_admin),
    session: Session = Depends(get_session),
) -> None:
    p = session.get(Project, project_id)
    if not p:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    session.delete(p)
    session.commit()
    return None

@app.get("/cases", response_model=list[Case])
def list_public_cases(session: Session = Depends(get_session)) -> list[Case]:
    statement = select(Case).where(Case.enabled == True).order_by(Case.created_at.desc())
    return list(session.exec(statement).all())

@app.get("/admin/cases", response_model=list[Case])
def list_cases(_admin: str = Depends(_get_current_admin), session: Session = Depends(get_session)) -> list[Case]:
    statement = select(Case).order_by(Case.created_at.desc())
    return list(session.exec(statement).all())

@app.post("/admin/cases", response_model=Case, status_code=status.HTTP_201_CREATED)
def create_case(
    body: CaseCreate,
    _admin: str = Depends(_get_current_admin),
    session: Session = Depends(get_session),
) -> Case:
    existing = session.exec(select(Case).where(Case.url == body.url)).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Case with this url already exists")

    c = Case(
        title=body.title,
        category=body.category,
        url=body.url,
        image=body.image,
        enabled=body.enabled,
    )
    session.add(c)
    session.commit()
    session.refresh(c)
    return c

@app.patch("/admin/cases/{case_id}", response_model=Case)
def update_case(
    case_id: uuid.UUID,
    body: CaseUpdate,
    _admin: str = Depends(_get_current_admin),
    session: Session = Depends(get_session),
) -> Case:
    c = session.get(Case, case_id)
    if not c:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

    if body.url and body.url != c.url:
        existing = session.exec(select(Case).where(Case.url == body.url)).first()
        if existing:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Case with this url already exists")

    data = body.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(c, k, v)
    c.updated_at = _now_utc()

    session.add(c)
    session.commit()
    session.refresh(c)
    return c

@app.delete("/admin/cases/{case_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_case(
    case_id: uuid.UUID,
    _admin: str = Depends(_get_current_admin),
    session: Session = Depends(get_session),
) -> None:
    c = session.get(Case, case_id)
    if not c:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

    session.delete(c)
    session.commit()
    return None
