"""Shared error codes for REST API and GraphQL.

This module provides a single source of truth for all error codes
used across the application, ensuring consistency between REST and
GraphQL API error responses.
"""

from enum import Enum


class ErrorCode(str, Enum):
    """Application error codes.

    Error codes are organized by category:
    - Authentication (1xxx): User identity verification
    - Authorization (2xxx): Permission and access control
    - Validation (3xxx): Input validation failures
    - Resource (4xxx): Resource-related errors
    - Server (5xxx): Internal server errors
    - Security (6xxx): Rate limiting and query complexity
    """

    # Authentication errors (1xxx)
    UNAUTHENTICATED = "UNAUTHENTICATED"
    INVALID_CREDENTIALS = "INVALID_CREDENTIALS"
    INVALID_TOKEN = "INVALID_TOKEN"
    TOKEN_EXPIRED = "TOKEN_EXPIRED"
    REFRESH_TOKEN_INVALID = "REFRESH_TOKEN_INVALID"
    INACTIVE_USER = "INACTIVE_USER"
    PASSWORD_NOT_SET = "PASSWORD_NOT_SET"

    # Authorization errors (2xxx)
    FORBIDDEN = "FORBIDDEN"
    INSUFFICIENT_PERMISSIONS = "INSUFFICIENT_PERMISSIONS"

    # Validation errors (3xxx)
    VALIDATION_ERROR = "VALIDATION_ERROR"
    INVALID_INPUT = "INVALID_INPUT"
    INVALID_EMAIL = "INVALID_EMAIL"
    WEAK_PASSWORD = "WEAK_PASSWORD"
    INVALID_PASSWORD = "INVALID_PASSWORD"
    PASSWORD_TOO_SHORT = "PASSWORD_TOO_SHORT"
    PASSWORD_TOO_LONG = "PASSWORD_TOO_LONG"
    NAME_TOO_SHORT = "NAME_TOO_SHORT"
    NAME_TOO_LONG = "NAME_TOO_LONG"

    # Resource errors (4xxx)
    NOT_FOUND = "NOT_FOUND"
    USER_NOT_FOUND = "USER_NOT_FOUND"
    ALREADY_EXISTS = "ALREADY_EXISTS"
    USER_ALREADY_EXISTS = "USER_ALREADY_EXISTS"
    EMAIL_ALREADY_EXISTS = "EMAIL_ALREADY_EXISTS"

    # Server errors (5xxx)
    INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR"
    DATABASE_ERROR = "DATABASE_ERROR"

    # Security errors (6xxx) - Rate limiting and GraphQL complexity
    RATE_LIMITED = "RATE_LIMITED"
    QUERY_TOO_DEEP = "QUERY_TOO_DEEP"
    QUERY_TOO_COMPLEX = "QUERY_TOO_COMPLEX"
