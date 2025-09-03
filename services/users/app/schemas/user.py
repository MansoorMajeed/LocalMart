"""
Pydantic schemas for user data validation and serialization
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    """Base user schema"""
    name: str
    email: EmailStr


class UserCreate(UserBase):
    """Schema for creating a user - migrated from monolith signup"""
    password: str


class UserUpdate(BaseModel):
    """Schema for updating user information"""
    name: Optional[str] = None
    email: Optional[EmailStr] = None


class UserResponse(UserBase):
    """Schema for user responses - excludes sensitive data"""
    id: int
    is_admin: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    """Schema for user login - migrated from monolith login"""
    email: EmailStr
    password: str


class Token(BaseModel):
    """JWT token response"""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse