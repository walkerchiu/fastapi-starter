"""Rate limiting middleware using sliding window algorithm."""

import asyncio
import time
from collections import defaultdict
from dataclasses import dataclass, field

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse


@dataclass
class RateLimitConfig:
    """Rate limit configuration for a specific route pattern."""

    requests: int  # Number of requests allowed
    window: int  # Time window in seconds

    def __hash__(self):
        return hash((self.requests, self.window))


@dataclass
class ClientState:
    """Tracks request timestamps for a client."""

    timestamps: list[float] = field(default_factory=list)
    lock: asyncio.Lock = field(default_factory=asyncio.Lock)


class RateLimiter:
    """In-memory rate limiter using sliding window algorithm."""

    _instance: "RateLimiter | None" = None

    def __new__(cls):
        """Singleton pattern to allow reset across tests."""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
        self._clients: dict[str, ClientState] = defaultdict(ClientState)
        self._cleanup_interval = 60  # Cleanup every 60 seconds
        self._last_cleanup = time.time()
        self._initialized = True

    def reset(self):
        """Reset all rate limit counters. Useful for testing."""
        self._clients.clear()
        self._last_cleanup = time.time()

    @classmethod
    def get_instance(cls) -> "RateLimiter":
        """Get the singleton instance."""
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    async def is_allowed(
        self, client_id: str, config: RateLimitConfig
    ) -> tuple[bool, int, int]:
        """Check if request is allowed.

        Returns:
            Tuple of (allowed, remaining_requests, retry_after_seconds)
        """
        now = time.time()
        window_start = now - config.window

        # Periodic cleanup of old client data
        if now - self._last_cleanup > self._cleanup_interval:
            await self._cleanup()

        client = self._clients[client_id]

        async with client.lock:
            # Remove expired timestamps
            client.timestamps = [ts for ts in client.timestamps if ts > window_start]

            # Check if allowed
            if len(client.timestamps) < config.requests:
                client.timestamps.append(now)
                remaining = config.requests - len(client.timestamps)
                return True, remaining, 0

            # Calculate retry-after
            oldest_in_window = min(client.timestamps) if client.timestamps else now
            retry_after = int(oldest_in_window - window_start) + 1

            return False, 0, retry_after

    async def _cleanup(self):
        """Remove stale client entries."""
        now = time.time()
        self._last_cleanup = now

        # Find clients with no recent activity (older than 10 minutes)
        stale_threshold = now - 600
        stale_clients = [
            client_id
            for client_id, state in self._clients.items()
            if not state.timestamps or max(state.timestamps) < stale_threshold
        ]

        for client_id in stale_clients:
            del self._clients[client_id]


class RateLimitMiddleware(BaseHTTPMiddleware):
    """FastAPI middleware for rate limiting."""

    def __init__(
        self,
        app,
        default_limit: RateLimitConfig | None = None,
        route_limits: dict[str, RateLimitConfig] | None = None,
        exclude_paths: list[str] | None = None,
    ):
        super().__init__(app)
        self.limiter = RateLimiter()
        self.default_limit = default_limit or RateLimitConfig(requests=100, window=60)
        self.route_limits = route_limits or {}
        self.exclude_paths = set(
            exclude_paths or ["/", "/health", "/docs", "/openapi.json"]
        )

    def _get_client_id(self, request: Request) -> str:
        """Get client identifier from request."""
        # Use X-Forwarded-For if behind proxy, otherwise use client host
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            # Take the first IP in the chain (original client)
            return forwarded.split(",")[0].strip()
        return request.client.host if request.client else "unknown"

    def _get_rate_limit_config(self, path: str) -> RateLimitConfig | None:
        """Get rate limit config for a path."""
        # Check if path is excluded
        if path in self.exclude_paths:
            return None

        # Check for specific route limits
        for pattern, config in self.route_limits.items():
            if path.startswith(pattern):
                return config

        return self.default_limit

    async def dispatch(self, request: Request, call_next) -> Response:
        """Process request and apply rate limiting."""
        path = request.url.path
        config = self._get_rate_limit_config(path)

        # Skip rate limiting for excluded paths
        if config is None:
            return await call_next(request)

        client_id = self._get_client_id(request)
        # Include path prefix in the key for per-route limiting
        rate_key = f"{client_id}:{path.split('/')[1] if '/' in path else path}"

        allowed, remaining, retry_after = await self.limiter.is_allowed(
            rate_key, config
        )

        if not allowed:
            return JSONResponse(
                status_code=429,
                content={
                    "error": "Too Many Requests",
                    "message": "Too many requests.",
                    "retry_after": retry_after,
                },
                headers={
                    "Retry-After": str(retry_after),
                    "X-RateLimit-Limit": str(config.requests),
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset": str(int(time.time()) + retry_after),
                },
            )

        response = await call_next(request)

        # Add rate limit headers to successful responses
        response.headers["X-RateLimit-Limit"] = str(config.requests)
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        response.headers["X-RateLimit-Reset"] = str(int(time.time()) + config.window)

        return response
