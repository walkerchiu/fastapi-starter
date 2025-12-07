"""User API endpoints."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession
from src.app.db import get_db
from src.app.schemas import (
    MessageResponse,
    PaginatedResponse,
    PaginationParams,
    UserCreate,
    UserRead,
    UserUpdate,
)
from src.app.schemas.pagination import PaginationMeta
from src.app.services import UserService
from src.app.services.user_service import EmailAlreadyExistsError, UserNotFoundError

router = APIRouter(prefix="/users", tags=["users"])


async def get_user_service(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> UserService:
    """Dependency to get user service."""
    return UserService(db)


@router.get("", response_model=PaginatedResponse[UserRead])
async def list_users(
    service: Annotated[UserService, Depends(get_user_service)],
    pagination: Annotated[PaginationParams, Depends()],
) -> PaginatedResponse[UserRead]:
    """List all users with pagination."""
    users, total = await service.list_users(
        skip=pagination.offset, limit=pagination.limit
    )

    total_pages = ((total + pagination.limit - 1) // pagination.limit) if pagination.limit > 0 else 1
    return PaginatedResponse[UserRead](
        data=[UserRead.model_validate(user) for user in users],
        meta=PaginationMeta(
            page=pagination.page,
            limit=pagination.limit,
            total_items=total,
            total_pages=total_pages,
            has_next_page=pagination.page < total_pages,
            has_prev_page=pagination.page > 1,
        ),
    )


@router.post("", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_in: UserCreate,
    service: Annotated[UserService, Depends(get_user_service)],
) -> UserRead:
    """Create a new user."""
    try:
        user = await service.create(user_in)
        return UserRead.model_validate(user)
    except EmailAlreadyExistsError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        ) from None
    except SQLAlchemyError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user",
        ) from None


@router.get("/{user_id}", response_model=UserRead)
async def get_user(
    user_id: int,
    service: Annotated[UserService, Depends(get_user_service)],
) -> UserRead:
    """Get a user by ID."""
    try:
        user = await service.get_by_id(user_id)
        return UserRead.model_validate(user)
    except UserNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        ) from None


@router.patch("/{user_id}", response_model=UserRead)
async def update_user(
    user_id: int,
    user_in: UserUpdate,
    service: Annotated[UserService, Depends(get_user_service)],
) -> UserRead:
    """Update a user."""
    try:
        user = await service.update(user_id, user_in)
        return UserRead.model_validate(user)
    except UserNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        ) from None
    except SQLAlchemyError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user",
        ) from None


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    service: Annotated[UserService, Depends(get_user_service)],
) -> MessageResponse:
    """Delete a user."""
    try:
        await service.delete(user_id)
    except UserNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        ) from None
    except SQLAlchemyError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete user",
        ) from None
    return MessageResponse(message="User deleted successfully")
