"""Unit tests for centralized exception handlers."""

from unittest.mock import MagicMock

import pytest
from fastapi import Request, status
from sqlalchemy.exc import SQLAlchemyError
from src.app.core.error_codes import ErrorCode
from src.app.core.exception_handlers import (
    _create_error_response,
    service_exception_handler,
    sqlalchemy_exception_handler,
)
from src.app.services.exceptions import (
    EmailAlreadyExistsError,
    FileNotFoundError,
    FileTooLargeError,
    InactiveUserError,
    InvalidCredentialsError,
    InvalidFileTypeError,
    InvalidTokenError,
    InvalidTokenTypeError,
    ServiceError,
    StorageConnectionError,
    StorageError,
    UserNotFoundError,
)


class TestCreateErrorResponse:
    """Test _create_error_response helper function."""

    def test_basic_error_response(self):
        """Test creating a basic error response."""
        response = _create_error_response(
            status_code=400,
            detail="Bad request",
            code=ErrorCode.VALIDATION_ERROR,
        )
        assert response.status_code == 400
        body = response.body.decode()
        assert "Bad request" in body
        assert "VALIDATION_ERROR" in body

    def test_error_response_with_errors(self):
        """Test creating error response with errors dict."""
        response = _create_error_response(
            status_code=404,
            detail="Not found",
            code=ErrorCode.NOT_FOUND,
            errors={"resource": "User", "id": 123},
        )
        assert response.status_code == 404
        body = response.body.decode()
        assert "Not found" in body
        assert "resource" in body
        assert "123" in body

    def test_error_response_with_headers(self):
        """Test creating error response with custom headers."""
        response = _create_error_response(
            status_code=401,
            detail="Unauthorized",
            code=ErrorCode.UNAUTHENTICATED,
            headers={"WWW-Authenticate": "Bearer"},
        )
        assert response.status_code == 401
        assert response.headers.get("WWW-Authenticate") == "Bearer"


class TestServiceExceptionHandler:
    """Test service_exception_handler for various exception types."""

    @pytest.fixture
    def mock_request(self):
        """Create a mock request object."""
        return MagicMock(spec=Request)

    @pytest.mark.asyncio
    async def test_invalid_credentials_error(self, mock_request):
        """Test handling InvalidCredentialsError."""
        exc = InvalidCredentialsError()
        response = await service_exception_handler(mock_request, exc)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert response.headers.get("WWW-Authenticate") == "Bearer"
        body = response.body.decode()
        assert "INVALID_CREDENTIALS" in body

    @pytest.mark.asyncio
    async def test_invalid_token_error(self, mock_request):
        """Test handling InvalidTokenError."""
        exc = InvalidTokenError()
        response = await service_exception_handler(mock_request, exc)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        body = response.body.decode()
        assert "INVALID_TOKEN" in body

    @pytest.mark.asyncio
    async def test_invalid_token_type_error(self, mock_request):
        """Test handling InvalidTokenTypeError."""
        exc = InvalidTokenTypeError()
        response = await service_exception_handler(mock_request, exc)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        body = response.body.decode()
        assert "INVALID_TOKEN" in body

    @pytest.mark.asyncio
    async def test_inactive_user_error(self, mock_request):
        """Test handling InactiveUserError."""
        exc = InactiveUserError()
        response = await service_exception_handler(mock_request, exc)
        assert response.status_code == status.HTTP_403_FORBIDDEN
        body = response.body.decode()
        assert "INACTIVE_USER" in body

    @pytest.mark.asyncio
    async def test_user_not_found_error_without_id(self, mock_request):
        """Test handling UserNotFoundError without user_id."""
        exc = UserNotFoundError()
        response = await service_exception_handler(mock_request, exc)
        assert response.status_code == status.HTTP_404_NOT_FOUND
        body = response.body.decode()
        assert "USER_NOT_FOUND" in body
        assert "User" in body

    @pytest.mark.asyncio
    async def test_user_not_found_error_with_id(self, mock_request):
        """Test handling UserNotFoundError with user_id."""
        exc = UserNotFoundError(user_id=123)
        response = await service_exception_handler(mock_request, exc)
        assert response.status_code == status.HTTP_404_NOT_FOUND
        body = response.body.decode()
        assert "123" in body

    @pytest.mark.asyncio
    async def test_email_already_exists_error(self, mock_request):
        """Test handling EmailAlreadyExistsError."""
        exc = EmailAlreadyExistsError()
        response = await service_exception_handler(mock_request, exc)
        assert response.status_code == status.HTTP_409_CONFLICT
        body = response.body.decode()
        assert "EMAIL_ALREADY_EXISTS" in body

    @pytest.mark.asyncio
    async def test_file_not_found_error(self, mock_request):
        """Test handling FileNotFoundError."""
        exc = FileNotFoundError()
        response = await service_exception_handler(mock_request, exc)
        assert response.status_code == status.HTTP_404_NOT_FOUND
        body = response.body.decode()
        assert "FILE_NOT_FOUND" in body

    @pytest.mark.asyncio
    async def test_file_too_large_error(self, mock_request):
        """Test handling FileTooLargeError."""
        exc = FileTooLargeError()
        response = await service_exception_handler(mock_request, exc)
        assert response.status_code == status.HTTP_413_CONTENT_TOO_LARGE
        body = response.body.decode()
        assert "FILE_TOO_LARGE" in body

    @pytest.mark.asyncio
    async def test_invalid_file_type_error(self, mock_request):
        """Test handling InvalidFileTypeError."""
        exc = InvalidFileTypeError()
        response = await service_exception_handler(mock_request, exc)
        assert response.status_code == status.HTTP_415_UNSUPPORTED_MEDIA_TYPE
        body = response.body.decode()
        assert "INVALID_FILE_TYPE" in body

    @pytest.mark.asyncio
    async def test_storage_connection_error(self, mock_request):
        """Test handling StorageConnectionError."""
        exc = StorageConnectionError()
        response = await service_exception_handler(mock_request, exc)
        assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
        body = response.body.decode()
        assert "STORAGE_ERROR" in body

    @pytest.mark.asyncio
    async def test_storage_error(self, mock_request):
        """Test handling StorageError."""
        exc = StorageError()
        response = await service_exception_handler(mock_request, exc)
        assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
        body = response.body.decode()
        assert "STORAGE_ERROR" in body

    @pytest.mark.asyncio
    async def test_generic_service_error(self, mock_request):
        """Test handling generic ServiceError falls back to 500."""
        exc = ServiceError("Something went wrong")
        response = await service_exception_handler(mock_request, exc)
        assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
        body = response.body.decode()
        assert "INTERNAL_SERVER_ERROR" in body


