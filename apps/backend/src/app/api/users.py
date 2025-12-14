"""User API endpoints."""

from typing import Annotated

from fastapi import APIRouter, Depends, Path, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from src.app.core.deps import require_permissions, require_superadmin
from src.app.db import get_db
from src.app.models import User
from src.app.schemas import (
    AssignRolesRequest,
    ErrorResponse,
    MessageResponse,
    PaginatedResponse,
    PaginationParams,
    PermissionRead,
    RoleRead,
    UserCreate,
    UserRead,
    UserReadWithRoles,
    UserUpdate,
)
from src.app.schemas.pagination import PaginationMeta
from src.app.services import UserService

router = APIRouter(prefix="/users", tags=["users"])

# Permission dependencies
RequireUsersRead = Annotated[User, Depends(require_permissions("users:read"))]
RequireUsersCreate = Annotated[User, Depends(require_permissions("users:create"))]
RequireUsersUpdate = Annotated[User, Depends(require_permissions("users:update"))]
RequireUsersDelete = Annotated[User, Depends(require_permissions("users:delete"))]
RequireUsersHardDelete = Annotated[
    User, Depends(require_permissions("users:hard_delete"))
]
RequireSuperAdmin = Annotated[User, Depends(require_superadmin())]


async def get_user_service(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> UserService:
    """Dependency to get user service."""
    return UserService(db)


@router.get(
    "",
    summary="List users",
    description="""
Retrieve a paginated list of users.

**Pagination parameters:**
- `skip`: Number of items to skip (default: 0)
- `limit`: Maximum number of items to return (default: 20, max: 100)

**Query parameters:**
- `include_roles`: Include roles in the response (default: false)
    """,
    responses={
        200: {
            "description": "List of users with pagination info",
            "content": {
                "application/json": {
                    "example": {
                        "data": [
                            {
                                "id": 1,
                                "email": "user@example.com",
                                "name": "John Doe",
                                "is_active": True,
                                "is_email_verified": True,
                                "two_factor_enabled": False,
                                "created_at": "2024-01-01T00:00:00Z",
                                "updated_at": "2024-01-01T00:00:00Z",
                                "deleted_at": None,
                            }
                        ],
                        "meta": {
                            "page": 1,
                            "limit": 20,
                            "total_items": 1,
                            "total_pages": 1,
                            "has_next_page": False,
                            "has_prev_page": False,
                        },
                    }
                }
            },
        },
        422: {"model": ErrorResponse, "description": "Validation error"},
    },
)
async def list_users(
    _current_user: RequireUsersRead,
    service: Annotated[UserService, Depends(get_user_service)],
    pagination: Annotated[PaginationParams, Depends()],
    include_roles: Annotated[
        bool, Query(description="Include roles in the response")
    ] = False,
) -> PaginatedResponse[UserRead] | PaginatedResponse[UserReadWithRoles]:
    """List all users with pagination."""
    users, total = await service.list_users(
        skip=pagination.offset, limit=pagination.limit, include_roles=include_roles
    )

    total_pages = ((total + pagination.limit - 1) // pagination.limit) if pagination.limit > 0 else 1
    meta = PaginationMeta(
        page=pagination.page,
        limit=pagination.limit,
        total_items=total,
        total_pages=total_pages,
        has_next_page=pagination.page < total_pages,
        has_prev_page=pagination.page > 1,
    )

    if include_roles:
        return PaginatedResponse[UserReadWithRoles](
            data=[UserReadWithRoles.model_validate(user) for user in users],
            meta=meta,
        )

    return PaginatedResponse[UserRead](
        data=[UserRead.model_validate(user) for user in users],
        meta=meta,
    )


@router.post(
    "",
    response_model=UserReadWithRoles,
    status_code=status.HTTP_201_CREATED,
    summary="Create user",
    description="""
Create a new user with email and name.

**Note:** This endpoint creates a user without a password.
For user registration with password, use `/auth/register`.

**Optional fields:**
- `role_ids`: List of role IDs to assign to the user
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
                        "roles": [],
                    }
                }
            },
        },
        400: {"model": ErrorResponse, "description": "Email already registered"},
        404: {"model": ErrorResponse, "description": "Role not found"},
        422: {"model": ErrorResponse, "description": "Validation error"},
        500: {"model": ErrorResponse, "description": "Database error"},
    },
)
async def create_user(
    _current_user: RequireUsersCreate,
    user_in: UserCreate,
    service: Annotated[UserService, Depends(get_user_service)],
) -> UserReadWithRoles:
    """Create a new user."""
    user = await service.create(user_in)
    return UserReadWithRoles.model_validate(user)


@router.get(
    "/{id}",
    response_model=UserReadWithRoles,
    summary="Get user",
    description="Retrieve a specific user by their ID with roles.",
    responses={
        200: {
            "description": "User details with roles",
            "content": {
                "application/json": {
                    "example": {
                        "id": 1,
                        "email": "user@example.com",
                        "name": "John Doe",
                        "is_active": True,
                        "created_at": "2024-01-01T00:00:00Z",
                        "updated_at": "2024-01-01T00:00:00Z",
                        "roles": [],
                    }
                }
            },
        },
        404: {"model": ErrorResponse, "description": "User not found"},
        422: {"model": ErrorResponse, "description": "Validation error"},
    },
)
async def get_user(
    _current_user: RequireUsersRead,
    id: Annotated[int, Path(description="The ID of the user to retrieve", ge=1)],
    service: Annotated[UserService, Depends(get_user_service)],
) -> UserReadWithRoles:
    """Get a user by ID with roles."""
    user = await service.get_by_id(id, include_roles=True)
    return UserReadWithRoles.model_validate(user)


@router.patch(
    "/{id}",
    response_model=UserReadWithRoles,
    summary="Update user",
    description="""
Update a user's information. Only provided fields will be updated.

**Updatable fields:**
- `email`: User's email address
- `name`: User's display name
- `is_active`: Account active status
- `role_ids`: Replace all roles with new list
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
                        "roles": [],
                    }
                }
            },
        },
        404: {"model": ErrorResponse, "description": "User or role not found"},
        422: {"model": ErrorResponse, "description": "Validation error"},
        500: {"model": ErrorResponse, "description": "Database error"},
    },
)
async def update_user(
    _current_user: RequireUsersUpdate,
    id: Annotated[int, Path(description="The ID of the user to update", ge=1)],
    user_in: UserUpdate,
    service: Annotated[UserService, Depends(get_user_service)],
) -> UserReadWithRoles:
    """Update a user."""
    user = await service.update(id, user_in)
    return UserReadWithRoles.model_validate(user)


