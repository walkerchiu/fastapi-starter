"""GraphQL pagination types."""

import strawberry
from src.app.graphql.types.permission import PermissionType
from src.app.graphql.types.role import RoleType
from src.app.graphql.types.user import UserType


@strawberry.type
class PaginationMeta:
    """Pagination metadata for GraphQL."""

    page: int
    limit: int
    total_items: int = strawberry.field(name="totalItems")
    total_pages: int = strawberry.field(name="totalPages")
    has_next_page: bool = strawberry.field(name="hasNextPage")
    has_prev_page: bool = strawberry.field(name="hasPrevPage")


@strawberry.type
class PaginatedUsers:
    """Paginated users response."""

    data: list[UserType]
    meta: PaginationMeta


@strawberry.type
class PaginatedPermissions:
    """Paginated permissions response."""

    data: list[PermissionType]
    meta: PaginationMeta


@strawberry.type
class PaginatedRoles:
    """Paginated roles response."""

    data: list[RoleType]
    meta: PaginationMeta
