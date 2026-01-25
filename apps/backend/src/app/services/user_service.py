"""User service layer for business logic."""

import logging
from datetime import UTC, datetime
from typing import Any
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from src.app.core.audit import log_audit_from_context
from src.app.models import Permission, Role, User
from src.app.schemas import UserCreate, UserUpdate
from src.app.services.exceptions import (
    EmailAlreadyExistsError,
    HardDeleteNotAllowedError,
    RoleNotFoundError,
    UserNotFoundError,
)

logger = logging.getLogger(__name__)


class UserService:
    """Service class for user operations."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def _log_audit(
        self,
        action: str,
        entity_type: str,
        entity_id: UUID | None = None,
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
        user_id: UUID,
        include_deleted: bool = False,
        include_roles: bool = False,
    ) -> User:
        """Get a user by ID.

        Args:
            user_id: The user ID to look up.
            include_deleted: If True, include soft-deleted users.
            include_roles: If True, eagerly load roles.
        """
        query = select(User).where(User.id == user_id)
        if not include_deleted:
            query = query.where(User.deleted_at.is_(None))
        if include_roles:
            query = query.options(selectinload(User.roles))
        result = await self.db.execute(query)
        user = result.scalar_one_or_none()
        if not user:
            raise UserNotFoundError(
                f"User with id {user_id} not found", user_id=user_id
            )
        return user

    async def get_by_email(
        self, email: str, include_deleted: bool = False
    ) -> User | None:
        """Get a user by email.

        Args:
            email: The email to look up.
            include_deleted: If True, include soft-deleted users.
        """
        query = select(User).where(User.email == email)
        if not include_deleted:
            query = query.where(User.deleted_at.is_(None))
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def list_users(
        self,
        skip: int = 0,
        limit: int = 10,
        include_deleted: bool = False,
        include_roles: bool = False,
    ) -> tuple[list[User], int]:
        """List users with pagination. Returns (users, total_count).

        Args:
            skip: Number of records to skip.
            limit: Maximum number of records to return.
            include_deleted: If True, include soft-deleted users.
            include_roles: If True, eagerly load roles.
        """
        # Build base query with soft delete filter
        base_query = select(User)
        count_query = select(func.count()).select_from(User)

        if not include_deleted:
            base_query = base_query.where(User.deleted_at.is_(None))
            count_query = count_query.where(User.deleted_at.is_(None))

        # Get total count
        count_result = await self.db.execute(count_query)
        total = count_result.scalar() or 0

        # Get paginated items
        query = base_query.offset(skip).limit(limit)
        if include_roles:
            query = query.options(selectinload(User.roles))

        result = await self.db.execute(query)
        users = list(result.scalars().all())

        return users, total

    async def _get_roles_by_ids(self, role_ids: list[int]) -> list[Role]:
        """Get roles by their IDs."""
        if not role_ids:
            return []

        result = await self.db.execute(select(Role).where(Role.id.in_(role_ids)))
        roles = list(result.scalars().all())

        # Check if all requested roles were found
        found_ids = {r.id for r in roles}
        missing_ids = set(role_ids) - found_ids
        if missing_ids:
            raise RoleNotFoundError(
                f"Roles with ids {missing_ids} not found",
                role_id=list(missing_ids)[0],
            )

        return roles

    async def create(self, user_in: UserCreate) -> User:
        """Create a new user."""
        # Check if email already exists
        existing = await self.get_by_email(user_in.email)
        if existing:
            raise EmailAlreadyExistsError(f"Email {user_in.email} already registered")

        # Get roles
        roles = await self._get_roles_by_ids(user_in.role_ids)

        # Create user
        user_data = user_in.model_dump(exclude={"role_ids"})
        user = User(**user_data)
        self.db.add(user)
        await self.db.flush()

        # Assign roles
        await self.db.refresh(user, ["roles"])
        user.roles = roles

        await self.db.commit()
        await self.db.refresh(user, ["roles"])

        await self._log_audit(
            action="user.created",
            entity_type="User",
            entity_id=user.id,
            extra_metadata={"email": user.email, "name": user.name},
        )

        return user

    async def update(self, user_id: UUID, user_in: UserUpdate) -> User:
        """Update a user."""
        user = await self.get_by_id(user_id, include_roles=True)
        before_data = {"email": user.email, "name": user.name}

        # Update basic fields
        update_data = user_in.model_dump(exclude_unset=True, exclude={"role_ids"})
        for field, value in update_data.items():
            setattr(user, field, value)

        # Update roles if provided
        if user_in.role_ids is not None:
            roles = await self._get_roles_by_ids(user_in.role_ids)
            user.roles = roles

        await self.db.commit()
        await self.db.refresh(user)

        await self._log_audit(
            action="user.updated",
            entity_type="User",
            entity_id=user_id,
            changes={
                "before": before_data,
                "after": {"email": user.email, "name": user.name},
            },
        )

        return user

    async def delete(self, user_id: UUID) -> None:
        """Soft delete a user by setting deleted_at timestamp."""
        user = await self.get_by_id(user_id)
        user.deleted_at = datetime.now(UTC)
        await self.db.commit()

        await self._log_audit(
            action="user.deleted",
            entity_type="User",
            entity_id=user_id,
            extra_metadata={"email": user.email, "soft_delete": True},
        )

    async def restore(self, user_id: UUID) -> User:
        """Restore a soft-deleted user."""
        user = await self.get_by_id(user_id, include_deleted=True)
        user.deleted_at = None
        await self.db.commit()
        await self.db.refresh(user)

        await self._log_audit(
            action="user.restored",
            entity_type="User",
            entity_id=user_id,
            extra_metadata={"email": user.email},
        )

        return user

    async def hard_delete(self, user_id: UUID, is_super_admin: bool = False) -> None:
        """Permanently delete a user. Only allowed for super admins.

        Args:
            user_id: The user ID to delete.
            is_super_admin: Whether the requesting user is a super admin.

        Raises:
            HardDeleteNotAllowedError: If the user is not a super admin.
        """
        if not is_super_admin:
            raise HardDeleteNotAllowedError(
                "Hard delete is only allowed for super admins"
            )
        user = await self.get_by_id(user_id, include_deleted=True)
        user_email = user.email
        await self.db.delete(user)
        await self.db.commit()

        await self._log_audit(
            action="user.force_deleted",
            entity_type="User",
            entity_id=user_id,
            extra_metadata={"email": user_email, "hard_delete": True},
        )

    async def assign_role(self, user_id: UUID, role_id: int) -> User:
        """Assign a role to a user."""
        user = await self.get_by_id(user_id, include_roles=True)

        # Get the role
        result = await self.db.execute(select(Role).where(Role.id == role_id))
        role = result.scalar_one_or_none()
        if not role:
            raise RoleNotFoundError(
                f"Role with id {role_id} not found", role_id=role_id
            )

        # Add if not already present
        if role not in user.roles:
            user.roles.append(role)
            await self.db.commit()
            await self.db.refresh(user, ["roles"])

            await self._log_audit(
                action="role.assigned",
                entity_type="User",
                entity_id=user_id,
                extra_metadata={"role_id": role_id, "role_name": role.name},
            )

        return user

    async def remove_role(self, user_id: UUID, role_id: int) -> User:
        """Remove a role from a user."""
        user = await self.get_by_id(user_id, include_roles=True)

        # Find the role being removed
        removed_role = next((r for r in user.roles if r.id == role_id), None)

        # Find and remove the role
        user.roles = [r for r in user.roles if r.id != role_id]
        await self.db.commit()
        await self.db.refresh(user, ["roles"])

        if removed_role:
            await self._log_audit(
                action="role.removed",
                entity_type="User",
                entity_id=user_id,
                extra_metadata={"role_id": role_id, "role_name": removed_role.name},
            )

        return user

    async def replace_roles(self, user_id: UUID, role_ids: list[int]) -> User:
        """Replace all roles for a user."""
        user = await self.get_by_id(user_id, include_roles=True)
        before_roles = [{"id": r.id, "name": r.name} for r in user.roles]

        # Get the new roles
        roles = await self._get_roles_by_ids(role_ids)

        # Replace all roles
        user.roles = roles

        await self.db.commit()
        await self.db.refresh(user, ["roles"])

        await self._log_audit(
            action="roles.replaced",
            entity_type="User",
            entity_id=user_id,
            changes={
                "before": before_roles,
                "after": [{"id": r.id, "name": r.name} for r in roles],
            },
        )

        return user

    async def add_roles(self, user_id: UUID, role_ids: list[int]) -> User:
        """Add multiple roles to a user (bulk operation)."""
        user = await self.get_by_id(user_id, include_roles=True)

        # Get the roles to add
        roles_to_add = await self._get_roles_by_ids(role_ids)

        # Add only roles that are not already assigned
        existing_role_ids = {r.id for r in user.roles}
        new_roles = []
        for role in roles_to_add:
            if role.id not in existing_role_ids:
                user.roles.append(role)
                new_roles.append(role)

        await self.db.commit()
        await self.db.refresh(user, ["roles"])

        if new_roles:
            await self._log_audit(
                action="role.assigned",
                entity_type="User",
                entity_id=user_id,
                extra_metadata={
                    "role_ids": [r.id for r in new_roles],
                    "role_names": [r.name for r in new_roles],
                },
            )

        return user

    async def remove_roles(self, user_id: UUID, role_ids: list[int]) -> User:
        """Remove multiple roles from a user (bulk operation)."""
        user = await self.get_by_id(user_id, include_roles=True)

        # Find the roles being removed
        role_ids_set = set(role_ids)
        removed_roles = [r for r in user.roles if r.id in role_ids_set]

        # Remove roles that are in the list
        user.roles = [r for r in user.roles if r.id not in role_ids_set]

        await self.db.commit()
        await self.db.refresh(user, ["roles"])

        if removed_roles:
            await self._log_audit(
                action="role.removed",
                entity_type="User",
                entity_id=user_id,
                extra_metadata={
                    "role_ids": [r.id for r in removed_roles],
                    "role_names": [r.name for r in removed_roles],
                },
            )

        return user

    async def get_user_permissions(self, user_id: UUID) -> list[Permission]:
        """Get all permissions for a user through their roles."""
        # Query user with roles and their permissions
        result = await self.db.execute(
            select(User)
            .where(User.id == user_id)
            .options(selectinload(User.roles).selectinload(Role.permissions))
        )
        user = result.scalar_one_or_none()
        if not user:
            raise UserNotFoundError(
                f"User with id {user_id} not found", user_id=user_id
            )

        # Collect unique permissions from all roles
        permissions_dict: dict[int, Permission] = {}
        for role in user.roles:
            for permission in role.permissions:
                if permission.id not in permissions_dict:
                    permissions_dict[permission.id] = permission

        return list(permissions_dict.values())

    async def has_permission(self, user_id: UUID, permission_code: str) -> bool:
        """Check if a user has a specific permission."""
        permissions = await self.get_user_permissions(user_id)
        return any(p.code == permission_code for p in permissions)

    async def has_role(self, user_id: UUID, role_code: str) -> bool:
        """Check if a user has a specific role."""
        user = await self.get_by_id(user_id, include_roles=True)
        return any(r.code == role_code for r in user.roles)
