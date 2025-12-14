"""Role service tests."""

import pytest
from sqlalchemy.ext.asyncio import AsyncSession
from src.app.models import Permission
from src.app.schemas.role import RoleCreate, RoleUpdate
from src.app.services.exceptions import (
    HardDeleteNotAllowedError,
    PermissionNotFoundError,
    RoleCodeAlreadyExistsError,
    RoleNotFoundError,
    SystemRoleModificationError,
)
from src.app.services.role_service import RoleService


async def create_test_permissions(db_session: AsyncSession) -> list[Permission]:
    """Helper to create test permissions."""
    permissions = []
    for code in ["users:read", "users:create", "users:update", "users:delete"]:
        parts = code.split(":", 1)
        resource = parts[0] if len(parts) >= 1 else code
        action = parts[1] if len(parts) == 2 else ""
        perm = Permission(
            code=code,
            name=code.replace(":", " ").title(),
            resource=resource,
            action=action,
        )
        db_session.add(perm)
        permissions.append(perm)
    await db_session.commit()
    for p in permissions:
        await db_session.refresh(p)
    return permissions


@pytest.mark.asyncio
async def test_create_role(db_session: AsyncSession):
    """Test creating a new role."""
    service = RoleService(db_session)
    role_in = RoleCreate(
        code="admin",
        name="Administrator",
        description="Full access role",
    )

    role = await service.create(role_in)

    assert role.id is not None
    assert role.code == "admin"
    assert role.name == "Administrator"
    assert role.description == "Full access role"
    assert role.is_system is False


@pytest.mark.asyncio
async def test_create_role_with_permissions(db_session: AsyncSession):
    """Test creating a role with permissions."""
    permissions = await create_test_permissions(db_session)
    service = RoleService(db_session)

    role_in = RoleCreate(
        code="admin",
        name="Administrator",
        permission_ids=[p.id for p in permissions[:2]],
    )

    role = await service.create(role_in)

    assert len(role.permissions) == 2
    perm_codes = [p.code for p in role.permissions]
    assert "users:read" in perm_codes
    assert "users:create" in perm_codes


@pytest.mark.asyncio
async def test_create_role_duplicate_code(db_session: AsyncSession):
    """Test creating a role with duplicate code."""
    service = RoleService(db_session)
    role_in = RoleCreate(code="admin", name="Administrator")

    await service.create(role_in)

    with pytest.raises(RoleCodeAlreadyExistsError):
        await service.create(role_in)


@pytest.mark.asyncio
async def test_create_role_with_invalid_permission(db_session: AsyncSession):
    """Test creating a role with non-existent permission ID."""
    service = RoleService(db_session)
    role_in = RoleCreate(
        code="admin",
        name="Administrator",
        permission_ids=[999],
    )

    with pytest.raises(PermissionNotFoundError):
        await service.create(role_in)


@pytest.mark.asyncio
async def test_get_role_by_id(db_session: AsyncSession):
    """Test getting a role by ID."""
    service = RoleService(db_session)
    role_in = RoleCreate(code="admin", name="Administrator")
    created = await service.create(role_in)

    found = await service.get_by_id(created.id)

    assert found.id == created.id
    assert found.code == "admin"


@pytest.mark.asyncio
async def test_get_role_by_id_with_permissions(db_session: AsyncSession):
    """Test getting a role by ID with permissions loaded."""
    permissions = await create_test_permissions(db_session)
    service = RoleService(db_session)
    role_in = RoleCreate(
        code="admin",
        name="Administrator",
        permission_ids=[p.id for p in permissions],
    )
    created = await service.create(role_in)

    found = await service.get_by_id(created.id, include_permissions=True)

    assert len(found.permissions) == 4


@pytest.mark.asyncio
async def test_get_role_by_id_not_found(db_session: AsyncSession):
    """Test getting a non-existent role by ID."""
    service = RoleService(db_session)

    with pytest.raises(RoleNotFoundError) as exc_info:
        await service.get_by_id(999)

    assert exc_info.value.role_id == 999


@pytest.mark.asyncio
async def test_get_role_by_code(db_session: AsyncSession):
    """Test getting a role by code."""
    service = RoleService(db_session)
    role_in = RoleCreate(code="admin", name="Administrator")
    await service.create(role_in)

    found = await service.get_by_code("admin")

    assert found is not None
    assert found.code == "admin"


