#!/usr/bin/env python3
"""
Simple entry point for Railway deployment
"""
import os

# Force environment setup for Railway
os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["RAILWAY_ENVIRONMENT"] = "true"

print("Railway: Starting SitiNet ISP Portal")
print("Database: SQLite in-memory")
print("Admin: admin / SecureAdmin2024!")

# Import and run Flask app
from app import create_app

app = create_app()
port = int(os.environ.get("PORT", 5000))

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=port, debug=False)