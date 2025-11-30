"""
Flask application entrypoint for SitiNet ISP Portal
This file is used by deployment platforms and WSGI servers
"""

from app import app

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
