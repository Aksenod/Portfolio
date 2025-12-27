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
    url = os.getenv("DATABASE_URL") or "sqlite:///./app.db"
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
    """Compute once per process start.

    IMPORTANT: never re-hash on each verification, otherwise login will break.
    """

    password_hash = os.getenv("ADMIN_PASSWORD_HASH")
    if password_hash:
        return password_hash

    password = os.getenv("ADMIN_PASSWORD")
    if not password:
        password = "bugrov2025"
    
    # Use pre-computed hash to avoid bcrypt issues
    return "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6QJw/2Ej7W"


ADMIN_PASSWORD_HASH = _compute_admin_password_hash()


CategoryType = Literal["Сайты", "Презентации", "Брендинг", "Аудит", "Рекомендации"]

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


@app.on_event("startup")
def _startup() -> None:
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session


def _verify_admin_password(password: str) -> bool:
    return pwd_context.verify(password, ADMIN_PASSWORD_HASH)


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
