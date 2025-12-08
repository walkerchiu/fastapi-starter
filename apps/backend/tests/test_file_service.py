"""Tests for FileService database operations."""

import pytest
from sqlalchemy.ext.asyncio import AsyncSession
from src.app.models import User
from src.app.services import FileNotFoundError, FileService
from src.app.services.exceptions import HardDeleteNotAllowedError


@pytest.fixture
async def test_user(db_session: AsyncSession) -> User:
    """Create a test user for file operations."""
    user = User(email="fileowner@example.com", name="File Owner")
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest.mark.asyncio
async def test_create_file(db_session: AsyncSession, test_user: User):
    """Test creating a file record."""
    service = FileService(db_session)

    file = await service.create(
        key="2024/01/01/abc123_test.txt",
        filename="test.txt",
        size=1024,
        bucket="uploads",
        user_id=test_user.id,
        content_type="text/plain",
    )

    assert file.id is not None
    assert file.key == "2024/01/01/abc123_test.txt"
    assert file.filename == "test.txt"
    assert file.size == 1024
    assert file.bucket == "uploads"
    assert file.user_id == test_user.id
    assert file.content_type == "text/plain"
    assert file.created_at is not None


@pytest.mark.asyncio
async def test_get_by_id(db_session: AsyncSession, test_user: User):
    """Test getting a file by ID."""
    service = FileService(db_session)

    # Create a file
    created = await service.create(
        key="2024/01/01/test.txt",
        filename="test.txt",
        size=512,
        bucket="uploads",
        user_id=test_user.id,
    )

    # Retrieve it
    file = await service.get_by_id(created.id)
    assert file.key == "2024/01/01/test.txt"


@pytest.mark.asyncio
async def test_get_by_id_not_found(db_session: AsyncSession):
    """Test getting a non-existent file by ID."""
    service = FileService(db_session)

    with pytest.raises(FileNotFoundError):
        await service.get_by_id(999)


@pytest.mark.asyncio
async def test_get_by_key(db_session: AsyncSession, test_user: User):
    """Test getting a file by storage key."""
    service = FileService(db_session)

    await service.create(
        key="unique/key/file.txt",
        filename="file.txt",
        size=256,
        bucket="uploads",
        user_id=test_user.id,
    )

    file = await service.get_by_key("unique/key/file.txt")
    assert file is not None
    assert file.filename == "file.txt"


@pytest.mark.asyncio
async def test_get_by_key_not_found(db_session: AsyncSession):
    """Test getting a non-existent file by key returns None."""
    service = FileService(db_session)

    file = await service.get_by_key("nonexistent/key.txt")
    assert file is None


@pytest.mark.asyncio
async def test_list_files(db_session: AsyncSession, test_user: User):
    """Test listing files."""
    service = FileService(db_session)

    # Create multiple files
    for i in range(3):
        await service.create(
            key=f"2024/01/0{i}/file{i}.txt",
            filename=f"file{i}.txt",
            size=100 * (i + 1),
            bucket="uploads",
            user_id=test_user.id,
        )

    files, total = await service.list_files()
    assert total == 3
    assert len(files) == 3


@pytest.mark.asyncio
async def test_list_files_by_user(db_session: AsyncSession, test_user: User):
    """Test listing files filtered by user."""
    service = FileService(db_session)

    # Create another user
    other_user = User(email="other@example.com", name="Other User")
    db_session.add(other_user)
    await db_session.commit()
    await db_session.refresh(other_user)

    # Create files for both users
    await service.create(
        key="user1/file.txt",
        filename="file.txt",
        size=100,
        bucket="uploads",
        user_id=test_user.id,
    )
    await service.create(
        key="user2/file.txt",
        filename="file.txt",
        size=100,
        bucket="uploads",
        user_id=other_user.id,
    )

    # List only first user's files
    files, total = await service.list_files(user_id=test_user.id)
    assert total == 1
    assert len(files) == 1
    assert files[0].user_id == test_user.id


