"""Integration test fixtures.

These fixtures extend the base test fixtures with additional helpers
specific to integration testing.
"""

import os
import uuid
from datetime import UTC, datetime
from typing import Any
from unittest.mock import patch

import pyotp
import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from src.app.core.config import settings
from src.app.core.security import get_password_hash
from src.app.db.base import Base
from src.app.db.session import get_db
from src.app.main import app
from src.app.middleware.rate_limit import RateLimiter
from src.app.models import Permission, Role, User
from src.app.services.exceptions import (
    FileNotFoundError as StorageFileNotFoundError,
)
from src.app.services.exceptions import (
    FileTooLargeError,
    InvalidFileTypeError,
)

# Use in-memory SQLite for tests
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


class MockStorageService:
    """Mock implementation of StorageService for testing."""

    def __init__(self) -> None:
        self.files: dict[str, dict[str, Any]] = {}

    def _generate_key(self, filename: str, prefix: str = "") -> str:
        """Generate unique storage key for file."""
        ext = os.path.splitext(filename)[1].lower()
        timestamp = datetime.now(UTC).strftime("%Y/%m/%d")
        unique_id = uuid.uuid4().hex[:12]
        base_name = os.path.splitext(filename)[0][:50]

        if prefix:
            return f"{prefix}/{timestamp}/{unique_id}_{base_name}{ext}"
        return f"{timestamp}/{unique_id}_{base_name}{ext}"

    async def ensure_bucket_exists(self) -> bool:
        """Mock: Always returns True."""
        return True

    async def upload_file(
        self,
        file_content: bytes,
        filename: str,
        content_type: str | None = None,
        prefix: str = "",
    ) -> dict[str, Any]:
        """Mock: Store file in memory."""
        file_size = len(file_content)

        # Validate file size
        if file_size > settings.s3_max_file_size:
            raise FileTooLargeError(
                f"File size {file_size} exceeds maximum allowed size "
                f"{settings.s3_max_file_size}"
            )

        # Validate file type
        ext = os.path.splitext(filename)[1].lower()
        if ext not in settings.s3_allowed_extensions:
            raise InvalidFileTypeError(
                f"File type '{ext}' is not allowed. "
                f"Allowed types: {settings.s3_allowed_extensions}"
            )

        key = self._generate_key(filename, prefix)

        metadata = {
            "key": key,
            "size": file_size,
            "content_type": content_type,
            "bucket": "test-bucket",
            "content": file_content,
        }
        self.files[key] = metadata

        return {
            "key": key,
            "size": file_size,
            "content_type": content_type,
            "bucket": "test-bucket",
        }

    async def download_file(self, key: str) -> tuple[bytes, dict[str, Any]]:
        """Mock: Retrieve file from memory."""
        if key not in self.files:
            raise StorageFileNotFoundError(f"File not found: {key}")

        file_data = self.files[key]
        metadata = {
            "content_type": file_data.get("content_type"),
            "size": file_data.get("size"),
            "last_modified": datetime.now(UTC),
        }
        return file_data.get("content", b"mock file content"), metadata

    async def delete_file(self, key: str) -> bool:
        """Mock: Remove file from memory."""
        if key in self.files:
            del self.files[key]
        return True

    async def get_presigned_url(
        self, key: str, expires_in: int = 3600, method: str = "get_object"
    ) -> str:
        """Mock: Return a fake presigned URL."""
        return f"http://mock-s3/{key}?signed=true&expires={expires_in}"

    async def list_files(
        self, prefix: str = "", max_keys: int = 100
    ) -> list[dict[str, Any]]:
        """Mock: List files from memory."""
        files = []
        count = 0
        for key, metadata in self.files.items():
            if prefix == "" or key.startswith(prefix):
                files.append(
                    {
                        "key": key,
                        "size": metadata.get("size", 0),
                        "last_modified": datetime.now(UTC),
                    }
                )
                count += 1
                if count >= max_keys:
                    break
        return files

    async def file_exists(self, key: str) -> bool:
        """Mock: Check if file exists in memory."""
        # For files created directly in DB, assume they exist
        return True


# Global mock storage instance
mock_storage_service = MockStorageService()

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
    RateLimiter.get_instance().reset()

    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture
