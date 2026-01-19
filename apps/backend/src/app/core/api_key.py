"""API Key authentication utilities.

Provides dependency functions for API key validation in FastAPI endpoints.
"""

from collections.abc import Callable
from typing import Annotated

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import APIKeyHeader

from app.core.config import settings


def _parse_api_keys(keys_str: str) -> dict[str, str]:
    """Parse API keys from configuration string.

    Args:
        keys_str: Comma-separated key:name pairs (e.g., "key1:name1,key2:name2")

    Returns:
        Dictionary mapping API keys to their names
    """
    if not keys_str:
        return {}

    result: dict[str, str] = {}
    for pair in keys_str.split(","):
        parts = pair.strip().split(":")
        if len(parts) == 2:
            key, name = parts
            if key and name:
                result[key.strip()] = name.strip()
    return result


# Parse API keys from settings
_api_keys = _parse_api_keys(settings.api_keys)

# Security scheme for API key header
api_key_header = APIKeyHeader(
    name=settings.api_key_header,
    auto_error=False,
)


class ApiKeyAuth:
    """API Key authentication handler."""

    def __init__(self, required: bool = True) -> None:
        """Initialize the API key auth handler.

        Args:
            required: If True, API key is required. If False, it's optional.
        """
        self.required = required

    async def __call__(
        self,
        request: Request,
        api_key: str | None = Depends(api_key_header),
    ) -> str | None:
        """Validate API key and return the associated name.

        Args:
            request: The FastAPI request object
            api_key: The API key from the header

        Returns:
            The name associated with the API key, or None if optional and not provided

        Raises:
            HTTPException: If API key is invalid or required but not provided
        """
        # If API key auth is disabled
        if not settings.api_key_enabled:
            if self.required:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="API key authentication is not enabled",
                )
            return None

        # No API key provided
        if not api_key:
            if self.required:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="API key is required",
                    headers={"WWW-Authenticate": "ApiKey"},
                )
            return None

        # Validate API key
        key_name = _api_keys.get(api_key)
        if not key_name:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid API key",
                headers={"WWW-Authenticate": "ApiKey"},
            )

        # Store the key name in request state for logging/auditing
        request.state.api_key_name = key_name

        return key_name


# Dependency instances
require_api_key = ApiKeyAuth(required=True)
optional_api_key = ApiKeyAuth(required=False)

# Type aliases for dependency injection
ApiKeyName = Annotated[str, Depends(require_api_key)]
OptionalApiKeyName = Annotated[str | None, Depends(optional_api_key)]


def get_api_key_name(request: Request) -> str | None:
    """Get the API key name from request state.

    Args:
        request: The FastAPI request object

    Returns:
        The API key name if authenticated, None otherwise
    """
    return getattr(request.state, "api_key_name", None)


def require_jwt_or_api_key() -> Callable[..., str | None]:
    """Create a dependency that accepts either JWT or API key authentication.

    Returns:
        A dependency function that validates JWT or API key
    """
    from app.api.deps import get_current_user_optional

    async def dependency(
        request: Request,
        api_key: str | None = Depends(api_key_header),
        user: object = Depends(get_current_user_optional),
    ) -> str | None:
        # If user is authenticated via JWT, allow
        if user is not None:
            return None

        # If API key auth is disabled, require JWT
        if not settings.api_key_enabled:
            if user is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Authentication required",
                )
            return None

        # Try API key authentication
        if api_key:
            key_name = _api_keys.get(api_key)
            if key_name:
                request.state.api_key_name = key_name
                return key_name
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid API key",
            )

        # Neither JWT nor API key provided
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required (JWT or API key)",
        )

    return dependency
