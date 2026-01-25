"""Role service layer for business logic."""

import logging
from datetime import UTC, datetime
from typing import Any

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from src.app.core.audit import log_audit_from_context
from src.app.models import Permission, Role
from src.app.schemas.role import RoleCreate, RoleUpdate
from src.app.services.exceptions import (
    HardDeleteNotAllowedError,
    PermissionNotFoundError,
    RoleCodeAlreadyExistsError,
    RoleNotFoundError,
    SystemRoleModificationError,
)

logger = logging.getLogger(__name__)


class RoleService:
    """Service class for role operations."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def _log_audit(
        self,
        action: str,
        entity_type: str,
        entity_id: int | None = None,
        changes: dict[str, Any] | None = None,
        extra_metadata: dict[str, Any] | None = None,
    ) -> None:
        """Log an audit event with error handling."""
        try:
            await log_audit_from_context(
                db=self.db,
                action=action,
                entity_type=entity_type,
                entity_id=str(entity_id) if entity_id else None,
                changes=changes,
                extra_metadata=extra_metadata,
            )
        except Exception as e:
            logger.error(f"Failed to create audit log: {e}")

    async def get_by_id(
        self,
        role_id: int,
        include_deleted: bool = False,
        include_permissions: bool = False,
    ) -> Role:
        """Get a role by ID.

        Args:
            role_id: The role ID to look up.
            include_deleted: If True, include soft-deleted roles.
            include_permissions: If True, eagerly load permissions.
        """
        query = select(Role).where(Role.id == role_id)
        if not include_deleted:
            query = query.where(Role.deleted_at.is_(None))
        if include_permissions:
            query = query.options(selectinload(Role.permissions))

        result = await self.db.execute(query)
        role = result.scalar_one_or_none()
        if not role:
            raise RoleNotFoundError(
                f"Role with id {role_id} not found", role_id=role_id
            )
        return role

    async def get_by_code(
        self, code: str, include_deleted: bool = False
    ) -> Role | None:
        """Get a role by code.

        Args:
            code: The role code to look up.
            include_deleted: If True, include soft-deleted roles.
        """
        query = select(Role).where(Role.code == code)
        if not include_deleted:
            query = query.where(Role.deleted_at.is_(None))
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_by_name(
        self, name: str, include_deleted: bool = False
    ) -> Role | None:
        """Get a role by name.

        Args:
            name: The role name to look up.
            include_deleted: If True, include soft-deleted roles.
        """
        query = select(Role).where(Role.name == name)
        if not include_deleted:
            query = query.where(Role.deleted_at.is_(None))
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def list_roles(
        self,
        skip: int = 0,
        limit: int = 10,
        include_deleted: bool = False,
        include_permissions: bool = False,
    ) -> tuple[list[Role], int]:
        """List roles with pagination. Returns (roles, total_count).

        Args:
            skip: Number of records to skip.
            limit: Maximum number of records to return.
            include_deleted: If True, include soft-deleted roles.
            include_permissions: If True, eagerly load permissions.
        """
        # Build base query with soft delete filter
        base_query = select(Role)
        count_query = select(func.count()).select_from(Role)

        if not include_deleted:
            base_query = base_query.where(Role.deleted_at.is_(None))
            count_query = count_query.where(Role.deleted_at.is_(None))

        # Get total count
        count_result = await self.db.execute(count_query)
        total = count_result.scalar() or 0

        # Get paginated items
        query = base_query.offset(skip).limit(limit)
        if include_permissions:
            query = query.options(selectinload(Role.permissions))

        result = await self.db.execute(query)
        roles = list(result.scalars().all())

        return roles, total

    async def _get_permissions_by_ids(
        self, permission_ids: list[int]
    ) -> list[Permission]:
        """Get permissions by their IDs."""
        if not permission_ids:
            return []

        result = await self.db.execute(
            select(Permission).where(Permission.id.in_(permission_ids))
        )
        permissions = list(result.scalars().all())

        # Check if all requested permissions were found
        found_ids = {p.id for p in permissions}
        missing_ids = set(permission_ids) - found_ids
        if missing_ids:
            raise PermissionNotFoundError(
                f"Permissions with ids {missing_ids} not found",
                permission_id=list(missing_ids)[0],
            )

        return permissions

    async def create(self, role_in: RoleCreate) -> Role:
        """Create a new role."""
        # Check if code already exists
        existing = await self.get_by_code(role_in.code)
        if existing:
            raise RoleCodeAlreadyExistsError(f"Role code {role_in.code} already exists")

        # Get permissions
        permissions = await self._get_permissions_by_ids(role_in.permission_ids)

        # Create role
        role_data = role_in.model_dump(exclude={"permission_ids"})
        role = Role(**role_data)
        self.db.add(role)
        await self.db.flush()

        # Assign permissions
        await self.db.refresh(role, ["permissions"])
        role.permissions = permissions

        await self.db.commit()
        await self.db.refresh(role, ["permissions"])

        await self._log_audit(
            action="role.created",
            entity_type="Role",
            entity_id=role.id,
            extra_metadata={"code": role.code, "name": role.name},
        )

        return role

    async def update(self, role_id: int, role_in: RoleUpdate) -> Role:
        """Update a role."""
        role = await self.get_by_id(role_id, include_permissions=True)
        before_data = {"code": role.code, "name": role.name}

        update_data = role_in.model_dump(exclude_unset=True, exclude={"permission_ids"})

        # Prevent modification of code and name for system roles
        if role.is_system and ("code" in update_data or "name" in update_data):
            raise SystemRoleModificationError(
                f"Cannot modify system role '{role.code}'"
            )

        # Check if new code conflicts with existing role
        if "code" in update_data and update_data["code"] != role.code:
            existing = await self.get_by_code(update_data["code"])
            if existing:
                raise RoleCodeAlreadyExistsError(
                    f"Role code {update_data['code']} already exists"
                )

        # Update basic fields
        for field, value in update_data.items():
            setattr(role, field, value)

        # Update permissions if provided
        if role_in.permission_ids is not None:
            # Check if system role
            if role.is_system:
                raise SystemRoleModificationError(
                    f"Cannot modify permissions of system role '{role.code}'"
                )
            permissions = await self._get_permissions_by_ids(role_in.permission_ids)
            role.permissions = permissions

        await self.db.commit()
        await self.db.refresh(role)

        await self._log_audit(
            action="role.updated",
            entity_type="Role",
            entity_id=role_id,
            changes={
                "before": before_data,
                "after": {"code": role.code, "name": role.name},
            },
        )

        return role

    async def delete(self, role_id: int) -> None:
        """Soft delete a role by setting deleted_at timestamp."""
        role = await self.get_by_id(role_id)

        # Check if system role
        if role.is_system:
            raise SystemRoleModificationError(
                f"Cannot delete system role '{role.code}'"
            )

        role.deleted_at = datetime.now(UTC)
        await self.db.commit()

        await self._log_audit(
            action="role.deleted",
            entity_type="Role",
            entity_id=role_id,
            extra_metadata={"code": role.code, "soft_delete": True},
        )

    async def restore(self, role_id: int) -> Role:
        """Restore a soft-deleted role."""
        role = await self.get_by_id(role_id, include_deleted=True)
        role.deleted_at = None
        await self.db.commit()
        await self.db.refresh(role)

        await self._log_audit(
            action="role.restored",
            entity_type="Role",
            entity_id=role_id,
            extra_metadata={"code": role.code},
        )

        return role

    async def hard_delete(self, role_id: int, is_super_admin: bool = False) -> None:
        """Permanently delete a role. Only allowed for super admins.

        Args:
            role_id: The role ID to delete.
            is_super_admin: Whether the requesting user is a super admin.

        Raises:
            HardDeleteNotAllowedError: If the user is not a super admin.
            SystemRoleModificationError: If trying to delete a system role.
        """
        if not is_super_admin:
            raise HardDeleteNotAllowedError(
                "Hard delete is only allowed for super admins"
            )
        role = await self.get_by_id(role_id, include_deleted=True)

        # Check if system role
        if role.is_system:
            raise SystemRoleModificationError(
                f"Cannot delete system role '{role.code}'"
            )

        role_code = role.code
        await self.db.delete(role)
        await self.db.commit()

        await self._log_audit(
            action="role.force_deleted",
            entity_type="Role",
            entity_id=role_id,
            extra_metadata={"code": role_code, "hard_delete": True},
        )

    async def add_permission(self, role_id: int, permission_id: int) -> Role:
        """Add a permission to a role."""
        role = await self.get_by_id(role_id, include_permissions=True)

        # Check if system role
        if role.is_system:
            raise SystemRoleModificationError(
                f"Cannot modify permissions of system role '{role.code}'"
            )

        # Get the permission
        result = await self.db.execute(
            select(Permission).where(Permission.id == permission_id)
        )
        permission = result.scalar_one_or_none()
        if not permission:
            raise PermissionNotFoundError(
                f"Permission with id {permission_id} not found",
                permission_id=permission_id,
            )

        # Add if not already present
        if permission not in role.permissions:
            role.permissions.append(permission)
            await self.db.commit()
            await self.db.refresh(role, ["permissions"])

            await self._log_audit(
                action="permission.granted",
                entity_type="Role",
                entity_id=role_id,
                extra_metadata={
                    "permission_id": permission_id,
                    "permission_code": permission.code,
                },
            )

        return role

    async def remove_permission(self, role_id: int, permission_id: int) -> Role:
        """Remove a permission from a role."""
        role = await self.get_by_id(role_id, include_permissions=True)

        # Check if system role
        if role.is_system:
            raise SystemRoleModificationError(
                f"Cannot modify permissions of system role '{role.code}'"
            )

        # Find the permission being removed
        removed_permission = next(
            (p for p in role.permissions if p.id == permission_id), None
        )

        # Find and remove the permission
        role.permissions = [p for p in role.permissions if p.id != permission_id]
        await self.db.commit()
        await self.db.refresh(role, ["permissions"])

        if removed_permission:
            await self._log_audit(
                action="permission.revoked",
                entity_type="Role",
                entity_id=role_id,
                extra_metadata={
                    "permission_id": permission_id,
                    "permission_code": removed_permission.code,
                },
            )

        return role

    async def assign_permissions(self, role_id: int, permission_ids: list[int]) -> Role:
        """Replace all permissions of a role with the given list."""
        role = await self.get_by_id(role_id, include_permissions=True)
        before_permissions = [{"id": p.id, "code": p.code} for p in role.permissions]

        # Check if system role
        if role.is_system:
            raise SystemRoleModificationError(
                f"Cannot modify permissions of system role '{role.code}'"
            )

        permissions = await self._get_permissions_by_ids(permission_ids)
        role.permissions = permissions

        await self.db.commit()
        await self.db.refresh(role, ["permissions"])

        await self._log_audit(
            action="permissions.replaced",
            entity_type="Role",
            entity_id=role_id,
            changes={
                "before": before_permissions,
                "after": [{"id": p.id, "code": p.code} for p in permissions],
            },
        )

        return role
