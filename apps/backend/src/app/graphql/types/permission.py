"""GraphQL Permission type."""

from datetime import datetime

import strawberry


@strawberry.type
class PermissionType:
    """GraphQL type for Permission."""

    id: strawberry.ID
    code: str
    name: str
    description: str | None
    resource: str
    action: str
    created_at: datetime = strawberry.field(name="createdAt")
    updated_at: datetime = strawberry.field(name="updatedAt")
