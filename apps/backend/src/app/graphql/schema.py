"""GraphQL schema definition."""

import strawberry
from src.app.graphql.extensions import DepthLimitExtension, QueryComplexityExtension
from src.app.graphql.resolvers import AuthMutation, AuthQuery, UserMutation, UserQuery


@strawberry.type
class Query(UserQuery, AuthQuery):
    """Root query type."""

    @strawberry.field
    def hello(self) -> str:
        """Simple hello query for testing."""
        return "Hello from GraphQL!"


@strawberry.type
class Mutation(UserMutation, AuthMutation):
    """Root mutation type."""

    @strawberry.mutation
    def ping(self) -> str:
        """Simple ping mutation for testing."""
        return "pong"


schema = strawberry.Schema(
    query=Query,
    mutation=Mutation,
    extensions=[
        DepthLimitExtension,
        QueryComplexityExtension,
    ],
)
