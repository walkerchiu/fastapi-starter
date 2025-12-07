"""Shared validation constants and functions.

This module provides validation constants and pure validation functions
that can be used by both REST API schemas and GraphQL validators.
"""

import re
from dataclasses import dataclass

# Email validation
EMAIL_MAX_LENGTH = 254
EMAIL_PATTERN = re.compile(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")

# Password validation
PASSWORD_MIN_LENGTH = 8
PASSWORD_MAX_LENGTH = 128

# Name validation
NAME_MIN_LENGTH = 1
NAME_MAX_LENGTH = 100

# Pagination defaults
PAGINATION_DEFAULT_SKIP = 0
PAGINATION_DEFAULT_LIMIT = 20
PAGINATION_MAX_LIMIT = 100


@dataclass
class ValidationResult:
    """Result of a validation check."""

    is_valid: bool
    error_message: str | None = None


def validate_email_format(email: str) -> ValidationResult:
    """Validate email format.

    Args:
        email: The email address to validate.

    Returns:
        ValidationResult with is_valid and error_message.
    """
    email = email.strip().lower()

    if not email:
        return ValidationResult(False, "Email cannot be empty")

    if len(email) > EMAIL_MAX_LENGTH:
        return ValidationResult(
            False, f"Email is too long (max {EMAIL_MAX_LENGTH} characters)"
        )

    if not EMAIL_PATTERN.match(email):
        return ValidationResult(False, "Invalid email format")

    return ValidationResult(True)


def validate_password_strength(password: str) -> ValidationResult:
    """Validate password strength.

    Args:
        password: The password to validate.

    Returns:
        ValidationResult with is_valid and error_message.
    """
    if not password:
        return ValidationResult(False, "Password cannot be empty")

    if len(password) < PASSWORD_MIN_LENGTH:
        return ValidationResult(
            False, f"Password must be at least {PASSWORD_MIN_LENGTH} characters"
        )

    if len(password) > PASSWORD_MAX_LENGTH:
        return ValidationResult(
            False, f"Password must be at most {PASSWORD_MAX_LENGTH} characters"
        )

    return ValidationResult(True)


def validate_name_format(name: str, field_name: str = "name") -> ValidationResult:
    """Validate name field.

    Args:
        name: The name to validate.
        field_name: The field name for error messages.

    Returns:
        ValidationResult with is_valid and error_message.
    """
    name = name.strip()

    if not name:
        return ValidationResult(False, f"{field_name.capitalize()} cannot be empty")

    if len(name) > NAME_MAX_LENGTH:
        return ValidationResult(
            False,
            f"{field_name.capitalize()} is too long (max {NAME_MAX_LENGTH} characters)",
        )

    return ValidationResult(True)


def validate_pagination_params(page: int, limit: int) -> ValidationResult:
    """Validate pagination parameters.

    Args:
        page: Page number (1-indexed).
        limit: Maximum number of items to return.

    Returns:
        ValidationResult with is_valid and error_message.
    """
    if page < 1:
        return ValidationResult(False, "Page must be at least 1")

    if limit < 1:
        return ValidationResult(False, "Limit must be at least 1")

    if limit > PAGINATION_MAX_LIMIT:
        return ValidationResult(False, f"Limit must be at most {PAGINATION_MAX_LIMIT}")

    return ValidationResult(True)


def normalize_email(email: str) -> str:
    """Normalize email address.

    Args:
        email: The email address to normalize.

    Returns:
        Normalized email (lowercased and stripped).
    """
    return email.strip().lower()


def normalize_name(name: str) -> str:
    """Normalize name field.

    Args:
        name: The name to normalize.

    Returns:
        Normalized name (stripped).
    """
    return name.strip()
