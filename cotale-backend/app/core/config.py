"""
Configuration module for CoTale backend
"""

import os
from typing import List
from pathlib import Path

# 只在開發環境載入本地 .env 檔案
if os.getenv("NODE_ENV") != "production" and os.getenv("ENVIRONMENT") != "production":
    from dotenv import load_dotenv

    root_dir = Path(__file__).parent.parent.parent.parent  # Go up to project root
    env_path = root_dir / ".env"
    if env_path.exists():
        load_dotenv(env_path)


class Settings:
    """Application settings loaded from environment variables"""

    # Server Configuration
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    DEBUG: bool = os.getenv("DEBUG", "true").lower() == "true"

    # CORS Configuration
    ALLOWED_ORIGINS: List[str] = os.getenv(
        "ALLOWED_ORIGINS", "http://localhost:3000"
    ).split(",")

    # Database Configuration
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./cotale.db")

    # OpenAI Configuration
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4")

    # JWT Configuration
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(
        os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30")
    )

    # WebSocket Configuration
    WS_MAX_CONNECTIONS: int = int(os.getenv("WS_MAX_CONNECTIONS", "100"))
    WS_HEARTBEAT_INTERVAL: int = int(os.getenv("WS_HEARTBEAT_INTERVAL", "30"))

    # Logging Configuration
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    LOG_FORMAT: str = os.getenv(
        "LOG_FORMAT", "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )

    @property
    def is_development(self) -> bool:
        """Check if running in development mode"""
        return self.DEBUG

    @property
    def has_openai_key(self) -> bool:
        """Check if OpenAI API key is configured"""
        return bool(
            self.OPENAI_API_KEY and self.OPENAI_API_KEY != "your_openai_api_key_here"
        )

    def __repr__(self) -> str:
        return f"<Settings DEBUG={self.DEBUG} HOST={self.HOST} PORT={self.PORT}>"


# Global settings instance
settings = Settings()

# Log configuration in development
if settings.is_development:
    print(f"CoTale Backend Configuration: {settings}")
    if not settings.has_openai_key:
        print(
            "Warning: OpenAI API key not configured. AI features will use mock responses."
        )
