"""
Configuration for Users Service
"""

import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Service config
    service_name: str = "users-service"
    version: str = "1.0.0"
    port: int = 8081
    
    # Database config
    db_host: str = "localhost"
    db_port: int = 5432
    db_user: str = "users_user"
    db_password: str = "users_password"
    db_name: str = "localmart_users"
    
    # JWT config
    jwt_secret_key: str = "your-secret-key-change-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expiration_hours: int = 24
    
    # Logging
    log_level: str = "INFO"
    
    @property
    def database_url(self) -> str:
        return f"postgresql+asyncpg://{self.db_user}:{self.db_password}@{self.db_host}:{self.db_port}/{self.db_name}"
    
    class Config:
        env_file = ".env"
        env_prefix = "USERS_"


# Global settings instance
settings = Settings()