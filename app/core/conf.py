from functools import lru_cache
from typing import Literal

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )

    # APP
    APP_TITLE: str = "FastAPI Starter"
    APP_PREFIX: str = "FS"
    APP_VERSION: str = "0.0.1"
    APP_DESCRIPTION: str = ""
    APP_API_V1_STR: str = "/api/v1"
    APP_DOCS_URL: str | None = f"{APP_API_V1_STR}/docs"
    APP_REDOCS_URL: str | None = f"{APP_API_V1_STR}/redocs"
    APP_OPENAPI_URL: str | None = f"{APP_API_V1_STR}/openapi"
    APP_ENV: Literal["dev", "staging", "prod"] = "dev"
    APP_AUTHOR_NAME: str = "Walker Chiu"
    APP_AUTHOR_EMAIL: str = "chenjen.chiou@gmail.com"

    @model_validator(mode="before")
    @classmethod
    def validate_openapi_url(cls, values):
        if values["APP_ENV"] in ("prod"):
            values["APP_OPENAPI_URL"] = None
        return values

    # Uvicorn
    UVICORN_HOST: str = "0.0.0.0"
    UVICORN_PORT: int = 8000
    UVICORN_RELOAD: bool = True

    # Static Server
    STATIC_FILES: bool = False

    # Timezone
    DATETIME_TIMEZONE: str = "Asia/Taipei"
    DATETIME_FORMAT: str = "%Y-%m-%d %H:%M:%S"

    # Log
    LOG_STDOUT_FILENAME: str = "access.log"
    LOG_STDERR_FILENAME: str = "error.log"

    # Middleware
    MIDDLEWARE_CORS: bool = True
    MIDDLEWARE_CORS_LIST: list = [
        "http://localhost",
        "http://localhost:3000",
        "http://localhost:8080",
    ]
    MIDDLEWARE_GZIP: bool = True
    MIDDLEWARE_ACCESS: bool = True


@lru_cache
def get_settings():
    return Settings()


settings = get_settings()
