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
    app_description: str = """
FastAPI backend application with REST API and GraphQL support.

## Features

- **Authentication**: JWT-based authentication with access and refresh tokens
- **User Management**: Full CRUD operations for user resources
- **GraphQL**: Alternative GraphQL API with subscriptions support
- **Rate Limiting**: Configurable rate limits per endpoint
- **Validation**: Input validation with detailed error messages

## Authentication

Most endpoints require authentication. Use the **Authorize** button above to enter your Bearer token.

To get a token:
1. Register a new user via `POST /api/v1/auth/register`
2. Login via `POST /api/v1/auth/login` to receive tokens
3. Use the `access_token` in the Authorization header
    """
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
    # Database Engine: postgres | timescaledb
    database_engine: Literal["postgres", "timescaledb"] = "postgres"

    # Database Connection Pool
    db_pool_max: int = 10
    db_pool_min: int = 2
    db_pool_idle_timeout: int = 300000  # 5 minutes in milliseconds
    db_pool_max_lifetime: int = 3600000  # 1 hour in milliseconds
    db_connection_timeout: int = 10000  # 10 seconds in milliseconds

    # TimescaleDB Settings (only effective when database_engine=timescaledb)
    timescale_compression_enabled: bool = True
    timescale_compression_after_days: int = 7
    timescale_retention_days: int = 0  # 0 means no retention policy
    timescale_chunk_interval: str = "1 day"

    # Redis
    redis_host: str = "localhost"
    redis_port: int = 6379
    redis_password: str = ""
    redis_db: int = 0

    # Redis Connection Pool
    redis_pool_size: int = 10
    redis_pool_min_idle: int = 2
    redis_pool_idle_timeout: int = 300000  # 5 minutes in milliseconds
    redis_connection_timeout: int = 5000  # 5 seconds in milliseconds
    redis_read_timeout: int = 3000  # 3 seconds in milliseconds
    redis_write_timeout: int = 3000  # 3 seconds in milliseconds

    # JWT Authentication
    jwt_secret_key: str = "your-secret-key-change-in-production"
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 30
    jwt_refresh_token_expire_days: int = 7

    # Rate Limiting
    rate_limit_enabled: bool = True
    rate_limit_trust_proxy: bool = False  # Only trust X-Forwarded-For behind a proxy
    rate_limit_requests: int = 100  # Default requests per window
    rate_limit_window: int = 60  # Default window in seconds
    rate_limit_auth_requests: int = 20  # Auth endpoints (login, register)
    rate_limit_auth_window: int = 60
    rate_limit_graphql_requests: int = 50  # GraphQL endpoint
    rate_limit_graphql_window: int = 60

    # GraphQL Security
    graphql_max_depth: int = 10  # Maximum query depth
    graphql_max_complexity: int = 100  # Maximum query complexity
    graphql_ide: Literal["sandbox", "graphiql", "none"] = "sandbox"  # GraphQL IDE

    # S3 Storage
    s3_endpoint_url: str | None = None  # None uses AWS S3; set URL for S3-compatible
    s3_access_key_id: str = ""
    s3_secret_access_key: str = ""
    s3_bucket_name: str = "uploads"
    s3_region: str = "us-east-1"
    s3_use_ssl: bool = True
    s3_max_file_size: int = 10 * 1024 * 1024  # 10MB default
    s3_allowed_extensions: list[str] = [
        ".jpg",
        ".jpeg",
        ".png",
        ".gif",
        ".webp",
        ".pdf",
        ".doc",
        ".docx",
        ".txt",
    ]

    # Email (SMTP)
    smtp_host: str = "localhost"
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_use_tls: bool = True
    smtp_connection_timeout: int = 10000  # 10 seconds in milliseconds
    smtp_socket_timeout: int = 10000  # 10 seconds in milliseconds
    email_from_address: str = "noreply@example.com"
    email_from_name: str = "FastAPI App"

    # Frontend URL for email links
    frontend_url: str = "http://localhost:3000"

    # Token expiration
    password_reset_expire_minutes: int = 60
    email_verification_expire_hours: int = 24

    # API Key Authentication
    api_key_enabled: bool = False
    api_key_header: str = "X-API-Key"
    api_keys: str = ""  # Format: "key1:name1,key2:name2"

    # 2FA
    two_factor_issuer_name: str = "FastAPI App"
    two_factor_totp_window: int = 1  # Number of 30-second windows for clock skew
    two_factor_backup_codes_count: int = 10  # Number of backup codes to generate

    # Access Logging
    access_log_enabled: bool = True
    access_log_skip_paths: list[str] = [
        "/health",
        "/health/live",
        "/health/ready",
        "/metrics",
    ]

    # GZIP Compression
    gzip_enabled: bool = True
    gzip_minimum_size: int = 1024  # Minimum response size to compress (bytes)

    # Security Headers
    security_headers_enabled: bool = True
    hsts_enabled: bool = False  # Enable only after confirming HTTPS works
    hsts_max_age: int = 31536000  # 1 year in seconds

    # Trusted Host Validation
    trusted_host_enabled: bool = False  # Disabled by default for development
    trusted_hosts: list[str] = ["localhost", "127.0.0.1"]

    # Timeouts
    request_timeout: int = 30  # Maximum time for processing HTTP request (seconds)
    shutdown_timeout: int = 30  # Maximum time for graceful shutdown (seconds)
    shutdown_drain_delay: int = (
        2  # Delay for LB to remove node after health check fails
    )
    health_check_timeout: int = 5  # Timeout for health check operations (seconds)


settings = Settings()
