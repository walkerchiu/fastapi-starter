"""API routes."""

from src.app.api.admin import router as admin_router
from src.app.api.auth import router as auth_router
from src.app.api.files import router as files_router
from src.app.api.health import router as health_router
from src.app.api.permissions import router as permissions_router
from src.app.api.roles import router as roles_router
from src.app.api.users import router as users_router

__all__ = [
    "admin_router",
    "auth_router",
    "files_router",
    "health_router",
    "permissions_router",
    "roles_router",
    "users_router",
]
