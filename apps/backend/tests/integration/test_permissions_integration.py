"""Permissions integration tests.

Tests: 5
- PERM-INT-001 to PERM-INT-005

These tests verify permission management functionality including:
- CRUD operations
"""

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from src.app.models import Permission


# PERM-INT-001: List permissions
@pytest.mark.asyncio
async def test_list_permissions(
    client: AsyncClient,
    superadmin_headers: dict,
    all_permissions: list[Permission],
):
    """Should return list of permissions."""
    response = await client.get(
        "/api/v1/permissions",
        headers=superadmin_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert len(data["data"]) == 20  # 20 permissions from all_permissions fixture


# PERM-INT-002: Get single permission
@pytest.mark.asyncio
async def test_get_single_permission(
    client: AsyncClient,
    db_session: AsyncSession,
    superadmin_headers: dict,
):
    """Should return single permission by ID."""
    # Create a permission
    perm = Permission(
        code="test:read",
        name="Test Read",
        resource="test",
        action="read",
    )
    db_session.add(perm)
    await db_session.commit()
    await db_session.refresh(perm)

    response = await client.get(
        f"/api/v1/permissions/{perm.id}",
        headers=superadmin_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["code"] == "test:read"
    assert data["name"] == "Test Read"


# PERM-INT-003: Create new permission
@pytest.mark.asyncio
async def test_create_permission(
    client: AsyncClient,
    superadmin_headers: dict,
):
    """Should create a new permission."""
    response = await client.post(
        "/api/v1/permissions",
        headers=superadmin_headers,
        json={
            "code": "custom:action",
            "name": "Custom Action",
            "resource": "custom",
            "action": "action",
            "description": "A custom permission",
        },
    )

    assert response.status_code == 201
    data = response.json()
    assert data["code"] == "custom:action"
    assert data["name"] == "Custom Action"
    assert data["resource"] == "custom"
    assert data["action"] == "action"


# PERM-INT-004: Update permission description
@pytest.mark.asyncio
async def test_update_permission(
    client: AsyncClient,
    db_session: AsyncSession,
    superadmin_headers: dict,
):
    """Should update permission description."""
    # Create a permission
    perm = Permission(
        code="update:test",
        name="Update Test",
        resource="update",
        action="test",
    )
    db_session.add(perm)
    await db_session.commit()
    await db_session.refresh(perm)

    response = await client.patch(
        f"/api/v1/permissions/{perm.id}",
        headers=superadmin_headers,
        json={
            "description": "Updated description for permission",
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["description"] == "Updated description for permission"


# PERM-INT-005: Delete permission
@pytest.mark.asyncio
async def test_delete_permission(
    client: AsyncClient,
    db_session: AsyncSession,
    superadmin_headers: dict,
):
    """Should delete permission."""
    # Create a permission
    perm = Permission(
        code="delete:test",
        name="Delete Test",
        resource="delete",
        action="test",
    )
    db_session.add(perm)
    await db_session.commit()
    perm_id = perm.id

    response = await client.delete(
        f"/api/v1/permissions/{perm_id}",
        headers=superadmin_headers,
    )

    assert response.status_code == 200

    # Verify soft deleted
    await db_session.refresh(perm)
    assert perm.deleted_at is not None
