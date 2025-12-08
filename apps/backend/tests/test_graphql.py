"""GraphQL endpoint tests."""

from httpx import AsyncClient


class TestGraphQLEndpoint:
    """Test GraphQL endpoint."""

    async def test_hello_query(self, client: AsyncClient):
        """Test basic hello query."""
        query = """
            query {
                hello
            }
        """
        response = await client.post("/graphql", json={"query": query})
        assert response.status_code == 200
        data = response.json()
        assert data["data"]["hello"] == "Hello from GraphQL!"

    async def test_ping_mutation(self, client: AsyncClient):
        """Test basic ping mutation."""
        mutation = """
            mutation {
                ping
            }
        """
        response = await client.post("/graphql", json={"query": mutation})
        assert response.status_code == 200
        data = response.json()
        assert data["data"]["ping"] == "pong"

    async def test_graphql_playground_accessible(self, client: AsyncClient):
        """Test that GraphQL playground is accessible."""
        response = await client.get("/graphql")
        assert response.status_code == 200


class TestGraphQLUserQueries:
    """Test GraphQL user queries."""

    async def test_users_query_empty(self, client: AsyncClient):
        """Test users query returns empty list when no users."""
        query = """
            query {
                users {
                    items {
                        id
                        email
                        name
                        isActive
                    }
                    total
                    skip
                    limit
                    hasMore
                }
            }
        """
        response = await client.post("/graphql", json={"query": query})
        assert response.status_code == 200
        data = response.json()
        assert data["data"]["users"]["items"] == []
        assert data["data"]["users"]["total"] == 0
        assert data["data"]["users"]["hasMore"] is False

    async def test_user_query_not_found(self, client: AsyncClient):
        """Test user query returns null for non-existent user."""
        query = """
            query {
                user(id: 9999) {
                    id
                    email
                    name
                }
            }
        """
        response = await client.post("/graphql", json={"query": query})
        assert response.status_code == 200
        data = response.json()
        assert data["data"]["user"] is None


class TestGraphQLUserMutations:
    """Test GraphQL user mutations."""

    async def test_create_user(self, client: AsyncClient):
        """Test creating a user via GraphQL."""
        mutation = """
            mutation {
                createUser(input: {email: "test@example.com", name: "Test User"}) {
                    id
                    email
                    name
                    isActive
                }
            }
        """
        response = await client.post("/graphql", json={"query": mutation})
        assert response.status_code == 200
        data = response.json()
        user = data["data"]["createUser"]
        assert user["email"] == "test@example.com"
        assert user["name"] == "Test User"
        assert user["isActive"] is True
        assert user["id"] is not None

    async def test_update_user(self, client: AsyncClient):
        """Test updating a user via GraphQL."""
        # First create a user
        create_mutation = """
            mutation {
                createUser(input: {email: "update@example.com", name: "Original"}) {
                    id
                }
            }
        """
        response = await client.post("/graphql", json={"query": create_mutation})
        user_id = response.json()["data"]["createUser"]["id"]

        # Update the user
        update_mutation = f"""
            mutation {{
                updateUser(id: {user_id}, input: {{name: "Updated Name"}}) {{
                    id
                    email
                    name
                }}
            }}
        """
        response = await client.post("/graphql", json={"query": update_mutation})
        assert response.status_code == 200
        data = response.json()
        user = data["data"]["updateUser"]
        assert user["name"] == "Updated Name"
        assert user["email"] == "update@example.com"

    async def test_delete_user(self, client: AsyncClient):
        """Test deleting a user via GraphQL."""
        # First create a user
        create_mutation = """
            mutation {
                createUser(input: {email: "delete@example.com", name: "To Delete"}) {
                    id
                }
            }
        """
        response = await client.post("/graphql", json={"query": create_mutation})
        user_id = response.json()["data"]["createUser"]["id"]

        # Delete the user
        delete_mutation = f"""
            mutation {{
                deleteUser(id: {user_id}) {{
                    message
                }}
            }}
        """
        response = await client.post("/graphql", json={"query": delete_mutation})
        assert response.status_code == 200
        data = response.json()
        assert data["data"]["deleteUser"]["message"] == "User deleted successfully"

        # Verify user is deleted
        query = f"""
            query {{
                user(id: {user_id}) {{
                    id
                }}
            }}
        """
        response = await client.post("/graphql", json={"query": query})
        data = response.json()
        assert data["data"]["user"] is None

    async def test_delete_user_not_found(self, client: AsyncClient):
        """Test deleting a non-existent user raises error with code."""
        mutation = """
            mutation {
                deleteUser(id: 9999) {
                    message
                }
            }
        """
        response = await client.post("/graphql", json={"query": mutation})
        assert response.status_code == 200
        data = response.json()
        assert "errors" in data
        error = data["errors"][0]
        assert "User not found" in error["message"]
        assert error["extensions"]["code"] == "USER_NOT_FOUND"
        assert error["extensions"]["id"] == "9999"


