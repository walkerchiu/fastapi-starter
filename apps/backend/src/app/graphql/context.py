"""GraphQL context utilities."""

from typing import Annotated

from fastapi import Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from src.app.db import get_db

DbDep = Annotated[AsyncSession, Depends(get_db)]


async def get_context(
    request: Request,
    db: DbDep,
) -> dict:
    """Get GraphQL context with database session."""
    return {"request": request, "db": db}
