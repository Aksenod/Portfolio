from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Field, SQLModel, create_engine, Session, select
from passlib.context import CryptContext
import jwt
import os
from datetime import datetime, timedelta
from typing import Optional

# Environment variables
DATABASE_URL = os.getenv("DATABASE_URL", "").replace("postgres://", "postgresql://", 1)
JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-change-in-production")
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD_HASH = os.getenv("ADMIN_PASSWORD_HASH", "$2b$12$...")
FRONTEND_ORIGINS = os.getenv("FRONTEND_ORIGINS", "http://localhost:4173,http://127.0.0.1:4173").split(",")

# Database setup
engine = create_engine(DATABASE_URL, echo=True)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Models
class Case(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    description: str
    image_url: str
    enabled: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

# FastAPI app
app = FastAPI(title="Portfolio API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=["HS256"])
        return payload
    except:
        raise HTTPException(status_code=401, detail="Invalid token")

# Routes
@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/auth/login")
def login(username: str, password: str):
    if username != ADMIN_USERNAME or not pwd_context.verify(password, ADMIN_PASSWORD_HASH):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = jwt.encode(
        {"sub": username, "exp": datetime.utcnow() + timedelta(days=1)},
        JWT_SECRET,
        algorithm="HS256"
    )
    return {"access_token": token}

@app.get("/cases")
def get_cases(session: Session = Depends(get_session)):
    cases = session.exec(select(Case).where(Case.enabled == True)).all()
    return cases

@app.get("/admin/cases")
def get_admin_cases(session: Session = Depends(get_session), _: dict = Depends(verify_token)):
    cases = session.exec(select(Case)).all()
    return cases

@app.post("/admin/cases")
def create_case(case: Case, session: Session = Depends(get_session), _: dict = Depends(verify_token)):
    session.add(case)
    session.commit()
    session.refresh(case)
    return case

@app.patch("/admin/cases/{case_id}")
def update_case(case_id: int, case_update: dict, session: Session = Depends(get_session), _: dict = Depends(verify_token)):
    case = session.get(Case, case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    for key, value in case_update.items():
        setattr(case, key, value)
    
    session.add(case)
    session.commit()
    session.refresh(case)
    return case

@app.delete("/admin/cases/{case_id}")
def delete_case(case_id: int, session: Session = Depends(get_session), _: dict = Depends(verify_token)):
    case = session.get(Case, case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    session.delete(case)
    session.commit()
    return {"message": "Case deleted"}