@pytest.mark.asyncio
async def test_list_files_pagination(db_session: AsyncSession, test_user: User):
    """Test listing files with pagination."""
    service = FileService(db_session)

    # Create 5 files
    for i in range(5):
        await service.create(
            key=f"page/file{i}.txt",
            filename=f"file{i}.txt",
            size=100,
            bucket="uploads",
            user_id=test_user.id,
        )

    # Get first page
    files, total = await service.list_files(skip=0, limit=2)
    assert total == 5
    assert len(files) == 2

    # Get second page
    files, total = await service.list_files(skip=2, limit=2)
    assert total == 5
    assert len(files) == 2


@pytest.mark.asyncio
async def test_delete_file(db_session: AsyncSession, test_user: User):
    """Test deleting a file by ID."""
    service = FileService(db_session)

    file = await service.create(
        key="to-delete.txt",
        filename="to-delete.txt",
        size=100,
        bucket="uploads",
        user_id=test_user.id,
    )

    await service.delete(file.id)

    with pytest.raises(FileNotFoundError):
        await service.get_by_id(file.id)


@pytest.mark.asyncio
async def test_delete_file_not_found(db_session: AsyncSession):
    """Test deleting a non-existent file."""
    service = FileService(db_session)

    with pytest.raises(FileNotFoundError):
        await service.delete(999)


@pytest.mark.asyncio
async def test_delete_by_key(db_session: AsyncSession, test_user: User):
    """Test deleting a file by storage key."""
    service = FileService(db_session)

    await service.create(
        key="delete-by-key.txt",
        filename="delete-by-key.txt",
        size=100,
        bucket="uploads",
        user_id=test_user.id,
    )

    await service.delete_by_key("delete-by-key.txt")

    file = await service.get_by_key("delete-by-key.txt")
    assert file is None


@pytest.mark.asyncio
async def test_delete_by_key_not_found(db_session: AsyncSession):
    """Test deleting a non-existent file by key."""
    service = FileService(db_session)

    with pytest.raises(FileNotFoundError):
        await service.delete_by_key("nonexistent.txt")


# Soft delete tests


@pytest.mark.asyncio
async def test_soft_delete_file(db_session: AsyncSession, test_user: User):
    """Test soft deleting a file sets deleted_at."""
    service = FileService(db_session)

    file = await service.create(
        key="soft-delete-test.txt",
        filename="soft-delete-test.txt",
        size=100,
        bucket="uploads",
        user_id=test_user.id,
    )

    await service.delete(file.id)

    # File should not be found with default query
    with pytest.raises(FileNotFoundError):
        await service.get_by_id(file.id)

    # File should be found with include_deleted=True
    deleted_file = await service.get_by_id(file.id, include_deleted=True)
    assert deleted_file.deleted_at is not None


@pytest.mark.asyncio
async def test_soft_deleted_file_not_in_list(db_session: AsyncSession, test_user: User):
    """Test soft deleted files are excluded from list by default."""
    service = FileService(db_session)

    # Create files
    for i in range(3):
        await service.create(
            key=f"list-test-{i}.txt",
            filename=f"list-test-{i}.txt",
            size=100,
            bucket="uploads",
            user_id=test_user.id,
        )

    # Soft delete one file
    files, _ = await service.list_files()
    await service.delete(files[0].id)

    # List should only have 2 files
    files_after, total_after = await service.list_files()
    assert total_after == 2
    assert len(files_after) == 2


@pytest.mark.asyncio
async def test_list_files_include_deleted(db_session: AsyncSession, test_user: User):
    """Test listing files with include_deleted=True."""
    service = FileService(db_session)

    # Create files
    for i in range(3):
        await service.create(
            key=f"include-deleted-{i}.txt",
            filename=f"include-deleted-{i}.txt",
            size=100,
            bucket="uploads",
            user_id=test_user.id,
        )

    # Soft delete one file
    files, _ = await service.list_files()
    await service.delete(files[0].id)

    # List with include_deleted should have all 3 files
    files_all, total_all = await service.list_files(include_deleted=True)
    assert total_all == 3
    assert len(files_all) == 3


