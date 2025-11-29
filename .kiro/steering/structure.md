# Project Structure

## Directory Layout

```
app/                    Flask application package
  __init__.py          App factory, configuration, database seeding
  admin_views.py       Admin portal routes (login, logout, user management)
  database.py          SQLAlchemy instance initialization
  models.py            Database models (Plan, AdminUser)
  routes.py            Public REST API blueprint (/api/plans)
  __pycache__/         Python bytecode cache

instance/              Instance-specific files (not in version control)
  plans.db             SQLite database file

static/                Frontend static assets
  css/
    styles.css         All application styles (dark theme, responsive)
  js/
    main.js            Client-side logic (API calls, DOM manipulation)

templates/             Jinja2 HTML templates
  index.html           Customer-facing homepage
  admin.html           Admin dashboard and management interface

.kiro/                 Kiro IDE configuration
  steering/            AI assistant guidance documents

.venv/                 Python virtual environment

run.py                 Development server entry point
requirements.txt       Python dependencies
README.md              Project documentation
```

## Architecture Patterns

### Backend Organization
- **App Factory Pattern**: `create_app()` in `__init__.py` initializes Flask app
- **Blueprints**: Separate blueprints for API (`api_blueprint`) and admin routes (`admin_bp`)
- **Database Models**: SQLAlchemy ORM models with helper methods (`to_dict()`, `set_password()`, `check_password()`)
- **Auto-seeding**: Database automatically seeds default admin user and demo plans on first run

### Frontend Organization
- **State Management**: Simple JavaScript object (`state`) tracks plans and active tab
- **API Client**: Fetch-based async functions for CRUD operations
- **Event-Driven**: Event listeners for tabs, forms, buttons
- **No Framework**: Vanilla JS with direct DOM manipulation

### API Design
- RESTful JSON API at `/api/plans`
- Query parameter filtering: `/api/plans?type=recharge`
- Session-based authentication for mutations (POST, PUT, DELETE)
- Public read access (GET)

## Code Conventions

### Python
- Use `snake_case` for variables, functions, and module names
- Models inherit from `db.Model`
- Password hashing via Werkzeug's `generate_password_hash` and `check_password_hash`
- HTTP status codes from `http.HTTPStatus` enum
- Flash messages for user feedback in admin portal

### JavaScript
- Use `camelCase` for variables and functions
- Async/await for API calls
- Template literals for HTML generation
- Currency formatting via `Intl.NumberFormat` for INR

### CSS
- CSS custom properties (variables) in `:root` for theming
- BEM-like naming: `component__element` and `component--modifier`
- Mobile-first responsive design with `@media` queries
- Utility classes: `.muted`, `.small`, `.eyebrow`

### Database
- Table names: plural lowercase with underscores (`admin_users`, `plans`)
- Timestamps: `created_at` with `datetime.utcnow` default
- Boolean flags: `is_popular`, `admin_authenticated`
