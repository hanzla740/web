#!/bin/bash
# Production Deployment Script for SitiNet ISP Portal

echo "🚀 Deploying SitiNet ISP Portal..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found! Copy .env.example and configure it."
    exit 1
fi

# Load environment variables
source .env

# Validate required environment variables
if [ -z "$SECRET_KEY" ] || [ "$SECRET_KEY" = "change-me" ]; then
    echo "❌ SECRET_KEY not set or using default value!"
    exit 1
fi

if [ -z "$ADMIN_DEFAULT_PASSWORD" ] || [ "$ADMIN_DEFAULT_PASSWORD" = "change-me-too" ]; then
    echo "❌ ADMIN_DEFAULT_PASSWORD not set or using default value!"
    exit 1
fi

echo "✅ Environment variables validated"

# Create instance directory
mkdir -p instance

# Install dependencies
echo "📦 Installing dependencies..."
pip install -r requirements.txt

# Run database migrations (if any)
echo "🗄️ Setting up database..."
python -c "from app import create_app; app = create_app(); app.app_context().push(); from app.database import db; db.create_all()"

echo "✅ Database setup complete"

# Start the application
echo "🌐 Starting SitiNet ISP Portal..."
echo "📍 Access at: http://localhost:${PORT:-5000}"
echo "🔐 Admin: http://localhost:${PORT:-5000}/admin"

# Use waitress for production
waitress-serve --host=${HOST:-0.0.0.0} --port=${PORT:-5000} --call app:create_app