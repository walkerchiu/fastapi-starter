"""Role API tests."""

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


@pytest.mark.asyncio
async def test_create_role(client: AsyncClient, superadmin_headers: dict):
    """Test creating a new role."""
    response = await client.post(
        "/api/v1/roles",
        json={
            "code": "editor",
            "name": "Editor",
            "description": "Content editor role",
        },
        headers=superadmin_headers,
    )
    assert response.status_code == 201
    data = response.json()
    assert data["code"] == "editor"
    assert data["name"] == "Editor"
    assert data["description"] == "Content editor role"
    assert data["is_system"] is False
    assert "id" in data
    assert "created_at" in data
    assert "permissions" in data
    assert data["permissions"] == []


@pytest.mark.asyncio
async def test_create_role_unauthorized(client: AsyncClient):
    """Test creating a role without authentication."""
    response = await client.post(
        "/api/v1/roles",
        json={"code": "editor", "name": "Editor"},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_create_role_non_superadmin(client: AsyncClient, admin_headers: dict):
    """Test creating a role with non-superadmin role."""
    response = await client.post(
        "/api/v1/roles",
        json={"code": "editor", "name": "Editor"},
        headers=admin_headers,
    )
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_create_role_with_permissions(
    client: AsyncClient, superadmin_headers: dict, db_session: AsyncSession
):
    """Test creating a role with permissions."""
    perm1 = await create_permission_db(db_session, "posts:read", "Posts Read")
    perm2 = await create_permission_db(db_session, "posts:create", "Posts Create")

    response = await client.post(
        "/api/v1/roles",
        json={
            "code": "editor",
            "name": "Editor",
            "permission_ids": [perm1.id, perm2.id],
        },
        headers=superadmin_headers,
    )
    assert response.status_code == 201
    data = response.json()
    assert len(data["permissions"]) == 2


@pytest.mark.asyncio
async def test_create_role_duplicate_code(
    client: AsyncClient, superadmin_headers: dict
):
    """Test creating a role with duplicate code."""
    await client.post(
        "/api/v1/roles",
        json={"code": "editor", "name": "Editor"},
        headers=superadmin_headers,
    )
    response = await client.post(
        "/api/v1/roles",
        json={"code": "editor", "name": "Another Editor"},
        headers=superadmin_headers,
    )
    assert response.status_code == 409
    data = response.json()
    assert data["detail"] == "Role code already exists."
    assert data["code"] == "ROLE_CODE_ALREADY_EXISTS"


@pytest.mark.asyncio
async def test_create_role_with_invalid_permission(
    client: AsyncClient, superadmin_headers: dict
):
    """Test creating a role with non-existent permission."""
    response = await client.post(
        "/api/v1/roles",
        json={
            "code": "editor",
            "name": "Editor",
            "permission_ids": [99999],
        },
        headers=superadmin_headers,
    )
    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == "Permission not found."
    assert data["code"] == "PERMISSION_NOT_FOUND"


@pytest.mark.asyncio
async def test_list_roles(client: AsyncClient, superadmin_headers: dict):
    """Test listing roles with pagination."""
    await client.post(
        "/api/v1/roles",
        json={"code": "editor", "name": "Editor"},
        headers=superadmin_headers,
    )
    await client.post(
        "/api/v1/roles",
        json={"code": "viewer", "name": "Viewer"},
        headers=superadmin_headers,
    )

    response = await client.get("/api/v1/roles", headers=superadmin_headers)
    assert response.status_code == 200
    data = response.json()
    # Includes superadmin role from fixture
    assert data["meta"]["total_items"] >= 2
    assert "data" in data
    assert "has_next_page" in data["meta"]


@pytest.mark.asyncio
async def test_list_roles_with_permissions(
    client: AsyncClient, superadmin_headers: dict, db_session: AsyncSession
):
    """Test listing roles with permissions included."""
    perm = await create_permission_db(db_session, "posts:read", "Posts Read")
    await client.post(
        "/api/v1/roles",
        json={
            "code": "editor",
            "name": "Editor",
            "permission_ids": [perm.id],
        },
        headers=superadmin_headers,
    )

    response = await client.get(
        "/api/v1/roles?include_permissions=true", headers=superadmin_headers
    )
    assert response.status_code == 200
    data = response.json()
    # Find the editor role
    editor_role = next((r for r in data["data"] if r["code"] == "editor"), None)
    assert editor_role is not None
    assert len(editor_role["permissions"]) == 1


@pytest.mark.asyncio
async def test_get_role(client: AsyncClient, superadmin_headers: dict):
    """Test getting a role by ID."""
    create_response = await client.post(
        "/api/v1/roles",
        json={"code": "editor", "name": "Editor"},
        headers=superadmin_headers,
    )
    role_id = create_response.json()["id"]

    response = await client.get(f"/api/v1/roles/{role_id}", headers=superadmin_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == role_id
    assert data["code"] == "editor"
    assert data["name"] == "Editor"
    assert "permissions" in data


@pytest.mark.asyncio
async def test_get_role_not_found(client: AsyncClient, superadmin_headers: dict):
    """Test getting a non-existent role."""
    response = await client.get("/api/v1/roles/99999", headers=superadmin_headers)
    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == "Role not found."
    assert data["code"] == "ROLE_NOT_FOUND"


@pytest.mark.asyncio
async def test_get_role_by_code(client: AsyncClient, superadmin_headers: dict):
    """Test getting a role by code."""
    create_response = await client.post(
        "/api/v1/roles",
        json={"code": "editor", "name": "Editor", "description": "Content editor"},
        headers=superadmin_headers,
    )
    assert create_response.status_code == 201

    response = await client.get("/api/v1/roles/code/editor", headers=superadmin_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["code"] == "editor"
    assert data["name"] == "Editor"
    assert data["description"] == "Content editor"
    assert "permissions" in data


@pytest.mark.asyncio
async def test_get_role_by_code_not_found(
    client: AsyncClient, superadmin_headers: dict
):
    """Test getting a non-existent role by code."""
    response = await client.get(
        "/api/v1/roles/code/nonexistent", headers=superadmin_headers
    )
    assert response.status_code == 404
    data = response.json()
    assert "not found" in data["detail"].lower()
    assert data["code"] == "NOT_FOUND"


@pytest.mark.asyncio
async def test_update_role(client: AsyncClient, superadmin_headers: dict):
    """Test updating a role."""
    create_response = await client.post(
        "/api/v1/roles",
        json={"code": "editor", "name": "Editor"},
        headers=superadmin_headers,
    )
    role_id = create_response.json()["id"]

    response = await client.patch(
        f"/api/v1/roles/{role_id}",
        json={"name": "Super Editor", "description": "Updated description"},
        headers=superadmin_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Super Editor"
    assert data["description"] == "Updated description"
    assert data["code"] == "editor"  # Code should not change


@pytest.mark.asyncio
async def test_update_role_permissions(
    client: AsyncClient, superadmin_headers: dict, db_session: AsyncSession
):
    """Test updating role permissions."""
    perm1 = await create_permission_db(db_session, "posts:read", "Posts Read")
    perm2 = await create_permission_db(db_session, "posts:create", "Posts Create")

    create_response = await client.post(
        "/api/v1/roles",
        json={
            "code": "editor",
            "name": "Editor",
            "permission_ids": [perm1.id],
        },
        headers=superadmin_headers,
    )
    role_id = create_response.json()["id"]

    response = await client.patch(
        f"/api/v1/roles/{role_id}",
        json={"permission_ids": [perm1.id, perm2.id]},
        headers=superadmin_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data["permissions"]) == 2


@pytest.mark.asyncio
async def test_update_system_role_fails(
    client: AsyncClient, superadmin_headers: dict, db_session: AsyncSession
):
    """Test that updating a system role fails."""
    # Create a different system role (not the superadmin from fixture)
    role = Role(code="sysrole", name="System Role", is_system=True)
    db_session.add(role)
    await db_session.commit()
    await db_session.refresh(role)

    response = await client.patch(
        f"/api/v1/roles/{role.id}",
        json={"name": "Changed"},
        headers=superadmin_headers,
    )
    assert response.status_code == 403
    data = response.json()
    assert data["detail"] == "Cannot modify system roles."
    assert data["code"] == "SYSTEM_ROLE_MODIFICATION"


@pytest.mark.asyncio
async def test_delete_role(client: AsyncClient, superadmin_headers: dict):
    """Test deleting a role."""
    create_response = await client.post(
        "/api/v1/roles",
        json={"code": "editor", "name": "Editor"},
        headers=superadmin_headers,
    )
    role_id = create_response.json()["id"]

    response = await client.delete(
        f"/api/v1/roles/{role_id}", headers=superadmin_headers
    )
    assert response.status_code == 200
    assert response.json()["message"] == "Role deleted successfully"

    # Verify deletion
    get_response = await client.get(
        f"/api/v1/roles/{role_id}", headers=superadmin_headers
    )
    assert get_response.status_code == 404


@pytest.mark.asyncio
async def test_delete_system_role_fails(
    client: AsyncClient, superadmin_headers: dict, db_session: AsyncSession
):
    """Test that deleting a system role fails."""
    # Create a different system role (not the superadmin from fixture)
    role = Role(code="sysrole", name="System Role", is_system=True)
    db_session.add(role)
    await db_session.commit()
    await db_session.refresh(role)

    response = await client.delete(
        f"/api/v1/roles/{role.id}", headers=superadmin_headers
    )
    assert response.status_code == 403
    data = response.json()
    assert data["detail"] == "Cannot modify system roles."
    assert data["code"] == "SYSTEM_ROLE_MODIFICATION"


@pytest.mark.asyncio
async def test_add_permission_to_role(
    client: AsyncClient, superadmin_headers: dict, db_session: AsyncSession
):
    """Test adding a permission to a role."""
    perm = await create_permission_db(db_session, "posts:read", "Posts Read")
    create_response = await client.post(
        "/api/v1/roles",
        json={"code": "editor", "name": "Editor"},
        headers=superadmin_headers,
    )
    role_id = create_response.json()["id"]

    response = await client.post(
        f"/api/v1/roles/{role_id}/permissions/{perm.id}",
        headers=superadmin_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Permission added successfully"


@pytest.mark.asyncio
async def test_add_permission_to_role_invalid_permission(
    client: AsyncClient, superadmin_headers: dict
):
    """Test adding a non-existent permission to a role."""
    create_response = await client.post(
        "/api/v1/roles",
        json={"code": "editor", "name": "Editor"},
        headers=superadmin_headers,
    )
    role_id = create_response.json()["id"]

    response = await client.post(
        f"/api/v1/roles/{role_id}/permissions/99999",
        headers=superadmin_headers,
    )
    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == "Permission not found."


@pytest.mark.asyncio
async def test_add_permission_to_system_role_fails(
    client: AsyncClient, superadmin_headers: dict, db_session: AsyncSession
):
    """Test that adding permission to system role fails."""
    perm = await create_permission_db(db_session, "posts:read", "Posts Read")

    role = Role(code="sysrole", name="System Role", is_system=True)
    db_session.add(role)
    await db_session.commit()
    await db_session.refresh(role)

    response = await client.post(
        f"/api/v1/roles/{role.id}/permissions/{perm.id}",
        headers=superadmin_headers,
    )
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_remove_permission_from_role(
    client: AsyncClient, superadmin_headers: dict, db_session: AsyncSession
):
    """Test removing a permission from a role."""
    perm1 = await create_permission_db(db_session, "posts:read", "Posts Read")
    perm2 = await create_permission_db(db_session, "posts:create", "Posts Create")

    create_response = await client.post(
        "/api/v1/roles",
        json={
            "code": "editor",
            "name": "Editor",
            "permission_ids": [perm1.id, perm2.id],
        },
        headers=superadmin_headers,
    )
    role_id = create_response.json()["id"]

    response = await client.delete(
        f"/api/v1/roles/{role_id}/permissions/{perm1.id}",
        headers=superadmin_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Permission removed successfully"


@pytest.mark.asyncio
async def test_list_roles_with_read_permission(
    client: AsyncClient, admin_headers: dict
):
    """Test listing roles with read-only permission."""
    # admin_headers has roles:read permission
    response = await client.get("/api/v1/roles", headers=admin_headers)
    assert response.status_code == 200
