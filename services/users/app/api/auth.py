"""
Authentication API routes - migrated from monolith auth/routes.py
"""

import structlog
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.database import get_db
from ..core.security import create_access_token
from ..schemas.user import UserCreate, UserLogin, Token, UserResponse
from ..services.user_service import UserService

logger = structlog.get_logger()

router = APIRouter(prefix="/auth", tags=["authentication"])


@router.post("/signup", response_model=Token, status_code=status.HTTP_201_CREATED)
async def signup(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    User registration - migrated from monolith signup route
    
    Creates a new user account and returns JWT token for immediate login
    """
    try:
        # Validate password length (same as monolith)
        if len(user_data.password) < 6:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 6 characters"
            )
        
        # Check if email already exists (same logic as monolith)
        if await UserService.email_exists(db, user_data.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create user
        user = await UserService.create_user(db, user_data)
        
        # Create JWT token (replaces session management from monolith)
        access_token = create_access_token(
            data={"sub": str(user.id), "email": user.email, "is_admin": user.is_admin}
        )
        
        logger.info("New user registered", email=user.email, user_id=user.id)
        
        return Token(
            access_token=access_token,
            user=UserResponse.from_orm(user)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error during signup", error=str(e), email=user_data.email)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error creating account. Please try again."
        )


@router.post("/login", response_model=Token)
async def login(
    login_data: UserLogin,
    db: AsyncSession = Depends(get_db)
):
    """
    User login - migrated from monolith login route
    
    Authenticates user and returns JWT token (replaces session)
    """
    try:
        # Get user by email (same logic as monolith)
        user = await UserService.get_user_by_email(db, login_data.email)
        
        # Verify user exists and password is correct (same logic as monolith)
        if not user or not UserService.verify_password(user, login_data.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Create JWT token (replaces session management from monolith)
        access_token = create_access_token(
            data={"sub": str(user.id), "email": user.email, "is_admin": user.is_admin}
        )
        
        logger.info("User logged in", email=user.email, user_id=user.id, is_admin=user.is_admin)
        
        return Token(
            access_token=access_token,
            user=UserResponse.from_orm(user)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error during login", error=str(e), email=login_data.email)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error logging in. Please try again."
        )