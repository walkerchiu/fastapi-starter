"""Health check endpoint tests."""

from httpx import AsyncClient


class TestHealthEndpoints:
    """Test health check endpoints."""

    async def test_health_check(self, client: AsyncClient):
        """Test comprehensive health check endpoint."""
        response = await client.get("/health")
        assert response.status_code == 200

        data = response.json()
        assert data["status"] in ["healthy", "unhealthy", "degraded"]
        assert "timestamp" in data
        assert "version" in data
        assert "environment" in data
        assert "components" in data
        assert "database" in data["components"]

    async def test_health_check_database_component(self, client: AsyncClient):
        """Test that database component is included in health check."""
        response = await client.get("/health")
        assert response.status_code == 200

        data = response.json()
        db_health = data["components"]["database"]
        assert db_health["status"] == "healthy"
        assert "latency_ms" in db_health

    async def test_liveness_probe(self, client: AsyncClient):
        """Test liveness probe endpoint."""
        response = await client.get("/health/live")
        assert response.status_code == 200
        assert response.json() == {"status": "OK"}

    async def test_readiness_probe(self, client: AsyncClient):
        """Test readiness probe endpoint."""
        response = await client.get("/health/ready")
        assert response.status_code == 200
        assert response.json() == {"status": "ready"}


class TestHealthStatus:
    """Test health status values."""

    async def test_health_status_healthy(self, client: AsyncClient):
        """Test that health status is healthy when all components are up."""
        response = await client.get("/health")
        assert response.status_code == 200

        data = response.json()
        # With SQLite in-memory, database should always be healthy in tests
        assert data["status"] == "healthy"
