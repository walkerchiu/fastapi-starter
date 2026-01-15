"""User API tests."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_user(client: AsyncClient):
    """Test creating a new user."""
    response = await client.post(
        "/api/v1/users",
        json={"email": "test@example.com", "name": "Test User"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["name"] == "Test User"
    assert data["is_active"] is True
    assert "id" in data
    assert "created_at" in data


@pytest.mark.asyncio
async def test_create_user_duplicate_email(client: AsyncClient):
    """Test creating a user with duplicate email."""
    await client.post(
        "/api/v1/users",
        json={"email": "test@example.com", "name": "Test User"},
    )
    response = await client.post(
        "/api/v1/users",
        json={"email": "test@example.com", "name": "Another User"},
    )
    assert response.status_code == 409
    assert "already registered" in response.json()["detail"]


@pytest.mark.asyncio
async def test_list_users(client: AsyncClient):
    """Test listing users."""
    # Create some users
    await client.post(
        "/api/v1/users",
        json={"email": "user1@example.com", "name": "User 1"},
    )
    await client.post(
        "/api/v1/users",
        json={"email": "user2@example.com", "name": "User 2"},
    )

    response = await client.get("/api/v1/users")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2


@pytest.mark.asyncio
async def test_get_user(client: AsyncClient):
    """Test getting a specific user."""
    create_response = await client.post(
        "/api/v1/users",
        json={"email": "test@example.com", "name": "Test User"},
    )
    user_id = create_response.json()["id"]

    response = await client.get(f"/api/v1/users/{user_id}")
    assert response.status_code == 200
    assert response.json()["email"] == "test@example.com"


@pytest.mark.asyncio
async def test_get_user_not_found(client: AsyncClient):
    """Test getting a non-existent user."""
    response = await client.get("/api/v1/users/999")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_update_user(client: AsyncClient):
    """Test updating a user."""
    create_response = await client.post(
        "/api/v1/users",
        json={"email": "test@example.com", "name": "Test User"},
    )
    user_id = create_response.json()["id"]

    response = await client.patch(
        f"/api/v1/users/{user_id}",
        json={"name": "Updated Name"},
    )
    assert response.status_code == 200
    assert response.json()["name"] == "Updated Name"
    assert response.json()["email"] == "test@example.com"


@pytest.mark.asyncio
async def test_delete_user(client: AsyncClient):
    """Test deleting a user."""
    create_response = await client.post(
        "/api/v1/users",
        json={"email": "test@example.com", "name": "Test User"},
    )
    user_id = create_response.json()["id"]

    response = await client.delete(f"/api/v1/users/{user_id}")
    assert response.status_code == 200
    assert response.json()["message"] == "User deleted successfully"

    # Verify user is deleted
    get_response = await client.get(f"/api/v1/users/{user_id}")
    assert get_response.status_code == 404


@pytest.mark.asyncio
async def test_update_user_not_found(client: AsyncClient):
    """Test updating a non-existent user."""
    response = await client.patch(
        "/api/v1/users/999",
        json={"name": "Updated Name"},
    )
    assert response.status_code == 404
    assert response.json()["detail"] == "User not found"


@pytest.mark.asyncio
async def test_delete_user_not_found(client: AsyncClient):
    """Test deleting a non-existent user."""
    response = await client.delete("/api/v1/users/999")
    assert response.status_code == 404
    assert response.json()["detail"] == "User not found"


@pytest.mark.asyncio
async def test_update_user_partial(client: AsyncClient):
    """Test partial update of a user."""
    create_response = await client.post(
        "/api/v1/users",
        json={"email": "test@example.com", "name": "Test User"},
    )
    user_id = create_response.json()["id"]

    # Update only is_active field
    response = await client.patch(
        f"/api/v1/users/{user_id}",
        json={"is_active": False},
    )
    assert response.status_code == 200
    assert response.json()["is_active"] is False
    assert response.json()["name"] == "Test User"


@pytest.mark.asyncio
async def test_list_users_empty(client: AsyncClient):
    """Test listing users when no users exist."""
    response = await client.get("/api/v1/users")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 0
