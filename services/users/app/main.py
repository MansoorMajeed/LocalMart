"""
FastAPI Users Service - Migrated from LocalMart Monolith
Main application entry point
"""

import structlog
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
import time

from .api import auth, users, health, metrics
from .api.metrics import request_count, request_duration
from .core.config import settings
from .core.init_db import init_database

# Configure structured logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()

# Create FastAPI app
app = FastAPI(
    title="LocalMart Users Service",
    description="User authentication and management microservice - migrated from monolith",
    version=settings.version,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    """Initialize database on application startup"""
    logger.info("Initializing database...")
    await init_database()
    logger.info("Database initialization completed")

# CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def logging_and_metrics_middleware(request: Request, call_next):
    """Basic logging and metrics middleware"""
    start_time = time.time()
    
    # Log request
    logger.info(
        "HTTP request started",
        method=request.method,
        path=request.url.path,
        user_agent=request.headers.get("user-agent", ""),
    )
    
    # Process request
    response = await call_next(request)
    
    # Calculate duration
    duration = time.time() - start_time
    
    # Record metrics
    request_count.labels(
        method=request.method,
        endpoint=request.url.path,
        status_code=response.status_code
    ).inc()
    
    request_duration.labels(
        method=request.method,
        endpoint=request.url.path
    ).observe(duration)
    
    # Log response
    logger.info(
        "HTTP request completed",
        method=request.method,
        path=request.url.path,
        status_code=response.status_code,
        duration_ms=round(duration * 1000, 2)
    )
    
    return response


# Include routers
app.include_router(health.router)
app.include_router(metrics.router)
app.include_router(auth.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "LocalMart Users Service",
        "version": settings.version,
        "service": settings.service_name,
        "docs": "/docs"
    }


if __name__ == "__main__":
    import uvicorn
    
    logger.info(
        "Starting Users Service",
        service=settings.service_name,
        version=settings.version,
        port=settings.port
    )
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=settings.port,
        reload=True,
        log_config=None  # Use structlog instead
    )