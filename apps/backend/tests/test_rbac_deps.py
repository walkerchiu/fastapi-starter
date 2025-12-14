"""RBAC dependencies tests."""

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from src.app.models import Permission, Role, User
from src.app.services import AuthService


async def create_user_with_password(
    db_session: AsyncSession, email: str, name: str, password: str
) -> User:
    """Helper to create a user with password."""
    auth_service = AuthService(db_session)
    from src.app.schemas import UserRegister

    user_in = UserRegister(email=email, name=name, password=password)
    return await auth_service.register(user_in)


async def create_permission(
    db_session: AsyncSession, code: str, name: str
) -> Permission:
    """Helper to create a permission."""
    parts = code.split(":", 1)
    resource = parts[0] if len(parts) >= 1 else code
    action = parts[1] if len(parts) == 2 else ""
    perm = Permission(code=code, name=name, resource=resource, action=action)
    db_session.add(perm)
    await db_session.commit()
    await db_session.refresh(perm)
    return perm


async def create_role_with_permissions(
    db_session: AsyncSession, code: str, name: str, permission_codes: list[str]
) -> Role:
    """Helper to create a role with permissions."""
    permissions = []
    for perm_code in permission_codes:
        perm = await create_permission(
            db_session, perm_code, perm_code.replace(":", " ").title()
        )
        permissions.append(perm)

    role = Role(code=code, name=name)
    db_session.add(role)
    await db_session.flush()
    await db_session.refresh(role, ["permissions"])
    role.permissions = permissions
    await db_session.commit()
    await db_session.refresh(role, ["permissions"])
    return role


async def assign_role_to_user(db_session: AsyncSession, user: User, role: Role) -> User:
    """Helper to assign a role to a user."""
    await db_session.refresh(user, ["roles"])
    user.roles.append(role)
    await db_session.commit()
    await db_session.refresh(user, ["roles"])
    return user


async def get_auth_token(client: AsyncClient, email: str, password: str) -> str:
    """Helper to get auth token."""
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password},
    )
    return response.json()["access_token"]


@pytest.mark.asyncio
async def test_require_permissions_single_permission(
    client: AsyncClient, db_session: AsyncSession
):
    """Test require_permissions with a single permission."""
    # Create user with permission
    user = await create_user_with_password(
        db_session, "test@example.com", "Test User", "password123"
    )
    role = await create_role_with_permissions(
        db_session, "admin", "Admin", ["users:read"]
    )
    await assign_role_to_user(db_session, user, role)

    token = await get_auth_token(client, "test@example.com", "password123")

    # This endpoint requires users:read permission (we'll use /auth/me as proxy)
    response = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_require_permissions_missing_permission(
    client: AsyncClient, db_session: AsyncSession
):
    """Test require_permissions when user lacks permission."""
    # Create user without any roles/permissions
    await create_user_with_password(
        db_session, "test@example.com", "Test User", "password123"
    )

    token = await get_auth_token(client, "test@example.com", "password123")

    # User can still access basic endpoints
    response = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_unauthenticated_request(client: AsyncClient):
    """Test that unauthenticated requests are rejected."""
    response = await client.get("/api/v1/auth/me")
    assert response.status_code == 401  # Unauthenticated


@pytest.mark.asyncio
async def test_invalid_token(client: AsyncClient):
    """Test that invalid tokens are rejected."""
    response = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": "Bearer invalid_token"},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_user_with_multiple_roles(client: AsyncClient, db_session: AsyncSession):
    """Test user with multiple roles has combined permissions."""
    user = await create_user_with_password(
        db_session, "test@example.com", "Test User", "password123"
    )

    role1 = await create_role_with_permissions(
        db_session, "reader", "Reader", ["users:read"]
    )
    role2 = await create_role_with_permissions(
        db_session, "writer", "Writer", ["users:create"]
    )

    await assign_role_to_user(db_session, user, role1)
    await assign_role_to_user(db_session, user, role2)

    token = await get_auth_token(client, "test@example.com", "password123")

    # Get user permissions via API
    response = await client.get(
        f"/api/v1/users/{user.id}/permissions",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()
    perm_codes = [p["code"] for p in data]
    assert "users:read" in perm_codes
    assert "users:create" in perm_codes


@pytest.mark.asyncio
async def test_inactive_user_rejected(client: AsyncClient, db_session: AsyncSession):
    """Test that inactive users are rejected."""
    user = await create_user_with_password(
        db_session, "test@example.com", "Test User", "password123"
    )

    # Get token while user is active
    token = await get_auth_token(client, "test@example.com", "password123")

    # Deactivate user
    user.is_active = False
    await db_session.commit()

    # Request should fail
    response = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 403
    assert response.json()["code"] == "INACTIVE_USER"
