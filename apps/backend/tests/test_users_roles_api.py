"""User role API tests."""

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from src.app.models import Permission, Role


async def create_permission_db(
    db_session: AsyncSession, code: str, name: str
) -> Permission:
    """Helper to create a permission directly in database."""
    parts = code.split(":", 1)
    resource = parts[0] if len(parts) >= 1 else code
    action = parts[1] if len(parts) == 2 else ""
    perm = Permission(code=code, name=name, resource=resource, action=action)
    db_session.add(perm)
    await db_session.commit()
    await db_session.refresh(perm)
    return perm


async def create_role_db(
    db_session: AsyncSession,
    code: str,
    name: str,
    permissions: list[Permission] | None = None,
) -> Role:
    """Helper to create a role directly in database."""
    role = Role(code=code, name=name)
    if permissions:
        role.permissions = permissions
    db_session.add(role)
    await db_session.commit()
    await db_session.refresh(role)
    return role


@pytest.mark.asyncio
async def test_create_user_with_roles(
    client: AsyncClient, superadmin_headers: dict, db_session: AsyncSession
):
    """Test creating a user with roles."""
    role = await create_role_db(db_session, "editor", "Editor")

    response = await client.post(
        "/api/v1/users",
        json={
            "email": "test@example.com",
            "name": "Test User",
            "role_ids": [role.id],
        },
        headers=superadmin_headers,
    )
    assert response.status_code == 201
    data = response.json()
    assert "roles" in data
    assert len(data["roles"]) == 1
    assert data["roles"][0]["code"] == "editor"


@pytest.mark.asyncio
async def test_create_user_with_invalid_role(
    client: AsyncClient, superadmin_headers: dict
):
    """Test creating a user with non-existent role."""
    response = await client.post(
        "/api/v1/users",
        json={
            "email": "test@example.com",
            "name": "Test User",
            "role_ids": [99999],
        },
        headers=superadmin_headers,
    )
    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == "Role not found."


@pytest.mark.asyncio
async def test_get_user_includes_roles(
    client: AsyncClient, superadmin_headers: dict, db_session: AsyncSession
):
    """Test getting a user includes roles."""
    role = await create_role_db(db_session, "editor", "Editor")

    create_response = await client.post(
        "/api/v1/users",
        json={
            "email": "test@example.com",
            "name": "Test User",
            "role_ids": [role.id],
        },
        headers=superadmin_headers,
    )
    user_id = create_response.json()["id"]

    response = await client.get(f"/api/v1/users/{user_id}", headers=superadmin_headers)
    assert response.status_code == 200
    data = response.json()
    assert "roles" in data
    assert len(data["roles"]) == 1


@pytest.mark.asyncio
async def test_list_users_with_roles(
    client: AsyncClient, superadmin_headers: dict, db_session: AsyncSession
):
    """Test listing users with roles included."""
    role = await create_role_db(db_session, "editor", "Editor")

    await client.post(
        "/api/v1/users",
        json={
            "email": "test@example.com",
            "name": "Test User",
            "role_ids": [role.id],
        },
        headers=superadmin_headers,
    )

    response = await client.get(
        "/api/v1/users?include_roles=true", headers=superadmin_headers
    )
    assert response.status_code == 200
    data = response.json()
    # Find the test user
    test_user = next(
        (u for u in data["data"] if u["email"] == "test@example.com"), None
    )
    assert test_user is not None
    assert len(test_user["roles"]) == 1


@pytest.mark.asyncio
async def test_list_users_without_roles(client: AsyncClient, superadmin_headers: dict):
    """Test listing users without roles (default)."""
    await client.post(
        "/api/v1/users",
        json={"email": "test@example.com", "name": "Test User"},
        headers=superadmin_headers,
    )

    response = await client.get("/api/v1/users", headers=superadmin_headers)
    assert response.status_code == 200
    data = response.json()
    # Find the test user
    test_user = next(
        (u for u in data["data"] if u["email"] == "test@example.com"), None
    )
    assert test_user is not None
    # Should not have roles key when include_roles is false
    assert "roles" not in test_user


@pytest.mark.asyncio
async def test_update_user_roles(
    client: AsyncClient, superadmin_headers: dict, db_session: AsyncSession
):
    """Test updating user roles."""
    role1 = await create_role_db(db_session, "editor", "Editor")
    role2 = await create_role_db(db_session, "viewer", "Viewer")

    create_response = await client.post(
        "/api/v1/users",
        json={
            "email": "test@example.com",
            "name": "Test User",
            "role_ids": [role1.id],
        },
        headers=superadmin_headers,
    )
    user_id = create_response.json()["id"]

    response = await client.patch(
        f"/api/v1/users/{user_id}",
        json={"role_ids": [role1.id, role2.id]},
        headers=superadmin_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data["roles"]) == 2


