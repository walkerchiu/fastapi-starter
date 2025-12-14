"""Role-Permission relationship tests."""

import pytest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from src.app.models.permission import Permission
from src.app.models.role import Role


def make_permission(code: str, name: str) -> Permission:
    """Helper to create a Permission with resource and action parsed from code."""
    parts = code.split(":", 1)
    resource = parts[0] if len(parts) >= 1 else code
    action = parts[1] if len(parts) == 2 else ""
    return Permission(code=code, name=name, resource=resource, action=action)


@pytest.mark.asyncio
async def test_assign_permission_to_role(db_session: AsyncSession):
    """Test assigning a permission to a role."""
    # Create permission
    permission = make_permission("users:read", "Read Users")
    db_session.add(permission)

    # Create role
    role = Role(code="admin", name="Administrator")
    db_session.add(role)
    await db_session.commit()

    # Refresh to get the objects with their IDs and initialize relationships
    await db_session.refresh(permission)
    await db_session.refresh(role, ["permissions"])

    # Assign permission to role using the association
    role.permissions = [permission]
    await db_session.commit()

    # Query the role with permissions loaded
    result = await db_session.execute(
        select(Role).where(Role.code == "admin").options(selectinload(Role.permissions))
    )
    found_role = result.scalar_one()

    assert len(found_role.permissions) == 1
    assert found_role.permissions[0].code == "users:read"


@pytest.mark.asyncio
async def test_assign_multiple_permissions_to_role(db_session: AsyncSession):
    """Test assigning multiple permissions to a role."""
    # Create permissions
    permissions = [
        make_permission("users:read", "Read Users"),
        make_permission("users:create", "Create Users"),
        make_permission("users:update", "Update Users"),
        make_permission("users:delete", "Delete Users"),
    ]
    for p in permissions:
        db_session.add(p)

    # Create role
    role = Role(code="admin", name="Administrator")
    db_session.add(role)
    await db_session.commit()

    # Refresh role with permissions relationship
    await db_session.refresh(role, ["permissions"])

    # Assign all permissions to role
    role.permissions = permissions
    await db_session.commit()

    # Query the role with permissions loaded
    result = await db_session.execute(
        select(Role).where(Role.code == "admin").options(selectinload(Role.permissions))
    )
    found_role = result.scalar_one()

    assert len(found_role.permissions) == 4
    codes = [p.code for p in found_role.permissions]
    assert "users:read" in codes
    assert "users:create" in codes
    assert "users:update" in codes
    assert "users:delete" in codes


@pytest.mark.asyncio
async def test_permission_assigned_to_multiple_roles(db_session: AsyncSession):
    """Test that a permission can be assigned to multiple roles."""
    # Create permission
    permission = make_permission("users:read", "Read Users")
    db_session.add(permission)

    # Create roles
    role1 = Role(code="admin", name="Administrator")
    role2 = Role(code="viewer", name="Viewer")
    db_session.add(role1)
    db_session.add(role2)
    await db_session.commit()

    # Refresh roles with permissions relationship
    await db_session.refresh(role1, ["permissions"])
    await db_session.refresh(role2, ["permissions"])

    # Assign permission to both roles
    role1.permissions = [permission]
    role2.permissions = [permission]
    await db_session.commit()

    # Query permission with roles loaded
    result = await db_session.execute(
        select(Permission)
        .where(Permission.code == "users:read")
        .options(selectinload(Permission.roles))
    )
    found_permission = result.scalar_one()

    assert len(found_permission.roles) == 2
    role_codes = [r.code for r in found_permission.roles]
    assert "admin" in role_codes
    assert "viewer" in role_codes