@router.delete(
<<<<<<< HEAD
    "/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
=======
    "/{id}",
    status_code=status.HTTP_204_NO_CONTENT,
>>>>>>> 41ea1315c (Feat(Module): Add role-based access control (RBAC) system)
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
    _current_user: RequireUsersDelete,
    id: Annotated[int, Path(description="The ID of the user to delete", ge=1)],
    service: Annotated[UserService, Depends(get_user_service)],
) -> None:
    """Delete a user."""
    await service.delete(id)


@router.delete(
    "/{id}/hard",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Hard delete user",
    description="Permanently delete a user from the database. This action cannot be undone.",
    responses={
        200: {"description": "User permanently deleted"},
        404: {"model": ErrorResponse, "description": "User not found"},
        422: {"model": ErrorResponse, "description": "Validation error"},
        500: {"model": ErrorResponse, "description": "Database error"},
    },
)
async def hard_delete_user(
    _current_user: RequireUsersHardDelete,
    id: Annotated[int, Path(description="The ID of the user to delete", ge=1)],
    service: Annotated[UserService, Depends(get_user_service)],
) -> MessageResponse:
    """Permanently delete a user."""
    await service.hard_delete(id, is_super_admin=True)
    return MessageResponse(message="User permanently deleted")


@router.post(
    "/{id}/restore",
    response_model=UserReadWithRoles,
    summary="Restore soft-deleted user",
    description="Restore a previously soft-deleted user.",
    responses={
        200: {"description": "User restored"},
        404: {"model": ErrorResponse, "description": "User not found"},
        422: {"model": ErrorResponse, "description": "Validation error"},
        500: {"model": ErrorResponse, "description": "Database error"},
    },
)
async def restore_user(
    _current_user: RequireSuperAdmin,
    id: Annotated[int, Path(description="The ID of the user to restore", ge=1)],
    service: Annotated[UserService, Depends(get_user_service)],
) -> UserReadWithRoles:
    """Restore a soft-deleted user. Super Admin only."""
    user = await service.restore(id)
    return UserReadWithRoles.model_validate(user)


@router.put(
    "/{id}/roles",
    response_model=list[RoleRead],
    summary="Replace user roles",
    description="Replace all roles for a user with the given list.",
    responses={
        200: {
            "description": "User roles replaced",
        },
        404: {"model": ErrorResponse, "description": "User or role not found"},
        422: {"model": ErrorResponse, "description": "Validation error"},
    },
)
async def replace_roles_for_user(
    _current_user: RequireUsersUpdate,
    id: Annotated[int, Path(description="The ID of the user", ge=1)],
    request: AssignRolesRequest,
    service: Annotated[UserService, Depends(get_user_service)],
) -> list[RoleRead]:
    """Replace all roles for a user."""
    user = await service.replace_roles(id, request.role_ids)
    return [RoleRead.model_validate(r) for r in user.roles]


@router.post(
    "/{id}/roles",
    response_model=list[RoleRead],
    summary="Add roles to user (bulk)",
    description="Add multiple roles to a user in a single operation.",
    responses={
        200: {
            "description": "Roles added to user",
        },
        404: {"model": ErrorResponse, "description": "User or role not found"},
        422: {"model": ErrorResponse, "description": "Validation error"},
    },
)
async def add_roles_to_user(
    _current_user: RequireUsersUpdate,
    id: Annotated[int, Path(description="The ID of the user", ge=1)],
    request: AssignRolesRequest,
    service: Annotated[UserService, Depends(get_user_service)],
) -> list[RoleRead]:
    """Add multiple roles to a user."""
    user = await service.add_roles(id, request.role_ids)
    return [RoleRead.model_validate(r) for r in user.roles]


