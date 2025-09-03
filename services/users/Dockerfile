# Basic Dockerfile for Users Service
# Educational: Start with simple, clear Dockerfile
# Multi-stage optimization will be shown later as separate concept

FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code and migration files
COPY app/ ./app/
COPY alembic.ini .
COPY migrations/ ./migrations/

# Expose port
EXPOSE 8081

# Run the application
CMD ["python", "-m", "app.main"]