from fastapi import Request, Response

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint

from app.common.log import log
from app.utils.timezone import timezone


class AccessMiddleware(BaseHTTPMiddleware):
    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        """
        Middleware to log access information for each request.

        Args:
        - request (Request): The incoming request.
        - call_next (RequestResponseEndpoint): The next middleware or request handler.

        Returns:
        - Response: The response from the request handler.
        """
        start_time = timezone.now()
        response = await call_next(request)
        end_time = timezone.now()

        if request.client:
            log.info(
                f"{response.status_code} {request.client.host} {request.method} {request.url} {end_time - start_time}"
            )
        else:
            log.info(
                f"{response.status_code} localhost {request.method} {request.url} {end_time - start_time}"
            )

        return response