class TestSQLAlchemyExceptionHandler:
    """Test sqlalchemy_exception_handler."""

    @pytest.fixture
    def mock_request(self):
        """Create a mock request object."""
        return MagicMock(spec=Request)

    @pytest.mark.asyncio
    async def test_sqlalchemy_error(self, mock_request):
        """Test handling SQLAlchemyError."""
        exc = SQLAlchemyError("Database connection failed")
        response = await sqlalchemy_exception_handler(mock_request, exc)
        assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
        body = response.body.decode()
        assert "DATABASE_ERROR" in body
        assert "Database operation failed" in body


class TestGraphQLExceptionMapper:
    """Test GraphQL exception mapper."""

    def test_map_invalid_credentials(self):
        """Test mapping InvalidCredentialsError to GraphQL."""
        from src.app.graphql.errors import InvalidCredentialsError as GQLError
        from src.app.graphql.exception_mapper import map_service_exception_to_graphql

        exc = InvalidCredentialsError()
        result = map_service_exception_to_graphql(exc)
        assert isinstance(result, GQLError)

    def test_map_invalid_token(self):
        """Test mapping InvalidTokenError to GraphQL."""
        from src.app.graphql.errors import InvalidTokenError as GQLError
        from src.app.graphql.exception_mapper import map_service_exception_to_graphql

        exc = InvalidTokenError()
        result = map_service_exception_to_graphql(exc)
        assert isinstance(result, GQLError)

    def test_map_invalid_token_type(self):
        """Test mapping InvalidTokenTypeError to GraphQL."""
        from src.app.graphql.errors import InvalidTokenError as GQLError
        from src.app.graphql.exception_mapper import map_service_exception_to_graphql

        exc = InvalidTokenTypeError()
        result = map_service_exception_to_graphql(exc)
        assert isinstance(result, GQLError)

    def test_map_inactive_user(self):
        """Test mapping InactiveUserError to GraphQL."""
        from src.app.graphql.errors import InactiveUserError as GQLError
        from src.app.graphql.exception_mapper import map_service_exception_to_graphql

        exc = InactiveUserError()
        result = map_service_exception_to_graphql(exc)
        assert isinstance(result, GQLError)

    def test_map_user_not_found(self):
        """Test mapping UserNotFoundError to GraphQL."""
        from src.app.graphql.errors import UserNotFoundError as GQLError
        from src.app.graphql.exception_mapper import map_service_exception_to_graphql

        exc = UserNotFoundError()
        result = map_service_exception_to_graphql(exc)
        assert isinstance(result, GQLError)

    def test_map_email_already_exists(self):
        """Test mapping EmailAlreadyExistsError to GraphQL."""
        from src.app.graphql.errors import EmailAlreadyExistsError as GQLError
        from src.app.graphql.exception_mapper import map_service_exception_to_graphql

        exc = EmailAlreadyExistsError()
        result = map_service_exception_to_graphql(exc)
        assert isinstance(result, GQLError)

    def test_unknown_exception_passthrough(self):
        """Test that unknown exceptions are passed through."""
        from src.app.graphql.exception_mapper import map_service_exception_to_graphql

        exc = ValueError("Unknown error")
        result = map_service_exception_to_graphql(exc)
        assert result is exc
