"""GraphQL resolvers."""

from src.app.graphql.resolvers.auth import AuthMutation
from src.app.graphql.resolvers.users import UserMutation, UserQuery

__all__ = ["AuthMutation", "UserMutation", "UserQuery"]
