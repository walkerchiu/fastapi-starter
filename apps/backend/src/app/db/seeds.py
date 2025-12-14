"""Database seed data for RBAC.

This module contains default permissions and roles for the RBAC system.
"""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from src.app.models.permission import Permission
from src.app.models.role import Role

# Default permissions following resource:action format
DEFAULT_PERMISSIONS = [
    # User management
    {
        "code": "users:read",
        "name": "Read Users",
        "description": "View user information",
    },
    {"code": "users:create", "name": "Create Users", "description": "Create new users"},
    {
        "code": "users:update",
        "name": "Update Users",
        "description": "Update user information",
    },
    {
        "code": "users:delete",
        "name": "Delete Users",
        "description": "Soft delete users",
    },
    {
        "code": "users:hard_delete",
        "name": "Hard Delete Users",
        "description": "Permanently delete users (Super Admin only)",
    },
    # Role management
    {
        "code": "roles:read",
        "name": "Read Roles",
        "description": "View role information",
    },
    {"code": "roles:create", "name": "Create Roles", "description": "Create new roles"},
    {
        "code": "roles:update",
        "name": "Update Roles",
        "description": "Update role information",
    },
    {
        "code": "roles:delete",
        "name": "Delete Roles",
        "description": "Soft delete roles",
    },
    {
        "code": "roles:hard_delete",
        "name": "Hard Delete Roles",
        "description": "Permanently delete roles (Super Admin only)",
    },
    # Permission management
    {
        "code": "permissions:read",
        "name": "Read Permissions",
        "description": "View permission information",
    },
    {
        "code": "permissions:create",
        "name": "Create Permissions",
        "description": "Create new permissions",
    },
    {
        "code": "permissions:update",
        "name": "Update Permissions",
        "description": "Update permission information",
    },
    {
        "code": "permissions:delete",
        "name": "Delete Permissions",
        "description": "Soft delete permissions",
    },
    {
        "code": "permissions:hard_delete",
        "name": "Hard Delete Permissions",
        "description": "Permanently delete permissions (Super Admin only)",
    },
    # File management
    {
        "code": "files:read",
        "name": "Read Files",
        "description": "View and download files",
    },
    {"code": "files:create", "name": "Create Files", "description": "Upload new files"},
    {
        "code": "files:update",
        "name": "Update Files",
        "description": "Update file metadata",
    },
    {
        "code": "files:delete",
        "name": "Delete Files",
        "description": "Soft delete files",
    },
    {
        "code": "files:hard_delete",
        "name": "Hard Delete Files",
        "description": "Permanently delete files (Super Admin only)",
    },
]

# Default roles with their permission codes
# is_system=True means the role cannot be modified or deleted
DEFAULT_ROLES = [
    {
        "code": "super_admin",
        "name": "Super Administrator",
        "description": "Full system access with all permissions",
        "is_system": True,
        "permissions": [
            "users:read",
            "users:create",
            "users:update",
            "users:delete",
            "users:hard_delete",
            "roles:read",
            "roles:create",
            "roles:update",
            "roles:delete",
            "roles:hard_delete",
            "permissions:read",
            "permissions:create",
            "permissions:update",
            "permissions:delete",
            "permissions:hard_delete",
            "files:read",
            "files:create",
            "files:update",
            "files:delete",
            "files:hard_delete",
        ],
    },
    {
        "code": "admin",
        "name": "Administrator",
        "description": "Administrative access for user and file management",
        "is_system": True,
        "permissions": [
            "users:read",
            "users:create",
            "users:update",
            "users:delete",
            "roles:read",
            "permissions:read",
            "files:read",
            "files:create",
            "files:update",
            "files:delete",
        ],
    },
    {
        "code": "user",
        "name": "User",
        "description": "Basic user access",
        "is_system": True,
        "permissions": [
            "users:read",
            "files:read",
            "files:create",
        ],
    },
]


async def seed_permissions(session: AsyncSession) -> dict[str, Permission]:
    """Seed default permissions.

    Args:
        session: Database session.

    Returns:
        Dictionary mapping permission codes to Permission objects.
    """
    permissions_map: dict[str, Permission] = {}

    for perm_data in DEFAULT_PERMISSIONS:
        # Check if permission already exists
        result = await session.execute(
            select(Permission).where(Permission.code == perm_data["code"])
        )
        existing = result.scalar_one_or_none()

        if existing:
            permissions_map[perm_data["code"]] = existing
        else:
            # Parse resource and action from code
            code = perm_data["code"]
            parts = code.split(":", 1)
            resource = parts[0] if len(parts) >= 1 else code
            action = parts[1] if len(parts) == 2 else ""
            permission = Permission(**perm_data, resource=resource, action=action)
            session.add(permission)
            permissions_map[perm_data["code"]] = permission

    await session.flush()
    return permissions_map


async def seed_roles(
    session: AsyncSession, permissions_map: dict[str, Permission]
) -> dict[str, Role]:
    """Seed default roles with their permissions.

    Args:
        session: Database session.
        permissions_map: Dictionary mapping permission codes to Permission objects.

    Returns:
        Dictionary mapping role codes to Role objects.
    """
    roles_map: dict[str, Role] = {}

    for role_data in DEFAULT_ROLES:
        # Check if role already exists
        result = await session.execute(
            select(Role).where(Role.code == role_data["code"])
        )
        existing = result.scalar_one_or_none()

        if existing:
            roles_map[role_data["code"]] = existing
        else:
            # Extract permissions list
            permission_codes = role_data.pop("permissions")

            # Create role
            role = Role(**role_data)
            session.add(role)
            await session.flush()

            # Refresh to load relationships
            await session.refresh(role, ["permissions"])

            # Assign permissions
            role.permissions = [
                permissions_map[code]
                for code in permission_codes
                if code in permissions_map
            ]

            roles_map[role_data["code"]] = role

            # Put permissions back for potential re-use
            role_data["permissions"] = permission_codes

    await session.flush()
    return roles_map


async def seed_all(
    session: AsyncSession,
) -> tuple[dict[str, Permission], dict[str, Role]]:
    """Seed all default RBAC data.

    Args:
        session: Database session.

    Returns:
        Tuple of (permissions_map, roles_map).
    """
    permissions_map = await seed_permissions(session)
    roles_map = await seed_roles(session, permissions_map)
    await session.commit()
    return permissions_map, roles_map
