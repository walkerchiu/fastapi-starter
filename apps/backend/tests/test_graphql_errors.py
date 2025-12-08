"""Unit tests for GraphQL error classes."""

import pytest
from src.app.core.error_codes import ErrorCode
from src.app.graphql.errors import (
    EmailAlreadyExistsError,
    ForbiddenError,
    GraphQLError,
    InactiveUserError,
    InvalidCredentialsError,
    InvalidEmailError,
    InvalidTokenError,
    IsAuthenticated,
    NotFoundError,
    QueryComplexityError,
    QueryDepthError,
    RateLimitedError,
    UnauthenticatedError,
    UserNotFoundError,
    ValidationError,
    WeakPasswordError,
)


class TestGraphQLError:
    """Test base GraphQLError class."""

    def test_error_with_code_and_message(self):
        """Test creating error with code and message."""
        error = GraphQLError("Test error", ErrorCode.VALIDATION_ERROR)
        assert str(error) == "Test error"
        assert error.code == ErrorCode.VALIDATION_ERROR
        assert error.extensions["code"] == "VALIDATION_ERROR"

    def test_error_with_details(self):
        """Test creating error with additional details."""
        error = GraphQLError(
            "Test error",
            ErrorCode.VALIDATION_ERROR,
            details={"field": "email", "value": "invalid"},
        )
        assert error.extensions["code"] == "VALIDATION_ERROR"
        assert error.extensions["field"] == "email"
        assert error.extensions["value"] == "invalid"


class TestAuthenticationErrors:
    """Test authentication error classes."""

    def test_unauthenticated_error_default(self):
        """Test UnauthenticatedError with default message."""
        error = UnauthenticatedError()
        assert str(error) == "User not authenticated."
        assert error.code == ErrorCode.UNAUTHENTICATED
        assert error.extensions["code"] == "UNAUTHENTICATED"

    def test_unauthenticated_error_custom_message(self):
        """Test UnauthenticatedError with custom message."""
        error = UnauthenticatedError("Please log in first")
        assert str(error) == "Please log in first"

    def test_invalid_credentials_error_default(self):
        """Test InvalidCredentialsError with default message."""
        error = InvalidCredentialsError()
        assert str(error) == "Invalid email or password."
        assert error.code == ErrorCode.INVALID_CREDENTIALS

    def test_invalid_credentials_error_custom_message(self):
        """Test InvalidCredentialsError with custom message."""
        error = InvalidCredentialsError("Wrong password")
        assert str(error) == "Wrong password"

    def test_invalid_token_error_default(self):
        """Test InvalidTokenError with default message."""
        error = InvalidTokenError()
        assert str(error) == "Token is invalid or expired."
        assert error.code == ErrorCode.INVALID_TOKEN

    def test_invalid_token_error_custom_message(self):
        """Test InvalidTokenError with custom message."""
        error = InvalidTokenError("Token has expired")
        assert str(error) == "Token has expired"

    def test_inactive_user_error_default(self):
        """Test InactiveUserError with default message."""
        error = InactiveUserError()
        assert str(error) == "User account is disabled."
        assert error.code == ErrorCode.INACTIVE_USER

    def test_inactive_user_error_custom_message(self):
        """Test InactiveUserError with custom message."""
        error = InactiveUserError("Account suspended")
        assert str(error) == "Account suspended"


class TestAuthorizationErrors:
    """Test authorization error classes."""

    def test_forbidden_error_default(self):
        """Test ForbiddenError with default message."""
        error = ForbiddenError()
        assert str(error) == "Access forbidden."
        assert error.code == ErrorCode.FORBIDDEN

    def test_forbidden_error_custom_message(self):
        """Test ForbiddenError with custom message."""
        error = ForbiddenError("Admin access required")
        assert str(error) == "Admin access required"


class TestValidationErrors:
    """Test validation error classes."""

    def test_validation_error_without_field(self):
        """Test ValidationError without field."""
        error = ValidationError("Invalid input")
        assert str(error) == "Invalid input"
        assert error.code == ErrorCode.VALIDATION_ERROR
        assert "field" not in error.extensions

    def test_validation_error_with_field(self):
        """Test ValidationError with field."""
        error = ValidationError("Must be positive", field="amount")
        assert error.extensions["field"] == "amount"

    def test_invalid_email_error_default(self):
        """Test InvalidEmailError with default message."""
        error = InvalidEmailError()
        assert str(error) == "Invalid email format."
        assert error.code == ErrorCode.INVALID_EMAIL
        assert error.extensions["field"] == "email"

    def test_invalid_email_error_custom_message(self):
        """Test InvalidEmailError with custom message."""
        error = InvalidEmailError("Email domain not allowed")
        assert str(error) == "Email domain not allowed"

    def test_weak_password_error_default(self):
        """Test WeakPasswordError with default message."""
        error = WeakPasswordError()
        assert str(error) == "Password does not meet requirements."
        assert error.code == ErrorCode.WEAK_PASSWORD
        assert error.extensions["field"] == "password"

    def test_weak_password_error_custom_message(self):
        """Test WeakPasswordError with custom message."""
        error = WeakPasswordError("Password must be at least 8 characters")
        assert str(error) == "Password must be at least 8 characters"


