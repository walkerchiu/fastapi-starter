"""Permission service tests."""

import pytest
from sqlalchemy.ext.asyncio import AsyncSession
from src.app.schemas.permission import PermissionCreate, PermissionUpdate
from src.app.services.exceptions import (
    HardDeleteNotAllowedError,
    PermissionCodeAlreadyExistsError,
    PermissionNotFoundError,
)
from src.app.services.permission_service import PermissionService


@pytest.mark.asyncio
async def test_create_permission(db_session: AsyncSession):
    """Test creating a new permission."""
    service = PermissionService(db_session)
    permission_in = PermissionCreate(
        code="users:read",
        name="Read Users",
        description="View user information",
    )

    permission = await service.create(permission_in)

    assert permission.id is not None
    assert permission.code == "users:read"
    assert permission.name == "Read Users"
    assert permission.description == "View user information"


@pytest.mark.asyncio
async def test_create_permission_duplicate_code(db_session: AsyncSession):
    """Test creating a permission with duplicate code."""
    service = PermissionService(db_session)
    permission_in = PermissionCreate(code="users:read", name="Read Users")

    await service.create(permission_in)

    with pytest.raises(PermissionCodeAlreadyExistsError):
        await service.create(permission_in)


@pytest.mark.asyncio
async def test_get_permission_by_id(db_session: AsyncSession):
    """Test getting a permission by ID."""
    service = PermissionService(db_session)
    permission_in = PermissionCreate(code="users:read", name="Read Users")
    created = await service.create(permission_in)

    found = await service.get_by_id(created.id)

    assert found.id == created.id
    assert found.code == "users:read"


@pytest.mark.asyncio
async def test_get_permission_by_id_not_found(db_session: AsyncSession):
    """Test getting a non-existent permission by ID."""
    service = PermissionService(db_session)

    with pytest.raises(PermissionNotFoundError) as exc_info:
        await service.get_by_id(999)

    assert exc_info.value.permission_id == 999


@pytest.mark.asyncio
async def test_get_permission_by_code(db_session: AsyncSession):
    """Test getting a permission by code."""
    service = PermissionService(db_session)
    permission_in = PermissionCreate(code="users:read", name="Read Users")
    await service.create(permission_in)

    found = await service.get_by_code("users:read")

    assert found is not None
    assert found.code == "users:read"


@pytest.mark.asyncio
async def test_get_permission_by_code_not_found(db_session: AsyncSession):
    """Test getting a non-existent permission by code."""
    service = PermissionService(db_session)

    found = await service.get_by_code("nonexistent:code")

    assert found is None


@pytest.mark.asyncio
async def test_list_permissions(db_session: AsyncSession):
    """Test listing permissions with pagination."""
    service = PermissionService(db_session)

    # Create some permissions
    for action in ["read", "create", "update", "delete"]:
        await service.create(
            PermissionCreate(code=f"users:{action}", name=f"Users {action}")
        )

    permissions, total = await service.list_permissions(skip=0, limit=10)

    assert total == 4
    assert len(permissions) == 4


@pytest.mark.asyncio
async def test_list_permissions_pagination(db_session: AsyncSession):
    """Test listing permissions with custom pagination."""
    service = PermissionService(db_session)

    # Create some permissions
    for action in ["read", "create", "update", "delete", "list"]:
        await service.create(
            PermissionCreate(code=f"users:{action}", name=f"Users {action}")
        )

    permissions, total = await service.list_permissions(skip=2, limit=2)

    assert total == 5
    assert len(permissions) == 2


@pytest.mark.asyncio
async def test_update_permission(db_session: AsyncSession):
    """Test updating a permission."""
    service = PermissionService(db_session)
    permission_in = PermissionCreate(code="users:read", name="Read Users")
    created = await service.create(permission_in)

    update_in = PermissionUpdate(name="View Users", description="Updated description")
    updated = await service.update(created.id, update_in)

    assert updated.name == "View Users"
    assert updated.description == "Updated description"
    assert updated.code == "users:read"  # Code should not change


@pytest.mark.asyncio
async def test_update_permission_partial(db_session: AsyncSession):
    """Test partial update of a permission."""
    service = PermissionService(db_session)
    permission_in = PermissionCreate(
        code="users:read", name="Read Users", description="Original description"
    )
    created = await service.create(permission_in)

    update_in = PermissionUpdate(name="View Users")
    updated = await service.update(created.id, update_in)

    assert updated.name == "View Users"
    assert updated.description == "Original description"  # Should not change


@pytest.mark.asyncio
async def test_update_permission_not_found(db_session: AsyncSession):
    """Test updating a non-existent permission."""
    service = PermissionService(db_session)

    with pytest.raises(PermissionNotFoundError):
        await service.update(999, PermissionUpdate(name="Updated"))


