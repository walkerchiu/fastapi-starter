"""Unit tests for core API exceptions."""

from fastapi import status
from src.app.core.error_codes import ErrorCode
from src.app.core.exceptions import (
    APIException,
    DatabaseException,
    EmailAlreadyExistsException,
    ForbiddenException,
    InactiveUserException,
    InternalServerException,
    InvalidCredentialsException,
    InvalidTokenException,
    InvalidTokenTypeException,
    NotFoundException,
    UnauthenticatedException,
    UserNotFoundException,
)


class TestAPIException:
    """Test base APIException class."""

    def test_exception_with_all_params(self):
        """Test creating exception with all parameters."""
        exc = APIException(
            status_code=400,
            detail="Test error",
            code=ErrorCode.VALIDATION_ERROR,
            errors={"field": "email", "value": "invalid"},
            headers={"X-Custom": "header"},
        )
        assert exc.status_code == 400
        assert exc.detail["detail"] == "Test error"
        assert exc.detail["code"] == "VALIDATION_ERROR"
        assert exc.detail["errors"]["field"] == "email"
        assert exc.headers["X-Custom"] == "header"

    def test_exception_without_errors(self):
        """Test creating exception without errors."""
        exc = APIException(
            status_code=400,
            detail="Test error",
            code=ErrorCode.VALIDATION_ERROR,
        )
        assert exc.detail["errors"] is None

    def test_exception_with_errors_dict(self):
        """Test errors are properly serialized."""
        exc = APIException(
            status_code=400,
            detail="Test",
            code=ErrorCode.NOT_FOUND,
            errors={"resource": "User", "id": 123},
        )
        assert exc.detail["errors"]["resource"] == "User"
        assert exc.detail["errors"]["id"] == 123


class TestAuthenticationExceptions:
    """Test authentication exception classes."""

    def test_unauthenticated_default(self):
        """Test UnauthenticatedException with defaults."""
        exc = UnauthenticatedException()
        assert exc.status_code == status.HTTP_401_UNAUTHORIZED
        assert exc.detail["detail"] == "User not authenticated."
        assert exc.detail["code"] == "UNAUTHENTICATED"
        assert exc.headers["WWW-Authenticate"] == "Bearer"

    def test_unauthenticated_custom(self):
        """Test UnauthenticatedException with custom values."""
        exc = UnauthenticatedException(
            detail="Token required",
            headers={"WWW-Authenticate": "Bearer realm='api'"},
        )
        assert exc.detail["detail"] == "Token required"
        assert exc.headers["WWW-Authenticate"] == "Bearer realm='api'"

    def test_invalid_credentials_default(self):
        """Test InvalidCredentialsException with defaults."""
        exc = InvalidCredentialsException()
        assert exc.status_code == status.HTTP_401_UNAUTHORIZED
        assert exc.detail["detail"] == "Invalid email or password."
        assert exc.detail["code"] == "INVALID_CREDENTIALS"

    def test_invalid_credentials_custom(self):
        """Test InvalidCredentialsException with custom values."""
        exc = InvalidCredentialsException(detail="Wrong password")
        assert exc.detail["detail"] == "Wrong password"

    def test_invalid_token_default(self):
        """Test InvalidTokenException with defaults."""
        exc = InvalidTokenException()
        assert exc.status_code == status.HTTP_401_UNAUTHORIZED
        assert exc.detail["detail"] == "Token is invalid or expired."
        assert exc.detail["code"] == "INVALID_TOKEN"

    def test_invalid_token_custom(self):
        """Test InvalidTokenException with custom values."""
        exc = InvalidTokenException(detail="Token expired")
        assert exc.detail["detail"] == "Token expired"

    def test_invalid_token_type_default(self):
        """Test InvalidTokenTypeException with defaults."""
        exc = InvalidTokenTypeException()
        assert exc.status_code == status.HTTP_401_UNAUTHORIZED
        assert exc.detail["detail"] == "Invalid token type."
        assert exc.detail["code"] == "INVALID_TOKEN"

    def test_invalid_token_type_custom(self):
        """Test InvalidTokenTypeException with custom values."""
        exc = InvalidTokenTypeException(
            detail="Expected refresh token",
            headers={"WWW-Authenticate": "Bearer error='invalid_token'"},
        )
        assert exc.detail["detail"] == "Expected refresh token"

    def test_inactive_user_default(self):
        """Test InactiveUserException with defaults."""
        exc = InactiveUserException()
        assert exc.status_code == status.HTTP_403_FORBIDDEN
        assert exc.detail["detail"] == "User account is disabled."
        assert exc.detail["code"] == "INACTIVE_USER"

    def test_inactive_user_custom(self):
        """Test InactiveUserException with custom message."""
        exc = InactiveUserException(detail="Account suspended")
        assert exc.detail["detail"] == "Account suspended"