@pytest.mark.asyncio
async def test_list_roles(db_session: AsyncSession):
    """Test listing roles with pagination."""
    service = RoleService(db_session)

    # Create some roles
    for code in ["admin", "user", "MODERATOR"]:
        await service.create(RoleCreate(code=code, name=code.title()))

    roles, total = await service.list_roles(skip=0, limit=10)

    assert total == 3
    assert len(roles) == 3


@pytest.mark.asyncio
async def test_list_roles_with_permissions(db_session: AsyncSession):
    """Test listing roles with permissions loaded."""
    permissions = await create_test_permissions(db_session)
    service = RoleService(db_session)

    role_in = RoleCreate(
        code="admin",
        name="Administrator",
        permission_ids=[p.id for p in permissions],
    )
    await service.create(role_in)

    roles, total = await service.list_roles(skip=0, limit=10, include_permissions=True)

    assert total == 1
    assert len(roles[0].permissions) == 4


@pytest.mark.asyncio
async def test_update_role(db_session: AsyncSession):
    """Test updating a role."""
    service = RoleService(db_session)
    role_in = RoleCreate(code="admin", name="Administrator")
    created = await service.create(role_in)

    update_in = RoleUpdate(name="Super Admin", description="Updated description")
    updated = await service.update(created.id, update_in)

    assert updated.name == "Super Admin"
    assert updated.description == "Updated description"
    assert updated.code == "admin"  # Code should not change


@pytest.mark.asyncio
async def test_update_role_permissions(db_session: AsyncSession):
    """Test updating role permissions."""
    permissions = await create_test_permissions(db_session)
    service = RoleService(db_session)

    role_in = RoleCreate(
        code="admin",
        name="Administrator",
        permission_ids=[permissions[0].id],
    )
    created = await service.create(role_in)
    assert len(created.permissions) == 1

    update_in = RoleUpdate(permission_ids=[p.id for p in permissions])
    updated = await service.update(created.id, update_in)

    assert len(updated.permissions) == 4


@pytest.mark.asyncio
async def test_update_system_role_fails(db_session: AsyncSession):
    """Test that updating a system role fails."""
    from src.app.models import Role

    # Create a system role directly
    role = Role(code="super_admin", name="Super Admin", is_system=True)
    db_session.add(role)
    await db_session.commit()
    await db_session.refresh(role)

    service = RoleService(db_session)

    with pytest.raises(SystemRoleModificationError):
        await service.update(role.id, RoleUpdate(name="Changed"))


@pytest.mark.asyncio
async def test_delete_role(db_session: AsyncSession):
    """Test deleting a role."""
    service = RoleService(db_session)
    role_in = RoleCreate(code="admin", name="Administrator")
    created = await service.create(role_in)

    await service.delete(created.id)

    with pytest.raises(RoleNotFoundError):
        await service.get_by_id(created.id)


@pytest.mark.asyncio
async def test_delete_system_role_fails(db_session: AsyncSession):
    """Test that deleting a system role fails."""
    from src.app.models import Role

    # Create a system role directly
    role = Role(code="super_admin", name="Super Admin", is_system=True)
    db_session.add(role)
    await db_session.commit()
    await db_session.refresh(role)

    service = RoleService(db_session)

    with pytest.raises(SystemRoleModificationError):
        await service.delete(role.id)


@pytest.mark.asyncio
async def test_add_permission_to_role(db_session: AsyncSession):
    """Test adding a permission to a role."""
    permissions = await create_test_permissions(db_session)
    service = RoleService(db_session)

    role_in = RoleCreate(code="admin", name="Administrator")
    role = await service.create(role_in)

    updated = await service.add_permission(role.id, permissions[0].id)

    assert len(updated.permissions) == 1
    assert updated.permissions[0].code == "users:read"


@pytest.mark.asyncio
async def test_add_permission_to_system_role_fails(db_session: AsyncSession):
    """Test that adding permission to system role fails."""
    from src.app.models import Role

    permissions = await create_test_permissions(db_session)

    role = Role(code="super_admin", name="Super Admin", is_system=True)
    db_session.add(role)
    await db_session.commit()
    await db_session.refresh(role)

    service = RoleService(db_session)

    with pytest.raises(SystemRoleModificationError):
        await service.add_permission(role.id, permissions[0].id)


@pytest.mark.asyncio
async def test_remove_permission_from_role(db_session: AsyncSession):
    """Test removing a permission from a role."""
    permissions = await create_test_permissions(db_session)
    service = RoleService(db_session)

    role_in = RoleCreate(
        code="admin",
        name="Administrator",
        permission_ids=[p.id for p in permissions],
    )
    role = await service.create(role_in)
    assert len(role.permissions) == 4

    updated = await service.remove_permission(role.id, permissions[0].id)

    assert len(updated.permissions) == 3


