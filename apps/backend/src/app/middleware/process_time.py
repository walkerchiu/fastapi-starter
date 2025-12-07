"""Process time middleware."""

import time
from collections.abc import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware


class ProcessTimeMiddleware(BaseHTTPMiddleware):
    """Middleware for adding X-Process-Time header to responses.

    This middleware measures the time taken to process each request
    and adds it as a response header for monitoring purposes.
    """

    async def dispatch(
        self, request: Request, call_next: Callable[[Request], Response]
    ) -> Response:
        """Add processing time header to response."""
        start_time = time.perf_counter()

        response = await call_next(request)

        process_time = time.perf_counter() - start_time
        response.headers["X-Process-Time"] = f"{process_time:.4f}"

        return response
