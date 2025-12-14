"""Permission API endpoints."""

from typing import Annotated

from fastapi import APIRouter, Depends, Path, status
from sqlalchemy.ext.asyncio import AsyncSession
from src.app.core.deps import require_permissions, require_superadmin
from src.app.core.exceptions import NotFoundException
from src.app.db import get_db
from src.app.models import User
from src.app.schemas import (
    ErrorResponse,
    MessageResponse,
    PaginatedResponse,
    PaginationParams,
    PermissionCreate,
    PermissionRead,
    PermissionUpdate,
)
from src.app.services import PermissionService

router = APIRouter(prefix="/permissions", tags=["permissions"])

# Permission dependencies
RequirePermissionsRead = Annotated[
    User, Depends(require_permissions("permissions:read"))
]
RequireSuperAdmin = Annotated[User, Depends(require_superadmin())]


async def get_permission_service(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> PermissionService:
    """Dependency to get permission service."""
    return PermissionService(db)


@router.get(
    "",
    response_model=PaginatedResponse[PermissionRead],
    summary="List permissions",
    description="""
Retrieve a paginated list of permissions.

**Pagination parameters:**
- `skip`: Number of items to skip (default: 0)
- `limit`: Maximum number of items to return (default: 20, max: 100)
    """,
    responses={
        200: {
            "description": "List of permissions with pagination info",
            "content": {
                "application/json": {
                    "example": {
                        "data": [
                            {
                                "id": 1,
                                "code": "users:read",
                                "name": "Users Read",
                                "description": "Permission to read users",
                                "created_at": "2024-01-01T00:00:00Z",
                                "updated_at": "2024-01-01T00:00:00Z",
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
async def list_permissions(
    _current_user: RequirePermissionsRead,
    service: Annotated[PermissionService, Depends(get_permission_service)],
    pagination: Annotated[PaginationParams, Depends()],
) -> PaginatedResponse[PermissionRead]:
    """List all permissions with pagination."""
    permissions, total = await service.list_permissions(
        skip=pagination.offset, limit=pagination.limit
    )
    page = pagination.page
    total_pages = ((total + pagination.limit - 1) // pagination.limit) if pagination.limit > 0 else 1
    return PaginatedResponse[PermissionRead](
        data=[PermissionRead.model_validate(p) for p in permissions],
        meta={
            "page": page,
            "limit": pagination.limit,
            "total_items": total,
            "total_pages": total_pages,
            "has_next_page": page < total_pages,
            "has_prev_page": page > 1,
        },
    )


@router.post(
    "",
    response_model=PermissionRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create permission",
    description="""
Create a new permission with a unique code.

**Required fields:**
- `code`: Unique permission code (e.g., "users:read")
- `name`: Human-readable name
    """,
    responses={
        201: {
            "description": "Permission successfully created",
            "content": {
                "application/json": {
                    "example": {
                        "id": 1,
                        "code": "users:read",
                        "name": "Users Read",
                        "description": "Permission to read users",
                        "createdAt": "2024-01-01T00:00:00Z",
                        "updatedAt": "2024-01-01T00:00:00Z",
                    }
                }
            },
        },
        400: {"model": ErrorResponse, "description": "Permission code already exists"},
        422: {"model": ErrorResponse, "description": "Validation error"},
        500: {"model": ErrorResponse, "description": "Database error"},
    },
)
async def create_permission(
    _current_user: RequireSuperAdmin,
    permission_in: PermissionCreate,
    service: Annotated[PermissionService, Depends(get_permission_service)],
) -> PermissionRead:
    """Create a new permission."""
    permission = await service.create(permission_in)
    return PermissionRead.model_validate(permission)


@router.get(
    "/code/{code}",
    response_model=PermissionRead,
    summary="Get permission by code",
    description="Retrieve a specific permission by its code.",
    responses={
        200: {
            "description": "Permission details",
            "content": {
                "application/json": {
                    "example": {
                        "id": 1,
                        "code": "users:read",
                        "name": "Users Read",
                        "description": "Permission to read users",
                        "createdAt": "2024-01-01T00:00:00Z",
                        "updatedAt": "2024-01-01T00:00:00Z",
                    }
                }
            },
        },
        404: {"model": ErrorResponse, "description": "Permission not found"},
        422: {"model": ErrorResponse, "description": "Validation error"},
    },
)
async def get_permission_by_code(
    _current_user: RequirePermissionsRead,
    code: Annotated[str, Path(description="The code of the permission to retrieve")],
    service: Annotated[PermissionService, Depends(get_permission_service)],
) -> PermissionRead:
    """Get a permission by code."""
    permission = await service.get_by_code(code)
    if not permission:
        raise NotFoundException(
            detail=f"Permission with code '{code}' not found",
            resource="permission",
            resource_id=code,
        )
    return PermissionRead.model_validate(permission)


@router.get(
    "/name/{name}",
    response_model=PermissionRead,
    summary="Get permission by name",
    description="Retrieve a specific permission by its name.",
    responses={
        200: {
            "description": "Permission details",
            "content": {
                "application/json": {
                    "example": {
                        "id": 1,
                        "code": "users:read",
                        "name": "Users Read",
                        "description": "Permission to read users",
                        "createdAt": "2024-01-01T00:00:00Z",
                        "updatedAt": "2024-01-01T00:00:00Z",
                    }
                }
            },
        },
        404: {"model": ErrorResponse, "description": "Permission not found"},
        422: {"model": ErrorResponse, "description": "Validation error"},
    },
)
async def get_permission_by_name(
    _current_user: RequirePermissionsRead,
    name: Annotated[str, Path(description="The name of the permission to retrieve")],
    service: Annotated[PermissionService, Depends(get_permission_service)],
) -> PermissionRead:
    """Get a permission by name."""
    permission = await service.get_by_name(name)
    if not permission:
        raise NotFoundException(
            detail=f"Permission with name '{name}' not found",
            resource="permission",
            resource_id=name,
        )
    return PermissionRead.model_validate(permission)


@router.get(
    "/{id}",
    response_model=PermissionRead,
    summary="Get permission by ID",
    description="Retrieve a specific permission by its ID.",
    responses={
        200: {
            "description": "Permission details",
            "content": {
                "application/json": {
                    "example": {
                        "id": 1,
                        "code": "users:read",
                        "name": "Users Read",
                        "description": "Permission to read users",
                        "createdAt": "2024-01-01T00:00:00Z",
                        "updatedAt": "2024-01-01T00:00:00Z",
                    }
                }
            },
        },
        404: {"model": ErrorResponse, "description": "Permission not found"},
        422: {"model": ErrorResponse, "description": "Validation error"},
    },
)
async def get_permission(
    _current_user: RequirePermissionsRead,
    id: Annotated[int, Path(description="The ID of the permission to retrieve", ge=1)],
    service: Annotated[PermissionService, Depends(get_permission_service)],
) -> PermissionRead:
    """Get a permission by ID."""
    permission = await service.get_by_id(id)
    return PermissionRead.model_validate(permission)


@router.patch(
    "/{id}",
    response_model=PermissionRead,
    summary="Update permission",
    description="""
Update a permission's information. Only provided fields will be updated.

**Updatable fields:**
- `name`: Human-readable name
- `description`: Permission description
    """,
    responses={
        200: {
            "description": "Permission successfully updated",
            "content": {
                "application/json": {
                    "example": {
                        "id": 1,
                        "code": "users:read",
                        "name": "Updated Name",
                        "description": "Updated description",
                        "createdAt": "2024-01-01T00:00:00Z",
                        "updatedAt": "2024-01-02T00:00:00Z",
                    }
                }
            },
        },
        404: {"model": ErrorResponse, "description": "Permission not found"},
        422: {"model": ErrorResponse, "description": "Validation error"},
        500: {"model": ErrorResponse, "description": "Database error"},
    },
)
async def update_permission(
    _current_user: RequireSuperAdmin,
    id: Annotated[int, Path(description="The ID of the permission to update", ge=1)],
    permission_in: PermissionUpdate,
    service: Annotated[PermissionService, Depends(get_permission_service)],
) -> PermissionRead:
    """Update a permission."""
    permission = await service.update(id, permission_in)
    return PermissionRead.model_validate(permission)


@router.delete(
    "/{id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete permission",
    description="Permanently delete a permission by its ID.",
    responses={
        204: {"description": "Permission successfully deleted"},
        404: {"model": ErrorResponse, "description": "Permission not found"},
        422: {"model": ErrorResponse, "description": "Validation error"},
        500: {"model": ErrorResponse, "description": "Database error"},
    },
)
async def delete_permission(
    _current_user: RequireSuperAdmin,
    id: Annotated[int, Path(description="The ID of the permission to delete", ge=1)],
    service: Annotated[PermissionService, Depends(get_permission_service)],
) -> None:
    """Delete a permission."""
    await service.delete(id)


@router.delete(
    "/{id}/hard",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Hard delete permission",
    description="Permanently delete a permission from the database. This action cannot be undone.",
    responses={
        200: {"description": "Permission permanently deleted"},
        404: {"model": ErrorResponse, "description": "Permission not found"},
        422: {"model": ErrorResponse, "description": "Validation error"},
        500: {"model": ErrorResponse, "description": "Database error"},
    },
)
async def hard_delete_permission(
    _current_user: RequireSuperAdmin,
    id: Annotated[int, Path(description="The ID of the permission to delete", ge=1)],
    service: Annotated[PermissionService, Depends(get_permission_service)],
) -> MessageResponse:
    """Permanently delete a permission."""
    await service.hard_delete(id, is_super_admin=True)
    return MessageResponse(message="Permission permanently deleted")


@router.post(
    "/{id}/restore",
    response_model=PermissionRead,
    summary="Restore soft-deleted permission",
    description="Restore a previously soft-deleted permission.",
    responses={
        200: {"description": "Permission restored"},
        404: {"model": ErrorResponse, "description": "Permission not found"},
        422: {"model": ErrorResponse, "description": "Validation error"},
        500: {"model": ErrorResponse, "description": "Database error"},
    },
)
async def restore_permission(
    _current_user: RequireSuperAdmin,
    id: Annotated[int, Path(description="The ID of the permission to restore", ge=1)],
    service: Annotated[PermissionService, Depends(get_permission_service)],
) -> PermissionRead:
    """Restore a soft-deleted permission."""
    permission = await service.restore(id)
    return PermissionRead.model_validate(permission)
