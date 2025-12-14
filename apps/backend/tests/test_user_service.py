"""User service tests."""

import pytest
from sqlalchemy.ext.asyncio import AsyncSession
from src.app.models import Permission, Role
from src.app.schemas.user import UserCreate, UserUpdate
from src.app.services.exceptions import (
    EmailAlreadyExistsError,
    HardDeleteNotAllowedError,
    RoleNotFoundError,
    UserNotFoundError,
)
from src.app.services.user_service import UserService


async def create_test_role(
    db_session: AsyncSession, code: str = "test_role", name: str = "Test Role"
) -> Role:
    """Helper to create a test role."""
    role = Role(code=code, name=name)
    db_session.add(role)
    await db_session.commit()
    await db_session.refresh(role)
    return role


async def create_test_role_with_permissions(
    db_session: AsyncSession,
) -> tuple[Role, list[Permission]]:
    """Helper to create a test role with permissions."""
    permissions = []
    for code in ["users:read", "users:create"]:
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

    role = Role(code="admin", name="Admin")
    db_session.add(role)
    await db_session.flush()
    await db_session.refresh(role, ["permissions"])
    role.permissions = permissions
    await db_session.commit()
    await db_session.refresh(role, ["permissions"])

    return role, permissions


@pytest.mark.asyncio
async def test_create_user(db_session: AsyncSession):
    """Test creating a new user."""
    service = UserService(db_session)
    user_in = UserCreate(
        email="test@example.com",
        name="Test User",
    )

    user = await service.create(user_in)

    assert user.id is not None
    assert user.email == "test@example.com"
    assert user.name == "Test User"
    assert user.is_active is True


@pytest.mark.asyncio
async def test_create_user_with_roles(db_session: AsyncSession):
    """Test creating a user with roles."""
    role = await create_test_role(db_session)
    service = UserService(db_session)

    user_in = UserCreate(
        email="test@example.com",
        name="Test User",
        role_ids=[role.id],
    )

    user = await service.create(user_in)

    assert len(user.roles) == 1
    assert user.roles[0].code == "test_role"


@pytest.mark.asyncio
async def test_create_user_duplicate_email(db_session: AsyncSession):
    """Test creating a user with duplicate email."""
    service = UserService(db_session)
    user_in = UserCreate(email="test@example.com", name="Test User")

    await service.create(user_in)

    with pytest.raises(EmailAlreadyExistsError):
        await service.create(user_in)


@pytest.mark.asyncio
async def test_create_user_with_invalid_role(db_session: AsyncSession):
    """Test creating a user with non-existent role ID."""
    service = UserService(db_session)
    user_in = UserCreate(
        email="test@example.com",
        name="Test User",
        role_ids=[999],
    )

    with pytest.raises(RoleNotFoundError):
        await service.create(user_in)


@pytest.mark.asyncio
async def test_get_user_by_id(db_session: AsyncSession):
    """Test getting a user by ID."""
    service = UserService(db_session)
    user_in = UserCreate(email="test@example.com", name="Test User")
    created = await service.create(user_in)

    found = await service.get_by_id(created.id)

    assert found.id == created.id
    assert found.email == "test@example.com"


@pytest.mark.asyncio
async def test_get_user_by_id_with_roles(db_session: AsyncSession):
    """Test getting a user by ID with roles loaded."""
    role = await create_test_role(db_session)
    service = UserService(db_session)

    user_in = UserCreate(
        email="test@example.com",
        name="Test User",
        role_ids=[role.id],
    )
    created = await service.create(user_in)

    found = await service.get_by_id(created.id, include_roles=True)

    assert len(found.roles) == 1


@pytest.mark.asyncio
async def test_get_user_by_id_not_found(db_session: AsyncSession):
    """Test getting a non-existent user by ID."""
    service = UserService(db_session)

    with pytest.raises(UserNotFoundError) as exc_info:
        await service.get_by_id(999)

    assert exc_info.value.user_id == 999


@pytest.mark.asyncio
async def test_get_user_by_email(db_session: AsyncSession):
    """Test getting a user by email."""
    service = UserService(db_session)
    user_in = UserCreate(email="test@example.com", name="Test User")
    await service.create(user_in)

    found = await service.get_by_email("test@example.com")

    assert found is not None
    assert found.email == "test@example.com"


