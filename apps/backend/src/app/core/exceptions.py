"""Custom API exceptions with error codes."""

from typing import Any

from fastapi import HTTPException, status
from src.app.core.error_codes import ErrorCode
from src.app.schemas.errors import ErrorDetail


class APIException(HTTPException):
    """Base API exception with error code support."""

    def __init__(
        self,
        status_code: int,
        detail: str,
        code: ErrorCode,
        errors: dict[str, Any] | None = None,
        headers: dict[str, str] | None = None,
    ):
        self.code = code
        self.errors = ErrorDetail(**errors) if errors else None
        super().__init__(
            status_code=status_code,
            detail={
                "detail": detail,
                "code": code.value,
                "errors": self.errors.model_dump(exclude_none=True)
                if self.errors
                else None,
            },
            headers=headers,
        )


# Authentication Errors
class UnauthenticatedException(APIException):
    """Raised when user is not authenticated."""

    def __init__(
        self,
        detail: str = "User not authenticated.",
        headers: dict[str, str] | None = None,
    ):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            code=ErrorCode.UNAUTHENTICATED,
            headers=headers or {"WWW-Authenticate": "Bearer"},
        )


class InvalidCredentialsException(APIException):
    """Raised when login credentials are invalid."""

    def __init__(
        self,
        detail: str = "Invalid email or password.",
        headers: dict[str, str] | None = None,
    ):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            code=ErrorCode.INVALID_CREDENTIALS,
            headers=headers or {"WWW-Authenticate": "Bearer"},
        )


class InvalidTokenException(APIException):
    """Raised when token is invalid or expired."""

    def __init__(
        self,
        detail: str = "Token is invalid or expired.",
        headers: dict[str, str] | None = None,
    ):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            code=ErrorCode.INVALID_TOKEN,
            headers=headers or {"WWW-Authenticate": "Bearer"},
        )


class InvalidTokenTypeException(APIException):
    """Raised when wrong token type is used."""

    def __init__(
        self,
        detail: str = "Invalid token type.",
        headers: dict[str, str] | None = None,
    ):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            code=ErrorCode.INVALID_TOKEN,
            headers=headers or {"WWW-Authenticate": "Bearer"},
        )


class InactiveUserException(APIException):
    """Raised when user account is inactive."""

    def __init__(self, detail: str = "User account is disabled."):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=detail,
            code=ErrorCode.INACTIVE_USER,
        )


# Authorization Errors
class ForbiddenException(APIException):
    """Raised when user doesn't have permission."""

    def __init__(self, detail: str = "Access forbidden."):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=detail,
            code=ErrorCode.FORBIDDEN,
        )


class InsufficientPermissionsException(APIException):
    """Raised when user lacks required permissions."""

    def __init__(
        self,
        detail: str = "User lacks required permissions.",
        required_permissions: list[str] | None = None,
        required_roles: list[str] | None = None,
    ):
        errors: dict[str, Any] = {}
        if required_permissions:
            errors["required_permissions"] = required_permissions
        if required_roles:
            errors["required_roles"] = required_roles
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=detail,
            code=ErrorCode.INSUFFICIENT_PERMISSIONS,
            errors=errors if errors else None,
        )


# Resource Errors
class NotFoundException(APIException):
    """Raised when resource is not found."""

    def __init__(
        self,
        detail: str = "Resource not found.",
        resource: str | None = None,
        resource_id: int | str | None = None,
    ):
        errors = {}
        if resource:
            errors["resource"] = resource
        if resource_id is not None:
            errors["id"] = resource_id
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=detail,
            code=ErrorCode.NOT_FOUND,
            errors=errors if errors else None,
        )


class UserNotFoundException(APIException):
    """Raised when user is not found."""

    def __init__(self, user_id: int | None = None):
        errors = {"resource": "User"}
        if user_id is not None:
            errors["id"] = user_id
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
            code=ErrorCode.USER_NOT_FOUND,
            errors=errors,
        )


class EmailAlreadyExistsException(APIException):
    """Raised when email already exists."""

    def __init__(self, email: str | None = None):
        errors = {"field": "email"}
        if email:
            errors["value"] = email
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email is already registered.",
            code=ErrorCode.EMAIL_ALREADY_EXISTS,
            errors=errors,
        )


# Server Errors
class DatabaseException(APIException):
    """Raised when database operation fails."""

    def __init__(self, detail: str = "Database operation failed."):
        super().__init__(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=detail,
            code=ErrorCode.DATABASE_ERROR,
        )


class InternalServerException(APIException):
    """Raised when internal server error occurs."""

    def __init__(self, detail: str = "Internal server error."):
        super().__init__(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=detail,
            code=ErrorCode.INTERNAL_SERVER_ERROR,
        )


# File/Storage Errors
class FileNotFoundException(APIException):
    """Raised when file is not found in storage."""

    def __init__(self, file_key: str | None = None):
        errors = {"resource": "File"}
        if file_key:
            errors["key"] = file_key
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found.",
            code=ErrorCode.FILE_NOT_FOUND,
            errors=errors,
        )


class AuditLogNotFoundException(APIException):
    """Raised when audit log is not found."""

    def __init__(self, detail: str = "Audit log not found."):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=detail,
            code=ErrorCode.AUDIT_LOG_NOT_FOUND,
            errors={"resource": "AuditLog"},
        )


class FileTooLargeException(APIException):
    """Raised when uploaded file exceeds size limit."""

    def __init__(self, max_size: int | None = None):
        errors = {}
        if max_size:
            errors["max_size"] = max_size
        super().__init__(
            status_code=status.HTTP_413_CONTENT_TOO_LARGE,
            detail="File exceeds size limit.",
            code=ErrorCode.FILE_TOO_LARGE,
            errors=errors if errors else None,
        )


class InvalidFileTypeException(APIException):
    """Raised when file type is not allowed."""

    def __init__(
        self, file_type: str | None = None, allowed_types: list[str] | None = None
    ):
        errors = {}
        if file_type:
            errors["file_type"] = file_type
        if allowed_types:
            errors["allowed_types"] = allowed_types
        super().__init__(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="File type not permitted.",
            code=ErrorCode.INVALID_FILE_TYPE,
            errors=errors if errors else None,
        )


class StorageException(APIException):
    """Raised when storage operation fails."""

    def __init__(self, detail: str = "Storage operation failed."):
        super().__init__(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=detail,
            code=ErrorCode.STORAGE_ERROR,
        )
