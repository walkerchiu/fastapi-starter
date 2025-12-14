"""User API tests."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_user(client: AsyncClient, superadmin_headers: dict):
    """Test creating a new user."""
    response = await client.post(
        "/api/v1/users",
        json={"email": "test@example.com", "name": "Test User"},
        headers=superadmin_headers,
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["name"] == "Test User"
    assert data["is_active"] is True
    assert "id" in data
    assert "created_at" in data


@pytest.mark.asyncio
async def test_create_user_unauthorized(client: AsyncClient):
    """Test creating a user without authentication."""
    response = await client.post(
        "/api/v1/users",
        json={"email": "test@example.com", "name": "Test User"},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_create_user_duplicate_email(
    client: AsyncClient, superadmin_headers: dict
):
    """Test creating a user with duplicate email."""
    await client.post(
        "/api/v1/users",
        json={"email": "test@example.com", "name": "Test User"},
        headers=superadmin_headers,
    )
    response = await client.post(
        "/api/v1/users",
        json={"email": "test@example.com", "name": "Another User"},
        headers=superadmin_headers,
    )
    assert response.status_code == 409
    data = response.json()
    assert data["detail"] == "Email is already registered."
    assert data["code"] == "EMAIL_ALREADY_EXISTS"


@pytest.mark.asyncio
async def test_create_user_name_empty(client: AsyncClient, superadmin_headers: dict):
    """Test creating a user with empty name."""
    response = await client.post(
        "/api/v1/users",
        json={"email": "emptyname@example.com", "name": ""},
        headers=superadmin_headers,
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_create_user_name_too_long(client: AsyncClient, superadmin_headers: dict):
    """Test creating a user with name exceeding max length."""
    response = await client.post(
        "/api/v1/users",
        json={"email": "longname@example.com", "name": "A" * 101},
        headers=superadmin_headers,
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_update_user_name_empty(client: AsyncClient, superadmin_headers: dict):
    """Test updating a user with empty name."""
    create_response = await client.post(
        "/api/v1/users",
        json={"email": "test@example.com", "name": "Test User"},
        headers=superadmin_headers,
    )
    user_id = create_response.json()["id"]

    response = await client.patch(
        f"/api/v1/users/{user_id}",
        json={"name": ""},
        headers=superadmin_headers,
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_update_user_name_too_long(client: AsyncClient, superadmin_headers: dict):
    """Test updating a user with name exceeding max length."""
    create_response = await client.post(
        "/api/v1/users",
        json={"email": "test@example.com", "name": "Test User"},
        headers=superadmin_headers,
    )
    user_id = create_response.json()["id"]

    response = await client.patch(
        f"/api/v1/users/{user_id}",
        json={"name": "A" * 101},
        headers=superadmin_headers,
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_list_users(client: AsyncClient, superadmin_headers: dict):
    """Test listing users with pagination."""
    # Create some users
    await client.post(
        "/api/v1/users",
        json={"email": "user1@example.com", "name": "User 1"},
        headers=superadmin_headers,
    )
    await client.post(
        "/api/v1/users",
        json={"email": "user2@example.com", "name": "User 2"},
        headers=superadmin_headers,
    )

    response = await client.get("/api/v1/users", headers=superadmin_headers)
    assert response.status_code == 200
    data = response.json()
    # Include superadmin user created by fixture
    assert data["meta"]["total_items"] >= 2
    assert "data" in data
    assert "meta" in data


@pytest.mark.asyncio
async def test_list_users_unauthorized(client: AsyncClient):
    """Test listing users without authentication."""
    response = await client.get("/api/v1/users")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_list_users_pagination(client: AsyncClient, superadmin_headers: dict):
    """Test listing users with custom pagination parameters."""
    # Create some users
    for i in range(5):
        await client.post(
            "/api/v1/users",
            json={"email": f"user{i}@example.com", "name": f"User {i}"},
            headers=superadmin_headers,
        )

    # Test with limit
    response = await client.get("/api/v1/users?limit=2", headers=superadmin_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data["data"]) == 2
    assert data["meta"]["has_next_page"] is True


@pytest.mark.asyncio
async def test_list_users_pagination_validation(
    client: AsyncClient, superadmin_headers: dict
):
    """Test pagination parameter validation."""
    # Test invalid page (zero, page starts from 1)
    response = await client.get("/api/v1/users?page=0", headers=superadmin_headers)
    assert response.status_code == 422

    # Test invalid limit (zero)
    response = await client.get("/api/v1/users?limit=0", headers=superadmin_headers)
    assert response.status_code == 422

    # Test invalid limit (too large)
    response = await client.get("/api/v1/users?limit=101", headers=superadmin_headers)
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_get_user(client: AsyncClient, superadmin_headers: dict):
    """Test getting a specific user."""
    create_response = await client.post(
        "/api/v1/users",
        json={"email": "test@example.com", "name": "Test User"},
        headers=superadmin_headers,
    )
    user_id = create_response.json()["id"]

    response = await client.get(f"/api/v1/users/{user_id}", headers=superadmin_headers)
    assert response.status_code == 200
    assert response.json()["email"] == "test@example.com"


@pytest.mark.asyncio
async def test_get_user_not_found(client: AsyncClient, superadmin_headers: dict):
    """Test getting a non-existent user."""
    response = await client.get("/api/v1/users/999", headers=superadmin_headers)
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_update_user(client: AsyncClient, superadmin_headers: dict):
    """Test updating a user."""
    create_response = await client.post(
        "/api/v1/users",
        json={"email": "test@example.com", "name": "Test User"},
        headers=superadmin_headers,
    )
    user_id = create_response.json()["id"]

    response = await client.patch(
        f"/api/v1/users/{user_id}",
        json={"name": "Updated Name"},
        headers=superadmin_headers,
    )
    assert response.status_code == 200
    assert response.json()["name"] == "Updated Name"
    assert response.json()["email"] == "test@example.com"


@pytest.mark.asyncio
async def test_delete_user(client: AsyncClient, superadmin_headers: dict):
    """Test deleting a user."""
    create_response = await client.post(
        "/api/v1/users",
        json={"email": "test@example.com", "name": "Test User"},
        headers=superadmin_headers,
    )
    user_id = create_response.json()["id"]

    response = await client.delete(
        f"/api/v1/users/{user_id}", headers=superadmin_headers
    )
    assert response.status_code == 200
    assert response.json()["message"] == "User deleted successfully"

    # Verify user is deleted
    get_response = await client.get(
        f"/api/v1/users/{user_id}", headers=superadmin_headers
    )
    assert get_response.status_code == 404


@pytest.mark.asyncio
async def test_update_user_not_found(client: AsyncClient, superadmin_headers: dict):
    """Test updating a non-existent user."""
    response = await client.patch(
        "/api/v1/users/999",
        json={"name": "Updated Name"},
        headers=superadmin_headers,
    )
    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == "User not found."
    assert data["code"] == "USER_NOT_FOUND"
    assert data["errors"]["resource"] == "User"
    assert data["errors"]["id"] == 999


@pytest.mark.asyncio
async def test_delete_user_not_found(client: AsyncClient, superadmin_headers: dict):
    """Test deleting a non-existent user."""
    response = await client.delete("/api/v1/users/999", headers=superadmin_headers)
    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == "User not found."
    assert data["code"] == "USER_NOT_FOUND"
    assert data["errors"]["resource"] == "User"
    assert data["errors"]["id"] == 999


@pytest.mark.asyncio
async def test_update_user_partial(client: AsyncClient, superadmin_headers: dict):
    """Test partial update of a user."""
    create_response = await client.post(
        "/api/v1/users",
        json={"email": "test@example.com", "name": "Test User"},
        headers=superadmin_headers,
    )
    user_id = create_response.json()["id"]

    # Update only is_active field
    response = await client.patch(
        f"/api/v1/users/{user_id}",
        json={"is_active": False},
        headers=superadmin_headers,
    )
    assert response.status_code == 200
    assert response.json()["is_active"] is False
    assert response.json()["name"] == "Test User"


@pytest.mark.asyncio
async def test_list_users_empty(client: AsyncClient, superadmin_headers: dict):
    """Test listing users when only superadmin exists."""
    response = await client.get("/api/v1/users", headers=superadmin_headers)
    assert response.status_code == 200
    data = response.json()
    # Only superadmin user from fixture exists
    assert data["meta"]["total_items"] == 1


@pytest.mark.asyncio
async def test_insufficient_permissions(client: AsyncClient, admin_headers: dict):
    """Test creating a user with insufficient permissions."""
    # admin_headers only has read permissions, not create
    response = await client.post(
        "/api/v1/users",
        json={"email": "test@example.com", "name": "Test User"},
        headers=admin_headers,
    )
    assert response.status_code == 403
    data = response.json()
    assert data["code"] == "INSUFFICIENT_PERMISSIONS"
