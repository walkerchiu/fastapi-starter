"""GraphQL RBAC resolver tests."""

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from src.app.models import Permission, Role


async def create_permission(
    db_session: AsyncSession, code: str, name: str, description: str | None = None
) -> Permission:
    """Helper to create a permission."""
    # Parse resource and action from code
    parts = code.split(":", 1)
    resource = parts[0] if len(parts) >= 1 else code
    action = parts[1] if len(parts) == 2 else ""
    perm = Permission(
        code=code, name=name, description=description, resource=resource, action=action
    )
    db_session.add(perm)
    await db_session.commit()
    await db_session.refresh(perm)
    return perm


async def create_role(
    db_session: AsyncSession,
    code: str,
    name: str,
    description: str | None = None,
    is_system: bool = False,
) -> Role:
    """Helper to create a role."""
    role = Role(code=code, name=name, description=description, is_system=is_system)
    db_session.add(role)
    await db_session.commit()
    await db_session.refresh(role)
    return role


# Permission Query Tests
@pytest.mark.asyncio
async def test_graphql_list_permissions(
    client: AsyncClient, db_session: AsyncSession, superadmin_headers: dict
):
    """Test listing permissions via GraphQL."""
    await create_permission(db_session, "test:read", "Test Read")
    await create_permission(db_session, "test:write", "Test Write")

    query = """
        query {
            permissions(page: 1, limit: 100) {
                data {
                    id
                    code
                    name
                }
                meta {
                    totalItems
                    hasNextPage
                }
            }
        }
    """
    response = await client.post(
        "/graphql", json={"query": query}, headers=superadmin_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert "errors" not in data
    assert data["data"]["permissions"]["meta"]["totalItems"] >= 2
    codes = [p["code"] for p in data["data"]["permissions"]["data"]]
    assert "test:read" in codes
    assert "test:write" in codes


@pytest.mark.asyncio
async def test_graphql_get_permission(
    client: AsyncClient, db_session: AsyncSession, superadmin_headers: dict
):
    """Test getting a single permission via GraphQL."""
    perm = await create_permission(db_session, "single:read", "Single Read", "Can read")

    query = f"""
        query {{
            permission(id: {perm.id}) {{
                id
                code
                name
                description
            }}
        }}
    """
    response = await client.post(
        "/graphql", json={"query": query}, headers=superadmin_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert "errors" not in data
    assert data["data"]["permission"]["code"] == "single:read"
    assert data["data"]["permission"]["description"] == "Can read"


# Permission Mutation Tests
@pytest.mark.asyncio
async def test_graphql_create_permission(client: AsyncClient, superadmin_headers: dict):
    """Test creating a permission via GraphQL."""
    mutation = """
        mutation {
            createPermission(input: {
                code: "posts:read",
                name: "Read Posts",
                description: "Can read posts"
            }) {
                id
                code
                name
                description
            }
        }
    """
    response = await client.post(
        "/graphql", json={"query": mutation}, headers=superadmin_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert "errors" not in data
    assert data["data"]["createPermission"]["code"] == "posts:read"
    assert data["data"]["createPermission"]["name"] == "Read Posts"


@pytest.mark.asyncio
async def test_graphql_update_permission(
    client: AsyncClient, db_session: AsyncSession, superadmin_headers: dict
):
    """Test updating a permission via GraphQL."""
    perm = await create_permission(db_session, "update:read", "Update Read")

    mutation = f"""
        mutation {{
            updatePermission(id: {perm.id}, input: {{
                name: "Updated Name"
            }}) {{
                id
                code
                name
            }}
        }}
    """
    response = await client.post(
        "/graphql", json={"query": mutation}, headers=superadmin_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert "errors" not in data
    assert data["data"]["updatePermission"]["name"] == "Updated Name"


@pytest.mark.asyncio
async def test_graphql_delete_permission(
    client: AsyncClient, db_session: AsyncSession, superadmin_headers: dict
):
    """Test deleting a permission via GraphQL."""
    perm = await create_permission(db_session, "temp:delete", "Temp Permission")

    mutation = f"""
        mutation {{
            deletePermission(id: {perm.id}) {{
                message
            }}
        }}
    """
    response = await client.post(
        "/graphql", json={"query": mutation}, headers=superadmin_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert "errors" not in data
    assert (
        data["data"]["deletePermission"]["message"] == "Permission deleted successfully"
    )


# Role Query Tests
@pytest.mark.asyncio
async def test_graphql_list_roles(
    client: AsyncClient, db_session: AsyncSession, superadmin_headers: dict
):
    """Test listing roles via GraphQL."""
    await create_role(db_session, "testrole1", "Test Role 1")
    await create_role(db_session, "testrole2", "Test Role 2")

    query = """
        query {
            roles(page: 1, limit: 100) {
                data {
                    id
                    code
                    name
                    isSystem
                    permissions {
                        id
                        code
                    }
                }
                meta {
                    totalItems
                    hasNextPage
                }
            }
        }
    """
    response = await client.post(
        "/graphql", json={"query": query}, headers=superadmin_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert "errors" not in data
    assert data["data"]["roles"]["meta"]["totalItems"] >= 2
    codes = [r["code"] for r in data["data"]["roles"]["data"]]
    assert "testrole1" in codes
    assert "testrole2" in codes


@pytest.mark.asyncio
async def test_graphql_get_role(
    client: AsyncClient, db_session: AsyncSession, superadmin_headers: dict
):
    """Test getting a single role via GraphQL."""
    role = await create_role(db_session, "singlerole", "Single Role", "Role desc")

    query = f"""
        query {{
            role(id: {role.id}) {{
                id
                code
                name
                description
                isSystem
            }}
        }}
    """
    response = await client.post(
        "/graphql", json={"query": query}, headers=superadmin_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert "errors" not in data
    assert data["data"]["role"]["code"] == "singlerole"
    assert data["data"]["role"]["description"] == "Role desc"


# Role Mutation Tests
@pytest.mark.asyncio
async def test_graphql_create_role(
    client: AsyncClient, db_session: AsyncSession, superadmin_headers: dict
):
    """Test creating a role via GraphQL."""
    perm = await create_permission(db_session, "role:read", "Role Read")

    mutation = f"""
        mutation {{
            createRole(input: {{
                code: "moderator",
                name: "Moderator",
                description: "Can moderate content",
                permissionIds: [{perm.id}]
            }}) {{
                id
                code
                name
                description
                permissions {{
                    id
                    code
                }}
            }}
        }}
    """
    response = await client.post(
        "/graphql", json={"query": mutation}, headers=superadmin_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert "errors" not in data
    assert data["data"]["createRole"]["code"] == "moderator"
    assert len(data["data"]["createRole"]["permissions"]) == 1
    assert data["data"]["createRole"]["permissions"][0]["code"] == "role:read"


@pytest.mark.asyncio
async def test_graphql_update_role(
    client: AsyncClient, db_session: AsyncSession, superadmin_headers: dict
):
    """Test updating a role via GraphQL."""
    role = await create_role(db_session, "updaterole", "Update Role")

    mutation = f"""
        mutation {{
            updateRole(id: {role.id}, input: {{
                name: "Updated Role Name"
            }}) {{
                id
                code
                name
            }}
        }}
    """
    response = await client.post(
        "/graphql", json={"query": mutation}, headers=superadmin_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert "errors" not in data
    assert data["data"]["updateRole"]["name"] == "Updated Role Name"


@pytest.mark.asyncio
async def test_graphql_delete_role(
    client: AsyncClient, db_session: AsyncSession, superadmin_headers: dict
):
    """Test deleting a role via GraphQL."""
    role = await create_role(db_session, "temprole", "Temp Role")

    mutation = f"""
        mutation {{
            deleteRole(id: {role.id}) {{
                message
            }}
        }}
    """
    response = await client.post(
        "/graphql", json={"query": mutation}, headers=superadmin_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert "errors" not in data
    assert data["data"]["deleteRole"]["message"] == "Role deleted successfully"


@pytest.mark.asyncio
async def test_graphql_delete_system_role_fails(
    client: AsyncClient, db_session: AsyncSession, superadmin_headers: dict
):
    """Test that deleting a system role fails."""
    role = await create_role(db_session, "sysrole", "System Role", is_system=True)

    mutation = f"""
        mutation {{
            deleteRole(id: {role.id}) {{
                message
            }}
        }}
    """
    response = await client.post(
        "/graphql", json={"query": mutation}, headers=superadmin_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert "errors" in data
    assert "SYSTEM_ROLE_MODIFICATION" in str(data["errors"])


@pytest.mark.asyncio
async def test_graphql_add_permission_to_role(
    client: AsyncClient, db_session: AsyncSession, superadmin_headers: dict
):
    """Test adding a permission to a role via GraphQL."""
    role = await create_role(db_session, "assignrole", "Assign Role")
    perm = await create_permission(db_session, "assign:read", "Assign Read")

    mutation = f"""
        mutation {{
            addPermissionToRole(roleId: {role.id}, permissionId: {perm.id}) {{
                message
            }}
        }}
    """
    response = await client.post(
        "/graphql", json={"query": mutation}, headers=superadmin_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert "errors" not in data
    assert (
        data["data"]["addPermissionToRole"]["message"]
        == "Permission added to role successfully"
    )


@pytest.mark.asyncio
async def test_graphql_remove_permission_from_role(
    client: AsyncClient, db_session: AsyncSession, superadmin_headers: dict
):
    """Test removing a permission from a role via GraphQL."""
    role = await create_role(db_session, "removerole", "Remove Role")
    perm = await create_permission(db_session, "remove:read", "Remove Read")

    # First assign the permission
    await db_session.refresh(role, ["permissions"])
    role.permissions.append(perm)
    await db_session.commit()

    mutation = f"""
        mutation {{
            removePermissionFromRole(roleId: {role.id}, permissionId: {perm.id}) {{
                message
            }}
        }}
    """
    response = await client.post(
        "/graphql", json={"query": mutation}, headers=superadmin_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert "errors" not in data
    assert (
        data["data"]["removePermissionFromRole"]["message"]
        == "Permission removed from role successfully"
    )


# User-Role Query Tests
@pytest.mark.asyncio
async def test_graphql_user_with_roles(
    client: AsyncClient, db_session: AsyncSession, superadmin_headers: dict
):
    """Test getting a user with roles via GraphQL."""
    from src.app.models import User

    user = User(email="roletest@example.com", name="Role Test User", is_active=True)
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)

    role = await create_role(db_session, "userrole", "User Role")
    await db_session.refresh(user, ["roles"])
    user.roles.append(role)
    await db_session.commit()

    query = f"""
        query {{
            userWithRoles(id: "{user.id}") {{
                id
                email
                name
                roles {{
                    id
                    code
                    name
                }}
            }}
        }}
    """
    response = await client.post(
        "/graphql", json={"query": query}, headers=superadmin_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert "errors" not in data
    assert data["data"]["userWithRoles"]["email"] == "roletest@example.com"
    assert len(data["data"]["userWithRoles"]["roles"]) == 1
    assert data["data"]["userWithRoles"]["roles"][0]["code"] == "userrole"


@pytest.mark.asyncio
async def test_graphql_user_permissions(
    client: AsyncClient, db_session: AsyncSession, superadmin_headers: dict
):
    """Test getting user permissions via GraphQL."""
    from src.app.models import User

    user = User(email="permtest@example.com", name="Perm Test User", is_active=True)
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)

    perm = await create_permission(db_session, "user:perm", "User Perm")
    role = await create_role(db_session, "permrole", "Perm Role")
    await db_session.refresh(role, ["permissions"])
    role.permissions.append(perm)
    await db_session.commit()

    await db_session.refresh(user, ["roles"])
    user.roles.append(role)
    await db_session.commit()

    query = f"""
        query {{
            userPermissions(userId: "{user.id}") {{
                id
                code
                name
            }}
        }}
    """
    response = await client.post(
        "/graphql", json={"query": query}, headers=superadmin_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert "errors" not in data
    assert len(data["data"]["userPermissions"]) == 1
    assert data["data"]["userPermissions"][0]["code"] == "user:perm"


# User-Role Mutation Tests
@pytest.mark.asyncio
async def test_graphql_assign_role_to_user(
    client: AsyncClient, db_session: AsyncSession, superadmin_headers: dict
):
    """Test assigning a role to a user via GraphQL."""
    from src.app.models import User

    user = User(email="assignuser@example.com", name="Assign User", is_active=True)
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)

    role = await create_role(db_session, "assignuserrole", "Assign User Role")

    mutation = f"""
        mutation {{
            assignRoleToUser(userId: "{user.id}", roleId: {role.id}) {{
                message
            }}
        }}
    """
    response = await client.post(
        "/graphql", json={"query": mutation}, headers=superadmin_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert "errors" not in data
    assert (
        data["data"]["assignRoleToUser"]["message"]
        == "Role assigned to user successfully"
    )


@pytest.mark.asyncio
async def test_graphql_remove_role_from_user(
    client: AsyncClient, db_session: AsyncSession, superadmin_headers: dict
):
    """Test removing a role from a user via GraphQL."""
    from src.app.models import User

    user = User(email="removeuser@example.com", name="Remove User", is_active=True)
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)

    role = await create_role(db_session, "removeuserrole", "Remove User Role")
    await db_session.refresh(user, ["roles"])
    user.roles.append(role)
    await db_session.commit()

    mutation = f"""
        mutation {{
            removeRoleFromUser(userId: "{user.id}", roleId: {role.id}) {{
                message
            }}
        }}
    """
    response = await client.post(
        "/graphql", json={"query": mutation}, headers=superadmin_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert "errors" not in data
    assert (
        data["data"]["removeRoleFromUser"]["message"]
        == "Role removed from user successfully"
    )
