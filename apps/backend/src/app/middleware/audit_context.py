"""Audit context middleware for capturing request information."""

from src.app.core.audit import (
    AuditContext,
    audit_context_var,
    get_client_ip,
    get_user_agent,
)
from src.app.middleware.request_id import get_request_id
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response


class AuditContextMiddleware(BaseHTTPMiddleware):
    """Middleware to set up audit context for each request.

    This middleware extracts client information (IP, User-Agent) from the
    request and stores it in a context variable that can be accessed by
    the audit logging functions.
    """

    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        """Set up audit context and process request."""
        # Extract client information
        client_ip = get_client_ip(request)
        user_agent = get_user_agent(request)
        request_id = get_request_id()

        # Create audit context
        # Note: actor_id will be set later if user is authenticated
        context = AuditContext(
            actor_id=None,
            actor_ip=client_ip,
            actor_user_agent=user_agent,
            request_id=request_id,
        )

        # Store in context variable
        token = audit_context_var.set(context)

        try:
            response = await call_next(request)
            return response
        finally:
            # Reset context
            audit_context_var.reset(token)
