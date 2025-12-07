"""User API tests."""

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import StaticPool
from src.app.db import Base, get_db
from src.app.main import app

# Test database
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

engine = create_async_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

async_session_maker = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def override_get_db():
    async with async_session_maker() as session:
        yield session


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
async def setup_database():
    """Create tables before each test and drop after."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture
async def client():
    """Async test client."""
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as ac:
        yield ac


async def test_create_user(client):
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


async def test_create_user_duplicate_email(client):
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


async def test_list_users(client):
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


async def test_get_user(client):
    """Test getting a specific user."""
    create_response = await client.post(
        "/api/v1/users",
        json={"email": "test@example.com", "name": "Test User"},
    )
    user_id = create_response.json()["id"]

    response = await client.get(f"/api/v1/users/{user_id}")
    assert response.status_code == 200
    assert response.json()["email"] == "test@example.com"


async def test_get_user_not_found(client):
    """Test getting a non-existent user."""
    response = await client.get("/api/v1/users/999")
    assert response.status_code == 404


async def test_update_user(client):
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


async def test_delete_user(client):
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
    assert data["total"] == 0
    assert len(data["items"]) == 0
