"""GZIP compression middleware.

This module provides GZIP compression middleware for FastAPI applications.
For better performance, use the built-in GZipMiddleware from starlette:

    from starlette.middleware.gzip import GZipMiddleware

    app.add_middleware(GZipMiddleware, minimum_size=1000)

This custom implementation is provided for reference and customization.
"""

import gzip
import io
from collections.abc import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware


class GzipMiddleware(BaseHTTPMiddleware):
    """Middleware for GZIP compression of responses.

    Args:
        minimum_size: Minimum response size in bytes to compress.
            Defaults to 500 bytes.
        compresslevel: GZIP compression level (1-9).
            Defaults to 6.
    """

    def __init__(self, app, minimum_size: int = 500, compresslevel: int = 6):
        """Initialize the middleware."""
        super().__init__(app)
        self.minimum_size = minimum_size
        self.compresslevel = compresslevel

    async def dispatch(
        self, request: Request, call_next: Callable[[Request], Response]
    ) -> Response:
        """Compress response if client accepts gzip and response is large enough."""
        # Check if client accepts gzip
        accept_encoding = request.headers.get("accept-encoding", "")
        if "gzip" not in accept_encoding.lower():
            return await call_next(request)

        # Get the response
        response = await call_next(request)

        # Don't compress if already encoded or streaming
        content_encoding = response.headers.get("content-encoding")
        if content_encoding:
            return response

        # Get response body
        body = b""
        async for chunk in response.body_iterator:
            body += chunk

        # Don't compress small responses
        if len(body) < self.minimum_size:
            return Response(
                content=body,
                status_code=response.status_code,
                headers=dict(response.headers),
                media_type=response.media_type,
            )

        # Compress the body
        buffer = io.BytesIO()
        with gzip.GzipFile(
            mode="wb", fileobj=buffer, compresslevel=self.compresslevel
        ) as f:
            f.write(body)
        compressed_body = buffer.getvalue()

        # Return compressed response
        headers = dict(response.headers)
        headers["content-encoding"] = "gzip"
        headers["content-length"] = str(len(compressed_body))

        return Response(
            content=compressed_body,
            status_code=response.status_code,
            headers=headers,
            media_type=response.media_type,
        )
