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
    
    # Create a writable temp directory for SQLite
    temp_dir = tempfile.mkdtemp()
    db_path = os.path.join(temp_dir, "plans.db")
    
    # Set database URL to use the temp file
    if not os.getenv("DATABASE_URL"):
        os.environ["DATABASE_URL"] = f"sqlite:///{db_path}"
    
    print(f"Railway startup: Using database at {os.getenv('DATABASE_URL')}")
    
    # Import and run the Flask app
    from app import app
    
    # Get port from Railway
    port = int(os.environ.get("PORT", 5000))
    
    print(f"Starting SitiNet ISP Portal on port {port}")
    app.run(host="0.0.0.0", port=port, debug=False)

if __name__ == "__main__":
    setup_railway_environment()