# Soft delete tests


@pytest.mark.asyncio
async def test_soft_delete_role(db_session: AsyncSession):
    """Test soft deleting a role sets deleted_at."""
    service = RoleService(db_session)
    role_in = RoleCreate(code="admin", name="Administrator")
    created = await service.create(role_in)

    await service.delete(created.id)

    # Role should not be found with default query
    with pytest.raises(RoleNotFoundError):
        await service.get_by_id(created.id)

    # Role should be found with include_deleted=True
    deleted_role = await service.get_by_id(created.id, include_deleted=True)
    assert deleted_role.deleted_at is not None


@pytest.mark.asyncio
async def test_soft_deleted_role_not_in_list(db_session: AsyncSession):
    """Test soft deleted roles are excluded from list by default."""
    service = RoleService(db_session)

    # Create roles
    for code in ["admin", "user", "MODERATOR"]:
        await service.create(RoleCreate(code=code, name=code.title()))

    # Soft delete one role
    roles, _ = await service.list_roles()
    await service.delete(roles[0].id)

    # List should only have 2 roles
    roles_after, total_after = await service.list_roles()
    assert total_after == 2
    assert len(roles_after) == 2


@pytest.mark.asyncio
async def test_list_roles_include_deleted(db_session: AsyncSession):
    """Test listing roles with include_deleted=True."""
    service = RoleService(db_session)

    # Create roles
    for code in ["admin", "user", "MODERATOR"]:
        await service.create(RoleCreate(code=code, name=code.title()))

    # Soft delete one role
    roles, _ = await service.list_roles()
    await service.delete(roles[0].id)

    # List with include_deleted should have all 3 roles
    roles_all, total_all = await service.list_roles(include_deleted=True)
    assert total_all == 3
    assert len(roles_all) == 3


@pytest.mark.asyncio
async def test_get_by_code_excludes_deleted(db_session: AsyncSession):
    """Test get_by_code excludes soft deleted roles by default."""
    service = RoleService(db_session)
    role_in = RoleCreate(code="admin", name="Administrator")
    created = await service.create(role_in)

    await service.delete(created.id)

    # Should not find deleted role
    found = await service.get_by_code("admin")
    assert found is None

    # Should find with include_deleted
    found_deleted = await service.get_by_code("admin", include_deleted=True)
    assert found_deleted is not None


@pytest.mark.asyncio
async def test_restore_role(db_session: AsyncSession):
    """Test restoring a soft deleted role."""
    service = RoleService(db_session)
    role_in = RoleCreate(code="admin", name="Administrator")
    created = await service.create(role_in)

    # Soft delete
    await service.delete(created.id)

    # Restore
    restored = await service.restore(created.id)
    assert restored.deleted_at is None

    # Role should be found normally
    found = await service.get_by_id(created.id)
    assert found is not None


# Hard delete tests


@pytest.mark.asyncio
async def test_hard_delete_role_as_super_admin(db_session: AsyncSession):
    """Test hard delete as super admin permanently deletes role."""
    service = RoleService(db_session)
    role_in = RoleCreate(code="admin", name="Administrator")
    created = await service.create(role_in)

    await service.hard_delete(created.id, is_super_admin=True)

    # Role should not be found even with include_deleted
    with pytest.raises(RoleNotFoundError):
        await service.get_by_id(created.id, include_deleted=True)


@pytest.mark.asyncio
async def test_hard_delete_role_not_super_admin(db_session: AsyncSession):
    """Test hard delete without super admin raises error."""
    service = RoleService(db_session)
    role_in = RoleCreate(code="admin", name="Administrator")
    created = await service.create(role_in)

    with pytest.raises(HardDeleteNotAllowedError):
        await service.hard_delete(created.id, is_super_admin=False)


@pytest.mark.asyncio
async def test_hard_delete_system_role_fails(db_session: AsyncSession):
    """Test that hard deleting a system role fails even for super admin."""
    from src.app.models import Role

    # Create a system role directly
    role = Role(code="super_admin", name="Super Admin", is_system=True)
    db_session.add(role)
    await db_session.commit()
    await db_session.refresh(role)

    service = RoleService(db_session)

    with pytest.raises(SystemRoleModificationError):
        await service.hard_delete(role.id, is_super_admin=True)
