# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LocalMart is a cloud-native e-commerce microservices application designed as a comprehensive learning environment for modern engineers. Built around a relatable e-commerce domain that everyone understands (products, catalogs, shopping), it serves as a realistic platform for teaching containerized service management, observability, and production-ready development practices.

### Educational Purpose
This repository is specifically designed for creating teaching videos and hands-on learning experiences for modern engineers who need to understand the complete software delivery lifecycle. In today's world of blurred responsibilities and cross-functional teams, engineers benefit from understanding how everything fits together - from code to production and back.

### Current Architecture
- **Catalog Service** (Go): Product management API with full observability (tracing, metrics, logging)
- **Frontend Service** (React + TypeScript): Modern e-commerce interface with Tailwind CSS
- **PostgreSQL**: Database for catalog service
- **Infrastructure**: Docker Compose for local development

### Learning Environment Vision
LocalMart will evolve into a fully-fledged development learning environment that teaches the complete modern software delivery lifecycle:
- **Development**: Multiple microservices with realistic business logic and interactions
- **Build & Test**: Automated testing, quality gates, and continuous integration
- **Containerization**: Docker best practices, multi-stage builds, and optimization
- **Orchestration**: Kubernetes deployments, service mesh, and configuration management
- **Observability**: Production-grade monitoring, logging, tracing, and alerting
- **Deployment**: GitOps workflows, progressive delivery, and rollback strategies
- **Operations**: Incident response, capacity planning, and performance optimization
- **Security**: Authentication, authorization, secrets management, and compliance
- **Reliability**: Circuit breakers, retries, chaos engineering, and disaster recovery

## Common Development Commands

### Docker Compose Operations
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild and restart specific service
docker-compose up --build catalog
```

### Catalog Service (Go)
```bash
cd services/catalog

# Install dependencies
go mod tidy

# Run locally (requires PostgreSQL running)
go run main.go

# Build
go build -o bin/catalog main.go

# Run tests
go test ./...

# Format code
go fmt ./...
```

### Frontend Service (React + TypeScript)
```bash
cd services/frontend

# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Preview production build
npm run preview
```

### Traffic Simulation
```bash
# Generate realistic e-commerce traffic
./scripts/simulate-traffic.sh

# Custom duration and interval
./scripts/simulate-traffic.sh --duration 300 --interval 2

# Seed database only
./scripts/simulate-traffic.sh --seed-only
```

## Architecture Overview

### High-Level Structure
```
LocalMart/
├── services/
│   ├── catalog/          # Go microservice with full observability
│   └── frontend/         # React TypeScript SPA
├── scripts/
│   └── simulate-traffic.sh  # E-commerce traffic generator
└── docker-compose.yml   # Development environment
```

### Catalog Service Architecture
- **main.go**: Application entry point with service initialization
- **internal/server/**: HTTP server setup with middleware stack (tracing, logging, metrics)
- **internal/handlers/**: REST API endpoints for products and health checks
- **internal/services/**: Business logic including complex analysis operations
- **internal/models/**: Data access layer with database operations
- **internal/db/**: Database connection and schema management
- **internal/tracing/**: OpenTelemetry tracing configuration
- **internal/metrics/**: Prometheus metrics collection
- **internal/logger/**: Structured logging with trace correlation

### Frontend Architecture
- **src/components/**: React components (ProductList, ProductDetail, UI components)
- **src/hooks/**: React Query hooks for API integration with metrics
- **src/services/**: API service layer (catalogApi, metricsApi)
- **src/types/**: TypeScript type definitions
- Built with Vite, uses Tailwind CSS v4, React Router for SPA routing

### Key Technology Decisions
- **Observability**: Full OpenTelemetry tracing, structured JSON logging, Prometheus metrics
- **Database**: PostgreSQL with connection pooling via lib/pq
- **HTTP Framework**: Gin for Go services with middleware for cross-cutting concerns
- **Frontend**: Modern React 18 with TypeScript, React Query for state management
- **Containerization**: Multi-stage Docker builds optimized for each service

### Development Patterns
- **Dependency Injection**: Database connections passed to services
- **Middleware Layering**: Tracing → Logging → Metrics → Business Logic
- **Error Handling**: Consistent JSON error responses with structured logging
- **Context Propagation**: Trace context flows through all application layers
- **API Design**: RESTful endpoints with consistent response format

## Educational Learning Journey

### Complete Software Delivery Lifecycle
Students will learn how modern software flows from idea to production:

1. **Code Development**: Writing microservices with proper architecture patterns
2. **Local Development**: Running services locally with Docker Compose
3. **Testing Strategy**: Unit, integration, and end-to-end testing approaches
4. **Build Automation**: CI pipelines that build, test, and package applications
5. **Container Strategy**: Optimizing Docker images and managing dependencies
6. **Deployment Automation**: GitOps workflows and progressive delivery techniques
7. **Observability Implementation**: Monitoring, logging, and tracing for production visibility
8. **Incident Response**: Debugging distributed systems using real-world scenarios
9. **Performance Optimization**: Scaling applications and managing resource constraints
10. **Security Integration**: Implementing security throughout the development lifecycle

### Cross-Functional Skills Development
Modern engineers need to understand:
- **How code changes impact infrastructure and operations**
- **Why observability decisions affect debugging and incident response**
- **How container and Kubernetes choices influence both development and production**
- **Why security and compliance requirements shape architecture decisions**
- **How monitoring and alerting inform development practices**
- **Why performance considerations drive both code and infrastructure design**

### Breaking Down Silos
Rather than separating concerns by traditional roles, students learn:
- **Holistic thinking**: Understanding how each component affects the entire system
- **Shared responsibility**: Everyone contributes to reliability, security, and performance
- **Cross-team collaboration**: Speaking the same language across development and operations
- **End-to-end ownership**: Taking responsibility from code commit to production operation
- **Systems thinking**: Seeing the bigger picture of how distributed systems work together

### Why E-commerce Domain?
Using an e-commerce platform as the learning environment provides several advantages:
- **Familiar Business Logic**: Everyone understands products, shopping carts, orders
- **Real-world Complexity**: Realistic service interactions and data relationships
- **Scalability Challenges**: Traffic patterns that mirror production environments
- **Relatable Scenarios**: Business requirements that students can easily understand
- **Growth Potential**: Natural progression from simple catalog to full marketplace
- **Cross-cutting Concerns**: Authentication, payments, inventory - all realistic engineering challenges

### Environment Configuration
Services use environment variables for configuration. Default values are set in docker-compose.yml:
- Database connection (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME)
- Service ports (CATALOG_PORT, FRONTEND_PORT)
- Tracing configuration (TRACING_ENABLED, OTEL_EXPORTER_OTLP_ENDPOINT)

### API Integration
- Frontend communicates with catalog service via REST API
- Nginx proxy routes `/api/*` requests to catalog service
- Error handling and loading states implemented on frontend
- Metrics collected on both frontend (RUM) and backend

### Special Features
- **Rich Tracing Demo**: `/api/v1/products/analyze` endpoint creates complex trace hierarchies
- **Frontend Metrics**: Browser performance metrics sent to backend for Prometheus scraping
- **Traffic Simulation**: Realistic e-commerce traffic patterns for testing observability