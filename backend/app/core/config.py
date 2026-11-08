from pathlib import Path
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    """Enterprise application settings."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # ==========================================
    # General
    # ==========================================

    PROJECT_NAME: str = "InsightForge AI"
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"
    API_V1_STR: str = "/api/v1"

    BACKEND_HOST: str = "0.0.0.0"
    BACKEND_PORT: int = 8000

    # ==========================================
    # Security
    # ==========================================

    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # ==========================================
    # PostgreSQL
    # ==========================================

    POSTGRES_SERVER: str
    POSTGRES_PORT: int
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str

    DATABASE_URL: str
    SYNC_DATABASE_URL: str

    # ==========================================
    # Gemini AI
    # ==========================================

    GEMINI_API_KEY: str
    GEMINI_MODEL: str = "gemini-1.5-pro"

    # ==========================================
    # Uploads
    # ==========================================

    UPLOAD_DIR: str = str(BASE_DIR / "storage" / "uploads")
    MAX_UPLOAD_SIZE_BYTES: int = 100 * 1024 * 1024
    ALLOWED_EXTENSIONS: List[str] = [".csv", ".xlsx", ".xls"]

    # ==========================================
    # CORS
    # ==========================================

    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8000",
    ]

    # ==========================================
    # Default Admin
    # ==========================================

    FIRST_SUPERUSER_EMAIL: str = "admin@dell.insightforge.ai"
    FIRST_SUPERUSER_PASSWORD: str = "InsightForge2026!"
    FIRST_SUPERUSER_NAME: str = "Dell Lead Solution Architect"
    FIRST_SUPERUSER_ORG: str = "Dell Technologies"

    def get_upload_path(self) -> Path:
        path = Path(self.UPLOAD_DIR)
        path.mkdir(parents=True, exist_ok=True)
        return path


settings = Settings()
settings.get_upload_path()