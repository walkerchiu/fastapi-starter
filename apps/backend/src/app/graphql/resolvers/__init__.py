"""GraphQL resolvers."""

from src.app.graphql.resolvers.users import UserMutation, UserQuery

__all__ = ["UserMutation", "UserQuery"]
