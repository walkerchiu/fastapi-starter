"""GraphQL types."""

from src.app.graphql.types.pagination import PaginatedUsers
from src.app.graphql.types.user import Message, UserType

__all__ = ["Message", "PaginatedUsers", "UserType"]
