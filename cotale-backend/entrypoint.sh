#!/bin/bash
set -e

# Run database migrations if needed
echo "Running database migrations..."
python -m alembic upgrade head

# Start the FastAPI application
echo "Starting CoTale Backend..."
exec python -m uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} 