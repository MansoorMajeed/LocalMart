"""
User business logic service
"""

from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.security import hash_password, verify_password
from ..models.user import User
from ..schemas.user import UserCreate, UserUpdate


class UserService:
    """User service containing business logic - migrated from monolith"""

    @staticmethod
    async def create_user(db: AsyncSession, user_data: UserCreate) -> User:
        """Create a new user - migrated from monolith create_user function"""
        # Hash the password
        password_hash = hash_password(user_data.password)
        
        # Create user instance
        db_user = User(
            name=user_data.name,
            email=user_data.email.lower(),  # Store email in lowercase
            password_hash=password_hash,
            is_admin=False  # New users are not admin by default
        )
        
        db.add(db_user)
        await db.commit()
        await db.refresh(db_user)
        
        return db_user

    @staticmethod
    async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
        """Get user by email - migrated from monolith get_user_by_email"""
        result = await db.execute(
            select(User).where(User.email == email.lower())
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def get_user_by_id(db: AsyncSession, user_id: int) -> Optional[User]:
        """Get user by ID - migrated from monolith get_user_by_id"""
        result = await db.execute(
            select(User).where(User.id == user_id)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def email_exists(db: AsyncSession, email: str) -> bool:
        """Check if email already exists - migrated from monolith email_exists"""
        result = await db.execute(
            select(User.id).where(User.email == email.lower())
        )
        return result.scalar_one_or_none() is not None

    @staticmethod
    def verify_password(user: User, password: str) -> bool:
        """Verify user password - migrated from monolith verify_password"""
        return verify_password(password, user.password_hash)

    @staticmethod
    async def update_user(db: AsyncSession, user_id: int, user_data: UserUpdate) -> Optional[User]:
        """Update user information"""
        user = await UserService.get_user_by_id(db, user_id)
        if not user:
            return None
        
        # Update fields if provided
        if user_data.name is not None:
            user.name = user_data.name
        if user_data.email is not None:
            user.email = user_data.email.lower()
        
        await db.commit()
        await db.refresh(user)
        
        return user