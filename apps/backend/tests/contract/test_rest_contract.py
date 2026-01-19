"""
REST API Contract Tests.

Validates that API responses conform to the OpenAPI specification.
This ensures consistency between the spec and implementation.

Tests: 15
- CONTRACT-001 to CONTRACT-015
"""

from pathlib import Path
from uuid import UUID

import pytest
import yaml
from httpx import ASGITransport, AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from src.app.db.base import Base
from src.app.db.seeds import seed_all
from src.app.db.session import get_db
from src.app.main import app
from src.app.middleware.rate_limit import RateLimiter
from src.app.models import User

# OpenAPI spec path
OPENAPI_SPEC_PATH = (
    Path(__file__).parent.parent.parent.parent.parent.parent
    / "specs"
    / "api"
    / "openapi.yaml"
)

# Test database
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
    """Create tables before each test, seed RBAC data, and drop after."""
    RateLimiter.get_instance().reset()
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    # Seed default roles and permissions for RBAC
    async with test_async_session_maker() as session:
        await seed_all(session)
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
def openapi_spec() -> dict:
    """Load OpenAPI specification."""
    with open(OPENAPI_SPEC_PATH) as f:
        return yaml.safe_load(f)


@pytest.fixture
async def auth_context(client: AsyncClient) -> dict:
    """Create test user with 'user' role and return auth context."""
    # Register user
    register_res = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "contract@example.com",
            "name": "Contract Test User",
            "password": "Contract123!@#",
        },
    )
    user_id = register_res.json().get("id")

    # Assign 'user' role to the test user for RBAC permissions
    async with test_async_session_maker() as session:
        from src.app.models import Role

        # Get the 'user' role (seeded in setup_database)
        result = await session.execute(select(Role).where(Role.code == "user"))
        user_role = result.scalar_one()

        # Get the user and assign the role
        user_result = await session.execute(
            select(User).where(User.id == UUID(user_id))
        )
        user = user_result.scalar_one()
        user.roles.append(user_role)
        await session.commit()

    # Login
    login_res = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "contract@example.com",
            "password": "Contract123!@#",
        },
    )
    token = login_res.json().get("access_token")

    return {
        "user_id": user_id,
        "access_token": token,
        "headers": {"Authorization": f"Bearer {token}"},
    }


class TestSchemaValidation:
    """Schema validation tests."""

    @pytest.mark.asyncio
    async def test_contract_001_register_response_schema(
        self, client: AsyncClient, openapi_spec: dict
    ):
        """CONTRACT-001: register response should match OpenAPI schema."""
        response = await client.post(
            "/api/v1/auth/register",
            json={
                "email": "schema@example.com",
                "name": "Schema Test",
                "password": "Schema123!@#",
            },
        )

        assert response.status_code == 201
        assert "application/json" in response.headers.get("content-type", "")

        body = response.json()
        # Verify required fields
        assert "id" in body
        assert "email" in body
        assert "name" in body
        assert "is_active" in body
        assert "is_email_verified" in body
        assert "created_at" in body

        # Verify password not exposed
        assert "hashed_password" not in body

    @pytest.mark.asyncio
    async def test_contract_002_login_response_schema(
        self, client: AsyncClient, auth_context: dict
    ):
        """CONTRACT-002: login response should match OpenAPI schema."""
        response = await client.post(
            "/api/v1/auth/login",
            json={
                "email": "contract@example.com",
                "password": "Contract123!@#",
            },
        )

        assert response.status_code == 200
        assert "application/json" in response.headers.get("content-type", "")

        body = response.json()
        # Verify token structure
        assert "access_token" in body
        assert "refresh_token" in body
        assert body.get("token_type") == "Bearer"

        # Verify JWT format
        assert isinstance(body["access_token"], str)
        assert len(body["access_token"].split(".")) == 3

    @pytest.mark.asyncio
    async def test_contract_003_get_current_user_schema(
        self, client: AsyncClient, auth_context: dict
    ):
        """CONTRACT-003: get current user should match OpenAPI schema."""
        response = await client.get(
            "/api/v1/auth/me",
            headers=auth_context["headers"],
        )

        assert response.status_code == 200
        assert "application/json" in response.headers.get("content-type", "")

        body = response.json()
        # Verify user structure
        assert "id" in body
        assert "email" in body
        assert "name" in body
        assert "is_active" in body
        assert "is_email_verified" in body
        assert "is_two_factor_enabled" in body

    @pytest.mark.asyncio
    async def test_contract_004_list_users_pagination_schema(
        self, client: AsyncClient, auth_context: dict
    ):
        """CONTRACT-004: list users should match pagination schema."""
        response = await client.get(
            "/api/v1/users",
            headers=auth_context["headers"],
        )

        assert response.status_code == 200
        assert "application/json" in response.headers.get("content-type", "")

        body = response.json()
        # Verify pagination structure
        assert "data" in body
        assert "meta" in body
        assert "page" in body["meta"]
        assert "limit" in body["meta"]
        assert "total_items" in body["meta"]
        assert "total_pages" in body["meta"]
        assert "has_next_page" in body["meta"]
        assert "has_prev_page" in body["meta"]

        assert isinstance(body["data"], list)
        assert isinstance(body["meta"]["total_items"], int)
        assert isinstance(body["meta"]["has_next_page"], bool)

    @pytest.mark.asyncio
    async def test_contract_005_get_single_user_schema(
        self, client: AsyncClient, auth_context: dict
    ):
        """CONTRACT-005: get single user should match OpenAPI schema."""
        user_id = auth_context["user_id"]
        response = await client.get(
            f"/api/v1/users/{user_id}",
            headers=auth_context["headers"],
        )

        assert response.status_code == 200
        assert "application/json" in response.headers.get("content-type", "")

        body = response.json()
        assert body.get("id") == user_id
        assert "email" in body
        assert "name" in body


