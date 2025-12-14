"""User-Role relationship tests."""

import pytest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from src.app.models.role import Role
from src.app.models.user import User


@pytest.mark.asyncio
async def test_assign_role_to_user(db_session: AsyncSession):
    """Test assigning a role to a user."""
    # Create role
    role = Role(code="admin", name="Administrator")
    db_session.add(role)

    # Create user
    user = User(email="test@example.com", name="Test User")
    db_session.add(user)
    await db_session.commit()

    # Refresh to load relationships
    await db_session.refresh(user, ["roles"])

    # Assign role to user
    user.roles = [role]
    await db_session.commit()

    # Query the user with roles loaded
    result = await db_session.execute(
        select(User)
        .where(User.email == "test@example.com")
        .options(selectinload(User.roles))
    )
    found_user = result.scalar_one()

    assert len(found_user.roles) == 1
    assert found_user.roles[0].code == "admin"


@pytest.mark.asyncio
async def test_assign_multiple_roles_to_user(db_session: AsyncSession):
    """Test assigning multiple roles to a user (M:N relationship)."""
    # Create roles
    roles = [
        Role(code="admin", name="Administrator"),
        Role(code="moderator", name="Moderator"),
        Role(code="editor", name="Editor"),
    ]
    for r in roles:
        db_session.add(r)

    # Create user
    user = User(email="test@example.com", name="Test User")
    db_session.add(user)
    await db_session.commit()

    # Refresh to load relationships
    await db_session.refresh(user, ["roles"])

    # Assign all roles to user
    user.roles = roles
    await db_session.commit()

    # Query the user with roles loaded
    result = await db_session.execute(
        select(User)
        .where(User.email == "test@example.com")
        .options(selectinload(User.roles))
    )
    found_user = result.scalar_one()

    assert len(found_user.roles) == 3
    codes = [r.code for r in found_user.roles]
    assert "admin" in codes
    assert "moderator" in codes
    assert "editor" in codes


@pytest.mark.asyncio
async def test_role_assigned_to_multiple_users(db_session: AsyncSession):
    """Test that a role can be assigned to multiple users."""
    # Create role
    role = Role(code="user", name="Regular User")
    db_session.add(role)

    # Create users
    user1 = User(email="user1@example.com", name="User 1")
    user2 = User(email="user2@example.com", name="User 2")
    db_session.add(user1)
    db_session.add(user2)
    await db_session.commit()

    # Refresh to load relationships
    await db_session.refresh(user1, ["roles"])
    await db_session.refresh(user2, ["roles"])

    # Assign role to both users
    user1.roles = [role]
    user2.roles = [role]
    await db_session.commit()

    # Query role with users loaded
    result = await db_session.execute(
        select(Role).where(Role.code == "user").options(selectinload(Role.users))
    )
    found_role = result.scalar_one()

    assert len(found_role.users) == 2
    emails = [u.email for u in found_role.users]
    assert "user1@example.com" in emails
    assert "user2@example.com" in emails


@pytest.mark.asyncio
async def test_remove_role_from_user(db_session: AsyncSession):
    """Test removing a role from a user."""
    # Create role
    role = Role(code="admin", name="Administrator")
    db_session.add(role)

    # Create user
    user = User(email="test@example.com", name="Test User")
    db_session.add(user)
    await db_session.commit()

    # Refresh and assign role
    await db_session.refresh(user, ["roles"])
    user.roles = [role]
    await db_session.commit()

    # Query to verify assignment
    result = await db_session.execute(
        select(User)
        .where(User.email == "test@example.com")
        .options(selectinload(User.roles))
    )
    found_user = result.scalar_one()
    assert len(found_user.roles) == 1

    # Remove role
    found_user.roles = []
    await db_session.commit()

    # Query to verify removal
    result = await db_session.execute(
        select(User)
        .where(User.email == "test@example.com")
        .options(selectinload(User.roles))
    )
    found_user = result.scalar_one()
    assert len(found_user.roles) == 0

    # Verify role still exists
    result = await db_session.execute(select(Role).where(Role.code == "admin"))
    found_role = result.scalar_one_or_none()
    assert found_role is not None


