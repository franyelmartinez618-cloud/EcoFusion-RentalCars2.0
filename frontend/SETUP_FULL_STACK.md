# EcoFusion full-stack development setup

## 1. Frontend

```powershell
cd frontend
npm install
copy .env.local.example .env.local
npm run dev
```

## 2. Backend (SQLite development)

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn main:app --reload --port 8000
```

The API health endpoint is `http://localhost:8000/api/v1/health`.

## 3. MySQL production

Create the database and all 69 domain tables using `backend/sql/schema.sql`. Then set `MYSQL_URL` in `backend/.env` to a real MySQL 8+ connection string.

The API uses SQLAlchemy parameter binding for business queries and can run against MySQL without changing the frontend.

## 4. Real Google/SMS

Firebase Web App configuration goes in `frontend/.env.local`. Firebase Admin service-account credentials go only on the backend. Never put the service-account JSON in Vite variables.

## 5. Square

Set `SQUARE_ACCESS_TOKEN`, `SQUARE_ENVIRONMENT`, `SQUARE_LOCATION_ID`, and `SQUARE_WEBHOOK_SIGNATURE_KEY` only on the backend. The frontend calls `/account/reservations/:id/checkout`; it never receives the Square secret.

## 6. Identity verification

Set the Persona API key, inquiry template ID and webhook secret only on the backend.