@router.delete(
    "/{id}/roles",
    response_model=MessageResponse,
    summary="Remove roles from user (bulk)",
    description="Remove multiple roles from a user in a single operation.",
    responses={
        200: {
            "description": "Roles removed from user",
        },
        404: {"model": ErrorResponse, "description": "User not found"},
        422: {"model": ErrorResponse, "description": "Validation error"},
    },
)
async def remove_roles_from_user(
    _current_user: RequireUsersUpdate,
    id: Annotated[int, Path(description="The ID of the user", ge=1)],
    request: AssignRolesRequest,
    service: Annotated[UserService, Depends(get_user_service)],
) -> MessageResponse:
    """Remove multiple roles from a user."""
    await service.remove_roles(id, request.role_ids)
    return MessageResponse(message="Roles removed successfully")


@router.post(
    "/{id}/roles/{roleId}",
    response_model=MessageResponse,
    summary="Assign role to user",
    description="Assign a single role to a user.",
    responses={
        200: {
            "description": "Role assigned to user",
        },
        404: {"model": ErrorResponse, "description": "User or role not found"},
        422: {"model": ErrorResponse, "description": "Validation error"},
    },
)
async def assign_role_to_user(
    _current_user: RequireUsersUpdate,
    id: Annotated[int, Path(description="The ID of the user", ge=1)],
    roleId: Annotated[int, Path(description="The ID of the role to assign", ge=1)],
    service: Annotated[UserService, Depends(get_user_service)],
) -> MessageResponse:
    """Assign a single role to a user."""
    await service.assign_role(id, roleId)
    return MessageResponse(message="Role assigned successfully")


@router.delete(
    "/{id}/roles/{roleId}",
    response_model=MessageResponse,
    summary="Remove role from user",
    description="Remove a single role from a user.",
    responses={
        200: {
            "description": "Role removed from user",
        },
        404: {"model": ErrorResponse, "description": "User not found"},
        422: {"model": ErrorResponse, "description": "Validation error"},
    },
)
async def remove_role_from_user(
    _current_user: RequireUsersUpdate,
    id: Annotated[int, Path(description="The ID of the user", ge=1)],
    roleId: Annotated[int, Path(description="The ID of the role to remove", ge=1)],
    service: Annotated[UserService, Depends(get_user_service)],
) -> MessageResponse:
    """Remove a single role from a user."""
    await service.remove_role(id, roleId)
    return MessageResponse(message="Role removed successfully")


@router.get(
    "/{id}/permissions",
    response_model=list[PermissionRead],
    summary="Get user permissions",
    description="Get all permissions for a user through their roles.",
    responses={
        200: {
            "description": "List of user permissions",
            "content": {
                "application/json": {
                    "example": [
                        {
                            "id": 1,
                            "code": "users:read",
                            "name": "Users Read",
                            "description": None,
                            "created_at": "2024-01-01T00:00:00Z",
                            "updated_at": "2024-01-01T00:00:00Z",
                        }
                    ]
                }
            },
        },
        404: {"model": ErrorResponse, "description": "User not found"},
        422: {"model": ErrorResponse, "description": "Validation error"},
    },
)
async def get_user_permissions(
    _current_user: RequireUsersRead,
    id: Annotated[int, Path(description="The ID of the user", ge=1)],
    service: Annotated[UserService, Depends(get_user_service)],
) -> list[PermissionRead]:
    """Get all permissions for a user through their roles."""
    permissions = await service.get_user_permissions(id)
    return [PermissionRead.model_validate(p) for p in permissions]


@router.get(
    "/{id}/roles",
    response_model=list[RoleRead],
    summary="Get user roles",
    description="Get all roles assigned to a user.",
    responses={
        200: {
            "description": "List of user roles",
            "content": {
                "application/json": {
                    "example": [
                        {
                            "id": 1,
                            "code": "admin",
                            "name": "Administrator",
                            "description": None,
                            "is_system": False,
                            "created_at": "2024-01-01T00:00:00Z",
                            "updated_at": "2024-01-01T00:00:00Z",
                        }
                    ]
                }
            },
        },
        404: {"model": ErrorResponse, "description": "User not found"},
        422: {"model": ErrorResponse, "description": "Validation error"},
    },
)
async def get_user_roles(
    _current_user: RequireUsersRead,
    id: Annotated[int, Path(description="The ID of the user", ge=1)],
    service: Annotated[UserService, Depends(get_user_service)],
) -> list[RoleRead]:
    """Get all roles assigned to a user."""
    user = await service.get_by_id(id, include_roles=True)
    return [RoleRead.model_validate(r) for r in user.roles]
