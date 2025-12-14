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
    "InsufficientPermissionsError",
    "ValidationError",
    "InvalidEmailError",
    "WeakPasswordError",
    "NotFoundError",
    "UserNotFoundError",
    "PermissionNotFoundError",
    "RoleNotFoundError",
    "CannotModifySystemRoleError",
    "EmailAlreadyExistsError",
    "RateLimitedError",
    "QueryDepthError",
    "QueryComplexityError",
    "IsAuthenticated",
    "RequirePermissions",
    "RequireSuperadmin",
    "require_permissions",
    "require_superadmin",
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


class InsufficientPermissionsError(GraphQLError):
    """Raised when user lacks required permissions."""

    def __init__(
        self,
        message: str = "User lacks required permissions.",
        required_permissions: list[str] | None = None,
        required_roles: list[str] | None = None,
    ):
        details: dict[str, Any] = {}
        if required_permissions:
            details["required_permissions"] = required_permissions
        if required_roles:
            details["required_roles"] = required_roles
        super().__init__(message, ErrorCode.INSUFFICIENT_PERMISSIONS, details)


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


class PermissionNotFoundError(GraphQLError):
    """Raised when permission is not found."""

    def __init__(self, permission_id: int | None = None):
        details = {"resource": "Permission"}
        if permission_id is not None:
            details["id"] = permission_id
        super().__init__(
            "Permission not found.", ErrorCode.PERMISSION_NOT_FOUND, details
        )


class RoleNotFoundError(GraphQLError):
    """Raised when role is not found."""

    def __init__(self, role_id: int | None = None):
        details = {"resource": "Role"}
        if role_id is not None:
            details["id"] = role_id
        super().__init__("Role not found.", ErrorCode.ROLE_NOT_FOUND, details)


class CannotModifySystemRoleError(GraphQLError):
    """Raised when attempting to modify a system role."""

    def __init__(self, role_id: int | None = None):
        details = {"resource": "Role"}
        if role_id is not None:
            details["id"] = role_id
        super().__init__(
            "Cannot modify system roles.", ErrorCode.SYSTEM_ROLE_MODIFICATION, details
        )


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


class RequirePermissions(BasePermission):
    """Permission class to check if user has required permissions."""

    message = "User lacks required permissions."

    def __init__(self, permissions: list[str]):
        self.permissions = permissions

    def has_permission(self, source: Any, info: Info, **kwargs: Any) -> bool:
        user = info.context.get("user")
        if not user:
            raise UnauthenticatedError()

        # Get all permission codes from user's roles
        user_permissions: set[str] = set()
        for role in user.roles:
            for perm in role.permissions:
                user_permissions.add(perm.code)

        # Check if user has all required permissions
        missing = [p for p in self.permissions if p not in user_permissions]
        if missing:
            raise InsufficientPermissionsError(required_permissions=self.permissions)

        return True


class RequireSuperadmin(BasePermission):
    """Permission class to check if user is a superadmin."""

    message = "Superadmin role required"

    def has_permission(self, source: Any, info: Info, **kwargs: Any) -> bool:
        user = info.context.get("user")
        if not user:
            raise UnauthenticatedError()

        # Check if user has superadmin role
        for role in user.roles:
            if role.code == "super_admin":
                return True

        raise InsufficientPermissionsError(
            message="Superadmin role required", required_roles=["super_admin"]
        )


def require_permissions(*permissions: str) -> type[RequirePermissions]:
    """Factory function to create permission class with required permissions."""

    class PermissionCheck(RequirePermissions):
        def __init__(self):
            super().__init__(list(permissions))

    return PermissionCheck


def require_superadmin() -> type[RequireSuperadmin]:
    """Factory function to create superadmin permission class."""
    return RequireSuperadmin