@pytest.mark.asyncio
async def test_delete_permission(db_session: AsyncSession):
    """Test deleting a permission."""
    service = PermissionService(db_session)
    permission_in = PermissionCreate(code="users:read", name="Read Users")
    created = await service.create(permission_in)

    await service.delete(created.id)

    with pytest.raises(PermissionNotFoundError):
        await service.get_by_id(created.id)


@pytest.mark.asyncio
async def test_delete_permission_not_found(db_session: AsyncSession):
    """Test deleting a non-existent permission."""
    service = PermissionService(db_session)

    with pytest.raises(PermissionNotFoundError):
        await service.delete(999)


# Soft delete tests


@pytest.mark.asyncio
async def test_soft_delete_permission(db_session: AsyncSession):
    """Test soft deleting a permission sets deleted_at."""
    service = PermissionService(db_session)
    permission_in = PermissionCreate(code="users:read", name="Read Users")
    created = await service.create(permission_in)

    await service.delete(created.id)

    # Permission should not be found with default query
    with pytest.raises(PermissionNotFoundError):
        await service.get_by_id(created.id)

    # Permission should be found with include_deleted=True
    deleted_perm = await service.get_by_id(created.id, include_deleted=True)
    assert deleted_perm.deleted_at is not None


@pytest.mark.asyncio
async def test_soft_deleted_permission_not_in_list(db_session: AsyncSession):
    """Test soft deleted permissions are excluded from list by default."""
    service = PermissionService(db_session)

    # Create permissions
    for action in ["read", "create", "update"]:
        await service.create(
            PermissionCreate(code=f"users:{action}", name=f"Users {action}")
        )

    # Soft delete one permission
    permissions, _ = await service.list_permissions()
    await service.delete(permissions[0].id)

    # List should only have 2 permissions
    permissions_after, total_after = await service.list_permissions()
    assert total_after == 2
    assert len(permissions_after) == 2


@pytest.mark.asyncio
async def test_list_permissions_include_deleted(db_session: AsyncSession):
    """Test listing permissions with include_deleted=True."""
    service = PermissionService(db_session)

    # Create permissions
    for action in ["read", "create", "update"]:
        await service.create(
            PermissionCreate(code=f"users:{action}", name=f"Users {action}")
        )

    # Soft delete one permission
    permissions, _ = await service.list_permissions()
    await service.delete(permissions[0].id)

    # List with include_deleted should have all 3 permissions
    permissions_all, total_all = await service.list_permissions(include_deleted=True)
    assert total_all == 3
    assert len(permissions_all) == 3


@pytest.mark.asyncio
async def test_get_by_code_excludes_deleted(db_session: AsyncSession):
    """Test get_by_code excludes soft deleted permissions by default."""
    service = PermissionService(db_session)
    permission_in = PermissionCreate(code="users:read", name="Read Users")
    created = await service.create(permission_in)

    await service.delete(created.id)

    # Should not find deleted permission
    found = await service.get_by_code("users:read")
    assert found is None

    # Should find with include_deleted
    found_deleted = await service.get_by_code("users:read", include_deleted=True)
    assert found_deleted is not None


@pytest.mark.asyncio
async def test_restore_permission(db_session: AsyncSession):
    """Test restoring a soft deleted permission."""
    service = PermissionService(db_session)
    permission_in = PermissionCreate(code="users:read", name="Read Users")
    created = await service.create(permission_in)

    # Soft delete
    await service.delete(created.id)

    # Restore
    restored = await service.restore(created.id)
    assert restored.deleted_at is None

    # Permission should be found normally
    found = await service.get_by_id(created.id)
    assert found is not None


# Hard delete tests


@pytest.mark.asyncio
async def test_hard_delete_permission_as_super_admin(db_session: AsyncSession):
    """Test hard delete as super admin permanently deletes permission."""
    service = PermissionService(db_session)
    permission_in = PermissionCreate(code="users:read", name="Read Users")
    created = await service.create(permission_in)

    await service.hard_delete(created.id, is_super_admin=True)

    # Permission should not be found even with include_deleted
    with pytest.raises(PermissionNotFoundError):
        await service.get_by_id(created.id, include_deleted=True)


@pytest.mark.asyncio
async def test_hard_delete_permission_not_super_admin(db_session: AsyncSession):
    """Test hard delete without super admin raises error."""
    service = PermissionService(db_session)
    permission_in = PermissionCreate(code="users:read", name="Read Users")
    created = await service.create(permission_in)

    with pytest.raises(HardDeleteNotAllowedError):
        await service.hard_delete(created.id, is_super_admin=False)
