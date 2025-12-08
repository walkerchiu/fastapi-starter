"""Request ID middleware for request tracing."""

import uuid
from contextvars import ContextVar

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response

# Context variable to store request ID for the current request
request_id_ctx: ContextVar[str | None] = ContextVar("request_id", default=None)

# Header name for request ID
REQUEST_ID_HEADER = "X-Request-ID"


def get_request_id() -> str | None:
    """Get the current request ID from context."""
    return request_id_ctx.get()


class RequestIDMiddleware(BaseHTTPMiddleware):
    """Middleware to add request ID to each request for tracing."""

    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        """Add request ID to request and response."""
        # Get existing request ID from header or generate new one
        request_id = request.headers.get(REQUEST_ID_HEADER) or str(uuid.uuid4())

        # Store in context for logging
        token = request_id_ctx.set(request_id)

        try:
            # Process request
            response = await call_next(request)

            # Add request ID to response header
            response.headers[REQUEST_ID_HEADER] = request_id

            return response
        finally:
            # Reset context
            request_id_ctx.reset(token)
