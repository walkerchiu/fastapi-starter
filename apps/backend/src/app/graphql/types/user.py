"""GraphQL User type."""

from datetime import datetime

import strawberry


@strawberry.type
class UserType:
    """GraphQL type for User."""

    id: int
    email: str
    name: str
    is_active: bool = strawberry.field(name="isActive")
    created_at: datetime = strawberry.field(name="createdAt")
    updated_at: datetime = strawberry.field(name="updatedAt")
