# Users Service

Python FastAPI microservice for user authentication and management - **migrated from LocalMart monolith**.

## 🎯 Educational Purpose

This service demonstrates the migration from **monolithic architecture** to **microservices**, showing how user authentication functionality can be extracted and modernized:

- **From**: Flask monolith with sessions and SQLite
- **To**: FastAPI microservice with JWT and PostgreSQL

## 🔄 Migration from Monolith

### What Changed
- **Session-based auth** → **JWT tokens** (stateless for microservices)
- **SQLite** → **PostgreSQL** (proper microservice database isolation)
- **Raw SQL** → **SQLAlchemy ORM** (better maintainability)
- **Flask templates** → **REST API** (API-first design)
- **Basic logging** → **Structured logging** (observability)

### What Stayed the Same
- **Core user model**: name, email, password_hash, is_admin
- **Business logic**: Registration validation, password hashing
- **API contracts**: Similar endpoints and validation rules

## 🚀 Features

- **User Registration**: Create new user accounts
- **User Authentication**: Login with JWT tokens
- **Profile Management**: Update user information
- **Admin Support**: Admin user privileges (migrated from monolith)
- **Health Checks**: Service health monitoring
- **Basic Metrics**: Prometheus metrics endpoint
- **Structured Logging**: JSON logs for observability

## 🏗️ Architecture

### Tech Stack
- **FastAPI**: Modern async Python web framework
- **SQLAlchemy**: ORM with async support
- **PostgreSQL**: Production-ready database
- **JWT**: Stateless authentication tokens
- **Pydantic**: Data validation and serialization
- **Structured Logging**: JSON logs with structured data

### Project Structure
```
services/users/
├── app/
│   ├── api/               # API routes
│   │   ├── auth.py       # Authentication endpoints (signup, login)
│   │   ├── users.py      # User management endpoints
│   │   ├── health.py     # Health check endpoint
│   │   └── metrics.py    # Prometheus metrics
│   ├── core/             # Core configurations
│   │   ├── config.py     # Settings and environment variables
│   │   ├── database.py   # Database connection and session
│   │   └── security.py   # JWT and password utilities
│   ├── models/           # SQLAlchemy models
│   │   └── user.py       # User model (migrated from monolith)
│   ├── schemas/          # Pydantic schemas
│   │   └── user.py       # Request/response models
│   ├── services/         # Business logic
│   │   └── user_service.py # User operations (migrated from monolith)
│   └── main.py           # FastAPI application
├── migrations/           # Alembic database migrations
├── requirements.txt      # Python dependencies
└── Dockerfile           # Basic container setup
```

## 🛠️ Development

### Local Development
```bash
cd services/users

# Install dependencies
pip install -r requirements.txt

# Set up database (requires PostgreSQL)
# Update USERS_DB_* environment variables
alembic upgrade head

# Run the service
python -m app.main
```

### Docker Development
```bash
# Start all services including users service
docker-compose up -d

# Check users service health
curl http://localhost:8081/health

# View users service logs
docker-compose logs users
```

## 📝 API Endpoints

### Authentication (migrated from monolith)
```http
POST /api/v1/auth/signup     # Create account + auto-login
POST /api/v1/auth/login      # User login with JWT
```

### User Management
```http
GET  /api/v1/users/me        # Get current user profile
PUT  /api/v1/users/me        # Update current user profile
GET  /api/v1/users/{id}      # Get user by ID (admin or self)
```

### System
```http
GET  /health                 # Health check
GET  /metrics               # Prometheus metrics
```

## 🔧 Configuration

Environment variables (prefixed with `USERS_`):
```bash
USERS_DB_HOST=postgres-users
USERS_DB_USER=users_user
USERS_DB_PASSWORD=users_password
USERS_DB_NAME=localmart_users
USERS_JWT_SECRET_KEY=your-secret-key
USERS_PORT=8081
```

## 🧪 Testing the Migration

### Compare with Monolith
1. **Start monolith**: Check existing user functionality
2. **Start microservice**: Same functionality via REST API
3. **Compare responses**: Similar data structures and validation

### Example: User Registration
**Monolith** (form submission):
```html
POST /signup
name=John&email=john@example.com&password=password123
```

**Microservice** (JSON API):
```json
POST /api/v1/auth/signup
{
  "name": "John",
  "email": "john@example.com", 
  "password": "password123"
}
```

Both create the same user with the same validation rules!

## 🔍 Learning Opportunities

### Microservice Patterns
- **Database per service**: Separate PostgreSQL for users
- **Stateless authentication**: JWT instead of sessions
- **API-first design**: REST endpoints instead of web forms
- **Service isolation**: Independent deployment and scaling

### Modern Python Patterns
- **Async/await**: FastAPI with async database operations
- **Type hints**: Pydantic schemas and SQLAlchemy models
- **Dependency injection**: FastAPI's dependency system
- **Structured logging**: JSON logs for observability

### Docker Best Practices
- **Basic Dockerfile**: Simple, educational approach
- **Multi-stage builds**: Coming next as optimization lesson
- **Environment configuration**: 12-factor app principles
- **Service composition**: Docker Compose orchestration