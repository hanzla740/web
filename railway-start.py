#!/usr/bin/env python3
"""
Railway-specific startup script - SQLite only approach
"""
import os
import sys

def setup_railway_environment():
    """Setup environment for Railway deployment with SQLite"""
    
    # Set Railway environment flag
    os.environ["RAILWAY_ENVIRONMENT"] = "true"
    
    # Ensure we have required environment variables
    if not os.getenv("SECRET_KEY"):
        print("ERROR: SECRET_KEY environment variable is required")
        sys.exit(1)
    
    # Force SQLite in-memory database for Railway
    print("Railway startup: Using in-memory SQLite database")
    os.environ["DATABASE_URL"] = "sqlite:///:memory:"
    print("Note: Data will reset on each deployment (suitable for demo/testing)")
    
    # Import and run the Flask app
    from app import app
    
    # Get port from Railway
    port = int(os.environ.get("PORT", 5000))
    
    print(f"Starting SitiNet ISP Portal on port {port}")
    print("Admin credentials: admin / SecureAdmin2024!")
    print(f"Access at: https://web-production-170f5.up.railway.app/")
    print("Database: In-memory SQLite (demo data will be created)")
    
    app.run(host="0.0.0.0", port=port, debug=False)

if __name__ == "__main__":
    setup_railway_environment()