@pytest.mark.asyncio
async def test_remove_permission_from_role(db_session: AsyncSession):
    """Test removing a permission from a role."""
    # Create permission
    permission = make_permission("users:read", "Read Users")
    db_session.add(permission)

    # Create role
    role = Role(code="admin", name="Administrator")
    db_session.add(role)
    await db_session.commit()

    # Refresh role with permissions relationship
    await db_session.refresh(role, ["permissions"])

    # Assign permission
    role.permissions = [permission]
    await db_session.commit()

    # Query to verify assignment
    result = await db_session.execute(
        select(Role).where(Role.code == "admin").options(selectinload(Role.permissions))
    )
    found_role = result.scalar_one()
    assert len(found_role.permissions) == 1

    # Remove permission
    found_role.permissions = []
    await db_session.commit()

    # Query to verify removal
    result = await db_session.execute(
        select(Role).where(Role.code == "admin").options(selectinload(Role.permissions))
    )
    found_role = result.scalar_one()
    assert len(found_role.permissions) == 0

    # Verify permission still exists
    result = await db_session.execute(
        select(Permission).where(Permission.code == "users:read")
    )
    found_permission = result.scalar_one_or_none()
    assert found_permission is not None


@pytest.mark.asyncio
async def test_delete_role_cascades_to_association(db_session: AsyncSession):
    """Test that deleting a role removes the role-permission association."""
    # Create permission
    permission = make_permission("users:read", "Read Users")
    db_session.add(permission)

    # Create role
    role = Role(code="admin", name="Administrator")
    db_session.add(role)
    await db_session.commit()

    # Refresh role with permissions relationship
    await db_session.refresh(role, ["permissions"])

    # Assign permission
    role.permissions = [permission]
    await db_session.commit()

    # Get the role ID before deleting
    role_id = role.id

    # Delete role
    await db_session.delete(role)
    await db_session.commit()

    # Verify role is deleted
    result = await db_session.execute(select(Role).where(Role.id == role_id))
    deleted_role = result.scalar_one_or_none()
    assert deleted_role is None

    # Verify permission still exists but has no roles
    result = await db_session.execute(
        select(Permission)
        .where(Permission.code == "users:read")
        .options(selectinload(Permission.roles))
    )
    found_permission = result.scalar_one()
    assert len(found_permission.roles) == 0


@pytest.mark.asyncio
async def test_delete_permission_cascades_to_association(db_session: AsyncSession):
    """Test that deleting a permission removes the role-permission association."""
    # Create permission
    permission = make_permission("users:read", "Read Users")
    db_session.add(permission)

    # Create role
    role = Role(code="admin", name="Administrator")
    db_session.add(role)
    await db_session.commit()

    # Refresh role with permissions relationship
    await db_session.refresh(role, ["permissions"])

    # Assign permission
    role.permissions = [permission]
    await db_session.commit()

    # Get the permission ID before deleting
    permission_id = permission.id

    # Delete permission
    await db_session.delete(permission)
    await db_session.commit()

    # Expire all to clear cached relationships
    db_session.expire_all()

    # Verify permission is deleted
    result = await db_session.execute(
        select(Permission).where(Permission.id == permission_id)
    )
    deleted_permission = result.scalar_one_or_none()
    assert deleted_permission is None

    # Verify role still exists but has no permissions
    result = await db_session.execute(
        select(Role).where(Role.code == "admin").options(selectinload(Role.permissions))
    )
    found_role = result.scalar_one()
    assert len(found_role.permissions) == 0


@pytest.mark.asyncio
async def test_get_roles_with_permissions(db_session: AsyncSession):
    """Test fetching roles with their permissions using eager loading."""
    # Create permissions
    perm1 = make_permission("users:read", "Read Users")
    perm2 = make_permission("users:write", "Write Users")
    db_session.add(perm1)
    db_session.add(perm2)

    # Create role
    role = Role(code="admin", name="Administrator")
    db_session.add(role)
    await db_session.commit()

    # Refresh role with permissions relationship
    await db_session.refresh(role, ["permissions"])

    # Assign permissions
    role.permissions = [perm1, perm2]
    await db_session.commit()

    # Fetch role with selectinload
    result = await db_session.execute(
        select(Role).where(Role.code == "admin").options(selectinload(Role.permissions))
    )
    found_role = result.scalar_one()

    assert len(found_role.permissions) == 2