class TestResourceErrors:
    """Test resource error classes."""

    def test_not_found_error_default(self):
        """Test NotFoundError with default values."""
        error = NotFoundError()
        assert str(error) == "Resource not found."
        assert error.code == ErrorCode.NOT_FOUND
        assert error.extensions["resource"] == "Resource"

    def test_not_found_error_with_resource(self):
        """Test NotFoundError with resource name."""
        error = NotFoundError(resource="Post")
        assert str(error) == "Post not found."
        assert error.extensions["resource"] == "Post"

    def test_not_found_error_with_id(self):
        """Test NotFoundError with resource ID."""
        error = NotFoundError(resource="Comment", resource_id=42)
        assert error.extensions["resource"] == "Comment"
        assert error.extensions["id"] == 42

    def test_user_not_found_error_without_id(self):
        """Test UserNotFoundError without user ID."""
        error = UserNotFoundError()
        assert str(error) == "User not found."
        assert error.code == ErrorCode.USER_NOT_FOUND
        assert error.extensions["resource"] == "User"
        assert "id" not in error.extensions

    def test_user_not_found_error_with_id(self):
        """Test UserNotFoundError with user ID."""
        error = UserNotFoundError(user_id=123)
        assert error.extensions["id"] == 123

    def test_email_already_exists_error_without_email(self):
        """Test EmailAlreadyExistsError without email."""
        error = EmailAlreadyExistsError()
        assert str(error) == "Email is already registered."
        assert error.code == ErrorCode.EMAIL_ALREADY_EXISTS
        assert error.extensions["field"] == "email"
        assert "value" not in error.extensions

    def test_email_already_exists_error_with_email(self):
        """Test EmailAlreadyExistsError with email."""
        error = EmailAlreadyExistsError(email="test@example.com")
        assert error.extensions["value"] == "test@example.com"


class TestRateLimitingErrors:
    """Test rate limiting error classes."""

    def test_rate_limited_error_without_retry_after(self):
        """Test RateLimitedError without retry_after."""
        error = RateLimitedError()
        assert str(error) == "Too many requests."
        assert error.code == ErrorCode.RATE_LIMITED
        assert "retry_after" not in error.extensions

    def test_rate_limited_error_with_retry_after(self):
        """Test RateLimitedError with retry_after."""
        error = RateLimitedError(retry_after=60)
        assert error.extensions["retry_after"] == 60


class TestQueryLimitErrors:
    """Test query limit error classes."""

    def test_query_depth_error(self):
        """Test QueryDepthError."""
        error = QueryDepthError(depth=15, max_depth=10)
        assert str(error) == "Query exceeds maximum depth."
        assert error.code == ErrorCode.QUERY_TOO_DEEP
        assert error.extensions["depth"] == 15
        assert error.extensions["max_depth"] == 10

    def test_query_complexity_error(self):
        """Test QueryComplexityError."""
        error = QueryComplexityError(complexity=150, max_complexity=100)
        assert str(error) == "Query exceeds maximum complexity."
        assert error.code == ErrorCode.QUERY_TOO_COMPLEX
        assert error.extensions["complexity"] == 150
        assert error.extensions["max_complexity"] == 100


class TestIsAuthenticatedPermission:
    """Test IsAuthenticated permission class."""

    def test_has_permission_with_user(self):
        """Test has_permission returns True when user exists."""

        class MockInfo:
            def __init__(self, user):
                self.context = {"user": user}

        class MockUser:
            id = 1

        permission = IsAuthenticated()
        info = MockInfo(MockUser())
        result = permission.has_permission(None, info)
        assert result is True

    def test_has_permission_without_user_raises(self):
        """Test has_permission raises UnauthenticatedError when no user."""

        class MockInfo:
            def __init__(self):
                self.context = {}

        permission = IsAuthenticated()
        info = MockInfo()
        with pytest.raises(UnauthenticatedError):
            permission.has_permission(None, info)

    def test_has_permission_with_none_user_raises(self):
        """Test has_permission raises when user is None."""

        class MockInfo:
            def __init__(self):
                self.context = {"user": None}

        permission = IsAuthenticated()
        info = MockInfo()
        with pytest.raises(UnauthenticatedError):
            permission.has_permission(None, info)

    def test_permission_message(self):
        """Test permission has correct message attribute."""
        permission = IsAuthenticated()
        assert permission.message == "User not authenticated"
