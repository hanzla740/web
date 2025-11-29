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

