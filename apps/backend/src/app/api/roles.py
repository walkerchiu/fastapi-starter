"""Role API endpoints."""

from typing import Annotated

from fastapi import APIRouter, Depends, Path, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from src.app.core.deps import require_permissions, require_superadmin
from src.app.core.exceptions import NotFoundException
from src.app.db import get_db
from src.app.models import User
from src.app.schemas import (
    AssignPermissionsRequest,
    ErrorResponse,
    MessageResponse,
    PaginatedResponse,
    PaginationParams,
    PermissionRead,
    RoleCreate,
    RoleRead,
    RoleReadWithPermissions,
    RoleUpdate,
)
from src.app.services import RoleService

router = APIRouter(prefix="/roles", tags=["roles"])

# Permission dependencies
RequireRolesRead = Annotated[User, Depends(require_permissions("roles:read"))]
RequireSuperAdmin = Annotated[User, Depends(require_superadmin())]


async def get_role_service(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> RoleService:
    """Dependency to get role service."""
    return RoleService(db)


@router.get(
    "",
    summary="List roles",
    description="""
Retrieve a paginated list of roles.

**Pagination parameters:**
- `skip`: Number of items to skip (default: 0)
- `limit`: Maximum number of items to return (default: 20, max: 100)

**Query parameters:**
- `include_permissions`: Include permissions in the response (default: false)
    """,
    responses={
        200: {
            "description": "List of roles with pagination info",
            "content": {
                "application/json": {
                    "example": {
                        "data": [
                            {
                                "id": 1,
                                "code": "admin",
                                "name": "Administrator",
                                "description": "Full access role",
                                "is_system": False,
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
async def list_roles(
    _current_user: RequireRolesRead,
    service: Annotated[RoleService, Depends(get_role_service)],
    pagination: Annotated[PaginationParams, Depends()],
    include_permissions: Annotated[
        bool, Query(description="Include permissions in the response")
    ] = False,
) -> PaginatedResponse[RoleRead] | PaginatedResponse[RoleReadWithPermissions]:
    """List all roles with pagination."""
    roles, total = await service.list_roles(
        skip=pagination.offset,
        limit=pagination.limit,
        include_permissions=include_permissions,
    )
    page = pagination.page
    total_pages = ((total + pagination.limit - 1) // pagination.limit) if pagination.limit > 0 else 1
    meta = {
        "page": page,
        "limit": pagination.limit,
        "total_items": total,
        "total_pages": total_pages,
        "has_next_page": page < total_pages,
        "has_prev_page": page > 1,
    }

    if include_permissions:
        return PaginatedResponse[RoleReadWithPermissions](
            data=[RoleReadWithPermissions.model_validate(r) for r in roles],
            meta=meta,
        )

    return PaginatedResponse[RoleRead](
        data=[RoleRead.model_validate(r) for r in roles],
        meta=meta,
    )


@router.post(
    "",
    response_model=RoleReadWithPermissions,
    status_code=status.HTTP_201_CREATED,
    summary="Create role",
    description="""
Create a new role with a unique code.

**Required fields:**
- `code`: Unique role code (lowercase alphanumeric with underscores)
- `name`: Human-readable name

**Optional fields:**
- `description`: Role description
- `permission_ids`: List of permission IDs to assign
    """,
    responses={
        201: {
            "description": "Role successfully created",
            "content": {
                "application/json": {
                    "example": {
                        "id": 1,
                        "code": "admin",
                        "name": "Administrator",
                        "description": "Full access role",
                        "isSystem": False,
                        "createdAt": "2024-01-01T00:00:00Z",
                        "updatedAt": "2024-01-01T00:00:00Z",
                        "permissions": [],
                    }
                }
            },
        },
        400: {"model": ErrorResponse, "description": "Role code already exists"},
        404: {"model": ErrorResponse, "description": "Permission not found"},
        422: {"model": ErrorResponse, "description": "Validation error"},
        500: {"model": ErrorResponse, "description": "Database error"},
    },
)
async def create_role(
    _current_user: RequireSuperAdmin,
    role_in: RoleCreate,
    service: Annotated[RoleService, Depends(get_role_service)],
) -> RoleReadWithPermissions:
    """Create a new role."""
    role = await service.create(role_in)
    return RoleReadWithPermissions.model_validate(role)


@router.get(
    "/code/{code}",
    response_model=RoleReadWithPermissions,
    summary="Get role by code",
    description="Retrieve a specific role by its code with permissions.",
    responses={
        200: {
            "description": "Role details with permissions",
            "content": {
                "application/json": {
                    "example": {
                        "id": 1,
                        "code": "admin",
                        "name": "Administrator",
                        "description": "Full access role",
                        "isSystem": False,
                        "createdAt": "2024-01-01T00:00:00Z",
                        "updatedAt": "2024-01-01T00:00:00Z",
                        "permissions": [],
                    }
                }
            },
        },
        404: {"model": ErrorResponse, "description": "Role not found"},
        422: {"model": ErrorResponse, "description": "Validation error"},
    },
)
async def get_role_by_code(
    _current_user: RequireRolesRead,
    code: Annotated[str, Path(description="The code of the role to retrieve")],
    service: Annotated[RoleService, Depends(get_role_service)],
) -> RoleReadWithPermissions:
    """Get a role by code with permissions."""
    role = await service.get_by_code(code)
    if not role:
        raise NotFoundException(
            detail=f"Role with code '{code}' not found",
            resource="role",
            resource_id=code,
        )
    # Load permissions
    role = await service.get_by_id(role.id, include_permissions=True)
    return RoleReadWithPermissions.model_validate(role)


@router.get(
    "/name/{name}",
    response_model=RoleReadWithPermissions,
    summary="Get role by name",
    description="Retrieve a specific role by its name with permissions.",
    responses={
        200: {
            "description": "Role details with permissions",
            "content": {
                "application/json": {
                    "example": {
                        "id": 1,
                        "code": "admin",
                        "name": "Administrator",
                        "description": "Full access role",
                        "isSystem": False,
                        "createdAt": "2024-01-01T00:00:00Z",
                        "updatedAt": "2024-01-01T00:00:00Z",
                        "permissions": [],
                    }
                }
            },
        },
        404: {"model": ErrorResponse, "description": "Role not found"},
        422: {"model": ErrorResponse, "description": "Validation error"},
    },
)
async def get_role_by_name(
    _current_user: RequireRolesRead,
    name: Annotated[str, Path(description="The name of the role to retrieve")],
    service: Annotated[RoleService, Depends(get_role_service)],
) -> RoleReadWithPermissions:
    """Get a role by name with permissions."""
    role = await service.get_by_name(name)
    if not role:
        raise NotFoundException(
            detail=f"Role with name '{name}' not found",
            resource="role",
            resource_id=name,
        )
    # Load permissions
    role = await service.get_by_id(role.id, include_permissions=True)
    return RoleReadWithPermissions.model_validate(role)


@router.get(
    "/{id}",
    response_model=RoleReadWithPermissions,
    summary="Get role by ID",
    description="Retrieve a specific role by its ID with permissions.",
    responses={
        200: {
            "description": "Role details with permissions",
            "content": {
                "application/json": {
                    "example": {
                        "id": 1,
                        "code": "admin",
                        "name": "Administrator",
                        "description": "Full access role",
                        "isSystem": False,
                        "createdAt": "2024-01-01T00:00:00Z",
                        "updatedAt": "2024-01-01T00:00:00Z",
                        "permissions": [
                            {
                                "id": 1,
                                "code": "users:read",
                                "name": "Users Read",
                                "description": None,
                                "createdAt": "2024-01-01T00:00:00Z",
                                "updatedAt": "2024-01-01T00:00:00Z",
                            }
                        ],
                    }
                }
            },
        },
        404: {"model": ErrorResponse, "description": "Role not found"},
        422: {"model": ErrorResponse, "description": "Validation error"},
    },
)
async def get_role(
    _current_user: RequireRolesRead,
    id: Annotated[int, Path(description="The ID of the role to retrieve", ge=1)],
    service: Annotated[RoleService, Depends(get_role_service)],
) -> RoleReadWithPermissions:
    """Get a role by ID with permissions."""
    role = await service.get_by_id(id, include_permissions=True)
    return RoleReadWithPermissions.model_validate(role)


@router.patch(
    "/{id}",
    response_model=RoleReadWithPermissions,
    summary="Update role",
    description="""
Update a role's information. Only provided fields will be updated.

**Note:** System roles cannot be modified.

**Updatable fields:**
- `name`: Human-readable name
- `description`: Role description
- `permission_ids`: Replace all permissions with new list
    """,
    responses={
        200: {
            "description": "Role successfully updated",
            "content": {
                "application/json": {
                    "example": {
                        "id": 1,
                        "code": "admin",
                        "name": "Updated Name",
                        "description": "Updated description",
                        "isSystem": False,
                        "createdAt": "2024-01-01T00:00:00Z",
                        "updatedAt": "2024-01-02T00:00:00Z",
                        "permissions": [],
                    }
                }
            },
        },
        403: {"model": ErrorResponse, "description": "Cannot modify system role"},
        404: {"model": ErrorResponse, "description": "Role or permission not found"},
        422: {"model": ErrorResponse, "description": "Validation error"},
        500: {"model": ErrorResponse, "description": "Database error"},
    },
)
async def update_role(
    _current_user: RequireSuperAdmin,
    id: Annotated[int, Path(description="The ID of the role to update", ge=1)],
    role_in: RoleUpdate,
    service: Annotated[RoleService, Depends(get_role_service)],
) -> RoleReadWithPermissions:
    """Update a role."""
    role = await service.update(id, role_in)
    return RoleReadWithPermissions.model_validate(role)


@router.delete(
    "/{id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete role",
    description="""
Permanently delete a role by its ID.

**Note:** System roles cannot be deleted.
    """,
    responses={
        204: {"description": "Role successfully deleted"},
        403: {"model": ErrorResponse, "description": "Cannot delete system role"},
        404: {"model": ErrorResponse, "description": "Role not found"},
        422: {"model": ErrorResponse, "description": "Validation error"},
        500: {"model": ErrorResponse, "description": "Database error"},
    },
)
async def delete_role(
    _current_user: RequireSuperAdmin,
    id: Annotated[int, Path(description="The ID of the role to delete", ge=1)],
    service: Annotated[RoleService, Depends(get_role_service)],
) -> None:
    """Delete a role."""
    await service.delete(id)


@router.delete(
    "/{id}/hard",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Hard delete role",
    description="""
Permanently delete a role from the database. This action cannot be undone.

**Note:** System roles cannot be deleted.
    """,
    responses={
        200: {"description": "Role permanently deleted"},
        403: {"model": ErrorResponse, "description": "Cannot delete system role"},
        404: {"model": ErrorResponse, "description": "Role not found"},
        422: {"model": ErrorResponse, "description": "Validation error"},
        500: {"model": ErrorResponse, "description": "Database error"},
    },
)
async def hard_delete_role(
    _current_user: RequireSuperAdmin,
    id: Annotated[int, Path(description="The ID of the role to delete", ge=1)],
    service: Annotated[RoleService, Depends(get_role_service)],
) -> MessageResponse:
    """Permanently delete a role."""
    await service.hard_delete(id, is_super_admin=True)
    return MessageResponse(message="Role permanently deleted")


@router.post(
    "/{id}/restore",
    response_model=RoleRead,
    summary="Restore soft-deleted role",
    description="Restore a previously soft-deleted role.",
    responses={
        200: {"description": "Role restored"},
        404: {"model": ErrorResponse, "description": "Role not found"},
        422: {"model": ErrorResponse, "description": "Validation error"},
        500: {"model": ErrorResponse, "description": "Database error"},
    },
)
async def restore_role(
    _current_user: RequireSuperAdmin,
    id: Annotated[int, Path(description="The ID of the role to restore", ge=1)],
    service: Annotated[RoleService, Depends(get_role_service)],
) -> RoleRead:
    """Restore a soft-deleted role."""
    role = await service.restore(id)
    return RoleRead.model_validate(role)


@router.get(
    "/{id}/permissions",
    response_model=list[PermissionRead],
    summary="Get role permissions",
    description="Retrieve all permissions assigned to a role.",
    responses={
        200: {
            "description": "List of permissions",
        },
        404: {"model": ErrorResponse, "description": "Role not found"},
        422: {"model": ErrorResponse, "description": "Validation error"},
    },
)
async def get_role_permissions(
    _current_user: RequireRolesRead,
    id: Annotated[int, Path(description="The ID of the role", ge=1)],
    service: Annotated[RoleService, Depends(get_role_service)],
) -> list[PermissionRead]:
    """Get all permissions of a role."""
    role = await service.get_by_id(id, include_permissions=True)
    return [PermissionRead.model_validate(p) for p in role.permissions]


@router.put(
    "/{id}/permissions",
    response_model=list[PermissionRead],
    summary="Assign permissions to role",
    description="Replace all permissions of a role with the given list.",
    responses={
        200: {
            "description": "Updated permissions list",
        },
        404: {"model": ErrorResponse, "description": "Role or permission not found"},
        422: {"model": ErrorResponse, "description": "Validation error"},
    },
)
async def assign_permissions_to_role(
    _current_user: RequireSuperAdmin,
    id: Annotated[int, Path(description="The ID of the role", ge=1)],
    request: AssignPermissionsRequest,
    service: Annotated[RoleService, Depends(get_role_service)],
) -> list[PermissionRead]:
    """Replace all permissions of a role."""
    role = await service.assign_permissions(id, request.permission_ids)
    return [PermissionRead.model_validate(p) for p in role.permissions]


@router.post(
    "/{id}/permissions/{permissionId}",
    response_model=MessageResponse,
    summary="Add permission to role",
    description="""
Add a permission to a role.

**Note:** System roles cannot be modified.
    """,
    responses={
        200: {
            "description": "Permission added to role",
        },
        403: {"model": ErrorResponse, "description": "Cannot modify system role"},
        404: {"model": ErrorResponse, "description": "Role or permission not found"},
        422: {"model": ErrorResponse, "description": "Validation error"},
    },
)
async def add_permission_to_role(
    _current_user: RequireSuperAdmin,
    id: Annotated[int, Path(description="The ID of the role", ge=1)],
    permissionId: Annotated[
        int, Path(description="The ID of the permission to add", ge=1)
    ],
    service: Annotated[RoleService, Depends(get_role_service)],
) -> MessageResponse:
    """Add a permission to a role."""
    await service.add_permission(id, permissionId)
    return MessageResponse(message="Permission added successfully")


@router.delete(
    "/{id}/permissions/{permissionId}",
    response_model=MessageResponse,
    summary="Remove permission from role",
    description="""
Remove a permission from a role.

**Note:** System roles cannot be modified.
    """,
    responses={
        200: {
            "description": "Permission removed from role",
        },
        403: {"model": ErrorResponse, "description": "Cannot modify system role"},
        404: {"model": ErrorResponse, "description": "Role not found"},
        422: {"model": ErrorResponse, "description": "Validation error"},
    },
)
async def remove_permission_from_role(
    _current_user: RequireSuperAdmin,
    id: Annotated[int, Path(description="The ID of the role", ge=1)],
    permissionId: Annotated[
        int, Path(description="The ID of the permission to remove", ge=1)
    ],
    service: Annotated[RoleService, Depends(get_role_service)],
) -> MessageResponse:
    """Remove a permission from a role."""
    await service.remove_permission(id, permissionId)
    return MessageResponse(message="Permission removed successfully")
