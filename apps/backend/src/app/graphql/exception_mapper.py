"""GraphQL exception mapping utilities.

This module provides utilities to convert service-layer exceptions
to GraphQL errors, reducing boilerplate in resolvers.
"""

from src.app.graphql.errors import (
    EmailAlreadyExistsError as GQLEmailAlreadyExistsError,
)
from src.app.graphql.errors import (
    InactiveUserError as GQLInactiveUserError,
)
from src.app.graphql.errors import (
    InvalidCredentialsError as GQLInvalidCredentialsError,
)
from src.app.graphql.errors import (
    InvalidTokenError as GQLInvalidTokenError,
)
from src.app.graphql.errors import (
    UserNotFoundError as GQLUserNotFoundError,
)
from src.app.services.exceptions import (
    EmailAlreadyExistsError,
    InactiveUserError,
    InvalidCredentialsError,
    InvalidTokenError,
    InvalidTokenTypeError,
    UserNotFoundError,
)


def map_service_exception_to_graphql(exc: Exception) -> Exception:
    """Map a service-layer exception to its GraphQL equivalent.

    Args:
        exc: The service-layer exception to convert

    Returns:
        The corresponding GraphQL error

    Raises:
        The original exception if no mapping exists
    """
    # Authentication errors
    if isinstance(exc, InvalidCredentialsError):
        return GQLInvalidCredentialsError()

    if isinstance(exc, (InvalidTokenError, InvalidTokenTypeError)):
        msg = "Invalid token type." if isinstance(exc, InvalidTokenTypeError) else None
        return GQLInvalidTokenError(msg) if msg else GQLInvalidTokenError()

    if isinstance(exc, InactiveUserError):
        return GQLInactiveUserError()

    # Resource errors
    if isinstance(exc, UserNotFoundError):
        return GQLUserNotFoundError()

    if isinstance(exc, EmailAlreadyExistsError):
        return GQLEmailAlreadyExistsError()

    # No mapping found, re-raise original
    return exc