class TestStatusCodeValidation:
    """Status code validation tests."""

    @pytest.mark.asyncio
    async def test_contract_006_validation_errors_422(self, client: AsyncClient):
        """CONTRACT-006: validation errors should return 422 (Unprocessable Entity)."""
        response = await client.post(
            "/api/v1/auth/register",
            json={
                "email": "invalid-email",
                "name": "",
                "password": "123",
            },
        )

        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_contract_007_unauthorized_401(self, client: AsyncClient):
        """CONTRACT-007: unauthorized requests should return 401."""
        response = await client.get("/api/v1/auth/me")

        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_contract_008_invalid_token_401(self, client: AsyncClient):
        """CONTRACT-008: invalid token should return 401."""
        response = await client.get(
            "/api/v1/auth/me",
            headers={"Authorization": "Bearer invalid.token.here"},
        )

        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_contract_009_not_found_404(
        self, client: AsyncClient, auth_context: dict
    ):
        """CONTRACT-009: non-existent resource should return 404."""
        response = await client.get(
            "/api/v1/users/00000000-0000-0000-0000-000000000000",
            headers=auth_context["headers"],
        )

        assert response.status_code == 404

    @pytest.mark.asyncio
    async def test_contract_010_duplicate_409(
        self, client: AsyncClient, auth_context: dict
    ):
        """CONTRACT-010: duplicate resource should return 409."""
        response = await client.post(
            "/api/v1/auth/register",
            json={
                "email": "contract@example.com",
                "name": "Duplicate",
                "password": "Duplicate123!@#",
            },
        )

        assert response.status_code == 409


class TestErrorResponseFormat:
    """Error response format tests."""

    @pytest.mark.asyncio
    async def test_contract_011_error_has_detail(self, client: AsyncClient):
        """CONTRACT-011: error responses should include detail field."""
        response = await client.post(
            "/api/v1/auth/login",
            json={
                "email": "nonexistent@example.com",
                "password": "Wrong123!@#",
            },
        )

        assert response.status_code == 401
        body = response.json()
        assert "detail" in body
        assert isinstance(body["detail"], str)

    @pytest.mark.asyncio
    async def test_contract_012_error_has_code(self, client: AsyncClient):
        """CONTRACT-012: error responses should include code field."""
        response = await client.post(
            "/api/v1/auth/login",
            json={
                "email": "nonexistent@example.com",
                "password": "Wrong123!@#",
            },
        )

        assert response.status_code == 401
        body = response.json()
        assert "code" in body
        assert isinstance(body["code"], str)

    @pytest.mark.asyncio
    async def test_contract_013_error_code_matches_spec(
        self, client: AsyncClient, auth_context: dict
    ):
        """CONTRACT-013: error codes should match error-codes.json spec."""
        response = await client.post(
            "/api/v1/auth/register",
            json={
                "email": "contract@example.com",
                "name": "Duplicate",
                "password": "Duplicate123!@#",
            },
        )

        assert response.status_code == 409
        assert response.json().get("code") == "EMAIL_ALREADY_EXISTS"

    @pytest.mark.asyncio
    async def test_contract_014_not_found_error_code(
        self, client: AsyncClient, auth_context: dict
    ):
        """CONTRACT-014: not found errors should have correct code."""
        response = await client.get(
            "/api/v1/users/00000000-0000-0000-0000-000000000000",
            headers=auth_context["headers"],
        )

        assert response.status_code == 404
        assert response.json().get("code") == "USER_NOT_FOUND"

    @pytest.mark.asyncio
    async def test_contract_015_validation_error_format(self, client: AsyncClient):
        """CONTRACT-015: validation errors should have correct format."""
        response = await client.post(
            "/api/v1/auth/register",
            json={
                "email": "invalid-email",
                "name": "",
                "password": "123",
            },
        )

        assert response.status_code == 422
        body = response.json()
        # FastAPI validation errors have 'detail' as a list of error objects
        assert "detail" in body
        assert isinstance(body["detail"], list)
        assert len(body["detail"]) > 0
        # Each error should have loc and msg
        for error in body["detail"]:
            assert "loc" in error
            assert "msg" in error
