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
    assert response.json()["detail"] == "Email already registered"


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
    assert response.json()["detail"] == "Invalid email or password"


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
    assert response.json()["detail"] == "Invalid email or password"


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
