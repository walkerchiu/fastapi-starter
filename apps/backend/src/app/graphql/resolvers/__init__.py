"""GraphQL resolvers."""

from src.app.graphql.resolvers.auth import AuthMutation, AuthQuery
from src.app.graphql.resolvers.users import UserMutation, UserQuery

__all__ = ["AuthMutation", "AuthQuery", "UserMutation", "UserQuery"]