class TestGraphQLAuthMutations:
    """Test GraphQL auth mutations."""

    async def test_register(self, client: AsyncClient):
        """Test user registration via GraphQL."""
        mutation = """
            mutation {
                register(input: {
                    email: "graphql@example.com",
                    name: "GraphQL User",
                    password: "securepassword123"
                }) {
                    id
                    email
                    name
                    isActive
                }
            }
        """
        response = await client.post("/graphql", json={"query": mutation})
        assert response.status_code == 200
        data = response.json()
        user = data["data"]["register"]
        assert user["email"] == "graphql@example.com"
        assert user["name"] == "GraphQL User"
        assert user["isActive"] is True

    async def test_login(self, client: AsyncClient):
        """Test user login via GraphQL."""
        # First register a user
        register_mutation = """
            mutation {
                register(input: {
                    email: "login@example.com",
                    name: "Login User",
                    password: "securepassword123"
                }) {
                    id
                }
            }
        """
        await client.post("/graphql", json={"query": register_mutation})

        # Then login
        login_mutation = """
            mutation {
                login(input: {email: "login@example.com", password: "securepassword123"}) {
                    accessToken
                    refreshToken
                    tokenType
                }
            }
        """
        response = await client.post("/graphql", json={"query": login_mutation})
        assert response.status_code == 200
        data = response.json()
        token = data["data"]["login"]
        assert token["accessToken"] is not None
        assert token["refreshToken"] is not None
        assert token["tokenType"] == "bearer"

    async def test_refresh_token(self, client: AsyncClient):
        """Test token refresh via GraphQL."""
        # First register and login
        register_mutation = """
            mutation {
                register(input: {
                    email: "refresh@example.com",
                    name: "Refresh User",
                    password: "securepassword123"
                }) {
                    id
                }
            }
        """
        await client.post("/graphql", json={"query": register_mutation})

        login_mutation = """
            mutation {
                login(input: {email: "refresh@example.com", password: "securepassword123"}) {
                    refreshToken
                }
            }
        """
        response = await client.post("/graphql", json={"query": login_mutation})
        refresh_token = response.json()["data"]["login"]["refreshToken"]

        # Refresh the token
        refresh_mutation = f"""
            mutation {{
                refreshToken(input: {{refreshToken: "{refresh_token}"}}) {{
                    accessToken
                    refreshToken
                }}
            }}
        """
        response = await client.post("/graphql", json={"query": refresh_mutation})
        assert response.status_code == 200
        data = response.json()
        new_token = data["data"]["refreshToken"]
        assert new_token["accessToken"] is not None
        assert new_token["refreshToken"] is not None

    async def test_login_invalid_credentials(self, client: AsyncClient):
        """Test login with invalid credentials returns error with code."""
        mutation = """
            mutation {
                login(input: {email: "nonexistent@example.com", password: "wrongpassword"}) {
                    accessToken
                }
            }
        """
        response = await client.post("/graphql", json={"query": mutation})
        assert response.status_code == 200
        data = response.json()
        assert "errors" in data
        error = data["errors"][0]
        assert "Invalid email or password." in error["message"]
        assert error["extensions"]["code"] == "INVALID_CREDENTIALS"

    async def test_register_duplicate_email(self, client: AsyncClient):
        """Test registration with duplicate email returns error with code."""
        # First register a user
        mutation = """
            mutation {
                register(input: {
                    email: "duplicate@example.com",
                    name: "First User",
                    password: "securepassword123"
                }) {
                    id
                }
            }
        """
        await client.post("/graphql", json={"query": mutation})

        # Try to register with same email
        response = await client.post("/graphql", json={"query": mutation})
        assert response.status_code == 200
        data = response.json()
        assert "errors" in data
        error = data["errors"][0]
        assert "Email is already registered" in error["message"]
        assert error["extensions"]["code"] == "EMAIL_ALREADY_EXISTS"
        assert error["extensions"]["field"] == "email"