@pytest.mark.asyncio
async def test_list_users(db_session: AsyncSession):
    """Test listing users with pagination."""
    service = UserService(db_session)

    # Create some users
    for i in range(3):
        await service.create(UserCreate(email=f"user{i}@example.com", name=f"User {i}"))

    users, total = await service.list_users(skip=0, limit=10)

    assert total == 3
    assert len(users) == 3


@pytest.mark.asyncio
async def test_list_users_with_roles(db_session: AsyncSession):
    """Test listing users with roles loaded."""
    role = await create_test_role(db_session)
    service = UserService(db_session)

    user_in = UserCreate(
        email="test@example.com",
        name="Test User",
        role_ids=[role.id],
    )
    await service.create(user_in)

    users, total = await service.list_users(skip=0, limit=10, include_roles=True)

    assert total == 1
    assert len(users[0].roles) == 1


@pytest.mark.asyncio
async def test_update_user(db_session: AsyncSession):
    """Test updating a user."""
    service = UserService(db_session)
    user_in = UserCreate(email="test@example.com", name="Test User")
    created = await service.create(user_in)

    update_in = UserUpdate(name="Updated Name")
    updated = await service.update(created.id, update_in)

    assert updated.name == "Updated Name"
    assert updated.email == "test@example.com"  # Email should not change


@pytest.mark.asyncio
async def test_update_user_roles(db_session: AsyncSession):
    """Test updating user roles."""
    role1 = await create_test_role(db_session, code="role1", name="Role 1")
    role2 = await create_test_role(db_session, code="role2", name="Role 2")
    service = UserService(db_session)

    user_in = UserCreate(
        email="test@example.com",
        name="Test User",
        role_ids=[role1.id],
    )
    created = await service.create(user_in)
    assert len(created.roles) == 1

    update_in = UserUpdate(role_ids=[role1.id, role2.id])
    updated = await service.update(created.id, update_in)

    assert len(updated.roles) == 2


@pytest.mark.asyncio
async def test_delete_user(db_session: AsyncSession):
    """Test deleting a user."""
    service = UserService(db_session)
    user_in = UserCreate(email="test@example.com", name="Test User")
    created = await service.create(user_in)

    await service.delete(created.id)

    with pytest.raises(UserNotFoundError):
        await service.get_by_id(created.id)


@pytest.mark.asyncio
async def test_assign_role_to_user(db_session: AsyncSession):
    """Test assigning a role to a user."""
    role = await create_test_role(db_session)
    service = UserService(db_session)

    user_in = UserCreate(email="test@example.com", name="Test User")
    user = await service.create(user_in)

    updated = await service.assign_role(user.id, role.id)

    assert len(updated.roles) == 1
    assert updated.roles[0].code == "test_role"


@pytest.mark.asyncio
async def test_assign_role_to_user_invalid_role(db_session: AsyncSession):
    """Test assigning a non-existent role to a user."""
    service = UserService(db_session)

    user_in = UserCreate(email="test@example.com", name="Test User")
    user = await service.create(user_in)

    with pytest.raises(RoleNotFoundError):
        await service.assign_role(user.id, 999)


@pytest.mark.asyncio
async def test_assign_role_already_assigned(db_session: AsyncSession):
    """Test assigning a role that is already assigned."""
    role = await create_test_role(db_session)
    service = UserService(db_session)

    user_in = UserCreate(
        email="test@example.com",
        name="Test User",
        role_ids=[role.id],
    )
    user = await service.create(user_in)

    # Assign same role again
    updated = await service.assign_role(user.id, role.id)

    # Should still have only one role
    assert len(updated.roles) == 1


@pytest.mark.asyncio
async def test_remove_role_from_user(db_session: AsyncSession):
    """Test removing a role from a user."""
    role1 = await create_test_role(db_session, code="role1", name="Role 1")
    role2 = await create_test_role(db_session, code="role2", name="Role 2")
    service = UserService(db_session)

    user_in = UserCreate(
        email="test@example.com",
        name="Test User",
        role_ids=[role1.id, role2.id],
    )
    user = await service.create(user_in)
    assert len(user.roles) == 2

    updated = await service.remove_role(user.id, role1.id)

    assert len(updated.roles) == 1
    assert updated.roles[0].code == "role2"


