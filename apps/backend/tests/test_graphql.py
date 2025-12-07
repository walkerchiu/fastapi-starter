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
