"""Dependencies for authentication and authorization."""

from typing import Annotated

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from src.app.core.exceptions import (
    InactiveUserException,
    InvalidTokenException,
    InvalidTokenTypeException,
    UnauthenticatedException,
)
from src.app.core.security import decode_token
from src.app.db.session import get_db
from src.app.models import User

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

    result = await db.execute(select(User).where(User.id == int(user_id)))
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


# Type aliases for cleaner dependency injection
CurrentUser = Annotated[User, Depends(get_current_user)]
