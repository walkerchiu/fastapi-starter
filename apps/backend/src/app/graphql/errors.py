"""GraphQL error types with error codes.

This module provides GraphQL-specific error classes.
ErrorCode is imported from the shared core module.
"""

from typing import Any

from src.app.core.error_codes import ErrorCode
from strawberry import BasePermission
from strawberry.exceptions import StrawberryGraphQLError
from strawberry.types import Info

# Re-export ErrorCode for backwards compatibility
__all__ = [
    "ErrorCode",
    "GraphQLError",
    "UnauthenticatedError",
    "InvalidCredentialsError",
    "InvalidTokenError",
    "InactiveUserError",
    "ForbiddenError",
    "ValidationError",
    "InvalidEmailError",
    "WeakPasswordError",
    "NotFoundError",
    "UserNotFoundError",
    "EmailAlreadyExistsError",
    "RateLimitedError",
    "QueryDepthError",
    "QueryComplexityError",
    "IsAuthenticated",
]


class GraphQLError(StrawberryGraphQLError):
    """Base GraphQL error with error code."""

    def __init__(
        self,
        message: str,
        code: ErrorCode,
        details: dict[str, Any] | None = None,
    ):
        self.code = code
        self.details = details or {}
        extensions = {"code": code.value, **self.details}
        super().__init__(message, extensions=extensions)


# Authentication Errors
class UnauthenticatedError(GraphQLError):
    """Raised when user is not authenticated."""

    def __init__(self, message: str = "User not authenticated."):
        super().__init__(message, ErrorCode.UNAUTHENTICATED)


class InvalidCredentialsError(GraphQLError):
    """Raised when login credentials are invalid."""

    def __init__(self, message: str = "Invalid email or password."):
        super().__init__(message, ErrorCode.INVALID_CREDENTIALS)


class InvalidTokenError(GraphQLError):
    """Raised when token is invalid."""

    def __init__(self, message: str = "Token is invalid or expired."):
        super().__init__(message, ErrorCode.INVALID_TOKEN)


class InactiveUserError(GraphQLError):
    """Raised when user account is inactive."""

    def __init__(self, message: str = "User account is disabled."):
        super().__init__(message, ErrorCode.INACTIVE_USER)


# Authorization Errors
class ForbiddenError(GraphQLError):
    """Raised when user doesn't have permission."""

    def __init__(self, message: str = "Access forbidden."):
        super().__init__(message, ErrorCode.FORBIDDEN)


# Validation Errors
class ValidationError(GraphQLError):
    """Raised when input validation fails."""

    def __init__(self, message: str, field: str | None = None):
        details = {"field": field} if field else {}
        super().__init__(message, ErrorCode.VALIDATION_ERROR, details)


class InvalidEmailError(GraphQLError):
    """Raised when email format is invalid."""

    def __init__(self, message: str = "Invalid email format."):
        super().__init__(message, ErrorCode.INVALID_EMAIL, {"field": "email"})


class WeakPasswordError(GraphQLError):
    """Raised when password doesn't meet requirements."""

    def __init__(self, message: str = "Password does not meet requirements."):
        super().__init__(message, ErrorCode.WEAK_PASSWORD, {"field": "password"})


# Resource Errors
class NotFoundError(GraphQLError):
    """Raised when resource is not found."""

    def __init__(
        self, resource: str = "Resource", resource_id: int | str | None = None
    ):
        message = f"{resource} not found."
        details = {"resource": resource}
        if resource_id is not None:
            details["id"] = resource_id
        super().__init__(message, ErrorCode.NOT_FOUND, details)


class UserNotFoundError(GraphQLError):
    """Raised when user is not found."""

    def __init__(self, user_id: int | None = None):
        details = {"resource": "User"}
        if user_id is not None:
            details["id"] = user_id
        super().__init__("User not found.", ErrorCode.USER_NOT_FOUND, details)


class EmailAlreadyExistsError(GraphQLError):
    """Raised when email already exists."""

    def __init__(self, email: str | None = None):
        details = {"field": "email"}
        if email:
            details["value"] = email
        super().__init__(
            "Email is already registered.", ErrorCode.EMAIL_ALREADY_EXISTS, details
        )


# Rate Limiting Errors
class RateLimitedError(GraphQLError):
    """Raised when rate limit is exceeded."""

    def __init__(self, retry_after: int | None = None):
        details = {}
        if retry_after:
            details["retry_after"] = retry_after
        super().__init__("Too many requests.", ErrorCode.RATE_LIMITED, details)


# Query Complexity Errors
class QueryDepthError(GraphQLError):
    """Raised when query depth exceeds the maximum allowed."""

    def __init__(self, depth: int, max_depth: int):
        details = {"depth": depth, "max_depth": max_depth}
        super().__init__(
            "Query exceeds maximum depth.", ErrorCode.QUERY_TOO_DEEP, details
        )


class QueryComplexityError(GraphQLError):
    """Raised when query complexity exceeds the maximum allowed."""

    def __init__(self, complexity: int, max_complexity: int):
        details = {"complexity": complexity, "max_complexity": max_complexity}
        super().__init__(
            "Query exceeds maximum complexity.", ErrorCode.QUERY_TOO_COMPLEX, details
        )


# Permission Classes
class IsAuthenticated(BasePermission):
    """Permission class to check if user is authenticated."""

    message = "User not authenticated"

    def has_permission(self, source: Any, info: Info, **kwargs: Any) -> bool:
        user = info.context.get("user")
        if not user:
            raise UnauthenticatedError()
        return True
