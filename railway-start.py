#!/usr/bin/env python3
"""
Railway-specific startup script that handles database initialization
"""
import os
import sys

def setup_railway_environment():
    """Setup environment for Railway deployment"""
    
    # Set Railway environment flag
    os.environ["RAILWAY_ENVIRONMENT"] = "true"
    
    # Ensure we have required environment variables
    if not os.getenv("SECRET_KEY"):
        print("ERROR: SECRET_KEY environment variable is required")
        sys.exit(1)
    
    # Check database configuration
    database_url = os.getenv("DATABASE_URL")
    
    if not database_url:
        print("WARNING: No DATABASE_URL found. Using in-memory SQLite...")
        # Use in-memory SQLite as fallback
        os.environ["DATABASE_URL"] = "sqlite:///:memory:"
        print("Using in-memory SQLite - data will not persist between restarts!")
    elif database_url.startswith("postgres"):
        # Check if psycopg2 is available
        try:
            import psycopg2
            print(f"Railway startup: Using PostgreSQL database")
        except ImportError:
            print("WARNING: psycopg2 not available, falling back to SQLite")
            os.environ["DATABASE_URL"] = "sqlite:///:memory:"
    else:
        print(f"Railway startup: Using database at {database_url[:50]}...")
    
    # Import and run the Flask app
    from app import app
    
    # Get port from Railway
    port = int(os.environ.get("PORT", 5000))
    
    print(f"Starting SitiNet ISP Portal on port {port}")
    print("Admin credentials: admin / SecureAdmin2024!")
    print(f"Access at: https://web-production-170f5.up.railway.app/")
    
    app.run(host="0.0.0.0", port=port, debug=False)

if __name__ == "__main__":
    setup_railway_environment()