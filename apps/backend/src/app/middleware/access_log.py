"""Access logging middleware."""

import logging
import time
from collections.abc import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger("access")


class AccessLogMiddleware(BaseHTTPMiddleware):
    """Middleware for logging HTTP access requests."""

    async def dispatch(
        self, request: Request, call_next: Callable[[Request], Response]
    ) -> Response:
        """Log request and response details."""
        start_time = time.time()

        # Process the request
        response = await call_next(request)

        # Calculate processing time
        process_time = time.time() - start_time

        # Get request details
        client_ip = request.client.host if request.client else "unknown"
        method = request.method
        path = request.url.path
        query = str(request.url.query) if request.url.query else ""
        status_code = response.status_code
        user_agent = request.headers.get("user-agent", "unknown")

        # Log the access
        log_message = (
            f'{client_ip} - "{method} {path}'
            f'{"?" + query if query else ""}" '
            f"{status_code} {process_time:.3f}s "
            f'"{user_agent}"'
        )

        if status_code >= 500:
            logger.error(log_message)
        elif status_code >= 400:
            logger.warning(log_message)
        else:
            logger.info(log_message)

        return response
