"""
Flask application entrypoint for SitiNet ISP Portal
This file is used by deployment platforms and WSGI servers
"""

import os
from app import app

# Set Railway environment and database for deployment
if not os.getenv("DATABASE_URL"):
    os.environ["DATABASE_URL"] = "sqlite:///:memory:"

if os.getenv("PORT"):  # Railway sets PORT environment variable
    os.environ["RAILWAY_ENVIRONMENT"] = "true"

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"Starting SitiNet ISP Portal on port {port}")
    print("Using in-memory SQLite database")
    print("Admin credentials: admin / SecureAdmin2024!")
    app.run(debug=False, host="0.0.0.0", port=port)
