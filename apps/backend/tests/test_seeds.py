"""Seed data tests."""

import pytest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from src.app.db.seeds import (
    DEFAULT_PERMISSIONS,
    DEFAULT_ROLES,
    seed_all,
    seed_permissions,
    seed_roles,
)
from src.app.models.permission import Permission
from src.app.models.role import Role


@pytest.mark.asyncio
async def test_seed_permissions(db_session: AsyncSession):
    """Test seeding default permissions."""
    permissions_map = await seed_permissions(db_session)
    await db_session.commit()

    # Verify all default permissions were created
    assert len(permissions_map) == len(DEFAULT_PERMISSIONS)

    # Verify each permission exists in database
    for perm_data in DEFAULT_PERMISSIONS:
        result = await db_session.execute(
            select(Permission).where(Permission.code == perm_data["code"])
        )
        permission = result.scalar_one()
        assert permission.name == perm_data["name"]
        assert permission.description == perm_data["description"]


@pytest.mark.asyncio
async def test_seed_permissions_idempotent(db_session: AsyncSession):
    """Test that seeding permissions is idempotent."""
    # Seed twice
    await seed_permissions(db_session)
    await db_session.commit()

    await seed_permissions(db_session)
    await db_session.commit()

    # Should still have the same number of permissions
    result = await db_session.execute(select(Permission))
    permissions = result.scalars().all()
    assert len(permissions) == len(DEFAULT_PERMISSIONS)


@pytest.mark.asyncio
async def test_seed_roles(db_session: AsyncSession):
    """Test seeding default roles with permissions."""
    # First seed permissions
    permissions_map = await seed_permissions(db_session)
    await db_session.flush()

    # Then seed roles
    roles_map = await seed_roles(db_session, permissions_map)
    await db_session.commit()

    # Verify all default roles were created
    assert len(roles_map) == len(DEFAULT_ROLES)

    # Verify each role exists and has correct permissions
    for role_data in DEFAULT_ROLES:
        result = await db_session.execute(
            select(Role)
            .where(Role.code == role_data["code"])
            .options(selectinload(Role.permissions))
        )
        role = result.scalar_one()
        assert role.name == role_data["name"]
        assert role.is_system == role_data["is_system"]

        # Verify permissions count
        expected_perm_count = len(role_data["permissions"])
        assert len(role.permissions) == expected_perm_count


@pytest.mark.asyncio
async def test_seed_roles_idempotent(db_session: AsyncSession):
    """Test that seeding roles is idempotent."""
    # Seed twice
    permissions_map = await seed_permissions(db_session)
    await db_session.flush()
    await seed_roles(db_session, permissions_map)
    await db_session.commit()

    permissions_map = await seed_permissions(db_session)
    await db_session.flush()
    await seed_roles(db_session, permissions_map)
    await db_session.commit()

    # Should still have the same number of roles
    result = await db_session.execute(select(Role))
    roles = result.scalars().all()
    assert len(roles) == len(DEFAULT_ROLES)


@pytest.mark.asyncio
async def test_seed_all(db_session: AsyncSession):
    """Test seeding all RBAC data at once."""
    permissions_map, roles_map = await seed_all(db_session)

    # Verify counts
    assert len(permissions_map) == len(DEFAULT_PERMISSIONS)
    assert len(roles_map) == len(DEFAULT_ROLES)

    # Verify superadmin has all permissions
    result = await db_session.execute(
        select(Role)
        .where(Role.code == "super_admin")
        .options(selectinload(Role.permissions))
    )
    superadmin = result.scalar_one()
    assert len(superadmin.permissions) == len(DEFAULT_PERMISSIONS)

    # Verify user role has limited permissions
    result = await db_session.execute(
        select(Role).where(Role.code == "user").options(selectinload(Role.permissions))
    )
    user_role = result.scalar_one()
    user_perm_codes = [p.code for p in user_role.permissions]
    assert "users:read" in user_perm_codes
    assert "files:read" in user_perm_codes
    assert "files:create" in user_perm_codes
    assert "users:delete" not in user_perm_codes


@pytest.mark.asyncio
async def test_superadmin_role_is_system(db_session: AsyncSession):
    """Test that SuperAdmin role is marked as system role."""
    await seed_all(db_session)

    result = await db_session.execute(select(Role).where(Role.code == "super_admin"))
    superadmin = result.scalar_one()

    assert superadmin.is_system is True


@pytest.mark.asyncio
async def test_admin_role_permissions(db_session: AsyncSession):
    """Test that Admin role has correct permissions."""
    await seed_all(db_session)

    result = await db_session.execute(
        select(Role).where(Role.code == "admin").options(selectinload(Role.permissions))
    )
    admin = result.scalar_one()

    perm_codes = [p.code for p in admin.permissions]

    # Admin should have user management permissions
    assert "users:read" in perm_codes
    assert "users:create" in perm_codes
    assert "users:update" in perm_codes
    assert "users:delete" in perm_codes

    # Admin should have read-only role/permission access
    assert "roles:read" in perm_codes
    assert "permissions:read" in perm_codes

    # Admin should NOT have role/permission management
    assert "roles:create" not in perm_codes
    assert "roles:update" not in perm_codes
    assert "permissions:create" not in perm_codes
