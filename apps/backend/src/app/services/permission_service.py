"""Permission service layer for business logic."""

from datetime import UTC, datetime

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from src.app.models import Permission
from src.app.schemas.permission import PermissionCreate, PermissionUpdate
from src.app.services.exceptions import (
    HardDeleteNotAllowedError,
    PermissionCodeAlreadyExistsError,
    PermissionNotFoundError,
)


class PermissionService:
    """Service class for permission operations."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(
        self, permission_id: int, include_deleted: bool = False
    ) -> Permission:
        """Get a permission by ID.

        Args:
            permission_id: The permission ID to look up.
            include_deleted: If True, include soft-deleted permissions.
        """
        query = select(Permission).where(Permission.id == permission_id)
        if not include_deleted:
            query = query.where(Permission.deleted_at.is_(None))
        result = await self.db.execute(query)
        permission = result.scalar_one_or_none()
        if not permission:
            raise PermissionNotFoundError(
                f"Permission with id {permission_id} not found",
                permission_id=permission_id,
            )
        return permission

    async def get_by_code(
        self, code: str, include_deleted: bool = False
    ) -> Permission | None:
        """Get a permission by code.

        Args:
            code: The permission code to look up.
            include_deleted: If True, include soft-deleted permissions.
        """
        query = select(Permission).where(Permission.code == code)
        if not include_deleted:
            query = query.where(Permission.deleted_at.is_(None))
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_by_name(
        self, name: str, include_deleted: bool = False
    ) -> Permission | None:
        """Get a permission by name.

        Args:
            name: The permission name to look up.
            include_deleted: If True, include soft-deleted permissions.
        """
        query = select(Permission).where(Permission.name == name)
        if not include_deleted:
            query = query.where(Permission.deleted_at.is_(None))
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def list_permissions(
        self, skip: int = 0, limit: int = 10, include_deleted: bool = False
    ) -> tuple[list[Permission], int]:
        """List permissions with pagination. Returns (permissions, total_count).

        Args:
            skip: Number of records to skip.
            limit: Maximum number of records to return.
            include_deleted: If True, include soft-deleted permissions.
        """
        # Build base query with soft delete filter
        base_query = select(Permission)
        count_query = select(func.count()).select_from(Permission)

        if not include_deleted:
            base_query = base_query.where(Permission.deleted_at.is_(None))
            count_query = count_query.where(Permission.deleted_at.is_(None))

        # Get total count
        count_result = await self.db.execute(count_query)
        total = count_result.scalar() or 0

        # Get paginated items
        result = await self.db.execute(base_query.offset(skip).limit(limit))
        permissions = list(result.scalars().all())

        return permissions, total

    def _parse_code(self, code: str) -> tuple[str, str]:
        """Parse permission code into resource and action.

        Args:
            code: Permission code in format "resource:action".

        Returns:
            Tuple of (resource, action).
        """
        parts = code.split(":", 1)
        if len(parts) == 2:
            return parts[0], parts[1]
        return code, ""

    async def create(self, permission_in: PermissionCreate) -> Permission:
        """Create a new permission."""
        # Check if code already exists
        existing = await self.get_by_code(permission_in.code)
        if existing:
            raise PermissionCodeAlreadyExistsError(
                f"Permission code {permission_in.code} already exists"
            )

        # Parse resource and action from code
        resource, action = self._parse_code(permission_in.code)

        permission = Permission(
            **permission_in.model_dump(),
            resource=resource,
            action=action,
        )
        self.db.add(permission)
        await self.db.commit()
        await self.db.refresh(permission)
        return permission

    async def update(
        self, permission_id: int, permission_in: PermissionUpdate
    ) -> Permission:
        """Update a permission."""
        permission = await self.get_by_id(permission_id)

        # Check if new code conflicts with existing permission
        update_data = permission_in.model_dump(exclude_unset=True)
        if "code" in update_data and update_data["code"] != permission.code:
            existing = await self.get_by_code(update_data["code"])
            if existing:
                raise PermissionCodeAlreadyExistsError(
                    f"Permission code {update_data['code']} already exists"
                )
            # Update resource and action from new code
            resource, action = self._parse_code(update_data["code"])
            update_data["resource"] = resource
            update_data["action"] = action

        for field, value in update_data.items():
            setattr(permission, field, value)

        await self.db.commit()
        await self.db.refresh(permission)
        return permission

    async def delete(self, permission_id: int) -> None:
        """Soft delete a permission by setting deleted_at timestamp."""
        permission = await self.get_by_id(permission_id)
        permission.deleted_at = datetime.now(UTC)
        await self.db.commit()

    async def restore(self, permission_id: int) -> Permission:
        """Restore a soft-deleted permission."""
        permission = await self.get_by_id(permission_id, include_deleted=True)
        permission.deleted_at = None
        await self.db.commit()
        await self.db.refresh(permission)
        return permission

    async def hard_delete(
        self, permission_id: int, is_super_admin: bool = False
    ) -> None:
        """Permanently delete a permission. Only allowed for super admins.

        Args:
            permission_id: The permission ID to delete.
            is_super_admin: Whether the requesting user is a super admin.

        Raises:
            HardDeleteNotAllowedError: If the user is not a super admin.
        """
        if not is_super_admin:
            raise HardDeleteNotAllowedError(
                "Hard delete is only allowed for super admins"
            )
        permission = await self.get_by_id(permission_id, include_deleted=True)
        await self.db.delete(permission)
        await self.db.commit()
