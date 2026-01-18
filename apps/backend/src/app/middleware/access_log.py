"""Access logging middleware using structlog."""

import time
from collections.abc import Callable, Sequence

from fastapi import Request, Response
from src.app.core.logging import get_logger
from starlette.middleware.base import BaseHTTPMiddleware

logger = get_logger("access")


class AccessLogMiddleware(BaseHTTPMiddleware):
    """Middleware for logging HTTP access requests with structured logging."""

    def __init__(
        self,
        app: "ASGIApp",  # noqa: F821
        skip_paths: Sequence[str] | None = None,
    ) -> None:
        """Initialize with optional skip paths.

        Args:
            app: ASGI application.
            skip_paths: Paths to skip from access logging (e.g., health checks).
        """
        super().__init__(app)
        self.skip_paths = set(skip_paths) if skip_paths else set()

    async def dispatch(
        self, request: Request, call_next: Callable[[Request], Response]
    ) -> Response:
        """Log request and response details in structured format."""
        path = request.url.path

        # Skip logging for configured paths
        if path in self.skip_paths:
            return await call_next(request)

        start_time = time.time()

        # Process the request
        response = await call_next(request)

        # Calculate processing time in milliseconds
        duration_ms = (time.time() - start_time) * 1000

        # Get request details
        client_ip = request.client.host if request.client else "unknown"
        method = request.method
        query = str(request.url.query) if request.url.query else None
        status_code = response.status_code
        user_agent = request.headers.get("user-agent", "unknown")

        # Build context dictionary matching log schema
        context = {
            "method": method,
            "path": path,
            "status": status_code,
            "duration_ms": round(duration_ms, 2),
            "ip": client_ip,
            "user_agent": user_agent,
        }
        if query:
            context["query"] = query

        # Log based on status code
        message = f"{method} {path} completed"
        if status_code >= 500:
            logger.error(message, **context)
        elif status_code >= 400:
            logger.warning(message, **context)
        else:
            logger.info(message, **context)

        return response
