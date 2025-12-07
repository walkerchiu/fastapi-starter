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

    pass


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