async def client():
    """Create async test client with overridden database and storage."""
    app.dependency_overrides[get_db] = override_get_db

    # Reset mock storage for each test
    mock_storage_service.files.clear()

    # Patch the storage_service in api.files and graphql.resolvers.files modules
    with (
        patch("src.app.api.files.storage_service", mock_storage_service),
        patch("src.app.graphql.resolvers.files.storage_service", mock_storage_service),
    ):
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
async def all_permissions(db_session: AsyncSession) -> list[Permission]:
    """Create all 20 permissions as defined in specs."""
    permissions_data = [
        ("users:create", "Create Users", "users", "create"),
        ("users:read", "Read Users", "users", "read"),
        ("users:update", "Update Users", "users", "update"),
        ("users:delete", "Delete Users", "users", "delete"),
        ("users:hard_delete", "Hard Delete Users", "users", "hard_delete"),
        ("roles:create", "Create Roles", "roles", "create"),
        ("roles:read", "Read Roles", "roles", "read"),
        ("roles:update", "Update Roles", "roles", "update"),
        ("roles:delete", "Delete Roles", "roles", "delete"),
        ("roles:hard_delete", "Hard Delete Roles", "roles", "hard_delete"),
        ("permissions:create", "Create Permissions", "permissions", "create"),
        ("permissions:read", "Read Permissions", "permissions", "read"),
        ("permissions:update", "Update Permissions", "permissions", "update"),
        ("permissions:delete", "Delete Permissions", "permissions", "delete"),
        (
            "permissions:hard_delete",
            "Hard Delete Permissions",
            "permissions",
            "hard_delete",
        ),
        ("files:create", "Create Files", "files", "create"),
        ("files:read", "Read Files", "files", "read"),
        ("files:update", "Update Files", "files", "update"),
        ("files:delete", "Delete Files", "files", "delete"),
        ("files:hard_delete", "Hard Delete Files", "files", "hard_delete"),
    ]

    permissions = []
    for code, name, resource, action in permissions_data:
        perm = Permission(code=code, name=name, resource=resource, action=action)
        db_session.add(perm)
        permissions.append(perm)
    await db_session.flush()
    return permissions


@pytest.fixture
async def superadmin_role(
    db_session: AsyncSession, all_permissions: list[Permission]
) -> Role:
    """Create super_admin role with all permissions."""
    role = Role(
        code="super_admin",
        name="Super Administrator",
        description="Full system access",
        is_system=True,
    )
    role.permissions = all_permissions
    db_session.add(role)
    await db_session.flush()
    return role


@pytest.fixture
async def admin_role(db_session: AsyncSession) -> Role:
    """Create admin role with limited permissions."""
    from sqlalchemy import select

    read_permissions = [
        ("users:read", "Read Users", "users", "read"),
        ("users:list", "List Users", "users", "list"),
        ("roles:read", "Read Roles", "roles", "read"),
        ("roles:list", "List Roles", "roles", "list"),
        ("permissions:read", "Read Permissions", "permissions", "read"),
        ("permissions:list", "List Permissions", "permissions", "list"),
        ("files:read", "Read Files", "files", "read"),
        ("files:list", "List Files", "files", "list"),
        ("files:create", "Create Files", "files", "create"),
        ("files:delete", "Delete Files", "files", "delete"),
    ]

    permissions = []
    for code, name, resource, action in read_permissions:
        # Check if permission already exists
        result = await db_session.execute(
            select(Permission).where(Permission.code == code)
        )
        perm = result.scalar_one_or_none()
        if not perm:
            perm = Permission(code=code, name=name, resource=resource, action=action)
            db_session.add(perm)
        permissions.append(perm)
    await db_session.flush()

    # Check if role already exists
    result = await db_session.execute(select(Role).where(Role.code == "admin"))
    role = result.scalar_one_or_none()
    if not role:
        role = Role(
            code="admin",
            name="Administrator",
            description="Administrative access",
            is_system=True,
        )
        role.permissions = permissions
        db_session.add(role)
        await db_session.flush()
    return role


