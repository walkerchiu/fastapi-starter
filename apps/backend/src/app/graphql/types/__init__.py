"""GraphQL types."""

from src.app.graphql.types.auth import (
    LoginInput,
    RefreshTokenInput,
    RegisterInput,
    TokenType,
)
from src.app.graphql.types.inputs import CreateUserInput, UpdateUserInput
from src.app.graphql.types.pagination import PaginatedUsers, PaginationMeta
from src.app.graphql.types.user import Message, UserType

__all__ = [
    "CreateUserInput",
    "LoginInput",
    "Message",
    "PaginatedUsers",
    "PaginationMeta",
    "RefreshTokenInput",
    "RegisterInput",
    "TokenType",
    "UpdateUserInput",
    "UserType",
]
