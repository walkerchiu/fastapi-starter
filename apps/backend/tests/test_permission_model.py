"""Permission model tests."""

import pytest
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from src.app.models.permission import Permission


def make_permission(code: str, name: str, description: str | None = None) -> Permission:
    """Helper to create a Permission with resource and action parsed from code."""
    parts = code.split(":", 1)
    resource = parts[0] if len(parts) >= 1 else code
    action = parts[1] if len(parts) == 2 else ""
    return Permission(
        code=code, name=name, description=description, resource=resource, action=action
    )


@pytest.mark.asyncio
async def test_create_permission(db_session: AsyncSession):
    """Test creating a new permission."""
    permission = make_permission(
        code="users:read",
        name="Read Users",
        description="Allows reading user information",
    )
    db_session.add(permission)
    await db_session.commit()
    await db_session.refresh(permission)

    assert permission.id is not None
    assert permission.code == "users:read"
    assert permission.name == "Read Users"
    assert permission.description == "Allows reading user information"
    assert permission.created_at is not None
    assert permission.updated_at is not None


@pytest.mark.asyncio
async def test_permission_code_unique(db_session: AsyncSession):
    """Test that permission code must be unique."""
    permission1 = make_permission(
        code="users:read",
        name="Read Users",
    )
    db_session.add(permission1)
    await db_session.commit()

    permission2 = make_permission(
        code="users:read",
        name="Another Read Users",
    )
    db_session.add(permission2)

    with pytest.raises(IntegrityError):
        await db_session.commit()


@pytest.mark.asyncio
async def test_permission_without_description(db_session: AsyncSession):
    """Test creating a permission without description."""
    permission = make_permission(
        code="users:create",
        name="Create Users",
    )
    db_session.add(permission)
    await db_session.commit()
    await db_session.refresh(permission)

    assert permission.id is not None
    assert permission.description is None


@pytest.mark.asyncio
async def test_list_permissions(db_session: AsyncSession):
    """Test listing multiple permissions."""
    permissions_data = [
        {"code": "users:read", "name": "Read Users"},
        {"code": "users:create", "name": "Create Users"},
        {"code": "users:update", "name": "Update Users"},
        {"code": "users:delete", "name": "Delete Users"},
    ]

    for data in permissions_data:
        permission = make_permission(**data)
        db_session.add(permission)

    await db_session.commit()

    result = await db_session.execute(select(Permission))
    permissions = result.scalars().all()

    assert len(permissions) == 4
    codes = [p.code for p in permissions]
    assert "users:read" in codes
    assert "users:create" in codes
    assert "users:update" in codes
    assert "users:delete" in codes


@pytest.mark.asyncio
async def test_get_permission_by_code(db_session: AsyncSession):
    """Test retrieving a permission by its code."""
    permission = make_permission(
        code="roles:read",
        name="Read Roles",
        description="Allows reading role information",
    )
    db_session.add(permission)
    await db_session.commit()

    result = await db_session.execute(
        select(Permission).where(Permission.code == "roles:read")
    )
    found = result.scalar_one_or_none()

    assert found is not None
    assert found.code == "roles:read"
    assert found.name == "Read Roles"