@pytest.fixture
async def user_role(
    db_session: AsyncSession, all_permissions: list[Permission]
) -> Role:
    """Create user role with basic permissions."""
    from sqlalchemy import select

    # Filter permissions needed for user role
    basic_permission_codes = ["files:read", "files:create", "files:delete"]
    permissions = [p for p in all_permissions if p.code in basic_permission_codes]

    # Check if role already exists
    result = await db_session.execute(select(Role).where(Role.code == "user"))
    role = result.scalar_one_or_none()
    if not role:
        role = Role(
            code="user",
            name="User",
            description="Basic user access",
            is_system=True,
        )
        role.permissions = permissions
        db_session.add(role)
        await db_session.flush()
    return role


@pytest.fixture
async def superadmin_user(db_session: AsyncSession, superadmin_role: Role) -> User:
    """Create a superadmin user."""
    user = User(
        email="superadmin@example.com",
        name="Super Admin",
        hashed_password=get_password_hash("SuperAdmin123!@#"),
        is_active=True,
        is_email_verified=True,
    )
    user.roles = [superadmin_role]
    db_session.add(user)
    await db_session.commit()
    return user


@pytest.fixture
async def admin_user(db_session: AsyncSession, admin_role: Role) -> User:
    """Create an admin user."""
    user = User(
        email="admin@example.com",
        name="Admin User",
        hashed_password=get_password_hash("Admin123!@#"),
        is_active=True,
        is_email_verified=True,
    )
    user.roles = [admin_role]
    db_session.add(user)
    await db_session.commit()
    return user


@pytest.fixture
async def regular_user(db_session: AsyncSession, user_role: Role) -> User:
    """Create a regular user."""
    user = User(
        email="user@example.com",
        name="Regular User",
        hashed_password=get_password_hash("User123!@#"),
        is_active=True,
        is_email_verified=True,
    )
    user.roles = [user_role]
    db_session.add(user)
    await db_session.commit()
    return user


@pytest.fixture
async def unverified_user(db_session: AsyncSession) -> User:
    """Create an unverified user (email not verified)."""
    user = User(
        email="unverified@example.com",
        name="Unverified User",
        hashed_password=get_password_hash("Unverified123!@#"),
        is_active=True,
        is_email_verified=False,
        email_verification_token="test-verification-token",
    )
    db_session.add(user)
    await db_session.commit()
    return user


@pytest.fixture
async def inactive_user(db_session: AsyncSession) -> User:
    """Create an inactive user."""
    user = User(
        email="inactive@example.com",
        name="Inactive User",
        hashed_password=get_password_hash("Inactive123!@#"),
        is_active=False,
        is_email_verified=True,
    )
    db_session.add(user)
    await db_session.commit()
    return user


@pytest.fixture
async def superadmin_headers(client: AsyncClient, superadmin_user: User) -> dict:
    """Get authentication headers for superadmin user."""
    response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "superadmin@example.com",
            "password": "SuperAdmin123!@#",
        },
    )
    access_token = response.json()["access_token"]
    return {"Authorization": f"Bearer {access_token}"}


@pytest.fixture
async def admin_headers(client: AsyncClient, admin_user: User) -> dict:
    """Get authentication headers for admin user."""
    response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "admin@example.com",
            "password": "Admin123!@#",
        },
    )
    access_token = response.json()["access_token"]
    return {"Authorization": f"Bearer {access_token}"}


@pytest.fixture
async def user_headers(client: AsyncClient, regular_user: User) -> dict:
    """Get authentication headers for regular user."""
    response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "user@example.com",
            "password": "User123!@#",
        },
    )
    access_token = response.json()["access_token"]
    return {"Authorization": f"Bearer {access_token}"}


async def create_test_users(
    db_session: AsyncSession, count: int, role: Role | None = None
) -> list[User]:
    """Helper to create multiple test users."""
    users = []
    for i in range(count):
        user = User(
            email=f"testuser{i}@example.com",
            name=f"Test User {i}",
            hashed_password=get_password_hash("Test123!@#"),
            is_active=True,
            is_email_verified=True,
        )
        if role:
            user.roles = [role]
        db_session.add(user)
        users.append(user)
    await db_session.commit()
    return users


def generate_totp(secret: str) -> str:
    """Generate a TOTP code from a secret."""
    totp = pyotp.TOTP(secret)
    return totp.now()


async def get_user_by_email(db_session: AsyncSession, email: str) -> User | None:
    """Get a user by email."""
    result = await db_session.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()
