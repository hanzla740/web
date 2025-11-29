# SitiNet ISP Portal

Modern single-page experience for an ISP business. Customers can browse recharge and installation plans while admins manage plans in real time via a dedicated password-protected portal.

## Features

- **Customer website**
  - Hero section with value props and CTAs
  - Recharge and installation plan grids driven by live API data
  - Responsive design, dark theme, reusable cards
- **Admin control center**
  - Username/password authentication with session-based security
  - Full CRUD for recharge & installation plans
  - Admin management tools to add, delete, and update teammates' credentials
- **Backend**
  - Flask + SQLite with auto-seeded demo data
  - RESTful JSON API (`/api/plans`) secured for mutations
  - Simple configuration via environment variables

## Getting started

```powershell
cd C:\Users\hanzl\Desktop\siti
.\\.venv\\Scripts\\Activate.ps1  # activate the virtual environment
pip install -r requirements.txt  # only needed the first time
python run.py
```

Open http://127.0.0.1:5000/ in your browser.

Admin portal lives at http://127.0.0.1:5000/admin  
Default credentials: `admin / admin123` (change after first login).

## Production readiness

1. Copy `.env.example` to `.env` and provide real `SECRET_KEY`, `DATABASE_URL`, and `ADMIN_DEFAULT_PASSWORD` values.
2. Install dependencies on the target host and make sure `instance/` is writable so SQLite (or another DB) can create its file.
3. Use the WSGI entry point via Waitress or Gunicorn instead of Flask’s debug server:

```powershell
G:/siti/.venv/Scripts/python.exe -m pip install -r requirements.txt
setx SECRET_KEY "super-secret"
waitress-serve --listen=0.0.0.0:5000 --call app:create_app
```

The repo also includes `wsgi.py` (for platforms that expect a module-level `app`) and a `Procfile` using Waitress which works on Render/Heroku-style hosts. Update the command if you switch to Gunicorn on Linux.

For reverse proxying, point Nginx/Apache at the Waitress/Gunicorn socket and enable HTTPS according to your provider’s guidance.

## Configuration

| Variable                | Default       | Description                                |
| ----------------------- | ------------- | ------------------------------------------ |
| `DATABASE_URL`          | sqlite file   | Custom SQLAlchemy database connection      |
| `SECRET_KEY`            | `dev-secret`  | Flask session secret                       |
| `ADMIN_DEFAULT_PASSWORD`| `admin123`    | Password for the auto-seeded `admin` user  |

Set variables in your shell before launching, e.g.:

```powershell
$env:SECRET_KEY="super-secret"
$env:ADMIN_DEFAULT_PASSWORD="BetterPassw0rd!"
python run.py
```

## API overview

| Method | Endpoint          | Description                          |
| ------ | ----------------- | ------------------------------------ |
| GET    | `/api/plans`      | List all plans                       |
| GET    | `/api/plans?type=recharge` | Filter plans by type        |
| POST   | `/api/plans`      | Create plan (requires admin session) |
| PUT    | `/api/plans/<id>` | Update plan (requires admin session) |
| DELETE | `/api/plans/<id>` | Remove plan (requires admin session) |

## Project structure

```
app/              Flask application package
  __init__.py     App factory and seed data
  admin_views.py  Admin portal routes (login, account mgmt)
  database.py     SQLAlchemy instance
  models.py       Plan + admin user models
  routes.py       Public REST API blueprint
static/           CSS + JS frontend assets
templates/        Jinja templates (`index.html`, `admin.html`)
run.py            Development server entry point
requirements.txt  Python dependencies
```

## Next steps

- Add audit logs & activity timeline for plan changes
- Expose analytics (active users, uptime data) directly in the admin dashboard
- Deploy with a production server (Gunicorn/Waitress) and managed SQLite/MySQL

