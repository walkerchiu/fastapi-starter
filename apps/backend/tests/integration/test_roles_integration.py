"""Roles integration tests.

Tests: 10
- ROLE-INT-001 to ROLE-INT-010

These tests verify role management functionality including:
- CRUD operations
- System role protection
- Permission assignment
"""

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from src.app.models import Permission, Role


# ROLE-INT-001: Create new role
@pytest.mark.asyncio
async def test_create_role(
    client: AsyncClient,
    superadmin_headers: dict,
):
    """Should create a new role."""
    response = await client.post(
        "/api/v1/roles",
        headers=superadmin_headers,
        json={
            "code": "editor",
            "name": "Content Editor",
            "description": "Can edit content",
        },
    )

    assert response.status_code == 201
    data = response.json()
    assert data["code"] == "editor"
    assert data["name"] == "Content Editor"
    assert data["is_system"] is False


# ROLE-INT-002: List roles with pagination
@pytest.mark.asyncio
async def test_list_roles_paginated(
    client: AsyncClient,
    db_session: AsyncSession,
    superadmin_headers: dict,
):
    """Should return paginated list of roles."""
    # Create multiple roles
    for i in range(15):
        role = Role(
            code=f"test_role_{i}",
            name=f"Test Role {i}",
            is_system=False,
        )
        db_session.add(role)
    await db_session.commit()

    # Get first page
    response = await client.get(
        "/api/v1/roles?page=1&limit=10",
        headers=superadmin_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert len(data["data"]) == 10
    assert data["meta"]["has_next_page"] is True


# ROLE-INT-003: Get single role
@pytest.mark.asyncio
async def test_get_single_role(
    client: AsyncClient,
    db_session: AsyncSession,
    superadmin_headers: dict,
):
    """Should return single role by ID."""
    # Create a role
    role = Role(
        code="single_role",
        name="Single Role",
        description="A single role for testing",
        is_system=False,
    )
    db_session.add(role)
    await db_session.commit()
    await db_session.refresh(role)

    response = await client.get(
        f"/api/v1/roles/{role.id}",
        headers=superadmin_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["code"] == "single_role"
    assert data["name"] == "Single Role"


# ROLE-INT-004: Update role information
@pytest.mark.asyncio
async def test_update_role(
    client: AsyncClient,
    db_session: AsyncSession,
    superadmin_headers: dict,
):
    """Should update role information."""
    # Create a role
    role = Role(
        code="updatable_role",
        name="Updatable Role",
        is_system=False,
    )
    db_session.add(role)
    await db_session.commit()
    await db_session.refresh(role)

    response = await client.patch(
        f"/api/v1/roles/{role.id}",
        headers=superadmin_headers,
        json={
            "name": "Updated Role Name",
            "description": "Updated description",
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Role Name"
    assert data["description"] == "Updated description"


# ROLE-INT-005: Delete custom role
@pytest.mark.asyncio
async def test_delete_custom_role(
    client: AsyncClient,
    db_session: AsyncSession,
    superadmin_headers: dict,
):
    """Should delete custom role."""
    # Create a role
    role = Role(
        code="deletable_role",
        name="Deletable Role",
        is_system=False,
    )
    db_session.add(role)
    await db_session.commit()
    role_id = role.id

    response = await client.delete(
        f"/api/v1/roles/{role_id}",
        headers=superadmin_headers,
    )

    assert response.status_code == 200

    # Verify deleted (soft delete)
    await db_session.refresh(role)
    assert role.deleted_at is not None


# ROLE-INT-006: Cannot modify system role
@pytest.mark.asyncio
async def test_cannot_modify_system_role(
    client: AsyncClient,
    superadmin_headers: dict,
    superadmin_role: Role,
):
    """Should not allow modifying system role."""
    response = await client.patch(
        f"/api/v1/roles/{superadmin_role.id}",
        headers=superadmin_headers,
        json={
            "name": "Hacked Admin",
        },
    )

    assert response.status_code == 403
    data = response.json()
    assert data["code"] == "SYSTEM_ROLE_MODIFICATION"


# ROLE-INT-007: Cannot delete system role
@pytest.mark.asyncio
async def test_cannot_delete_system_role(
    client: AsyncClient,
    superadmin_headers: dict,
    superadmin_role: Role,
):
    """Should not allow deleting system role."""
    response = await client.delete(
        f"/api/v1/roles/{superadmin_role.id}",
        headers=superadmin_headers,
    )

    assert response.status_code == 403
    data = response.json()
    assert data["code"] == "SYSTEM_ROLE_MODIFICATION"


# ROLE-INT-008: Assign permissions to role
@pytest.mark.asyncio
async def test_assign_permissions_to_role(
    client: AsyncClient,
    db_session: AsyncSession,
    superadmin_headers: dict,
):
    """Should assign permissions to role."""
    # Create permissions
    perm1 = Permission(
        code="custom:read",
        name="Read Custom",
        resource="custom",
        action="read",
    )
    perm2 = Permission(
        code="custom:write",
        name="Write Custom",
        resource="custom",
        action="write",
    )
    db_session.add_all([perm1, perm2])
    await db_session.flush()

    # Create a role
    role = Role(
        code="permission_role",
        name="Permission Role",
        is_system=False,
    )
    db_session.add(role)
    await db_session.commit()
    await db_session.refresh(role)
    await db_session.refresh(perm1)
    await db_session.refresh(perm2)

    response = await client.put(
        f"/api/v1/roles/{role.id}/permissions",
        headers=superadmin_headers,
        json={"permission_ids": [perm1.id, perm2.id]},
    )

    assert response.status_code == 200

    # Verify permissions assigned
    await db_session.refresh(role)
    assert len(role.permissions) == 2


# ROLE-INT-009: Remove permission from role
@pytest.mark.asyncio
async def test_remove_permission_from_role(
    client: AsyncClient,
    db_session: AsyncSession,
    superadmin_headers: dict,
):
    """Should remove permission from role."""
    # Create a permission
    perm = Permission(
        code="removable:perm",
        name="Removable Permission",
        resource="removable",
        action="perm",
    )
    db_session.add(perm)
    await db_session.flush()

    # Create a role with the permission
    role = Role(
        code="perm_removal_role",
        name="Permission Removal Role",
        is_system=False,
    )
    role.permissions = [perm]
    db_session.add(role)
    await db_session.commit()
    await db_session.refresh(role)
    await db_session.refresh(perm)

    response = await client.delete(
        f"/api/v1/roles/{role.id}/permissions/{perm.id}",
        headers=superadmin_headers,
    )

    assert response.status_code == 200

    # Verify permission removed
    await db_session.refresh(role)
    assert len(role.permissions) == 0


# ROLE-INT-010: Duplicate role code fails
@pytest.mark.asyncio
async def test_duplicate_role_code_fails(
    client: AsyncClient,
    db_session: AsyncSession,
    superadmin_headers: dict,
):
    """Should fail to create role with duplicate code."""
    # Create first role
    role = Role(
        code="unique_code",
        name="First Role",
        is_system=False,
    )
    db_session.add(role)
    await db_session.commit()

    # Try to create second role with same code
    response = await client.post(
        "/api/v1/roles",
        headers=superadmin_headers,
        json={
            "code": "unique_code",
            "name": "Second Role",
        },
    )

    assert response.status_code == 409
    data = response.json()
    assert data["code"] == "ROLE_CODE_ALREADY_EXISTS"
