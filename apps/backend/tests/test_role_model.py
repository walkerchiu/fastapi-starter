"""Role model tests."""

import pytest
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from src.app.models.role import Role


@pytest.mark.asyncio
async def test_create_role(db_session: AsyncSession):
    """Test creating a new role."""
    role = Role(
        code="admin",
        name="Administrator",
        description="System administrator with full access",
    )
    db_session.add(role)
    await db_session.commit()
    await db_session.refresh(role)

    assert role.id is not None
    assert role.code == "admin"
    assert role.name == "Administrator"
    assert role.description == "System administrator with full access"
    assert role.is_system is False
    assert role.created_at is not None
    assert role.updated_at is not None


@pytest.mark.asyncio
async def test_create_system_role(db_session: AsyncSession):
    """Test creating a system role."""
    role = Role(
        code="super_admin",
        name="Super Administrator",
        description="Built-in super administrator role",
        is_system=True,
    )
    db_session.add(role)
    await db_session.commit()
    await db_session.refresh(role)

    assert role.is_system is True


@pytest.mark.asyncio
async def test_role_code_unique(db_session: AsyncSession):
    """Test that role code must be unique."""
    role1 = Role(
        code="admin",
        name="Administrator",
    )
    db_session.add(role1)
    await db_session.commit()

    role2 = Role(
        code="admin",
        name="Another Admin",
    )
    db_session.add(role2)

    with pytest.raises(IntegrityError):
        await db_session.commit()


@pytest.mark.asyncio
async def test_role_without_description(db_session: AsyncSession):
    """Test creating a role without description."""
    role = Role(
        code="user",
        name="Regular User",
    )
    db_session.add(role)
    await db_session.commit()
    await db_session.refresh(role)

    assert role.id is not None
    assert role.description is None


@pytest.mark.asyncio
async def test_list_roles(db_session: AsyncSession):
    """Test listing multiple roles."""
    roles_data = [
        {"code": "super_admin", "name": "Super Admin", "is_system": True},
        {"code": "admin", "name": "Admin", "is_system": True},
        {"code": "user", "name": "User", "is_system": True},
        {"code": "custom", "name": "Custom Role", "is_system": False},
    ]

    for data in roles_data:
        role = Role(**data)
        db_session.add(role)

    await db_session.commit()

    result = await db_session.execute(select(Role))
    roles = result.scalars().all()

    assert len(roles) == 4
    codes = [r.code for r in roles]
    assert "super_admin" in codes
    assert "admin" in codes
    assert "user" in codes
    assert "custom" in codes


@pytest.mark.asyncio
async def test_get_role_by_code(db_session: AsyncSession):
    """Test retrieving a role by its code."""
    role = Role(
        code="moderator",
        name="Moderator",
        description="Content moderator",
    )
    db_session.add(role)
    await db_session.commit()

    result = await db_session.execute(select(Role).where(Role.code == "moderator"))
    found = result.scalar_one_or_none()

    assert found is not None
    assert found.code == "moderator"
    assert found.name == "Moderator"


@pytest.mark.asyncio
async def test_filter_system_roles(db_session: AsyncSession):
    """Test filtering system roles from custom roles."""
    roles_data = [
        {"code": "super_admin", "name": "Super Admin", "is_system": True},
        {"code": "admin", "name": "Admin", "is_system": True},
        {"code": "custom1", "name": "Custom 1", "is_system": False},
        {"code": "custom2", "name": "Custom 2", "is_system": False},
    ]

    for data in roles_data:
        role = Role(**data)
        db_session.add(role)

    await db_session.commit()

    # Get system roles
    result = await db_session.execute(select(Role).where(Role.is_system.is_(True)))
    system_roles = result.scalars().all()
    assert len(system_roles) == 2

    # Get custom roles
    result = await db_session.execute(select(Role).where(Role.is_system.is_(False)))
    custom_roles = result.scalars().all()
    assert len(custom_roles) == 2
