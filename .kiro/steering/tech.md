# Technology Stack

## Backend
- **Framework**: Flask 3.1.2 (Python web framework)
- **Database**: SQLite with SQLAlchemy ORM (Flask-SQLAlchemy 3.1.1)
- **Authentication**: Session-based with Werkzeug password hashing
- **CORS**: Flask-CORS for API access
- **Configuration**: python-dotenv for environment variables

## Frontend
- **Vanilla JavaScript** (ES6+) with async/await
- **CSS**: Custom CSS with CSS variables for theming
- **Templates**: Jinja2 server-side rendering
- **No build step**: Direct browser-compatible code

## Development Environment
- **Python**: Virtual environment in `.venv/`
- **Shell**: PowerShell (Windows)
- **Database**: SQLite file at `instance/plans.db`

## Common Commands

### Setup and Run
```powershell
# Activate virtual environment
.\.venv\Scripts\Activate.ps1

# Install dependencies (first time only)
pip install -r requirements.txt

# Run development server
python run.py
```

### Access Points
- Customer site: http://127.0.0.1:5000/
- Admin portal: http://127.0.0.1:5000/admin
- API endpoint: http://127.0.0.1:5000/api/plans

## Environment Variables
- `DATABASE_URL`: Database connection string (default: `sqlite:///plans.db`)
- `SECRET_KEY`: Flask session secret (default: `dev-secret`)
- `ADMIN_DEFAULT_PASSWORD`: Initial admin password (default: `admin123`)

Set in PowerShell:
```powershell
$env:SECRET_KEY="your-secret-key"
$env:ADMIN_DEFAULT_PASSWORD="secure-password"
```