@pytest.mark.asyncio
async def test_get_by_key_excludes_deleted(db_session: AsyncSession, test_user: User):
    """Test get_by_key excludes soft deleted files by default."""
    service = FileService(db_session)

    await service.create(
        key="key-deleted-test.txt",
        filename="key-deleted-test.txt",
        size=100,
        bucket="uploads",
        user_id=test_user.id,
    )

    # Soft delete
    file = await service.get_by_key("key-deleted-test.txt")
    await service.delete(file.id)

    # Should not find deleted file
    found = await service.get_by_key("key-deleted-test.txt")
    assert found is None

    # Should find with include_deleted
    found_deleted = await service.get_by_key(
        "key-deleted-test.txt", include_deleted=True
    )
    assert found_deleted is not None


@pytest.mark.asyncio
async def test_restore_file(db_session: AsyncSession, test_user: User):
    """Test restoring a soft deleted file."""
    service = FileService(db_session)

    file = await service.create(
        key="restore-test.txt",
        filename="restore-test.txt",
        size=100,
        bucket="uploads",
        user_id=test_user.id,
    )

    # Soft delete
    await service.delete(file.id)

    # Restore
    restored = await service.restore(file.id)
    assert restored.deleted_at is None

    # File should be found normally
    found = await service.get_by_id(file.id)
    assert found is not None


# Hard delete tests


@pytest.mark.asyncio
async def test_hard_delete_file_as_super_admin(
    db_session: AsyncSession, test_user: User
):
    """Test hard delete as super admin permanently deletes file."""
    service = FileService(db_session)

    file = await service.create(
        key="hard-delete-test.txt",
        filename="hard-delete-test.txt",
        size=100,
        bucket="uploads",
        user_id=test_user.id,
    )

    await service.hard_delete(file.id, is_super_admin=True)

    # File should not be found even with include_deleted
    with pytest.raises(FileNotFoundError):
        await service.get_by_id(file.id, include_deleted=True)


@pytest.mark.asyncio
async def test_hard_delete_file_not_super_admin(
    db_session: AsyncSession, test_user: User
):
    """Test hard delete without super admin raises error."""
    service = FileService(db_session)

    file = await service.create(
        key="hard-delete-deny.txt",
        filename="hard-delete-deny.txt",
        size=100,
        bucket="uploads",
        user_id=test_user.id,
    )

    with pytest.raises(HardDeleteNotAllowedError):
        await service.hard_delete(file.id, is_super_admin=False)


@pytest.mark.asyncio
async def test_hard_delete_by_key_as_super_admin(
    db_session: AsyncSession, test_user: User
):
    """Test hard delete by key as super admin."""
    service = FileService(db_session)

    await service.create(
        key="hard-delete-key.txt",
        filename="hard-delete-key.txt",
        size=100,
        bucket="uploads",
        user_id=test_user.id,
    )

    await service.hard_delete_by_key("hard-delete-key.txt", is_super_admin=True)

    # File should be completely gone
    found = await service.get_by_key("hard-delete-key.txt", include_deleted=True)
    assert found is None


@pytest.mark.asyncio
async def test_hard_delete_by_key_not_super_admin(
    db_session: AsyncSession, test_user: User
):
    """Test hard delete by key without super admin raises error."""
    service = FileService(db_session)

    await service.create(
        key="hard-delete-key-deny.txt",
        filename="hard-delete-key-deny.txt",
        size=100,
        bucket="uploads",
        user_id=test_user.id,
    )

    with pytest.raises(HardDeleteNotAllowedError):
        await service.hard_delete_by_key(
            "hard-delete-key-deny.txt", is_super_admin=False
        )
