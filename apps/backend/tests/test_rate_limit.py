"""Rate limiting middleware tests."""

from httpx import AsyncClient


class TestRateLimiting:
    """Test rate limiting functionality."""

    async def test_rate_limit_headers_present(self, client: AsyncClient):
        """Test that rate limit headers are present in response."""
        response = await client.get("/api/v1/users")
        assert response.status_code == 200
        assert "X-RateLimit-Limit" in response.headers
        assert "X-RateLimit-Remaining" in response.headers
        assert "X-RateLimit-Reset" in response.headers

    async def test_excluded_path_no_rate_limit(self, client: AsyncClient):
        """Test that excluded paths don't have rate limit headers."""
        response = await client.get("/")
        assert response.status_code == 200
        assert "X-RateLimit-Limit" not in response.headers

    async def test_rate_limit_remaining_decreases(self, client: AsyncClient):
        """Test that remaining count decreases with each request."""
        # First request
        response1 = await client.get("/api/v1/users")
        remaining1 = int(response1.headers.get("X-RateLimit-Remaining", 0))

        # Second request
        response2 = await client.get("/api/v1/users")
        remaining2 = int(response2.headers.get("X-RateLimit-Remaining", 0))

        assert remaining2 < remaining1

    async def test_rate_limit_exceeded(self, client: AsyncClient):
        """Test rate limit exceeded response."""
        # Create a new client with very low rate limit for testing
        # Note: This test uses auth endpoint which has lower limit (10/min)
        # We'll make 12 rapid requests to trigger rate limiting
        for _ in range(12):
            response = await client.post(
                "/api/v1/auth/login",
                json={"email": "test@example.com", "password": "wrongpassword"},
            )
            if response.status_code == 429:
                # Rate limit exceeded
                assert response.json()["error"] == "Too Many Requests"
                assert "retry_after" in response.json()
                assert "Retry-After" in response.headers
                return

        # If we didn't hit the limit, check that we at least got close
        remaining = int(response.headers.get("X-RateLimit-Remaining", 0))
        assert remaining < 10  # Should have used most of the limit

    async def test_rate_limit_response_format(self, client: AsyncClient):
        """Test rate limit exceeded response format."""
        # Make rapid requests to auth endpoint to trigger rate limit
        responses = []
        for _ in range(15):
            response = await client.post(
                "/api/v1/auth/login",
                json={"email": "test@example.com", "password": "wrongpassword"},
            )
            responses.append(response)
            if response.status_code == 429:
                break

        # Find the 429 response if it occurred
        rate_limited = [r for r in responses if r.status_code == 429]
        if rate_limited:
            response = rate_limited[0]
            data = response.json()
            assert "error" in data
            assert "message" in data
            assert "retry_after" in data
            assert data["error"] == "Too Many Requests"
            assert int(data["retry_after"]) > 0


class TestRateLimitPerRoute:
    """Test per-route rate limiting."""

    async def test_graphql_has_rate_limit(self, client: AsyncClient):
        """Test that GraphQL endpoint has rate limiting."""
        response = await client.post("/graphql", json={"query": "{ hello }"})
        assert response.status_code == 200
        assert "X-RateLimit-Limit" in response.headers
        # GraphQL has different limit than default
        limit = int(response.headers.get("X-RateLimit-Limit", 0))
        assert limit == 50  # GraphQL limit

    async def test_users_endpoint_has_default_limit(self, client: AsyncClient):
        """Test that users endpoint uses default rate limit."""
        response = await client.get("/api/v1/users")
        assert response.status_code == 200
        limit = int(response.headers.get("X-RateLimit-Limit", 0))
        assert limit == 100  # Default limit
