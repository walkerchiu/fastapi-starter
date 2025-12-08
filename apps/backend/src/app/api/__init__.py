"""API routes."""

from src.app.api.auth import router as auth_router
from src.app.api.files import router as files_router
from src.app.api.health import router as health_router
from src.app.api.users import router as users_router

__all__ = ["auth_router", "files_router", "health_router", "users_router"]
