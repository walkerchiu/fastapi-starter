"""Shared test fixtures."""

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from src.app.db.base import Base
from src.app.db.session import get_db
from src.app.main import app
from src.app.middleware.rate_limit import RateLimiter

# Use in-memory SQLite for tests
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

test_engine = create_async_engine(TEST_DATABASE_URL, echo=False)
test_async_session_maker = async_sessionmaker(
    test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def override_get_db():
    """Override database dependency for tests."""
    async with test_async_session_maker() as session:
        yield session


@pytest.fixture(autouse=True)
async def setup_database():
    """Create tables before each test and drop after."""
    # Reset rate limiter before each test
    RateLimiter.get_instance().reset()

    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture
async def client():
    """Create async test client with overridden database."""
    app.dependency_overrides[get_db] = override_get_db
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        yield ac
    app.dependency_overrides.clear()


@pytest.fixture
async def db_session():
    """Provide a database session for tests that need direct DB access."""
    async with test_async_session_maker() as session:
        yield session


@pytest.fixture
async def auth_headers(client: AsyncClient) -> dict[str, str]:
    """Create a test user and return authentication headers."""
    # Register test user
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "testuser@example.com",
            "name": "Test User",
            "password": "testpassword123",
        },
    )
    # Login to get access token
    login_response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "testuser@example.com",
            "password": "testpassword123",
        },
    )
    access_token = login_response.json()["access_token"]
    return {"Authorization": f"Bearer {access_token}"}
