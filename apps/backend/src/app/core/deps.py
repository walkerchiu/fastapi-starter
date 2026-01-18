"""Dependencies for authentication and authorization."""

import uuid
from collections.abc import Callable
from typing import Annotated

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from src.app.core.exceptions import (
    InactiveUserException,
    InsufficientPermissionsException,
    InvalidTokenException,
    InvalidTokenTypeException,
    UnauthenticatedException,
)
from src.app.core.security import decode_token
from src.app.db.session import get_db
from src.app.models import Role, User

security = HTTPBearer()


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> User:
    """Get current authenticated user from JWT token."""
    token = credentials.credentials
    payload = decode_token(token)

    if not payload:
        raise InvalidTokenException()

    if payload.get("type") != "access":
        raise InvalidTokenTypeException()

    user_id = payload.get("sub")
    if not user_id:
        raise InvalidTokenException(detail="Invalid token payload")

    result = await db.execute(select(User).where(User.id == uuid.UUID(user_id)))
    user = result.scalar_one_or_none()

    if not user:
        raise UnauthenticatedException(detail="User not found")

    if not user.is_active:
        raise InactiveUserException()

    return user


async def get_current_user_with_roles(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> User:
    """Get current authenticated user with roles loaded."""
    token = credentials.credentials
    payload = decode_token(token)

    if not payload:
        raise InvalidTokenException()

    if payload.get("type") != "access":
        raise InvalidTokenTypeException()

    user_id = payload.get("sub")
    if not user_id:
        raise InvalidTokenException(detail="Invalid token payload")

    result = await db.execute(
        select(User)
        .where(User.id == uuid.UUID(user_id))
        .options(selectinload(User.roles).selectinload(Role.permissions))
    )
    user = result.scalar_one_or_none()

    if not user:
        raise UnauthenticatedException(detail="User not found")

    if not user.is_active:
        raise InactiveUserException()

    return user


async def get_current_active_user(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    """Get current active user (alias for get_current_user with active check)."""
    return current_user


def require_permissions(
    *permission_codes: str,
    require_all: bool = True,
) -> Callable[[User], User]:
    """
    Dependency factory for requiring specific permissions.

    Args:
        *permission_codes: Permission codes to check (e.g., "users:read", "users:create")
        require_all: If True, user must have ALL permissions. If False, user needs ANY.

    Usage:
        @router.get("/admin")
        async def admin_endpoint(
            user: Annotated[User, Depends(require_permissions("admin:read"))]
        ):
            ...

        @router.get("/any-permission")
        async def any_permission(
            user: Annotated[User, Depends(require_permissions("a:read", "b:read", require_all=False))]
        ):
            ...
    """

    async def permission_checker(
        user: Annotated[User, Depends(get_current_user_with_roles)],
    ) -> User:
        # Collect all permission codes from user's roles
        user_permissions: set[str] = set()
        for role in user.roles:
            for permission in role.permissions:
                user_permissions.add(permission.code)

        required = set(permission_codes)

        if require_all:
            # User must have ALL required permissions
            if not required.issubset(user_permissions):
                missing = required - user_permissions
                raise InsufficientPermissionsException(
                    detail=f"Missing required permissions: {', '.join(sorted(missing))}",
                    required_permissions=list(required),
                )
        else:
            # User must have ANY of the required permissions
            if not required.intersection(user_permissions):
                raise InsufficientPermissionsException(
                    detail=f"Requires at least one of: {', '.join(sorted(required))}",
                    required_permissions=list(required),
                )

        return user

    return permission_checker


def require_roles(
    *role_codes: str,
    require_all: bool = False,
) -> Callable[[User], User]:
    """
    Dependency factory for requiring specific roles.

    Args:
        *role_codes: Role codes to check (e.g., "admin", "super_admin")
        require_all: If True, user must have ALL roles. If False (default), user needs ANY.

    Usage:
        @router.get("/admin-only")
        async def admin_only(
            user: Annotated[User, Depends(require_roles("admin", "super_admin"))]
        ):
            ...
    """

    async def role_checker(
        user: Annotated[User, Depends(get_current_user_with_roles)],
    ) -> User:
        user_roles = {role.code for role in user.roles}
        required = set(role_codes)

        if require_all:
            # User must have ALL required roles
            if not required.issubset(user_roles):
                missing = required - user_roles
                raise InsufficientPermissionsException(
                    detail=f"Missing required roles: {', '.join(sorted(missing))}",
                    required_roles=list(required),
                )
        else:
            # User must have ANY of the required roles
            if not required.intersection(user_roles):
                raise InsufficientPermissionsException(
                    detail=f"Requires at least one of roles: {', '.join(sorted(required))}",
                    required_roles=list(required),
                )

        return user

    return role_checker


def require_superadmin() -> Callable[[User], User]:
    """
    Dependency for requiring superadmin role.

    Usage:
        @router.delete("/dangerous")
        async def dangerous_action(
            user: Annotated[User, Depends(require_superadmin())]
        ):
            ...
    """
    return require_roles("super_admin")


# Type aliases for cleaner dependency injection
CurrentUser = Annotated[User, Depends(get_current_user)]
CurrentUserWithRoles = Annotated[User, Depends(get_current_user_with_roles)]
