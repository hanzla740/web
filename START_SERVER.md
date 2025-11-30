# 🚀 Quick Start Guide - SitiNet ISP Portal

## Prerequisites
- Python 3.8 or higher
- Virtual environment activated

## Starting the Server

### Option 1: Using app.py (Recommended)
```powershell
python app.py
```

### Option 2: Using run.py
```powershell
python run.py
```

### Option 3: Using Flask CLI
```powershell
$env:FLASK_APP="app.py"
$env:FLASK_ENV="development"
flask run
```

### Option 4: Using wsgi.py (Production)
```powershell
python wsgi.py
```

## Access Points

Once the server is running, access:

- **Customer Portal**: http://127.0.0.1:5000/
- **Admin Dashboard**: http://127.0.0.1:5000/admin
- **API Endpoint**: http://127.0.0.1:5000/api/plans

## Default Admin Credentials

- **Username**: `admin`
- **Password**: `admin123`

⚠️ **Important**: Change the default password immediately after first login!

## Troubleshooting

### Python Path Issues
If you see "No module named 'app'" error:
```powershell
# Make sure you're in the project root directory
cd G:\siti

# Verify virtual environment is activated
.\.venv\Scripts\Activate.ps1

# Check if dependencies are installed
pip list
```

### Port Already in Use
If port 5000 is busy:
```powershell
# Use a different port
python app.py --port 5001
```

Or modify app.py to use a different port.

### Database Issues
If you see database errors:
```powershell
# Delete the database and restart (will reset all data)
Remove-Item instance\plans.db
python app.py
```

## Environment Variables (Optional)

Create a `.env` file in the project root:

```env
SECRET_KEY=your-super-secret-key-here
ADMIN_DEFAULT_PASSWORD=your-secure-password
DATABASE_URL=sqlite:///plans.db
```

Then load it before running:
```powershell
# Install python-dotenv if not already installed
pip install python-dotenv

# Run the app (it will auto-load .env)
python app.py
```

## Development Mode

The server runs in debug mode by default, which means:
- ✅ Auto-reload on code changes
- ✅ Detailed error messages
- ✅ Interactive debugger

## Production Deployment

For production, use a proper WSGI server:

```powershell
# Install gunicorn (Windows alternative: waitress)
pip install waitress

# Run with waitress
waitress-serve --port=5000 app:app
```

## Viewing the New Design

1. Start the server using any method above
2. Open http://127.0.0.1:5000/ in your browser
3. You'll see the ultra-modern design with:
   - Animated gradient backgrounds
   - Glass morphism effects
   - Smooth hover animations
   - Responsive mobile layout

## Need Help?

Check these files:
- `README.md` - Full project documentation
- `DESIGN_MAKEOVER.md` - Design system details
- `FEATURES_SUMMARY.md` - Feature list
- `QUICK_START.md` - Setup instructions

---

**Enjoy your modern ISP portal! 🎉**
