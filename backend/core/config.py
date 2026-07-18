from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "Saree Virtual Try-On API"
    VERSION: str = "2.0.0"
    API_V1_STR: str = "/api"
    DEBUG: bool = False
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001"
    ]
    
    # JWT
    SECRET_KEY: str = "fastapi-insecure-default-key-for-local-dev-only"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./db.sqlite3"
    
    # Frontend URL
    FRONTEND_URL: str = "http://localhost:3000"
    
    # Cloudinary
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""
    
    # AI Providers
    AI_PROVIDER: str = "mock" # 'mock', 'replicate', 'fashn'
    REPLICATE_API_TOKEN: str = ""
    FASHN_API_KEY: str = ""
    
    # Redis / Celery
    REDIS_URL: str = "redis://localhost:6379/0"
    # Storage Configuration (S3 / R2 / local)
    STORAGE_PROVIDER: str = "local" # 's3', 'r2', 'local'
    STORAGE_BUCKET: str = ""
    STORAGE_ACCESS_KEY: str = ""
    STORAGE_SECRET_KEY: str = ""
    STORAGE_ENDPOINT_URL: str = ""
    STORAGE_PUBLIC_URL: str = ""
    
    # GPU Server
    GPU_SERVER_URL: str = "http://localhost:8001"
    GPU_SERVER_API_KEY: str = ""

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True, extra="ignore")

settings = Settings()
