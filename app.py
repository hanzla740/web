"""
Flask application entrypoint for SitiNet ISP Portal
This file is used by deployment platforms and WSGI servers
"""

import os
from app import app

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=False, host="0.0.0.0", port=port)
