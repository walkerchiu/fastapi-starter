"""GraphQL input validators."""

import re

from src.app.graphql.errors import InvalidEmailError, ValidationError, WeakPasswordError

# Email regex pattern (simplified RFC 5322)
EMAIL_PATTERN = re.compile(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")

# Password requirements
MIN_PASSWORD_LENGTH = 8
MAX_PASSWORD_LENGTH = 128


def validate_email(email: str) -> str:
    """Validate email format.

    Args:
        email: The email address to validate.

    Returns:
        The validated email (lowercased and stripped).

    Raises:
        InvalidEmailError: If email format is invalid.
    """
    email = email.strip().lower()

    if not email:
        raise InvalidEmailError("Email cannot be empty")

    if len(email) > 254:
        raise InvalidEmailError("Email is too long (max 254 characters)")

    if not EMAIL_PATTERN.match(email):
        raise InvalidEmailError("Invalid email format")

    return email


def validate_password(password: str) -> str:
    """Validate password strength.

    Requirements:
    - At least 8 characters
    - At most 128 characters

    Args:
        password: The password to validate.

    Returns:
        The validated password.

    Raises:
        WeakPasswordError: If password doesn't meet requirements.
    """
    if not password:
        raise WeakPasswordError("Password cannot be empty")

    if len(password) < MIN_PASSWORD_LENGTH:
        raise WeakPasswordError(
            f"Password must be at least {MIN_PASSWORD_LENGTH} characters"
        )

    if len(password) > MAX_PASSWORD_LENGTH:
        raise WeakPasswordError(
            f"Password must be at most {MAX_PASSWORD_LENGTH} characters"
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
    name = name.strip()

    if not name:
        raise ValidationError(f"{field_name.capitalize()} cannot be empty", field_name)

    if len(name) > 100:
        raise ValidationError(
            f"{field_name.capitalize()} is too long (max 100 characters)", field_name
        )

    return name


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
    if page < 1:
        raise ValidationError("Page must be at least 1", "page")

    if limit < 1:
        raise ValidationError("Limit must be at least 1", "limit")

    if limit > 100:
        raise ValidationError("Limit must be at most 100", "limit")

    return page, limit