@pytest.mark.asyncio
async def test_assign_role_to_user(
    client: AsyncClient, superadmin_headers: dict, db_session: AsyncSession
):
    """Test assigning a role to a user."""
    role = await create_role_db(db_session, "editor", "Editor")

    create_response = await client.post(
        "/api/v1/users",
        json={"email": "test@example.com", "name": "Test User"},
        headers=superadmin_headers,
    )
    user_id = create_response.json()["id"]

    response = await client.post(
        f"/api/v1/users/{user_id}/roles/{role.id}",
        headers=superadmin_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Role assigned successfully"


@pytest.mark.asyncio
async def test_assign_role_to_user_invalid_role(
    client: AsyncClient, superadmin_headers: dict
):
    """Test assigning a non-existent role to a user."""
    create_response = await client.post(
        "/api/v1/users",
        json={"email": "test@example.com", "name": "Test User"},
        headers=superadmin_headers,
    )
    user_id = create_response.json()["id"]

    response = await client.post(
        f"/api/v1/users/{user_id}/roles/99999",
        headers=superadmin_headers,
    )
    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == "Role not found."


@pytest.mark.asyncio
async def test_assign_role_already_assigned(
    client: AsyncClient, superadmin_headers: dict, db_session: AsyncSession
):
    """Test assigning a role that's already assigned."""
    role = await create_role_db(db_session, "editor", "Editor")

    create_response = await client.post(
        "/api/v1/users",
        json={
            "email": "test@example.com",
            "name": "Test User",
            "role_ids": [role.id],
        },
        headers=superadmin_headers,
    )
    user_id = create_response.json()["id"]

    response = await client.post(
        f"/api/v1/users/{user_id}/roles/{role.id}",
        headers=superadmin_headers,
    )
    assert response.status_code == 200
    data = response.json()
    # Should return success message
    assert data["message"] == "Role assigned successfully"


@pytest.mark.asyncio
async def test_remove_role_from_user(
    client: AsyncClient, superadmin_headers: dict, db_session: AsyncSession
):
    """Test removing a role from a user."""
    role1 = await create_role_db(db_session, "editor", "Editor")
    role2 = await create_role_db(db_session, "viewer", "Viewer")

    create_response = await client.post(
        "/api/v1/users",
        json={
            "email": "test@example.com",
            "name": "Test User",
            "role_ids": [role1.id, role2.id],
        },
        headers=superadmin_headers,
    )
    user_id = create_response.json()["id"]

    response = await client.delete(
        f"/api/v1/users/{user_id}/roles/{role1.id}",
        headers=superadmin_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Role removed successfully"


@pytest.mark.asyncio
async def test_get_user_permissions(
    client: AsyncClient, superadmin_headers: dict, db_session: AsyncSession
):
    """Test getting user permissions through roles."""
    perm1 = await create_permission_db(db_session, "posts:read", "Posts Read")
    perm2 = await create_permission_db(db_session, "posts:create", "Posts Create")
    role = await create_role_db(db_session, "editor", "Editor", [perm1, perm2])

    create_response = await client.post(
        "/api/v1/users",
        json={
            "email": "test@example.com",
            "name": "Test User",
            "role_ids": [role.id],
        },
        headers=superadmin_headers,
    )
    user_id = create_response.json()["id"]

    response = await client.get(
        f"/api/v1/users/{user_id}/permissions", headers=superadmin_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    perm_codes = [p["code"] for p in data]
    assert "posts:read" in perm_codes
    assert "posts:create" in perm_codes


@pytest.mark.asyncio
async def test_get_user_permissions_no_roles(
    client: AsyncClient, superadmin_headers: dict
):
    """Test getting permissions for user with no roles."""
    create_response = await client.post(
        "/api/v1/users",
        json={"email": "test@example.com", "name": "Test User"},
        headers=superadmin_headers,
    )
    user_id = create_response.json()["id"]

    response = await client.get(
        f"/api/v1/users/{user_id}/permissions", headers=superadmin_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 0


@pytest.mark.asyncio
async def test_get_user_roles(
    client: AsyncClient, superadmin_headers: dict, db_session: AsyncSession
):
    """Test getting user roles."""
    role1 = await create_role_db(db_session, "editor", "Editor")
    role2 = await create_role_db(db_session, "viewer", "Viewer")

    create_response = await client.post(
        "/api/v1/users",
        json={
            "email": "test@example.com",
            "name": "Test User",
            "role_ids": [role1.id, role2.id],
        },
        headers=superadmin_headers,
    )
    user_id = create_response.json()["id"]

    response = await client.get(
        f"/api/v1/users/{user_id}/roles", headers=superadmin_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2


@pytest.mark.asyncio
async def test_get_user_roles_empty(client: AsyncClient, superadmin_headers: dict):
    """Test getting roles for user with no roles."""
    create_response = await client.post(
        "/api/v1/users",
        json={"email": "test@example.com", "name": "Test User"},
        headers=superadmin_headers,
    )
    user_id = create_response.json()["id"]

    response = await client.get(
        f"/api/v1/users/{user_id}/roles", headers=superadmin_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 0