@pytest.mark.asyncio
async def test_get_user_permissions(db_session: AsyncSession):
    """Test getting all permissions for a user through roles."""
    role, permissions = await create_test_role_with_permissions(db_session)
    service = UserService(db_session)

    user_in = UserCreate(
        email="test@example.com",
        name="Test User",
        role_ids=[role.id],
    )
    user = await service.create(user_in)

    user_permissions = await service.get_user_permissions(user.id)

    assert len(user_permissions) == 2
    perm_codes = [p.code for p in user_permissions]
    assert "users:read" in perm_codes
    assert "users:create" in perm_codes


@pytest.mark.asyncio
async def test_get_user_permissions_no_roles(db_session: AsyncSession):
    """Test getting permissions for a user with no roles."""
    service = UserService(db_session)

    user_in = UserCreate(email="test@example.com", name="Test User")
    user = await service.create(user_in)

    user_permissions = await service.get_user_permissions(user.id)

    assert len(user_permissions) == 0


@pytest.mark.asyncio
async def test_get_user_permissions_multiple_roles_unique(db_session: AsyncSession):
    """Test that permissions from multiple roles are unique."""
    # Create shared permission
    shared_perm = Permission(
        code="shared:read", name="Shared Read", resource="shared", action="read"
    )
    db_session.add(shared_perm)
    await db_session.commit()

    # Create two roles with same permission
    role1 = Role(code="role1", name="Role 1")
    role2 = Role(code="role2", name="Role 2")
    db_session.add(role1)
    db_session.add(role2)
    await db_session.flush()

    await db_session.refresh(role1, ["permissions"])
    await db_session.refresh(role2, ["permissions"])
    role1.permissions = [shared_perm]
    role2.permissions = [shared_perm]
    await db_session.commit()

    service = UserService(db_session)

    user_in = UserCreate(
        email="test@example.com",
        name="Test User",
        role_ids=[role1.id, role2.id],
    )
    user = await service.create(user_in)

    user_permissions = await service.get_user_permissions(user.id)

    # Should only have one unique permission even though both roles have it
    assert len(user_permissions) == 1
    assert user_permissions[0].code == "shared:read"


@pytest.mark.asyncio
async def test_has_permission_true(db_session: AsyncSession):
    """Test has_permission returns True when user has the permission."""
    role, _ = await create_test_role_with_permissions(db_session)
    service = UserService(db_session)

    user_in = UserCreate(
        email="test@example.com",
        name="Test User",
        role_ids=[role.id],
    )
    user = await service.create(user_in)

    result = await service.has_permission(user.id, "users:read")

    assert result is True


@pytest.mark.asyncio
async def test_has_permission_false(db_session: AsyncSession):
    """Test has_permission returns False when user lacks the permission."""
    role, _ = await create_test_role_with_permissions(db_session)
    service = UserService(db_session)

    user_in = UserCreate(
        email="test@example.com",
        name="Test User",
        role_ids=[role.id],
    )
    user = await service.create(user_in)

    result = await service.has_permission(user.id, "nonexistent:permission")

    assert result is False


@pytest.mark.asyncio
async def test_has_role_true(db_session: AsyncSession):
    """Test has_role returns True when user has the role."""
    role = await create_test_role(db_session, code="admin", name="Admin")
    service = UserService(db_session)

    user_in = UserCreate(
        email="test@example.com",
        name="Test User",
        role_ids=[role.id],
    )
    user = await service.create(user_in)

    result = await service.has_role(user.id, "admin")

    assert result is True


@pytest.mark.asyncio
async def test_has_role_false(db_session: AsyncSession):
    """Test has_role returns False when user lacks the role."""
    role = await create_test_role(db_session, code="admin", name="Admin")
    service = UserService(db_session)

    user_in = UserCreate(
        email="test@example.com",
        name="Test User",
        role_ids=[role.id],
    )
    user = await service.create(user_in)

    result = await service.has_role(user.id, "super_admin")

    assert result is False


# Soft delete tests


