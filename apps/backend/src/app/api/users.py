"""User API endpoints."""

from typing import Annotated

from fastapi import APIRouter, Depends, Path, status
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession
from src.app.core.exceptions import (
    DatabaseException,
    EmailAlreadyExistsException,
    UserNotFoundException,
)
from src.app.db import get_db
from src.app.schemas import (
    ErrorResponse,
    MessageResponse,
    PaginatedResponse,
    PaginationParams,
    UserCreate,
    UserRead,
    UserUpdate,
)
from src.app.schemas.pagination import PaginationMeta
from src.app.services import (
    EmailAlreadyExistsError,
    UserNotFoundError,
    UserService,
)

router = APIRouter(prefix="/users", tags=["users"])


async def get_user_service(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> UserService:
    """Dependency to get user service."""
    return UserService(db)


@router.get(
    "",
    response_model=PaginatedResponse[UserRead],
    summary="List users",
    description="""
Retrieve a paginated list of users.

**Pagination parameters:**
- `skip`: Number of items to skip (default: 0)
- `limit`: Maximum number of items to return (default: 20, max: 100)
    """,
    responses={
        200: {
            "description": "List of users with pagination info",
            "content": {
                "application/json": {
                    "example": {
                        "items": [
                            {
                                "id": 1,
                                "email": "user@example.com",
                                "name": "John Doe",
                                "is_active": True,
                                "created_at": "2024-01-01T00:00:00Z",
                                "updated_at": "2024-01-01T00:00:00Z",
                            }
                        ],
                        "total": 1,
                        "skip": 0,
                        "limit": 20,
                    }
                }
            },
        },
        422: {"model": ErrorResponse, "description": "Validation error"},
    },
)
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


@router.post(
    "",
    response_model=UserRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create user",
    description="""
Create a new user with email and name.

**Note:** This endpoint creates a user without a password.
For user registration with password, use `/auth/register`.
    """,
    responses={
        201: {
            "description": "User successfully created",
            "content": {
                "application/json": {
                    "example": {
                        "id": 1,
                        "email": "user@example.com",
                        "name": "John Doe",
                        "is_active": True,
                        "created_at": "2024-01-01T00:00:00Z",
                        "updated_at": "2024-01-01T00:00:00Z",
                    }
                }
            },
        },
        400: {"model": ErrorResponse, "description": "Email already registered"},
        422: {"model": ErrorResponse, "description": "Validation error"},
        500: {"model": ErrorResponse, "description": "Database error"},
    },
)
async def create_user(
    user_in: UserCreate,
    service: Annotated[UserService, Depends(get_user_service)],
) -> UserRead:
    """Create a new user."""
    try:
        user = await service.create(user_in)
        return UserRead.model_validate(user)
    except EmailAlreadyExistsError:
        raise EmailAlreadyExistsException() from None
    except SQLAlchemyError:
        raise DatabaseException(detail="Failed to create user") from None


@router.get(
    "/{user_id}",
    response_model=UserRead,
    summary="Get user",
    description="Retrieve a specific user by their ID.",
    responses={
        200: {
            "description": "User details",
            "content": {
                "application/json": {
                    "example": {
                        "id": 1,
                        "email": "user@example.com",
                        "name": "John Doe",
                        "is_active": True,
                        "created_at": "2024-01-01T00:00:00Z",
                        "updated_at": "2024-01-01T00:00:00Z",
                    }
                }
            },
        },
        404: {"model": ErrorResponse, "description": "User not found"},
        422: {"model": ErrorResponse, "description": "Validation error"},
    },
)
async def get_user(
    user_id: Annotated[int, Path(description="The ID of the user to retrieve", ge=1)],
    service: Annotated[UserService, Depends(get_user_service)],
) -> UserRead:
    """Get a user by ID."""
    try:
        user = await service.get_by_id(user_id)
        return UserRead.model_validate(user)
    except UserNotFoundError:
        raise UserNotFoundException(user_id=user_id) from None


@router.patch(
    "/{user_id}",
    response_model=UserRead,
    summary="Update user",
    description="""
Update a user's information. Only provided fields will be updated.

**Updatable fields:**
- `email`: User's email address
- `name`: User's display name
- `is_active`: Account active status
    """,
    responses={
        200: {
            "description": "User successfully updated",
            "content": {
                "application/json": {
                    "example": {
                        "id": 1,
                        "email": "updated@example.com",
                        "name": "Jane Doe",
                        "is_active": True,
                        "created_at": "2024-01-01T00:00:00Z",
                        "updated_at": "2024-01-02T00:00:00Z",
                    }
                }
            },
        },
        404: {"model": ErrorResponse, "description": "User not found"},
        422: {"model": ErrorResponse, "description": "Validation error"},
        500: {"model": ErrorResponse, "description": "Database error"},
    },
)
async def update_user(
    user_id: Annotated[int, Path(description="The ID of the user to update", ge=1)],
    user_in: UserUpdate,
    service: Annotated[UserService, Depends(get_user_service)],
) -> UserRead:
    """Update a user."""
    try:
        user = await service.update(user_id, user_in)
        return UserRead.model_validate(user)
    except UserNotFoundError:
        raise UserNotFoundException(user_id=user_id) from None
    except SQLAlchemyError:
        raise DatabaseException(detail="Failed to update user") from None


@router.delete(
    "/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete user",
    description="Permanently delete a user by their ID.",
    responses={
        204: {"description": "User successfully deleted"},
        404: {"model": ErrorResponse, "description": "User not found"},
        422: {"model": ErrorResponse, "description": "Validation error"},
        500: {"model": ErrorResponse, "description": "Database error"},
    },
)
async def delete_user(
    user_id: Annotated[int, Path(description="The ID of the user to delete", ge=1)],
    service: Annotated[UserService, Depends(get_user_service)],
) -> MessageResponse:
    """Delete a user."""
    try:
        await service.delete(user_id)
    except UserNotFoundError:
        raise UserNotFoundException(user_id=user_id) from None
    except SQLAlchemyError:
        raise DatabaseException(detail="Failed to delete user") from None
    return MessageResponse(message="User deleted successfully")
