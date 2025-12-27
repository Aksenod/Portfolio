# Bugrov.space Backend (Render)

FastAPI + SQLModel + JWT.

## Endpoints

- `GET /health`
- `POST /auth/login` -> `{ access_token }`
- Public:
  - `GET /cases` (only `enabled=true`)
- Admin (JWT required):
  - `GET /admin/cases`
  - `POST /admin/cases`
  - `PATCH /admin/cases/{id}`
  - `DELETE /admin/cases/{id}`

## Local run

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

export JWT_SECRET="dev-secret"
export ADMIN_USERNAME="admin"
export ADMIN_PASSWORD="bugrov2025"
export DATABASE_URL="sqlite:///./app.db"
export FRONTEND_ORIGINS="http://127.0.0.1:4173,http://localhost:4173"

uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Open:
- http://127.0.0.1:8000/docs

## Render deploy (Web Service)

- **Root Directory**: `backend`
- **Build Command**:

```bash
pip install -r requirements.txt
```

- **Start Command**:

```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```

### Render Environment Variables

- `JWT_SECRET` (required)
- `DATABASE_URL` (Render Postgres will provide it)
- `ADMIN_USERNAME` (optional, default `admin`)
- `ADMIN_PASSWORD_HASH` (recommended)
  - Generate locally with python:

```bash
python3 - <<'PY'
from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
print(pwd_context.hash("bugrov2025"))
PY
```

- `FRONTEND_ORIGINS`
  - include your GitHub Pages origin, e.g. `https://denisbugrov.github.io`

## Notes

- For production, prefer `ADMIN_PASSWORD_HASH` and do not set `ADMIN_PASSWORD`.
- `postgres://` URLs are normalized automatically to `postgresql://` for SQLAlchemy.
