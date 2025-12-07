"""HTTPS redirect middleware.

This module provides HTTPS redirect middleware for FastAPI applications.
For simpler usage, use the built-in HTTPSRedirectMiddleware from starlette:

    from starlette.middleware.httpsredirect import HTTPSRedirectMiddleware

    app.add_middleware(HTTPSRedirectMiddleware)

This custom implementation provides additional configuration options.
"""

from collections.abc import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import RedirectResponse


class HTTPSRedirectMiddleware(BaseHTTPMiddleware):
    """Middleware for redirecting HTTP requests to HTTPS.

    Args:
        exclude_paths: List of paths to exclude from HTTPS redirect.
            Useful for health check endpoints.
    """

    def __init__(self, app, exclude_paths: list[str] | None = None):
        """Initialize the middleware."""
        super().__init__(app)
        self.exclude_paths = exclude_paths or [
            "/health",
            "/health/live",
            "/health/ready",
        ]

    async def dispatch(
        self, request: Request, call_next: Callable[[Request], Response]
    ) -> Response:
        """Redirect HTTP to HTTPS if not already secure."""
        # Skip excluded paths (e.g., health checks)
        if request.url.path in self.exclude_paths:
            return await call_next(request)

        # Check if request is already HTTPS
        # Also check X-Forwarded-Proto for requests behind a reverse proxy
        forwarded_proto = request.headers.get("x-forwarded-proto")
        if request.url.scheme == "https" or forwarded_proto == "https":
            return await call_next(request)

        # Redirect to HTTPS
        https_url = request.url.replace(scheme="https")
        return RedirectResponse(url=str(https_url), status_code=301)
