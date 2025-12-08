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