class TestGraphQLValidation:
    """Test GraphQL input validation."""

    async def test_register_invalid_email(self, client: AsyncClient):
        """Test registration with invalid email format."""
        mutation = """
            mutation {
                register(input: {
                    email: "invalid-email",
                    name: "Test User",
                    password: "securepassword123"
                }) {
                    id
                }
            }
        """
        response = await client.post("/graphql", json={"query": mutation})
        assert response.status_code == 200
        data = response.json()
        assert "errors" in data
        error = data["errors"][0]
        assert error["extensions"]["code"] == "INVALID_EMAIL"
        assert error["extensions"]["field"] == "email"

    async def test_register_weak_password(self, client: AsyncClient):
        """Test registration with weak password."""
        mutation = """
            mutation {
                register(input: {
                    email: "test@example.com",
                    name: "Test User",
                    password: "short"
                }) {
                    id
                }
            }
        """
        response = await client.post("/graphql", json={"query": mutation})
        assert response.status_code == 200
        data = response.json()
        assert "errors" in data
        error = data["errors"][0]
        assert error["extensions"]["code"] == "WEAK_PASSWORD"
        assert error["extensions"]["field"] == "password"

    async def test_register_empty_name(self, client: AsyncClient):
        """Test registration with empty name."""
        mutation = """
            mutation {
                register(input: {
                    email: "test@example.com",
                    name: "   ",
                    password: "securepassword123"
                }) {
                    id
                }
            }
        """
        response = await client.post("/graphql", json={"query": mutation})
        assert response.status_code == 200
        data = response.json()
        assert "errors" in data
        error = data["errors"][0]
        assert error["extensions"]["code"] == "VALIDATION_ERROR"
        assert error["extensions"]["field"] == "name"

    async def test_users_invalid_pagination(self, client: AsyncClient):
        """Test users query with invalid pagination."""
        query = """
            query {
                users(skip: -1) {
                    items {
                        id
                    }
                }
            }
        """
        response = await client.post("/graphql", json={"query": query})
        assert response.status_code == 200
        data = response.json()
        assert "errors" in data
        error = data["errors"][0]
        assert error["extensions"]["code"] == "VALIDATION_ERROR"
        assert error["extensions"]["field"] == "skip"

    async def test_users_limit_too_high(self, client: AsyncClient):
        """Test users query with limit too high."""
        query = """
            query {
                users(limit: 500) {
                    items {
                        id
                    }
                }
            }
        """
        response = await client.post("/graphql", json={"query": query})
        assert response.status_code == 200
        data = response.json()
        assert "errors" in data
        error = data["errors"][0]
        assert error["extensions"]["code"] == "VALIDATION_ERROR"
        assert error["extensions"]["field"] == "limit"


