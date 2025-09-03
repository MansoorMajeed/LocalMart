"""
Health check endpoints
"""

import structlog
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.config import settings
from ..core.database import get_db

logger = structlog.get_logger()

router = APIRouter(tags=["health"])


@router.get("/health")
async def health_check(db: AsyncSession = Depends(get_db)):
    """
    Health check endpoint - checks service and database connectivity
    Similar pattern to Go catalog service
    """
    try:
        # Test database connection
        await db.execute(text("SELECT 1"))
        
        return {
            "data": {
                "status": "healthy",
                "database": "connected",
                "service": settings.service_name,
                "version": settings.version
            }
        }
        
    except Exception as e:
        logger.error("Health check failed", error=str(e))
        raise HTTPException(
            status_code=503,
            detail={
                "data": {
                    "status": "unhealthy",
                    "database": "disconnected",
                    "service": settings.service_name,
                    "version": settings.version,
                    "error": str(e)
                }
            }
        )