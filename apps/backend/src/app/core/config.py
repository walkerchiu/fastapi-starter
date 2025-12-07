from typing import Literal

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Environment
    environment: Literal["development", "production", "test"] = "development"

    # Application
    app_name: str = "FastAPI Backend"
    app_description: str = "FastAPI backend application"
    app_version: str = "0.0.0"
    debug: bool = False

    # Server
    host: str = "0.0.0.0"
    port: int = 8000

    # CORS
    cors_origins: list[str] | None = None
    cors_allow_credentials: bool = True
    cors_allow_methods: list[str] = ["*"]
    cors_allow_headers: list[str] = ["*"]

    @model_validator(mode="after")
    def set_cors_origins_default(self) -> "Settings":
        """Set default CORS origins based on environment."""
        if self.cors_origins is None:
            if self.environment == "development":
                self.cors_origins = ["http://localhost:3000"]
            else:
                # In production, CORS_ORIGINS must be explicitly configured
                self.cors_origins = []
        return self

    @model_validator(mode="after")
    def validate_jwt_secret(self) -> "Settings":
        """Validate JWT secret key is properly configured in production."""
        default_secret = "your-secret-key-change-in-production"
        if self.environment == "production" and self.jwt_secret_key == default_secret:
            raise ValueError(
                "JWT_SECRET_KEY must be set to a secure value in production. "
                "Do not use the default value."
            )
        return self

    # Database
    database_url: str = "sqlite+aiosqlite:///./data/app.db"
    database_echo: bool = False

    # JWT Authentication
    jwt_secret_key: str = "your-secret-key-change-in-production"
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 30
    jwt_refresh_token_expire_days: int = 7

    # Rate Limiting
    rate_limit_enabled: bool = True
    rate_limit_requests: int = 100  # Default requests per window
    rate_limit_window: int = 60  # Default window in seconds
    rate_limit_auth_requests: int = 20  # Auth endpoints (login, register)
    rate_limit_auth_window: int = 60
    rate_limit_graphql_requests: int = 50  # GraphQL endpoint
    rate_limit_graphql_window: int = 60

    # GraphQL Security
    graphql_max_depth: int = 10  # Maximum query depth
    graphql_max_complexity: int = 100  # Maximum query complexity


settings = Settings()
