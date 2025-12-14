"""Tests for authentication endpoints."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_register(client: AsyncClient):
    """Test user registration."""
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "newuser@example.com",
            "name": "New User",
            "password": "securepassword123",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "newuser@example.com"
    assert data["name"] == "New User"
    assert "id" in data
    assert "hashed_password" not in data


@pytest.mark.asyncio
async def test_register_duplicate_email(client: AsyncClient):
    """Test registration with duplicate email."""
    # First registration
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "duplicate@example.com",
            "name": "First User",
            "password": "securepassword123",
        },
    )

    # Second registration with same email
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "duplicate@example.com",
            "name": "Second User",
            "password": "anotherpassword123",
        },
    )
    assert response.status_code == 409
    data = response.json()
    assert data["detail"] == "Email is already registered."
    assert data["code"] == "EMAIL_ALREADY_EXISTS"


@pytest.mark.asyncio
async def test_register_password_too_short(client: AsyncClient):
    """Test registration with short password."""
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "shortpass@example.com",
            "name": "Short Pass User",
            "password": "short",
        },
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_register_name_empty(client: AsyncClient):
    """Test registration with empty name."""
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "emptyname@example.com",
            "name": "",
            "password": "securepassword123",
        },
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_register_name_too_long(client: AsyncClient):
    """Test registration with name exceeding max length."""
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "longname@example.com",
            "name": "A" * 101,  # 101 characters, max is 100
            "password": "securepassword123",
        },
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_register_password_too_long(client: AsyncClient):
    """Test registration with password exceeding max length."""
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "longpass@example.com",
            "name": "Long Pass User",
            "password": "A" * 129,  # 129 characters, max is 128
        },
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_login(client: AsyncClient):
    """Test user login."""
    # Register user first
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "loginuser@example.com",
            "name": "Login User",
            "password": "securepassword123",
        },
    )

    # Login
    response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "loginuser@example.com",
            "password": "securepassword123",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "Bearer"
    assert "expires_in" in data
    assert data["expires_in"] == 1800  # 30 minutes in seconds


@pytest.mark.asyncio
async def test_login_invalid_email(client: AsyncClient):
    """Test login with non-existent email."""
    response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "nonexistent@example.com",
            "password": "somepassword123",
        },
    )
    assert response.status_code == 401
    data = response.json()
    assert data["detail"] == "Invalid email or password."
    assert data["code"] == "INVALID_CREDENTIALS"


@pytest.mark.asyncio
async def test_login_invalid_password(client: AsyncClient):
    """Test login with wrong password."""
    # Register user first
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "wrongpass@example.com",
            "name": "Wrong Pass User",
            "password": "correctpassword123",
        },
    )

    # Login with wrong password
    response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "wrongpass@example.com",
            "password": "wrongpassword123",
        },
    )
    assert response.status_code == 401
    data = response.json()
    assert data["detail"] == "Invalid email or password."
    assert data["code"] == "INVALID_CREDENTIALS"


@pytest.mark.asyncio
async def test_refresh_token(client: AsyncClient):
    """Test token refresh."""
    # Register and login
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "refreshuser@example.com",
            "name": "Refresh User",
            "password": "securepassword123",
        },
    )
    login_response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "refreshuser@example.com",
            "password": "securepassword123",
        },
    )
    refresh_token = login_response.json()["refresh_token"]

    # Refresh token
    response = await client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": refresh_token},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert "expires_in" in data
    assert data["expires_in"] == 1800  # 30 minutes in seconds


@pytest.mark.asyncio
async def test_refresh_token_invalid(client: AsyncClient):
    """Test refresh with invalid token."""
    response = await client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": "invalid-token"},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_me(client: AsyncClient):
    """Test getting current user info."""
    # Register and login
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "meuser@example.com",
            "name": "Me User",
            "password": "securepassword123",
        },
    )
    login_response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "meuser@example.com",
            "password": "securepassword123",
        },
    )
    access_token = login_response.json()["access_token"]

    # Get current user
    response = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "meuser@example.com"
    assert data["name"] == "Me User"


@pytest.mark.asyncio
async def test_get_me_unauthorized(client: AsyncClient):
    """Test getting current user without token."""
    response = await client.get("/api/v1/auth/me")
    # HTTPBearer returns 401 when no token is provided
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_me_invalid_token(client: AsyncClient):
    """Test getting current user with invalid token."""
    response = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": "Bearer invalid-token"},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_logout(client: AsyncClient):
    """Test user logout."""
    # Register and login
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "logoutuser@example.com",
            "name": "Logout User",
            "password": "securepassword123",
        },
    )
    login_response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "logoutuser@example.com",
            "password": "securepassword123",
        },
    )
    access_token = login_response.json()["access_token"]

    # Logout
    response = await client.post(
        "/api/v1/auth/logout",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert data["message"] == "Logged out successfully"


@pytest.mark.asyncio
async def test_logout_unauthorized(client: AsyncClient):
    """Test logout without authentication."""
    response = await client.post("/api/v1/auth/logout")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_refresh_token_with_access_token(client: AsyncClient):
    """Test refresh with access token instead of refresh token."""
    # Register and login
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "accesstoken@example.com",
            "name": "Access Token User",
            "password": "securepassword123",
        },
    )
    login_response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "accesstoken@example.com",
            "password": "securepassword123",
        },
    )
    access_token = login_response.json()["access_token"]

    # Try to refresh with access token (should fail)
    response = await client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": access_token},
    )
    assert response.status_code == 401
    data = response.json()
    assert data["detail"] == "Invalid token type."
    assert data["code"] == "INVALID_TOKEN"


@pytest.mark.asyncio
async def test_login_inactive_user(client: AsyncClient, superadmin_headers: dict):
    """Test login with inactive user account."""
    # Register user
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "inactive@example.com",
            "name": "Inactive User",
            "password": "securepassword123",
        },
    )

    # Get the user ID and deactivate via users endpoint
    # First, list users to find our user
    users_response = await client.get("/api/v1/users", headers=superadmin_headers)
    users = users_response.json()["data"]
    user = next(u for u in users if u["email"] == "inactive@example.com")
    user_id = user["id"]

    # Deactivate the user
    await client.patch(
        f"/api/v1/users/{user_id}",
        json={"is_active": False},
        headers=superadmin_headers,
    )

    # Try to login with inactive user
    response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "inactive@example.com",
            "password": "securepassword123",
        },
    )
    assert response.status_code == 403
    data = response.json()
    assert data["detail"] == "User account is disabled."
    assert data["code"] == "INACTIVE_USER"


@pytest.mark.asyncio
async def test_refresh_token_inactive_user(
    client: AsyncClient, superadmin_headers: dict
):
    """Test refresh token with inactive user account."""
    # Register and login
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "inactiverefresh@example.com",
            "name": "Inactive Refresh User",
            "password": "securepassword123",
        },
    )
    login_response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "inactiverefresh@example.com",
            "password": "securepassword123",
        },
    )
    refresh_token = login_response.json()["refresh_token"]

    # Get the user ID and deactivate
    users_response = await client.get("/api/v1/users", headers=superadmin_headers)
    users = users_response.json()["data"]
    user = next(u for u in users if u["email"] == "inactiverefresh@example.com")
    user_id = user["id"]

    # Deactivate the user
    await client.patch(
        f"/api/v1/users/{user_id}",
        json={"is_active": False},
        headers=superadmin_headers,
    )

    # Try to refresh with inactive user
    response = await client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": refresh_token},
    )
    assert response.status_code == 403
    data = response.json()
    assert data["detail"] == "User account is disabled."
    assert data["code"] == "INACTIVE_USER"


@pytest.mark.asyncio
async def test_get_me_inactive_user(client: AsyncClient, superadmin_headers: dict):
    """Test getting current user info with inactive account."""
    # Register and login
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "inactiveme@example.com",
            "name": "Inactive Me User",
            "password": "securepassword123",
        },
    )
    login_response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "inactiveme@example.com",
            "password": "securepassword123",
        },
    )
    access_token = login_response.json()["access_token"]

    # Get the user ID and deactivate
    users_response = await client.get("/api/v1/users", headers=superadmin_headers)
    users = users_response.json()["data"]
    user = next(u for u in users if u["email"] == "inactiveme@example.com")
    user_id = user["id"]

    # Deactivate the user
    await client.patch(
        f"/api/v1/users/{user_id}",
        json={"is_active": False},
        headers=superadmin_headers,
    )

    # Try to get current user with inactive account
    response = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    assert response.status_code == 403
    data = response.json()
    assert data["detail"] == "User account is disabled."
    assert data["code"] == "INACTIVE_USER"


@pytest.mark.asyncio
async def test_get_me_with_refresh_token(client: AsyncClient):
    """Test getting current user with refresh token instead of access token."""
    # Register and login
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "refreshme@example.com",
            "name": "Refresh Me User",
            "password": "securepassword123",
        },
    )
    login_response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "refreshme@example.com",
            "password": "securepassword123",
        },
    )
    refresh_token = login_response.json()["refresh_token"]

    # Try to get current user with refresh token (should fail)
    response = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {refresh_token}"},
    )
    assert response.status_code == 401
    data = response.json()
    assert data["detail"] == "Invalid token type."
    assert data["code"] == "INVALID_TOKEN"
