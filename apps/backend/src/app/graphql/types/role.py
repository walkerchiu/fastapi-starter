"""GraphQL Role type."""

from datetime import datetime

import strawberry
from src.app.graphql.types.permission import PermissionType


@strawberry.type
class RoleType:
    """GraphQL type for Role."""

    id: strawberry.ID
    code: str
    name: str
    description: str | None
    is_system: bool = strawberry.field(name="isSystem")
    created_at: datetime = strawberry.field(name="createdAt")
    updated_at: datetime = strawberry.field(name="updatedAt")
    permissions: list[PermissionType]
