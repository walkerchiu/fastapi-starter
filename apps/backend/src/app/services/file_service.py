"""File service layer for database operations."""

from datetime import UTC, datetime
from typing import Any
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from src.app.models import File
from src.app.services.exceptions import FileNotFoundError, HardDeleteNotAllowedError


class FileService:
    """Service class for file database operations."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, file_id: UUID, include_deleted: bool = False) -> File:
        """Get a file by ID.

        Args:
            file_id: The file ID to look up.
            include_deleted: If True, include soft-deleted files.
        """
        query = select(File).where(File.id == file_id)
        if not include_deleted:
            query = query.where(File.deleted_at.is_(None))
        result = await self.db.execute(query)
        file = result.scalar_one_or_none()
        if not file:
            raise FileNotFoundError(f"File with id {file_id} not found")
        return file

    async def get_by_key(self, key: str, include_deleted: bool = False) -> File | None:
        """Get a file by storage key.

        Args:
            key: The storage key to look up.
            include_deleted: If True, include soft-deleted files.
        """
        query = select(File).where(File.key == key)
        if not include_deleted:
            query = query.where(File.deleted_at.is_(None))
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def list_files(
        self,
        user_id: UUID | None = None,
        skip: int = 0,
        limit: int = 100,
        include_deleted: bool = False,
    ) -> tuple[list[File], int]:
        """List files with optional user filter. Returns (files, total_count).

        Args:
            user_id: Optional user ID to filter by.
            skip: Number of records to skip.
            limit: Maximum number of records to return.
            include_deleted: If True, include soft-deleted files.
        """
        # Build base query
        base_query = select(File)
        count_query = select(func.count()).select_from(File)

        if not include_deleted:
            base_query = base_query.where(File.deleted_at.is_(None))
            count_query = count_query.where(File.deleted_at.is_(None))

        if user_id is not None:
            base_query = base_query.where(File.user_id == user_id)
            count_query = count_query.where(File.user_id == user_id)

        # Get total count
        count_result = await self.db.execute(count_query)
        total = count_result.scalar() or 0

        # Get paginated items
        result = await self.db.execute(
            base_query.order_by(File.created_at.desc()).offset(skip).limit(limit)
        )
        files = list(result.scalars().all())

        return files, total

    async def create(
        self,
        key: str,
        filename: str,
        size: int,
        bucket: str,
        user_id: UUID,
        content_type: str = "",
        metadata: dict[str, Any] | None = None,
    ) -> File:
        """Create a new file record."""
        file = File(
            key=key,
            filename=filename,
            size=size,
            bucket=bucket,
            user_id=user_id,
            content_type=content_type,
            file_metadata=metadata,
        )
        self.db.add(file)
        await self.db.commit()
        await self.db.refresh(file)
        return file

    async def delete(self, file_id: UUID) -> None:
        """Soft delete a file record by ID."""
        file = await self.get_by_id(file_id)
        file.deleted_at = datetime.now(UTC)
        await self.db.commit()

    async def delete_by_key(self, key: str) -> None:
        """Soft delete a file record by storage key."""
        file = await self.get_by_key(key)
        if not file:
            raise FileNotFoundError(f"File with key {key} not found")
        file.deleted_at = datetime.now(UTC)
        await self.db.commit()

    async def restore(self, file_id: UUID) -> File:
        """Restore a soft-deleted file."""
        file = await self.get_by_id(file_id, include_deleted=True)
        file.deleted_at = None
        await self.db.commit()
        await self.db.refresh(file)
        return file

    async def restore_by_key(self, key: str) -> File:
        """Restore a soft-deleted file by storage key."""
        file = await self.get_by_key(key, include_deleted=True)
        if not file:
            raise FileNotFoundError(f"File with key {key} not found")
        file.deleted_at = None
        await self.db.commit()
        await self.db.refresh(file)
        return file

    async def hard_delete(self, file_id: UUID, is_super_admin: bool = False) -> None:
        """Permanently delete a file record. Only allowed for super admins.

        Args:
            file_id: The file ID to delete.
            is_super_admin: Whether the requesting user is a super admin.

        Raises:
            HardDeleteNotAllowedError: If the user is not a super admin.
        """
        if not is_super_admin:
            raise HardDeleteNotAllowedError(
                "Hard delete is only allowed for super admins"
            )
        file = await self.get_by_id(file_id, include_deleted=True)
        await self.db.delete(file)
        await self.db.commit()

    async def hard_delete_by_key(self, key: str, is_super_admin: bool = False) -> None:
        """Permanently delete a file record by key. Only allowed for super admins.

        Args:
            key: The storage key to delete.
            is_super_admin: Whether the requesting user is a super admin.

        Raises:
            HardDeleteNotAllowedError: If the user is not a super admin.
        """
        if not is_super_admin:
            raise HardDeleteNotAllowedError(
                "Hard delete is only allowed for super admins"
            )
        file = await self.get_by_key(key, include_deleted=True)
        if not file:
            raise FileNotFoundError(f"File with key {key} not found")
        await self.db.delete(file)
        await self.db.commit()

    async def update(
        self,
        file_id: UUID,
        filename: str | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> File:
        """Update a file's metadata.

        Args:
            file_id: The file ID to update.
            filename: New filename if provided.
            metadata: New metadata if provided.
        """
        file = await self.get_by_id(file_id)
        if filename is not None:
            file.filename = filename
        if metadata is not None:
            file.file_metadata = metadata
        await self.db.commit()
        await self.db.refresh(file)
        return file

    async def delete_by_ids(
        self, file_ids: list[UUID], user_id: UUID
    ) -> tuple[int, int, list[str]]:
        """Delete multiple files by IDs. Returns (successful, failed, errors).

        Args:
            file_ids: List of file IDs to delete.
            user_id: The user ID performing the delete (for ownership check).
        """
        successful = 0
        failed = 0
        errors: list[str] = []

        for file_id in file_ids:
            try:
                file = await self.get_by_id(file_id)
                # Check ownership
                if file.user_id != user_id:
                    failed += 1
                    errors.append(f"file {file_id}: access denied")
                    continue
                file.deleted_at = datetime.now(UTC)
                successful += 1
            except FileNotFoundError:
                failed += 1
                errors.append(f"file {file_id}: not found")

        await self.db.commit()
        return successful, failed, errors
