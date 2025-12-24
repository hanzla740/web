#!/usr/bin/env python3
"""
Railway-specific startup script that handles database initialization
"""
import os
import sys
import tempfile
from pathlib import Path

def setup_railway_environment():
    """Setup environment for Railway deployment"""
    
    # Set Railway environment flag
    os.environ["RAILWAY_ENVIRONMENT"] = "true"
    
    # Ensure we have required environment variables
    if not os.getenv("SECRET_KEY"):
        print("ERROR: SECRET_KEY environment variable is required")
        sys.exit(1)
    
    # Check if we have PostgreSQL (preferred) or fall back to SQLite
    database_url = os.getenv("DATABASE_URL")
    
    if not database_url:
        print("WARNING: No DATABASE_URL found. Attempting SQLite fallback...")
        # Try to use in-memory SQLite as last resort
        os.environ["DATABASE_URL"] = "sqlite:///:memory:"
        print("Using in-memory SQLite - data will not persist between restarts!")
    else:
        print(f"Railway startup: Using database at {database_url[:50]}...")
    
    # Import and run the Flask app
    from app import app
    
    # Get port from Railway
    port = int(os.environ.get("PORT", 5000))
    
    print(f"Starting SitiNet ISP Portal on port {port}")
    print("Admin credentials: admin / SecureAdmin2024!")
    
    app.run(host="0.0.0.0", port=port, debug=False)

if __name__ == "__main__":
    setup_railway_environment()