@pytest.mark.asyncio
async def test_delete_user_cascades_to_association(db_session: AsyncSession):
    """Test that deleting a user removes the user-role association."""
    # Create role
    role = Role(code="admin", name="Administrator")
    db_session.add(role)

    # Create user
    user = User(email="test@example.com", name="Test User")
    db_session.add(user)
    await db_session.commit()

    # Refresh and assign role
    await db_session.refresh(user, ["roles"])
    user.roles = [role]
    await db_session.commit()

    # Get the user ID before deleting
    user_id = user.id

    # Delete user
    await db_session.delete(user)
    await db_session.commit()

    # Verify user is deleted
    result = await db_session.execute(select(User).where(User.id == user_id))
    deleted_user = result.scalar_one_or_none()
    assert deleted_user is None

    # Verify role still exists but has no users
    result = await db_session.execute(
        select(Role).where(Role.code == "admin").options(selectinload(Role.users))
    )
    found_role = result.scalar_one()
    assert len(found_role.users) == 0


@pytest.mark.asyncio
async def test_delete_role_cascades_to_association(db_session: AsyncSession):
    """Test that deleting a role removes the user-role association."""
    # Create role
    role = Role(code="admin", name="Administrator")
    db_session.add(role)

    # Create user
    user = User(email="test@example.com", name="Test User")
    db_session.add(user)
    await db_session.commit()

    # Refresh and assign role
    await db_session.refresh(user, ["roles"])
    user.roles = [role]
    await db_session.commit()

    # Get the role ID before deleting
    role_id = role.id

    # Delete role
    await db_session.delete(role)
    await db_session.commit()

    # Expire all to clear cached relationships
    db_session.expire_all()

    # Verify role is deleted
    result = await db_session.execute(select(Role).where(Role.id == role_id))
    deleted_role = result.scalar_one_or_none()
    assert deleted_role is None

    # Verify user still exists but has no roles
    result = await db_session.execute(
        select(User)
        .where(User.email == "test@example.com")
        .options(selectinload(User.roles))
    )
    found_user = result.scalar_one()
    assert len(found_user.roles) == 0


@pytest.mark.asyncio
async def test_get_user_with_roles_and_permissions(db_session: AsyncSession):
    """Test fetching a user with roles and their permissions."""
    from src.app.models.permission import Permission

    # Helper to create permission with resource and action
    def make_perm(code: str, name: str) -> Permission:
        parts = code.split(":", 1)
        resource = parts[0] if len(parts) >= 1 else code
        action = parts[1] if len(parts) == 2 else ""
        return Permission(code=code, name=name, resource=resource, action=action)

    # Create permissions
    perm1 = make_perm("users:read", "Read Users")
    perm2 = make_perm("users:write", "Write Users")
    db_session.add(perm1)
    db_session.add(perm2)

    # Create role
    role = Role(code="admin", name="Administrator")
    db_session.add(role)
    await db_session.commit()

    # Assign permissions to role
    await db_session.refresh(role, ["permissions"])
    role.permissions = [perm1, perm2]
    await db_session.commit()

    # Create user
    user = User(email="test@example.com", name="Test User")
    db_session.add(user)
    await db_session.commit()

    # Assign role to user
    await db_session.refresh(user, ["roles"])
    user.roles = [role]
    await db_session.commit()

    # Fetch user with roles and permissions (nested eager loading)
    result = await db_session.execute(
        select(User)
        .where(User.email == "test@example.com")
        .options(selectinload(User.roles).selectinload(Role.permissions))
    )
    found_user = result.scalar_one()

    assert len(found_user.roles) == 1
    assert len(found_user.roles[0].permissions) == 2

    # Get all user permissions through roles
    all_permissions = set()
    for r in found_user.roles:
        for p in r.permissions:
            all_permissions.add(p.code)

    assert "users:read" in all_permissions
    assert "users:write" in all_permissions
