"""User service layer for business logic."""

from datetime import UTC, datetime

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from src.app.models import User
from src.app.schemas import UserCreate, UserUpdate
from src.app.services.exceptions import (
    EmailAlreadyExistsError,
    HardDeleteNotAllowedError,
    UserNotFoundError,
)


class UserService:
    """Service class for user operations."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, user_id: int, include_deleted: bool = False) -> User:
        """Get a user by ID.

        Args:
            user_id: The user ID to look up.
            include_deleted: If True, include soft-deleted users.
        """
        query = select(User).where(User.id == user_id)
        if not include_deleted:
            query = query.where(User.deleted_at.is_(None))
        result = await self.db.execute(query)
        user = result.scalar_one_or_none()
        if not user:
            raise UserNotFoundError(f"User with id {user_id} not found")
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
        self, skip: int = 0, limit: int = 10, include_deleted: bool = False
    ) -> tuple[list[User], int]:
        """List users with pagination. Returns (users, total_count).

        Args:
            skip: Number of records to skip.
            limit: Maximum number of records to return.
            include_deleted: If True, include soft-deleted users.
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
        result = await self.db.execute(base_query.offset(skip).limit(limit))
        users = list(result.scalars().all())

        return users, total

    async def create(self, user_in: UserCreate) -> User:
        """Create a new user."""
        # Check if email already exists
        existing = await self.get_by_email(user_in.email)
        if existing:
            raise EmailAlreadyExistsError(f"Email {user_in.email} already registered")

        user = User(**user_in.model_dump())
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def update(self, user_id: int, user_in: UserUpdate) -> User:
        """Update a user."""
        user = await self.get_by_id(user_id)

        update_data = user_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(user, field, value)

        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def delete(self, user_id: int) -> None:
        """Soft delete a user by setting deleted_at timestamp."""
        user = await self.get_by_id(user_id)
        user.deleted_at = datetime.now(UTC)
        await self.db.commit()

    async def restore(self, user_id: int) -> User:
        """Restore a soft-deleted user."""
        user = await self.get_by_id(user_id, include_deleted=True)
        user.deleted_at = None
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def hard_delete(self, user_id: int, is_super_admin: bool = False) -> None:
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
        await self.db.delete(user)
        await self.db.commit()
