"""
Database initialization - creates tables if they don't exist
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
import structlog

from .database import engine, Base
from .config import settings

logger = structlog.get_logger()


async def create_tables():
    """Create database tables if they don't exist"""
    try:
        async with engine.begin() as conn:
            # Create all tables defined in models
            await conn.run_sync(Base.metadata.create_all)
        
        logger.info("Database tables created successfully")
        
    except Exception as e:
        logger.error("Failed to create database tables", error=str(e))
        raise


async def init_database():
    """Initialize database with tables and any seed data"""
    try:
        await create_tables()
        logger.info("Database initialization completed")
        
    except Exception as e:
        logger.error("Database initialization failed", error=str(e))
        raise