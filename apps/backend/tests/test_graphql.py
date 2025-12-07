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
        """Test deleting a non-existent user returns false."""
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
        assert data["data"]["deleteUser"] is False


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
        """Test login with invalid credentials."""
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
        assert "Invalid email or password" in data["errors"][0]["message"]
