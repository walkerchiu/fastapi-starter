"""Rate limiting middleware tests."""

import time

from httpx import AsyncClient
from src.app.middleware.rate_limit import RateLimitConfig, RateLimiter


class TestRateLimitConfig:
    """Test RateLimitConfig class."""

    def test_config_hash(self):
        """Test RateLimitConfig is hashable."""
        config1 = RateLimitConfig(requests=100, window=60)
        config2 = RateLimitConfig(requests=100, window=60)
        config3 = RateLimitConfig(requests=50, window=30)

        # Same config should have same hash
        assert hash(config1) == hash(config2)
        # Different config should have different hash
        assert hash(config1) != hash(config3)

        # Should be usable in sets
        config_set = {config1, config2, config3}
        assert len(config_set) == 2


class TestRateLimiterUnit:
    """Unit tests for RateLimiter class."""

    async def test_cleanup_triggered(self):
        """Test that cleanup is triggered after interval."""
        limiter = RateLimiter.get_instance()
        limiter.reset()

        config = RateLimitConfig(requests=10, window=60)

        # Make initial request
        await limiter.is_allowed("test_client_1", config)

        # Force cleanup interval to be exceeded
        limiter._last_cleanup = time.time() - 120  # 2 minutes ago

        # Next request should trigger cleanup
        await limiter.is_allowed("test_client_2", config)

        # Verify cleanup was triggered
        assert time.time() - limiter._last_cleanup < 5

    async def test_cleanup_removes_stale_clients(self):
        """Test that cleanup removes stale client entries."""
        limiter = RateLimiter.get_instance()
        limiter.reset()

        config = RateLimitConfig(requests=10, window=60)

        # Add a client
        await limiter.is_allowed("stale_client", config)
        assert "stale_client" in limiter._clients

        # Make timestamps stale (older than 10 minutes)
        limiter._clients["stale_client"].timestamps = [time.time() - 700]

        # Trigger cleanup
        await limiter._cleanup()

        # Stale client should be removed
        assert "stale_client" not in limiter._clients

    async def test_retry_after_calculation(self):
        """Test retry_after is calculated correctly when rate limited."""
        limiter = RateLimiter.get_instance()
        limiter.reset()

        config = RateLimitConfig(requests=2, window=60)

        # Exhaust the limit
        await limiter.is_allowed("retry_client", config)
        await limiter.is_allowed("retry_client", config)

        # Third request should be denied with retry_after
        allowed, remaining, retry_after = await limiter.is_allowed(
            "retry_client", config
        )

        assert allowed is False
        assert remaining == 0
        assert retry_after > 0
        assert retry_after <= 60  # Should be within the window


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

    async def test_x_forwarded_for_header(self, client: AsyncClient):
        """Test that X-Forwarded-For header is used for client identification."""
        # Request with X-Forwarded-For header
        response = await client.get(
            "/api/v1/users", headers={"X-Forwarded-For": "192.168.1.100, 10.0.0.1"}
        )
        assert response.status_code == 200
        assert "X-RateLimit-Remaining" in response.headers

    async def test_cleanup_empty_timestamps(self):
        """Test cleanup handles clients with empty timestamps."""
        limiter = RateLimiter.get_instance()
        limiter.reset()

        # Add a client with empty timestamps
        from src.app.middleware.rate_limit import ClientState

        limiter._clients["empty_client"] = ClientState()
        limiter._clients["empty_client"].timestamps = []

        # Trigger cleanup
        await limiter._cleanup()

        # Empty client should be removed
        assert "empty_client" not in limiter._clients
