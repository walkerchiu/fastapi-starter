"""Permission API tests."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_permission(client: AsyncClient, superadmin_headers: dict):
    """Test creating a new permission."""
    response = await client.post(
        "/api/v1/permissions",
        json={
            "code": "posts:read",
            "name": "Posts Read",
            "description": "Permission to read posts",
        },
        headers=superadmin_headers,
    )
    assert response.status_code == 201
    data = response.json()
    assert data["code"] == "posts:read"
    assert data["name"] == "Posts Read"
    assert data["description"] == "Permission to read posts"
    assert "id" in data
    assert "created_at" in data


@pytest.mark.asyncio
async def test_create_permission_unauthorized(client: AsyncClient):
    """Test creating a permission without authentication."""
    response = await client.post(
        "/api/v1/permissions",
        json={"code": "posts:read", "name": "Posts Read"},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_create_permission_non_superadmin(
    client: AsyncClient, admin_headers: dict
):
    """Test creating a permission with non-superadmin role."""
    response = await client.post(
        "/api/v1/permissions",
        json={"code": "posts:read", "name": "Posts Read"},
        headers=admin_headers,
    )
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_create_permission_duplicate_code(
    client: AsyncClient, superadmin_headers: dict
):
    """Test creating a permission with duplicate code."""
    await client.post(
        "/api/v1/permissions",
        json={"code": "posts:read", "name": "Posts Read"},
        headers=superadmin_headers,
    )
    response = await client.post(
        "/api/v1/permissions",
        json={"code": "posts:read", "name": "Another Name"},
        headers=superadmin_headers,
    )
    assert response.status_code == 409
    data = response.json()
    assert data["detail"] == "Permission code already exists."
    assert data["code"] == "PERMISSION_CODE_ALREADY_EXISTS"


@pytest.mark.asyncio
async def test_create_permission_minimal(client: AsyncClient, superadmin_headers: dict):
    """Test creating a permission with minimal fields."""
    response = await client.post(
        "/api/v1/permissions",
        json={"code": "posts:read", "name": "Posts Read"},
        headers=superadmin_headers,
    )
    assert response.status_code == 201
    data = response.json()
    assert data["code"] == "posts:read"
    assert data["name"] == "Posts Read"
    assert data["description"] is None


@pytest.mark.asyncio
async def test_list_permissions(client: AsyncClient, superadmin_headers: dict):
    """Test listing permissions with pagination."""
    # Create some permissions
    await client.post(
        "/api/v1/permissions",
        json={"code": "posts:read", "name": "Posts Read"},
        headers=superadmin_headers,
    )
    await client.post(
        "/api/v1/permissions",
        json={"code": "posts:create", "name": "Posts Create"},
        headers=superadmin_headers,
    )

    response = await client.get("/api/v1/permissions", headers=superadmin_headers)
    assert response.status_code == 200
    data = response.json()
    # Include permissions created by superadmin_headers fixture
    assert data["meta"]["total_items"] >= 2
    assert "data" in data
    assert "has_next_page" in data["meta"]


@pytest.mark.asyncio
async def test_list_permissions_pagination(
    client: AsyncClient, superadmin_headers: dict
):
    """Test listing permissions with pagination parameters."""
    # Create some permissions (using codes not seeded in fixtures)
    codes = [
        "posts:read",
        "posts:create",
        "posts:update",
        "posts:delete",
        "comments:read",
    ]
    for i, code in enumerate(codes):
        await client.post(
            "/api/v1/permissions",
            json={"code": code, "name": f"Permission {i}"},
            headers=superadmin_headers,
        )

    response = await client.get(
        "/api/v1/permissions?page=2&limit=2", headers=superadmin_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data["data"]) == 2
    assert "has_next_page" in data["meta"]


@pytest.mark.asyncio
async def test_get_permission(client: AsyncClient, superadmin_headers: dict):
    """Test getting a permission by ID."""
    create_response = await client.post(
        "/api/v1/permissions",
        json={"code": "posts:read", "name": "Posts Read"},
        headers=superadmin_headers,
    )
    permission_id = create_response.json()["id"]

    response = await client.get(
        f"/api/v1/permissions/{permission_id}", headers=superadmin_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == permission_id
    assert data["code"] == "posts:read"
    assert data["name"] == "Posts Read"


@pytest.mark.asyncio
async def test_get_permission_not_found(client: AsyncClient, superadmin_headers: dict):
    """Test getting a non-existent permission."""
    response = await client.get("/api/v1/permissions/999", headers=superadmin_headers)
    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == "Permission not found."
    assert data["code"] == "PERMISSION_NOT_FOUND"


@pytest.mark.asyncio
async def test_get_permission_by_code(client: AsyncClient, superadmin_headers: dict):
    """Test getting a permission by code."""
    create_response = await client.post(
        "/api/v1/permissions",
        json={
            "code": "posts:read",
            "name": "Posts Read",
            "description": "Permission to read posts",
        },
        headers=superadmin_headers,
    )
    assert create_response.status_code == 201

    response = await client.get(
        "/api/v1/permissions/code/posts:read", headers=superadmin_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["code"] == "posts:read"
    assert data["name"] == "Posts Read"
    assert data["description"] == "Permission to read posts"


@pytest.mark.asyncio
async def test_get_permission_by_code_not_found(
    client: AsyncClient, superadmin_headers: dict
):
    """Test getting a non-existent permission by code."""
    response = await client.get(
        "/api/v1/permissions/code/nonexistent:code", headers=superadmin_headers
    )
    assert response.status_code == 404
    data = response.json()
    assert "not found" in data["detail"].lower()
    assert data["code"] == "NOT_FOUND"


@pytest.mark.asyncio
async def test_update_permission(client: AsyncClient, superadmin_headers: dict):
    """Test updating a permission."""
    create_response = await client.post(
        "/api/v1/permissions",
        json={"code": "posts:read", "name": "Posts Read"},
        headers=superadmin_headers,
    )
    permission_id = create_response.json()["id"]

    response = await client.patch(
        f"/api/v1/permissions/{permission_id}",
        json={"name": "Updated Name", "description": "Updated description"},
        headers=superadmin_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Name"
    assert data["description"] == "Updated description"
    assert data["code"] == "posts:read"  # Code should not change


@pytest.mark.asyncio
async def test_update_permission_partial(client: AsyncClient, superadmin_headers: dict):
    """Test partial update of a permission."""
    create_response = await client.post(
        "/api/v1/permissions",
        json={
            "code": "posts:read",
            "name": "Posts Read",
            "description": "Original description",
        },
        headers=superadmin_headers,
    )
    permission_id = create_response.json()["id"]

    response = await client.patch(
        f"/api/v1/permissions/{permission_id}",
        json={"name": "Updated Name"},
        headers=superadmin_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Name"
    assert data["description"] == "Original description"  # Should be unchanged


@pytest.mark.asyncio
async def test_update_permission_not_found(
    client: AsyncClient, superadmin_headers: dict
):
    """Test updating a non-existent permission."""
    response = await client.patch(
        "/api/v1/permissions/999",
        json={"name": "Updated Name"},
        headers=superadmin_headers,
    )
    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == "Permission not found."
    assert data["code"] == "PERMISSION_NOT_FOUND"


@pytest.mark.asyncio
async def test_delete_permission(client: AsyncClient, superadmin_headers: dict):
    """Test deleting a permission."""
    create_response = await client.post(
        "/api/v1/permissions",
        json={"code": "posts:read", "name": "Posts Read"},
        headers=superadmin_headers,
    )
    permission_id = create_response.json()["id"]

    response = await client.delete(
        f"/api/v1/permissions/{permission_id}", headers=superadmin_headers
    )
    assert response.status_code == 200
    assert response.json()["message"] == "Permission deleted successfully"

    # Verify deletion
    get_response = await client.get(
        f"/api/v1/permissions/{permission_id}", headers=superadmin_headers
    )
    assert get_response.status_code == 404


@pytest.mark.asyncio
async def test_delete_permission_not_found(
    client: AsyncClient, superadmin_headers: dict
):
    """Test deleting a non-existent permission."""
    response = await client.delete(
        "/api/v1/permissions/999", headers=superadmin_headers
    )
    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == "Permission not found."
    assert data["code"] == "PERMISSION_NOT_FOUND"


@pytest.mark.asyncio
async def test_list_permissions_with_read_permission(
    client: AsyncClient, admin_headers: dict
):
    """Test listing permissions with read-only permission."""
    # admin_headers has permissions:read permission
    response = await client.get("/api/v1/permissions", headers=admin_headers)
    assert response.status_code == 200
