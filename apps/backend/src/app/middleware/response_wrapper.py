"""Response wrapper middleware for consistent API response format."""

import json
from typing import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp


class ResponseWrapperMiddleware(BaseHTTPMiddleware):
    """Middleware to wrap REST API responses with {success: true, data: ...} format.
    
    This middleware automatically wraps successful responses (status code 2xx)
    with a standardized format: {success: true, data: <original_response>}
    
    Exceptions and special cases:
    - Skips GraphQL endpoints (/graphql)
    - Skips health check endpoints (/health, /api/health)
    - Skips documentation endpoints (/docs, /redoc, /openapi.json)
    - Skips 204 No Content responses (already have no body)
    - Skips responses that are already wrapped (contain 'success' field)
    - Skips streaming responses (e.g., file downloads)
    """

    def __init__(
        self,
        app: ASGIApp,
        skip_paths: list[str] | None = None,
    ):
        """Initialize the response wrapper middleware.
        
        Args:
            app: The ASGI application
            skip_paths: Additional paths to skip wrapping (default: None)
        """
        super().__init__(app)
        self.default_skip_paths = {
            "/graphql",
            "/health",
            "/api/health",
            "/docs",
            "/api/docs",
            "/redoc",
            "/api/redoc",
            "/openapi.json",
            "/api/openapi.json",
        }
        if skip_paths:
            self.default_skip_paths.update(skip_paths)

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Process the request and wrap the response if needed."""
        # Check if path should be skipped
        if self._should_skip(request.path):
            return await call_next(request)

        # Get the response
        response = await call_next(request)

        # Skip if not a successful response (2xx) or is 204 No Content
        if not (200 <= response.status_code < 300) or response.status_code == 204:
            return response

        # Skip if streaming response
        if hasattr(response, "is_streaming") and response.is_streaming:
            return response

        # Read response body
        body = b""
        async for chunk in response.body_iterator:
            body += chunk

        # Skip if empty body
        if not body:
            return response

        # Try to parse as JSON
        try:
            data = json.loads(body.decode())
            
            # Skip if already wrapped (contains 'success' field)
            if isinstance(data, dict) and "success" in data:
                return response

            # Wrap the response
            wrapped_data = {
                "success": True,
                "data": data,
            }
            
            # Create new response with wrapped data
            return Response(
                content=json.dumps(wrapped_data),
                status_code=response.status_code,
                headers=dict(response.headers),
                media_type="application/json",
            )
        except (json.JSONDecodeError, UnicodeDecodeError):
            # If not JSON, return original response
            return Response(
                content=body,
                status_code=response.status_code,
                headers=dict(response.headers),
            )

    def _should_skip(self, path: str) -> bool:
        """Check if the path should skip response wrapping."""
        return any(path.startswith(skip_path) for skip_path in self.default_skip_paths)
