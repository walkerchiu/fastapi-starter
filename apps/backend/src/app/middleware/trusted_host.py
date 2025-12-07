"""Trusted host middleware.

This module provides trusted host validation middleware for FastAPI applications.
For simpler usage, use the built-in TrustedHostMiddleware from starlette:

    from starlette.middleware.trustedhost import TrustedHostMiddleware

    app.add_middleware(TrustedHostMiddleware, allowed_hosts=["example.com"])

This custom implementation provides additional configuration options.
"""

from collections.abc import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import PlainTextResponse


class TrustedHostMiddleware(BaseHTTPMiddleware):
    """Middleware for validating the Host header against a list of allowed hosts.

    This prevents HTTP Host header attacks by ensuring requests
    only come from trusted hosts.

    Args:
        allowed_hosts: List of allowed host names.
            Use ["*"] to allow all hosts (not recommended for production).
        allow_localhost: Whether to allow localhost and 127.0.0.1.
            Defaults to True for development convenience.
    """

    def __init__(
        self,
        app,
        allowed_hosts: list[str] | None = None,
        allow_localhost: bool = True,
    ):
        """Initialize the middleware."""
        super().__init__(app)
        self.allowed_hosts = set(allowed_hosts or [])
        self.allow_all = "*" in self.allowed_hosts

        if allow_localhost:
            self.allowed_hosts.update(["localhost", "127.0.0.1", "[::1]"])

    async def dispatch(
        self, request: Request, call_next: Callable[[Request], Response]
    ) -> Response:
        """Validate the Host header against allowed hosts."""
        if self.allow_all:
            return await call_next(request)

        host = request.headers.get("host", "").split(":")[0]

        if host not in self.allowed_hosts:
            return PlainTextResponse("Invalid host header", status_code=400)

        return await call_next(request)