class TestGraphQLMeQuery:
    """Test GraphQL me query for authentication."""

    async def test_me_authenticated(self, client: AsyncClient):
        """Test me query returns current user when authenticated."""
        # First register and login
        register_mutation = """
            mutation {
                register(input: {
                    email: "metest@example.com",
                    name: "Me Test User",
                    password: "securepassword123"
                }) {
                    id
                }
            }
        """
        await client.post("/graphql", json={"query": register_mutation})

        login_mutation = """
            mutation {
                login(input: {email: "metest@example.com", password: "securepassword123"}) {
                    accessToken
                }
            }
        """
        response = await client.post("/graphql", json={"query": login_mutation})
        access_token = response.json()["data"]["login"]["accessToken"]

        # Query me with auth header
        me_query = """
            query {
                me {
                    id
                    email
                    name
                    isActive
                }
            }
        """
        response = await client.post(
            "/graphql",
            json={"query": me_query},
            headers={"Authorization": f"Bearer {access_token}"},
        )
        assert response.status_code == 200
        data = response.json()
        user = data["data"]["me"]
        assert user["email"] == "metest@example.com"
        assert user["name"] == "Me Test User"
        assert user["isActive"] is True

    async def test_me_unauthenticated(self, client: AsyncClient):
        """Test me query returns null when not authenticated."""
        me_query = """
            query {
                me {
                    id
                    email
                    name
                }
            }
        """
        response = await client.post("/graphql", json={"query": me_query})
        assert response.status_code == 200
        data = response.json()
        assert data["data"]["me"] is None

    async def test_me_invalid_token(self, client: AsyncClient):
        """Test me query returns null with invalid token."""
        me_query = """
            query {
                me {
                    id
                    email
                }
            }
        """
        response = await client.post(
            "/graphql",
            json={"query": me_query},
            headers={"Authorization": "Bearer invalidtoken"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["data"]["me"] is None


class TestGraphQLAuthEdgeCases:
    """Test GraphQL auth edge cases for coverage."""

    async def test_login_inactive_user(self, client: AsyncClient, db_session):
        """Test login with inactive user returns error."""
        from src.app.core import get_password_hash
        from src.app.models import User

        # Create an inactive user directly in DB
        inactive_user = User(
            email="inactive@example.com",
            name="Inactive User",
            hashed_password=get_password_hash("securepassword123"),
            is_active=False,
        )
        db_session.add(inactive_user)
        await db_session.commit()

        # Try to login
        mutation = """
            mutation {
                login(input: {email: "inactive@example.com", password: "securepassword123"}) {
                    accessToken
                }
            }
        """
        response = await client.post("/graphql", json={"query": mutation})
        assert response.status_code == 200
        data = response.json()
        assert "errors" in data
        error = data["errors"][0]
        assert error["message"] == "User account is disabled."
        assert error["extensions"]["code"] == "INACTIVE_USER"

    async def test_refresh_token_with_access_token(self, client: AsyncClient):
        """Test refresh token with access token returns error."""
        # Register and login to get access token
        register_mutation = """
            mutation {
                register(input: {
                    email: "accesstest@example.com",
                    name: "Access Test",
                    password: "securepassword123"
                }) {
                    id
                }
            }
        """
        await client.post("/graphql", json={"query": register_mutation})

        login_mutation = """
            mutation {
                login(input: {email: "accesstest@example.com", password: "securepassword123"}) {
                    accessToken
                }
            }
        """
        response = await client.post("/graphql", json={"query": login_mutation})
        access_token = response.json()["data"]["login"]["accessToken"]

        # Try to use access token as refresh token
        refresh_mutation = f"""
            mutation {{
                refreshToken(input: {{refreshToken: "{access_token}"}}) {{
                    accessToken
                }}
            }}
        """
        response = await client.post("/graphql", json={"query": refresh_mutation})
        assert response.status_code == 200
        data = response.json()
        assert "errors" in data
        error = data["errors"][0]
        assert error["extensions"]["code"] == "INVALID_TOKEN"

    async def test_refresh_token_invalid(self, client: AsyncClient):
        """Test refresh token with invalid token returns error."""
        mutation = """
            mutation {
                refreshToken(input: {refreshToken: "invalid.token.here"}) {
                    accessToken
                }
            }
        """
        response = await client.post("/graphql", json={"query": mutation})
        assert response.status_code == 200
        data = response.json()
        assert "errors" in data
        error = data["errors"][0]
        assert error["extensions"]["code"] == "INVALID_TOKEN"

    async def test_refresh_token_inactive_user(self, client: AsyncClient, db_session):
        """Test refresh token with inactive user returns error."""
        from src.app.core import get_password_hash
        from src.app.models import User

        # Create a user
        user = User(
            email="willbeinactive@example.com",
            name="Will Be Inactive",
            hashed_password=get_password_hash("securepassword123"),
            is_active=True,
        )
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)

        # Login to get refresh token
        login_mutation = """
            mutation {
                login(input: {
                    email: "willbeinactive@example.com",
                    password: "securepassword123"
                }) {
                    refreshToken
                }
            }
        """
        response = await client.post("/graphql", json={"query": login_mutation})
        refresh_token = response.json()["data"]["login"]["refreshToken"]

        # Deactivate user
        user.is_active = False
        await db_session.commit()

        # Try to refresh token
        refresh_mutation = f"""
            mutation {{
                refreshToken(input: {{refreshToken: "{refresh_token}"}}) {{
                    accessToken
                }}
            }}
        """
        response = await client.post("/graphql", json={"query": refresh_mutation})
        assert response.status_code == 200
        data = response.json()
        assert "errors" in data
        error = data["errors"][0]
        assert error["extensions"]["code"] == "INACTIVE_USER"


class TestGraphQLUserEdgeCases:
    """Test GraphQL user edge cases for coverage."""

    async def test_create_user_duplicate_email(self, client: AsyncClient):
        """Test creating user with duplicate email returns error."""
        # Create first user
        mutation = """
            mutation {
                createUser(input: {email: "duplicate2@example.com", name: "First"}) {
                    id
                }
            }
        """
        await client.post("/graphql", json={"query": mutation})

        # Try to create user with same email
        response = await client.post("/graphql", json={"query": mutation})
        assert response.status_code == 200
        data = response.json()
        assert "errors" in data
        error = data["errors"][0]
        assert error["extensions"]["code"] == "EMAIL_ALREADY_EXISTS"

    async def test_update_user_email(self, client: AsyncClient):
        """Test updating user email."""
        # Create user
        create_mutation = """
            mutation {
                createUser(input: {email: "updateemail@example.com", name: "Update Email"}) {
                    id
                }
            }
        """
        response = await client.post("/graphql", json={"query": create_mutation})
        user_id = response.json()["data"]["createUser"]["id"]

        # Update email
        update_mutation = f"""
            mutation {{
                updateUser(id: {user_id}, input: {{email: "newemail@example.com"}}) {{
                    id
                    email
                }}
            }}
        """
        response = await client.post("/graphql", json={"query": update_mutation})
        assert response.status_code == 200
        data = response.json()
        assert data["data"]["updateUser"]["email"] == "newemail@example.com"

    async def test_update_user_is_active(self, client: AsyncClient):
        """Test updating user is_active status."""
        # Create user
        create_mutation = """
            mutation {
                createUser(input: {email: "toggleactive@example.com", name: "Toggle"}) {
                    id
                    isActive
                }
            }
        """
        response = await client.post("/graphql", json={"query": create_mutation})
        user_id = response.json()["data"]["createUser"]["id"]
        assert response.json()["data"]["createUser"]["isActive"] is True

        # Deactivate user
        update_mutation = f"""
            mutation {{
                updateUser(id: {user_id}, input: {{isActive: false}}) {{
                    id
                    isActive
                }}
            }}
        """
        response = await client.post("/graphql", json={"query": update_mutation})
        assert response.status_code == 200
        data = response.json()
        assert data["data"]["updateUser"]["isActive"] is False

    async def test_update_user_not_found(self, client: AsyncClient):
        """Test updating non-existent user returns null."""
        mutation = """
            mutation {
                updateUser(id: 99999, input: {name: "New Name"}) {
                    id
                }
            }
        """
        response = await client.post("/graphql", json={"query": mutation})
        assert response.status_code == 200
        data = response.json()
        assert data["data"]["updateUser"] is None
