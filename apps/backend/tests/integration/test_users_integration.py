"""Users integration tests.

Tests: 15
- USER-INT-001 to USER-INT-015

These tests verify user management functionality including:
- CRUD operations
- Pagination and filtering
- Soft delete and restore
- Role assignment
- Permission checks
"""

from datetime import UTC

import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from src.app.core.security import get_password_hash
from src.app.models import Role, User

from .conftest import create_test_users


# USER-INT-001: List users with pagination
@pytest.mark.asyncio
async def test_list_users_paginated(
    client: AsyncClient,
    db_session: AsyncSession,
    superadmin_headers: dict,
    superadmin_role: Role,
):
    """Should return paginated list of users."""
    # Create 25 users
    await create_test_users(db_session, 25, superadmin_role)

    # Get first page
    response = await client.get(
        "/api/v1/users?page=1&limit=10",
        headers=superadmin_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert len(data["data"]) == 10
    assert data["meta"]["total_items"] >= 25
    assert data["meta"]["has_next_page"] is True


# USER-INT-002: Get single user
@pytest.mark.asyncio
async def test_get_single_user(
    client: AsyncClient,
    db_session: AsyncSession,
    superadmin_headers: dict,
    superadmin_user: User,
):
    """Should return single user by ID."""
    response = await client.get(
        f"/api/v1/users/{superadmin_user.id}",
        headers=superadmin_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == str(superadmin_user.id)
    assert data["email"] == superadmin_user.email


# USER-INT-003: Get non-existent user fails
@pytest.mark.asyncio
async def test_get_nonexistent_user_fails(
    client: AsyncClient,
    superadmin_headers: dict,
):
    """Should return 404 for non-existent user."""
    fake_id = "00000000-0000-0000-0000-000000000000"
    response = await client.get(
        f"/api/v1/users/{fake_id}",
        headers=superadmin_headers,
    )

    assert response.status_code == 404
    data = response.json()
    assert data["code"] == "USER_NOT_FOUND"


# USER-INT-004: Create new user
@pytest.mark.asyncio
async def test_create_user(
    client: AsyncClient,
    superadmin_headers: dict,
):
    """Should create a new user."""
    response = await client.post(
        "/api/v1/users",
        headers=superadmin_headers,
        json={
            "email": "newcreated@example.com",
            "name": "New Created User",
            "password": "NewCreated123!@#",
        },
    )

    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "newcreated@example.com"
    assert data["name"] == "New Created User"
    assert "id" in data


# USER-INT-005: Create user with duplicate email fails
@pytest.mark.asyncio
async def test_create_user_duplicate_email_fails(
    client: AsyncClient,
    superadmin_headers: dict,
    superadmin_user: User,
):
    """Should fail to create user with existing email."""
    response = await client.post(
        "/api/v1/users",
        headers=superadmin_headers,
        json={
            "email": superadmin_user.email,
            "name": "Duplicate User",
            "password": "Duplicate123!@#",
        },
    )

    assert response.status_code == 409
    data = response.json()
    assert data["code"] == "EMAIL_ALREADY_EXISTS"


# USER-INT-006: Update user information
@pytest.mark.asyncio
async def test_update_user(
    client: AsyncClient,
    db_session: AsyncSession,
    superadmin_headers: dict,
):
    """Should update user information."""
    # Create a user to update
    user = User(
        email="toupdate@example.com",
        name="To Update",
        hashed_password=get_password_hash("ToUpdate123!@#"),
        is_active=True,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)

    # Update user
    response = await client.patch(
        f"/api/v1/users/{user.id}",
        headers=superadmin_headers,
        json={
            "name": "Updated Name",
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Name"


# USER-INT-007: Partial update user
@pytest.mark.asyncio
async def test_partial_update_user(
    client: AsyncClient,
    db_session: AsyncSession,
    superadmin_headers: dict,
):
    """Should partially update user (only specified fields)."""
    # Create a user
    user = User(
        email="partial@example.com",
        name="Partial Update",
        hashed_password=get_password_hash("Partial123!@#"),
        is_active=True,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)

    original_email = user.email

    # Update only name
    response = await client.patch(
        f"/api/v1/users/{user.id}",
        headers=superadmin_headers,
        json={
            "name": "New Name Only",
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "New Name Only"
    assert data["email"] == original_email


# USER-INT-008: Soft delete user
@pytest.mark.asyncio
async def test_soft_delete_user(
    client: AsyncClient,
    db_session: AsyncSession,
    superadmin_headers: dict,
):
    """Should soft delete user."""
    # Create a user
    user = User(
        email="todelete@example.com",
        name="To Delete",
        hashed_password=get_password_hash("ToDelete123!@#"),
        is_active=True,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)

    # Delete user
    response = await client.delete(
        f"/api/v1/users/{user.id}",
        headers=superadmin_headers,
    )

    assert response.status_code == 200

    # Verify soft deleted
    await db_session.refresh(user)
    assert user.deleted_at is not None


# USER-INT-009: Restore deleted user
@pytest.mark.asyncio
async def test_restore_deleted_user(
    client: AsyncClient,
    db_session: AsyncSession,
    superadmin_headers: dict,
):
    """Should restore soft deleted user."""
    from datetime import datetime

    # Create a soft deleted user
    user = User(
        email="torestore@example.com",
        name="To Restore",
        hashed_password=get_password_hash("ToRestore123!@#"),
        is_active=True,
        deleted_at=datetime.now(UTC),
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)

    # Restore user
    response = await client.post(
        f"/api/v1/users/{user.id}/restore",
        headers=superadmin_headers,
    )

    assert response.status_code == 200

    # Verify restored
    await db_session.refresh(user)
    assert user.deleted_at is None


# USER-INT-010: Hard delete user
@pytest.mark.asyncio
async def test_hard_delete_user(
    client: AsyncClient,
    db_session: AsyncSession,
    superadmin_headers: dict,
):
    """Should permanently delete user."""
    # Create a user
    user = User(
        email="tohardelete@example.com",
        name="To Hard Delete",
        hashed_password=get_password_hash("ToHardDelete123!@#"),
        is_active=True,
    )
    db_session.add(user)
    await db_session.commit()
    user_id = user.id

    # Hard delete user
    response = await client.delete(
        f"/api/v1/users/{user_id}/hard",
        headers=superadmin_headers,
    )

    assert response.status_code == 200

    # Verify permanently deleted
    result = await db_session.execute(select(User).where(User.id == user_id))
    assert result.scalar_one_or_none() is None


# USER-INT-011: Assign role to user
@pytest.mark.asyncio
async def test_assign_role_to_user(
    client: AsyncClient,
    db_session: AsyncSession,
    superadmin_headers: dict,
):
    """Should assign role to user."""
    # Create a user
    user = User(
        email="assignrole@example.com",
        name="Assign Role",
        hashed_password=get_password_hash("AssignRole123!@#"),
        is_active=True,
    )
    db_session.add(user)

    # Create a role
    role = Role(
        code="test_role",
        name="Test Role",
        is_system=False,
    )
    db_session.add(role)
    await db_session.commit()
    await db_session.refresh(user)
    await db_session.refresh(role)

    # Assign role
    response = await client.post(
        f"/api/v1/users/{user.id}/roles",
        headers=superadmin_headers,
        json={"role_ids": [role.id]},
    )

    assert response.status_code == 200

    # Verify role assigned
    await db_session.refresh(user)
    assert len(user.roles) == 1
    assert user.roles[0].code == "test_role"


# USER-INT-012: Remove role from user
@pytest.mark.asyncio
async def test_remove_role_from_user(
    client: AsyncClient,
    db_session: AsyncSession,
    superadmin_headers: dict,
):
    """Should remove role from user."""
    # Create a role
    role = Role(
        code="removable_role",
        name="Removable Role",
        is_system=False,
    )
    db_session.add(role)
    await db_session.flush()

    # Create a user with the role
    user = User(
        email="removerole@example.com",
        name="Remove Role",
        hashed_password=get_password_hash("RemoveRole123!@#"),
        is_active=True,
    )
    user.roles = [role]
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)

    # Remove role
    response = await client.delete(
        f"/api/v1/users/{user.id}/roles/{role.id}",
        headers=superadmin_headers,
    )

    assert response.status_code == 200

    # Verify role removed
    await db_session.refresh(user)
    assert len(user.roles) == 0


# USER-INT-013: Get user permissions
@pytest.mark.asyncio
async def test_get_user_permissions(
    client: AsyncClient,
    superadmin_headers: dict,
    superadmin_user: User,
):
    """Should return user's effective permissions."""
    response = await client.get(
        f"/api/v1/users/{superadmin_user.id}/permissions",
        headers=superadmin_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 20  # superadmin has all 20 permissions


# USER-INT-014: Access with insufficient permissions fails
@pytest.mark.asyncio
async def test_access_insufficient_permissions_fails(
    client: AsyncClient,
    user_headers: dict,
):
    """Should fail when user lacks required permissions."""
    # Regular user trying to list all users
    response = await client.get(
        "/api/v1/users",
        headers=user_headers,
    )

    assert response.status_code == 403
    data = response.json()
    assert data["code"] == "INSUFFICIENT_PERMISSIONS"


# USER-INT-015: Sort and filter users
@pytest.mark.asyncio
async def test_sort_and_filter_users(
    client: AsyncClient,
    db_session: AsyncSession,
    superadmin_headers: dict,
    superadmin_role: Role,
):
    """Should sort and filter users."""
    # Create users with specific names
    for name in ["Alice", "Bob", "Charlie"]:
        user = User(
            email=f"{name.lower()}@example.com",
            name=name,
            hashed_password=get_password_hash("Test123!@#"),
            is_active=True,
        )
        db_session.add(user)
    await db_session.commit()

    # Filter by name and sort
    response = await client.get(
        "/api/v1/users?sort_by=name&sort_order=asc&search=alice",
        headers=superadmin_headers,
    )

    assert response.status_code == 200
    data = response.json()
    # Should find Alice
    assert any(item["name"] == "Alice" for item in data["data"])