class TestAuthorizationExceptions:
    """Test authorization exception classes."""

    def test_forbidden_default(self):
        """Test ForbiddenException with defaults."""
        exc = ForbiddenException()
        assert exc.status_code == status.HTTP_403_FORBIDDEN
        assert exc.detail["detail"] == "Access forbidden."
        assert exc.detail["code"] == "FORBIDDEN"

    def test_forbidden_custom(self):
        """Test ForbiddenException with custom message."""
        exc = ForbiddenException(detail="Admin access required")
        assert exc.detail["detail"] == "Admin access required"


class TestResourceExceptions:
    """Test resource exception classes."""

    def test_not_found_default(self):
        """Test NotFoundException with defaults."""
        exc = NotFoundException()
        assert exc.status_code == status.HTTP_404_NOT_FOUND
        assert exc.detail["detail"] == "Resource not found."
        assert exc.detail["code"] == "NOT_FOUND"
        assert exc.detail["errors"] is None

    def test_not_found_with_resource(self):
        """Test NotFoundException with resource name."""
        exc = NotFoundException(detail="Post not found", resource="Post")
        assert exc.detail["detail"] == "Post not found"
        assert exc.detail["errors"]["resource"] == "Post"

    def test_not_found_with_resource_id(self):
        """Test NotFoundException with resource and ID."""
        exc = NotFoundException(
            detail="Comment not found",
            resource="Comment",
            resource_id=42,
        )
        assert exc.detail["errors"]["resource"] == "Comment"
        assert exc.detail["errors"]["id"] == 42

    def test_user_not_found_without_id(self):
        """Test UserNotFoundException without user ID."""
        exc = UserNotFoundException()
        assert exc.status_code == status.HTTP_404_NOT_FOUND
        assert exc.detail["detail"] == "User not found."
        assert exc.detail["code"] == "USER_NOT_FOUND"
        assert exc.detail["errors"]["resource"] == "User"
        assert "id" not in exc.detail["errors"]

    def test_user_not_found_with_id(self):
        """Test UserNotFoundException with user ID."""
        exc = UserNotFoundException(user_id=123)
        assert exc.detail["errors"]["id"] == 123

    def test_email_already_exists_without_email(self):
        """Test EmailAlreadyExistsException without email."""
        exc = EmailAlreadyExistsException()
        assert exc.status_code == status.HTTP_409_CONFLICT
        assert exc.detail["detail"] == "Email is already registered."
        assert exc.detail["code"] == "EMAIL_ALREADY_EXISTS"
        assert exc.detail["errors"]["field"] == "email"
        assert "value" not in exc.detail["errors"]

    def test_email_already_exists_with_email(self):
        """Test EmailAlreadyExistsException with email."""
        exc = EmailAlreadyExistsException(email="test@example.com")
        assert exc.detail["errors"]["value"] == "test@example.com"


class TestServerExceptions:
    """Test server error exception classes."""

    def test_database_exception_default(self):
        """Test DatabaseException with defaults."""
        exc = DatabaseException()
        assert exc.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
        assert exc.detail["detail"] == "Database operation failed."
        assert exc.detail["code"] == "DATABASE_ERROR"

    def test_database_exception_custom(self):
        """Test DatabaseException with custom message."""
        exc = DatabaseException(detail="Connection timeout")
        assert exc.detail["detail"] == "Connection timeout"

    def test_internal_server_exception_default(self):
        """Test InternalServerException with defaults."""
        exc = InternalServerException()
        assert exc.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
        assert exc.detail["detail"] == "Internal server error."
        assert exc.detail["code"] == "INTERNAL_SERVER_ERROR"

    def test_internal_server_exception_custom(self):
        """Test InternalServerException with custom message."""
        exc = InternalServerException(detail="Unexpected error occurred")
        assert exc.detail["detail"] == "Unexpected error occurred"
