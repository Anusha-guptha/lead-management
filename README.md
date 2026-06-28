# Confident Group

Full-stack starter with a React Vite frontend and Django REST Framework backend connected to PostgreSQL.

## Project layout

- `frontend/` - React + TypeScript + Vite
- `backend/` - Django 5 + Django REST Framework

## Database settings

PostgreSQL is installed outside this project at `C:\PostgreSQL\17`.

- Database: `confident_group`
- User: `anusha_local`
- Password: `postgres123`
- Host: `localhost`
- Port: `5432`

The Django backend reads these values from `backend/.env`.

## Run locally

Start the backend:

```powershell
cd backend
.\.venv\Scripts\python.exe manage.py runserver
```

Start the frontend in another terminal:

```powershell
cd frontend
npm.cmd run dev
```

Check the app:

- Backend health: `http://127.0.0.1:8000/api/health/`
- Frontend: `http://localhost:5173/`

Useful backend commands:

```powershell
.\.venv\Scripts\python.exe manage.py makemigrations
.\.venv\Scripts\python.exe manage.py migrate
.\.venv\Scripts\python.exe manage.py createsuperuser
```
