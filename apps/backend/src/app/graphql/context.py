"""GraphQL context utilities."""

from typing import Annotated

from fastapi import Depends, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from src.app.core.security import decode_token
from src.app.db import get_db
from src.app.models import User

DbDep = Annotated[AsyncSession, Depends(get_db)]


async def get_current_user_from_request(
    request: Request, db: AsyncSession
) -> User | None:
    """Extract current user from Authorization header if present.

    Loads user with roles and permissions for RBAC checks.
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None

    token = auth_header[7:]  # Remove "Bearer " prefix
    payload = decode_token(token)

    if not payload:
        return None

    if payload.get("type") != "access":
        return None

    user_id = payload.get("sub")
    if not user_id:
        return None

    # Load user - roles and permissions use lazy="selectin" in models
    result = await db.execute(select(User).where(User.id == int(user_id)))
    user = result.scalar_one_or_none()

    if not user or not user.is_active:
        return None

    return user


async def get_context(
    request: Request,
    db: DbDep,
) -> dict:
    """Get GraphQL context with database session and optional user."""
    user = await get_current_user_from_request(request, db)
    return {"request": request, "db": db, "user": user}
