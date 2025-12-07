"""GraphQL input validators.

This module provides GraphQL-specific validation functions that raise
GraphQL errors. The underlying validation logic is imported from the
shared core validators module.
"""

from src.app.core.validators import (
    normalize_email,
    normalize_name,
    validate_email_format,
    validate_name_format,
    validate_pagination_params,
    validate_password_strength,
)
from src.app.graphql.errors import InvalidEmailError, ValidationError, WeakPasswordError


def validate_email(email: str) -> str:
    """Validate email format.

    Args:
        email: The email address to validate.

    Returns:
        The validated email (lowercased and stripped).

    Raises:
        InvalidEmailError: If email format is invalid.
    """
    result = validate_email_format(email)
    if not result.is_valid:
        raise InvalidEmailError(result.error_message or "Invalid email format")
    return normalize_email(email)


def validate_password(password: str) -> str:
    """Validate password strength.

    Args:
        password: The password to validate.

    Returns:
        The validated password.

    Raises:
        WeakPasswordError: If password doesn't meet requirements.
    """
    result = validate_password_strength(password)
    if not result.is_valid:
        raise WeakPasswordError(
            result.error_message or "Password does not meet requirements"
        )
    return password


def validate_name(name: str, field_name: str = "name") -> str:
    """Validate name field.

    Args:
        name: The name to validate.
        field_name: The field name for error messages.

    Returns:
        The validated name (stripped).

    Raises:
        ValidationError: If name is invalid.
    """
    result = validate_name_format(name, field_name)
    if not result.is_valid:
        raise ValidationError(
            result.error_message or f"Invalid {field_name}", field_name
        )
    return normalize_name(name)


def validate_pagination(page: int, limit: int) -> tuple[int, int]:
    """Validate pagination parameters.

    Args:
        page: Page number (1-indexed).
        limit: Maximum number of items to return.

    Returns:
        Tuple of validated (page, limit).

    Raises:
        ValidationError: If pagination parameters are invalid.
    """
    result = validate_pagination_params(page, limit)
    if not result.is_valid:
        # Determine which field caused the error
        error_msg = result.error_message or "Invalid pagination parameters"
        field = "page" if "page" in error_msg.lower() else "limit"
        raise ValidationError(error_msg, field)
    return page, limit
