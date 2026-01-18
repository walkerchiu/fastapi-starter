"""Shared test fixtures."""

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from src.app.core.security import get_password_hash
from src.app.db.base import Base
from src.app.db.session import get_db
from src.app.main import app
from src.app.middleware.rate_limit import RateLimiter
from src.app.models import Permission, Role, User

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


@pytest.fixture
async def auth_with_user_id(client: AsyncClient) -> tuple[dict[str, str], str]:
    """Create a test user and return authentication headers with user ID."""
    # Register test user
    register_response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "testuser@example.com",
            "name": "Test User",
            "password": "testpassword123",
        },
    )
    user_id = register_response.json()["id"]

    # Login to get access token
    login_response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "testuser@example.com",
            "password": "testpassword123",
        },
    )
    access_token = login_response.json()["access_token"]
    return {"Authorization": f"Bearer {access_token}"}, user_id


@pytest.fixture
async def superadmin_headers(client: AsyncClient, db_session: AsyncSession) -> dict:
    """Create a superadmin user with all permissions and return auth headers."""
    # Create all 19 permissions (must match seeds.py)
    all_permissions = [
        # User management
        ("users:read", "Read Users"),
        ("users:create", "Create Users"),
        ("users:update", "Update Users"),
        ("users:delete", "Delete Users"),
        ("users:hard_delete", "Hard Delete Users"),
        # Role management
        ("roles:read", "Read Roles"),
        ("roles:create", "Create Roles"),
        ("roles:update", "Update Roles"),
        ("roles:delete", "Delete Roles"),
        ("roles:hard_delete", "Hard Delete Roles"),
        # Permission management
        ("permissions:read", "Read Permissions"),
        ("permissions:create", "Create Permissions"),
        ("permissions:update", "Update Permissions"),
        ("permissions:delete", "Delete Permissions"),
        ("permissions:hard_delete", "Hard Delete Permissions"),
        # File management
        ("files:read", "Read Files"),
        ("files:create", "Create Files"),
        ("files:delete", "Delete Files"),
        ("files:hard_delete", "Hard Delete Files"),
    ]

    permissions = []
    for code, name in all_permissions:
        resource, action = code.split(":")
        perm = Permission(code=code, name=name, resource=resource, action=action)
        db_session.add(perm)
        permissions.append(perm)
    await db_session.flush()

    # Create superadmin role
    superadmin_role = Role(
        code="super_admin",
        name="Super Administrator",
        is_system=True,
    )
    superadmin_role.permissions = permissions
    db_session.add(superadmin_role)
    await db_session.flush()

    # Create superadmin user
    superadmin_user = User(
        email="superadmin@example.com",
        name="Super Admin",
        hashed_password=get_password_hash("superadmin123"),
        is_active=True,
    )
    superadmin_user.roles = [superadmin_role]
    db_session.add(superadmin_user)
    await db_session.commit()

    # Login to get access token
    login_response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "superadmin@example.com",
            "password": "superadmin123",
        },
    )
    access_token = login_response.json()["access_token"]
    return {"Authorization": f"Bearer {access_token}"}


@pytest.fixture
async def admin_headers(client: AsyncClient, db_session: AsyncSession) -> dict:
    """Create an admin user with read permissions and return auth headers."""
    # Create read-only permissions for testing
    read_permissions = [
        ("users:read", "Read Users"),
        ("roles:read", "Read Roles"),
        ("permissions:read", "Read Permissions"),
        ("files:read", "Read Files"),
    ]

    permissions = []
    for code, name in read_permissions:
        resource, action = code.split(":")
        perm = Permission(code=code, name=name, resource=resource, action=action)
        db_session.add(perm)
        permissions.append(perm)
    await db_session.flush()

    # Create admin role
    admin_role = Role(
        code="admin",
        name="Administrator",
        is_system=False,
    )
    admin_role.permissions = permissions
    db_session.add(admin_role)
    await db_session.flush()

    # Create admin user
    admin_user = User(
        email="admin@example.com",
        name="Admin",
        hashed_password=get_password_hash("admin123"),
        is_active=True,
    )
    admin_user.roles = [admin_role]
    db_session.add(admin_user)
    await db_session.commit()

    # Login to get access token
    login_response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "admin@example.com",
            "password": "admin123",
        },
    )
    access_token = login_response.json()["access_token"]
    return {"Authorization": f"Bearer {access_token}"}
