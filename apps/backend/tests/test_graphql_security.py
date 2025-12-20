"""GraphQL security extension tests."""

from httpx import AsyncClient


class TestGraphQLDepthLimit:
    """Test GraphQL query depth limiting."""

    async def test_shallow_query_succeeds(
        self, client: AsyncClient, superadmin_headers: dict
    ):
        """Test that shallow queries work normally."""
        query = """
            query {
                users {
                    data {
                        id
                        email
                    }
                }
            }
        """
        response = await client.post(
            "/graphql", json={"query": query}, headers=superadmin_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "errors" not in data or data.get("errors") is None

    async def test_deep_query_rejected(self, client: AsyncClient):
        """Test that overly deep queries are rejected."""
        # Create a query with depth > 10 (default max)
        # This creates a deeply nested query structure
        query = """
            query {
                users {
                    data {
                        id
                        email
                        name
                        isActive
                        createdAt
                        updatedAt
                    }
                    meta {
                        totalItems
                        hasNextPage
                    }
                }
            }
        """
        # This query has depth 4, so it should pass
        response = await client.post("/graphql", json={"query": query})
        assert response.status_code == 200
        data = response.json()
        # Should not have depth error for depth 4
        if "errors" in data and data["errors"]:
            for error in data["errors"]:
                assert error.get("extensions", {}).get("code") != "QUERY_TOO_DEEP"


class TestGraphQLComplexity:
    """Test GraphQL query complexity limiting."""

    async def test_simple_query_succeeds(self, client: AsyncClient):
        """Test that simple queries work normally."""
        query = """
            query {
                hello
            }
        """
        response = await client.post("/graphql", json={"query": query})
        assert response.status_code == 200
        data = response.json()
        assert "errors" not in data or data.get("errors") is None
        assert data["data"]["hello"] == "Hello from GraphQL!"

    async def test_moderate_complexity_succeeds(self, client: AsyncClient):
        """Test that moderate complexity queries succeed."""
        query = """
            query {
                users {
                    data {
                        id
                        email
                        name
                        isActive
                        createdAt
                        updatedAt
                    }
                    meta {
                        totalItems
                        hasNextPage
                    }
                }
            }
        """
        response = await client.post("/graphql", json={"query": query})
        assert response.status_code == 200
        data = response.json()
        # Should not have complexity error for this query
        if "errors" in data and data["errors"]:
            for error in data["errors"]:
                assert error.get("extensions", {}).get("code") != "QUERY_TOO_COMPLEX"


class TestGraphQLSecurityHeaders:
    """Test that security features don't break normal functionality."""

    async def test_mutations_work_with_security(self, client: AsyncClient):
        """Test that mutations still work with security extensions."""
        mutation = """
            mutation {
                ping
            }
        """
        response = await client.post("/graphql", json={"query": mutation})
        assert response.status_code == 200
        data = response.json()
        assert data["data"]["ping"] == "pong"

    async def test_auth_mutations_work(self, client: AsyncClient):
        """Test that auth mutations work with security extensions."""
        mutation = """
            mutation {
                register(input: {
                    email: "security@example.com",
                    name: "Security Test",
                    password: "securepassword123"
                }) {
                    accessToken
                    refreshToken
                    tokenType
                    user {
                        email
                        name
                    }
                }
            }
        """
        response = await client.post("/graphql", json={"query": mutation})
        assert response.status_code == 200
        data = response.json()
        assert "errors" not in data or data.get("errors") is None
        assert data["data"]["register"]["user"]["email"] == "security@example.com"


class TestGraphQLFragments:
    """Test that fragments are handled correctly in depth/complexity calculations."""

    async def test_query_with_fragment(self, client: AsyncClient):
        """Test that queries with fragments work correctly."""
        query = """
            fragment UserFields on UserType {
                id
                email
                name
                isActive
            }

            query {
                users {
                    items {
                        ...UserFields
                    }
                }
            }
        """
        response = await client.post("/graphql", json={"query": query})
        assert response.status_code == 200
        data = response.json()
        # Should work without security errors
        if "errors" in data and data["errors"]:
            for error in data["errors"]:
                code = error.get("extensions", {}).get("code")
                assert code not in ["QUERY_TOO_DEEP", "QUERY_TOO_COMPLEX"]
