"""GraphQL User type."""

from datetime import datetime
from typing import Annotated

import strawberry


@strawberry.type
class Message:
    """Message response type."""

    message: str


@strawberry.type
class UserType:
    """GraphQL type for User."""

    id: strawberry.ID
    email: str
    name: str
    is_active: bool = strawberry.field(name="isActive")
    created_at: datetime = strawberry.field(name="createdAt")
    updated_at: datetime = strawberry.field(name="updatedAt")
    roles: list[Annotated["RoleType", strawberry.lazy("src.app.graphql.types.role")]]


@strawberry.type
class UserTypeWithRoles:
    """GraphQL type for User with roles loaded."""

    id: strawberry.ID
    email: str
    name: str
    is_active: bool = strawberry.field(name="isActive")
    created_at: datetime = strawberry.field(name="createdAt")
    updated_at: datetime = strawberry.field(name="updatedAt")
    roles: list[Annotated["RoleType", strawberry.lazy("src.app.graphql.types.role")]]


# Import for type completion
from src.app.graphql.types.role import RoleType  # noqa: E402, F401
