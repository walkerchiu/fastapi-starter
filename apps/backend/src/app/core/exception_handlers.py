"""Unified exception handling for REST API.

This module provides automatic conversion of service-layer exceptions
to HTTP exceptions, eliminating manual try-catch blocks in API routers.
"""

from typing import TYPE_CHECKING, Any

from fastapi import Request, status
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError
from src.app.core.error_codes import ErrorCode

if TYPE_CHECKING:
    from src.app.services.exceptions import ServiceError


def _create_error_response(
    status_code: int,
    detail: str,
    code: ErrorCode,
    errors: dict[str, Any] | None = None,
    headers: dict[str, str] | None = None,
) -> JSONResponse:
    """Create a standardized error response."""
    content = {
        "success": False,
        "error": {
            "code": code.value,
            "message": detail,
        },
    }
    if errors:
        content["error"]["details"] = errors

    return JSONResponse(
        status_code=status_code,
        content=content,
        headers=headers,
    )


async def service_exception_handler(
    request: Request, exc: "ServiceError"
) -> JSONResponse:
    """Handle all ServiceError exceptions and convert to HTTP responses."""
    # Import here to avoid circular imports
    from src.app.services.exceptions import (
        EmailAlreadyExistsError,
        EmailAlreadyVerifiedError,
        ExpiredResetTokenError,
        ExpiredVerificationTokenError,
        FileNotFoundError,
        FileTooLargeError,
        InactiveUserError,
        Invalid2FACodeError,
        InvalidCredentialsError,
        InvalidFileTypeError,
        InvalidResetTokenError,
        InvalidTokenError,
        InvalidTokenTypeError,
        InvalidVerificationTokenError,
        PermissionCodeAlreadyExistsError,
        PermissionNotFoundError,
        RefreshTokenInvalidError,
        ResetTokenAlreadyUsedError,
        RoleCodeAlreadyExistsError,
        RoleNotFoundError,
        SamePasswordError,
        StorageConnectionError,
        StorageError,
        SystemRoleModificationError,
        TwoFactorAlreadyEnabledError,
        TwoFactorNotEnabledError,
        TwoFactorNotSetupError,
        TwoFactorRequiredError,
        UserNotFoundError,
    )

    # Authentication errors
    if isinstance(exc, InvalidCredentialsError):
        return _create_error_response(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            code=ErrorCode.INVALID_CREDENTIALS,
            headers={"WWW-Authenticate": "Bearer"},
        )

    if isinstance(exc, RefreshTokenInvalidError):
        return _create_error_response(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token.",
            code=ErrorCode.REFRESH_TOKEN_INVALID,
            headers={"WWW-Authenticate": "Bearer"},
            request_id=request_id,
        )

    if isinstance(exc, InvalidTokenError):
        return _create_error_response(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token is invalid or expired.",
            code=ErrorCode.INVALID_TOKEN,
            headers={"WWW-Authenticate": "Bearer"},
        )

    if isinstance(exc, InvalidTokenTypeError):
        return _create_error_response(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type.",
            code=ErrorCode.INVALID_TOKEN,
            headers={"WWW-Authenticate": "Bearer"},
        )

    if isinstance(exc, InactiveUserError):
        return _create_error_response(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is disabled.",
            code=ErrorCode.INACTIVE_USER,
        )

    # Email verification errors
    if isinstance(exc, InvalidVerificationTokenError):
        return _create_error_response(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email verification token.",
            code=ErrorCode.INVALID_VERIFICATION_TOKEN,
            request_id=request_id,
        )

    if isinstance(exc, ExpiredVerificationTokenError):
        return _create_error_response(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email verification token has expired.",
            code=ErrorCode.EXPIRED_VERIFICATION_TOKEN,
            request_id=request_id,
        )

    if isinstance(exc, EmailAlreadyVerifiedError):
        return _create_error_response(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already verified.",
            code=ErrorCode.EMAIL_ALREADY_VERIFIED,
            request_id=request_id,
        )

    # Password reset errors
    if isinstance(exc, InvalidResetTokenError):
        return _create_error_response(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid password reset token.",
            code=ErrorCode.INVALID_RESET_TOKEN,
            request_id=request_id,
        )

    if isinstance(exc, ExpiredResetTokenError):
        return _create_error_response(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password reset token has expired.",
            code=ErrorCode.INVALID_RESET_TOKEN,
            request_id=request_id,
        )

    if isinstance(exc, ResetTokenAlreadyUsedError):
        return _create_error_response(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password reset token has already been used.",
            code=ErrorCode.RESET_TOKEN_USED,
            request_id=request_id,
        )

    if isinstance(exc, SamePasswordError):
        return _create_error_response(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be different from current password.",
            code=ErrorCode.INVALID_PASSWORD,
            request_id=request_id,
        )

    # Two-factor authentication errors
    if isinstance(exc, TwoFactorRequiredError):
        return _create_error_response(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Two-factor authentication required.",
            code=ErrorCode.TWO_FACTOR_REQUIRED,
            request_id=request_id,
        )

    if isinstance(exc, TwoFactorAlreadyEnabledError):
        return _create_error_response(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Two-factor authentication is already enabled.",
            code=ErrorCode.TWO_FACTOR_ALREADY_ENABLED,
            request_id=request_id,
        )

    if isinstance(exc, TwoFactorNotEnabledError):
        return _create_error_response(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Two-factor authentication is not enabled.",
            code=ErrorCode.TWO_FACTOR_NOT_ENABLED,
            request_id=request_id,
        )

    if isinstance(exc, TwoFactorNotSetupError):
        return _create_error_response(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Two-factor authentication has not been set up.",
            code=ErrorCode.TWO_FACTOR_NOT_SETUP,
            request_id=request_id,
        )

    if isinstance(exc, Invalid2FACodeError):
        return _create_error_response(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid two-factor authentication code.",
            code=ErrorCode.INVALID_TWO_FACTOR_CODE,
            request_id=request_id,
        )

    # Resource errors
    if isinstance(exc, UserNotFoundError):
        errors: dict[str, Any] = {"resource": "User"}
        if exc.user_id is not None:
            errors["id"] = str(exc.user_id)
        return _create_error_response(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
            code=ErrorCode.USER_NOT_FOUND,
            errors=errors,
        )

    if isinstance(exc, EmailAlreadyExistsError):
        return _create_error_response(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email is already registered.",
            code=ErrorCode.EMAIL_ALREADY_EXISTS,
            errors={"field": "email"},
        )

    # Permission errors
    if isinstance(exc, PermissionNotFoundError):
        errors: dict[str, Any] = {"resource": "Permission"}
        if exc.permission_id is not None:
            errors["id"] = exc.permission_id
        return _create_error_response(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Permission not found.",
            code=ErrorCode.PERMISSION_NOT_FOUND,
            errors=errors,
        )

    if isinstance(exc, PermissionCodeAlreadyExistsError):
        return _create_error_response(
            status_code=status.HTTP_409_CONFLICT,
            detail="Permission code already exists.",
            code=ErrorCode.PERMISSION_CODE_ALREADY_EXISTS,
            errors={"field": "code"},
        )

    # Role errors
    if isinstance(exc, RoleNotFoundError):
        errors = {"resource": "Role"}
        if exc.role_id is not None:
            errors["id"] = exc.role_id
        return _create_error_response(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role not found.",
            code=ErrorCode.ROLE_NOT_FOUND,
            errors=errors,
        )

    if isinstance(exc, RoleCodeAlreadyExistsError):
        return _create_error_response(
            status_code=status.HTTP_409_CONFLICT,
            detail="Role code already exists.",
            code=ErrorCode.ROLE_CODE_ALREADY_EXISTS,
            errors={"field": "code"},
        )

    if isinstance(exc, SystemRoleModificationError):
        return _create_error_response(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot modify system roles.",
            code=ErrorCode.SYSTEM_ROLE_MODIFICATION,
        )

    # File/Storage errors
    if isinstance(exc, FileNotFoundError):
        return _create_error_response(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found.",
            code=ErrorCode.FILE_NOT_FOUND,
            errors={"resource": "File"},
        )

    if isinstance(exc, FileTooLargeError):
        return _create_error_response(
            status_code=status.HTTP_413_CONTENT_TOO_LARGE,
            detail="File exceeds size limit.",
            code=ErrorCode.FILE_TOO_LARGE,
        )

    if isinstance(exc, InvalidFileTypeError):
        return _create_error_response(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="File type not permitted.",
            code=ErrorCode.INVALID_FILE_TYPE,
        )

    if isinstance(exc, StorageConnectionError):
        return _create_error_response(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Storage operation failed.",
            code=ErrorCode.STORAGE_ERROR,
        )

    if isinstance(exc, StorageError):
        return _create_error_response(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Storage operation failed.",
            code=ErrorCode.STORAGE_ERROR,
        )

    # Generic service error fallback
    return _create_error_response(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Internal server error.",
        code=ErrorCode.INTERNAL_SERVER_ERROR,
    )


async def sqlalchemy_exception_handler(
    request: Request, exc: SQLAlchemyError
) -> JSONResponse:
    """Handle SQLAlchemy database errors."""
    return _create_error_response(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Database operation failed.",
        code=ErrorCode.DATABASE_ERROR,
    )