@pytest.mark.asyncio
async def test_soft_delete_user(db_session: AsyncSession):
    """Test soft deleting a user sets deleted_at."""
    service = UserService(db_session)
    user_in = UserCreate(email="test@example.com", name="Test User")
    created = await service.create(user_in)

    await service.delete(created.id)

    # User should not be found with default query
    with pytest.raises(UserNotFoundError):
        await service.get_by_id(created.id)

    # User should be found with include_deleted=True
    deleted_user = await service.get_by_id(created.id, include_deleted=True)
    assert deleted_user.deleted_at is not None


@pytest.mark.asyncio
async def test_soft_deleted_user_not_in_list(db_session: AsyncSession):
    """Test soft deleted users are excluded from list by default."""
    service = UserService(db_session)

    # Create users
    for i in range(3):
        await service.create(UserCreate(email=f"user{i}@example.com", name=f"User {i}"))

    # Soft delete one user
    users, total = await service.list_users()
    await service.delete(users[0].id)

    # List should only have 2 users
    users_after, total_after = await service.list_users()
    assert total_after == 2
    assert len(users_after) == 2


@pytest.mark.asyncio
async def test_list_users_include_deleted(db_session: AsyncSession):
    """Test listing users with include_deleted=True."""
    service = UserService(db_session)

    # Create users
    for i in range(3):
        await service.create(UserCreate(email=f"user{i}@example.com", name=f"User {i}"))

    # Soft delete one user
    users, _ = await service.list_users()
    await service.delete(users[0].id)

    # List with include_deleted should have all 3 users
    users_all, total_all = await service.list_users(include_deleted=True)
    assert total_all == 3
    assert len(users_all) == 3


@pytest.mark.asyncio
async def test_get_by_email_excludes_deleted(db_session: AsyncSession):
    """Test get_by_email excludes soft deleted users by default."""
    service = UserService(db_session)
    user_in = UserCreate(email="test@example.com", name="Test User")
    created = await service.create(user_in)

    await service.delete(created.id)

    # Should not find deleted user
    found = await service.get_by_email("test@example.com")
    assert found is None

    # Should find with include_deleted
    found_deleted = await service.get_by_email("test@example.com", include_deleted=True)
    assert found_deleted is not None


@pytest.mark.asyncio
async def test_restore_user(db_session: AsyncSession):
    """Test restoring a soft deleted user."""
    service = UserService(db_session)
    user_in = UserCreate(email="test@example.com", name="Test User")
    created = await service.create(user_in)

    # Soft delete
    await service.delete(created.id)

    # Restore
    restored = await service.restore(created.id)
    assert restored.deleted_at is None

    # User should be found normally
    found = await service.get_by_id(created.id)
    assert found is not None


# Hard delete tests


@pytest.mark.asyncio
async def test_hard_delete_user_as_super_admin(db_session: AsyncSession):
    """Test hard delete as super admin permanently deletes user."""
    service = UserService(db_session)
    user_in = UserCreate(email="test@example.com", name="Test User")
    created = await service.create(user_in)

    await service.hard_delete(created.id, is_super_admin=True)

    # User should not be found even with include_deleted
    with pytest.raises(UserNotFoundError):
        await service.get_by_id(created.id, include_deleted=True)


@pytest.mark.asyncio
async def test_hard_delete_user_not_super_admin(db_session: AsyncSession):
    """Test hard delete without super admin raises error."""
    service = UserService(db_session)
    user_in = UserCreate(email="test@example.com", name="Test User")
    created = await service.create(user_in)

    with pytest.raises(HardDeleteNotAllowedError):
        await service.hard_delete(created.id, is_super_admin=False)


@pytest.mark.asyncio
async def test_hard_delete_soft_deleted_user(db_session: AsyncSession):
    """Test hard delete can remove a soft deleted user."""
    service = UserService(db_session)
    user_in = UserCreate(email="test@example.com", name="Test User")
    created = await service.create(user_in)

    # Soft delete first
    await service.delete(created.id)

    # Then hard delete
    await service.hard_delete(created.id, is_super_admin=True)

    # User should be completely gone
    with pytest.raises(UserNotFoundError):
        await service.get_by_id(created.id, include_deleted=True)
