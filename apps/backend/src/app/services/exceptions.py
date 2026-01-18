"""Shared service layer exceptions.

This module provides base exception classes and common exceptions
used across all service modules.
"""


class ServiceError(Exception):
    """Base exception for all service layer errors."""

    pass


# User-related errors
class UserNotFoundError(ServiceError):
    """Raised when user is not found."""

    def __init__(self, message: str = "User not found", user_id: int | None = None):
        super().__init__(message)
        self.user_id = user_id


class EmailAlreadyExistsError(ServiceError):
    """Raised when email already exists."""

    pass


class HardDeleteNotAllowedError(ServiceError):
    """Raised when hard delete is attempted without proper authorization."""

    pass


# Authentication-related errors
class InvalidCredentialsError(ServiceError):
    """Raised when login credentials are invalid."""

    pass


class InactiveUserError(ServiceError):
    """Raised when user account is inactive."""

    pass


class InvalidTokenError(ServiceError):
    """Raised when token is invalid or expired."""

    pass


class InvalidTokenTypeError(ServiceError):
    """Raised when token type is incorrect."""

    pass


class RefreshTokenInvalidError(ServiceError):
    """Raised when refresh token is invalid or expired."""

    pass


# Password reset errors
class InvalidResetTokenError(ServiceError):
    """Raised when password reset token is invalid."""

    pass


class ExpiredResetTokenError(ServiceError):
    """Raised when password reset token has expired."""

    pass


class ResetTokenAlreadyUsedError(ServiceError):
    """Raised when password reset token has already been used."""

    pass


# Email verification errors
class InvalidVerificationTokenError(ServiceError):
    """Raised when email verification token is invalid."""

    pass


class ExpiredVerificationTokenError(ServiceError):
    """Raised when email verification token has expired."""

    pass


class EmailAlreadyVerifiedError(ServiceError):
    """Raised when email is already verified."""

    pass


# Profile errors
class SamePasswordError(ServiceError):
    """Raised when new password is the same as current password."""

    pass


# Storage-related errors
class StorageError(ServiceError):
    """Base exception for storage operations."""

    pass


class FileNotFoundError(StorageError):
    """Raised when file is not found in storage."""

    pass


class FileTooLargeError(StorageError):
    """Raised when file exceeds maximum allowed size."""

    pass


class InvalidFileTypeError(StorageError):
    """Raised when file type is not allowed."""

    pass


class StorageConnectionError(StorageError):
    """Raised when unable to connect to storage service."""

    pass


# Permission-related errors
class PermissionNotFoundError(ServiceError):
    """Raised when permission is not found."""

    def __init__(
        self, message: str = "Permission not found", permission_id: int | None = None
    ):
        super().__init__(message)
        self.permission_id = permission_id


class PermissionCodeAlreadyExistsError(ServiceError):
    """Raised when permission code already exists."""

    pass


# Role-related errors
class RoleNotFoundError(ServiceError):
    """Raised when role is not found."""

    def __init__(self, message: str = "Role not found", role_id: int | None = None):
        super().__init__(message)
        self.role_id = role_id


class RoleCodeAlreadyExistsError(ServiceError):
    """Raised when role code already exists."""

    pass


class SystemRoleModificationError(ServiceError):
    """Raised when trying to modify a system role."""

    pass


# Email-related errors
class EmailError(ServiceError):
    """Base exception for email operations."""

    pass


class EmailSendError(EmailError):
    """Raised when email sending fails."""

    pass


class EmailConnectionError(EmailError):
    """Raised when unable to connect to SMTP server."""

    pass


# 2FA errors
class TwoFactorAlreadyEnabledError(ServiceError):
    """Raised when 2FA is already enabled."""

    pass


class TwoFactorNotEnabledError(ServiceError):
    """Raised when 2FA is not enabled."""

    pass


class TwoFactorNotSetupError(ServiceError):
    """Raised when 2FA setup is not initiated."""

    pass


class Invalid2FACodeError(ServiceError):
    """Raised when 2FA code is invalid."""

    pass


class TwoFactorRequiredError(ServiceError):
    """Raised when 2FA verification is required."""

    def __init__(
        self,
        message: str = "2FA required",
        user_id: int | None = None,
    ):
        super().__init__(message)
        self.user_id = user_id
