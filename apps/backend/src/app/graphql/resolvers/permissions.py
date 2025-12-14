"""Permission GraphQL resolvers."""

import strawberry
from src.app.graphql.errors import require_permissions, require_superadmin
from src.app.graphql.exception_mapper import map_service_exception_to_graphql
from src.app.graphql.types import (
    CreatePermissionInput,
    Message,
    PaginatedPermissions,
    PaginationMeta,
    PermissionType,
    UpdatePermissionInput,
)
from src.app.graphql.validators import validate_pagination
from src.app.schemas import PermissionCreate, PermissionUpdate
from src.app.services import PermissionService
from src.app.services.exceptions import PermissionNotFoundError, ServiceError
from strawberry.types import Info


def convert_permission_to_type(permission) -> PermissionType:
    """Convert database Permission model to GraphQL PermissionType."""
    return PermissionType(
        id=permission.id,
        code=permission.code,
        name=permission.name,
        description=permission.description,
        resource=permission.resource,
        action=permission.action,
        created_at=permission.created_at,
        updated_at=permission.updated_at,
    )


@strawberry.type
class PermissionQuery:
    """Permission query resolvers."""

    @strawberry.field(permission_classes=[require_permissions("permissions:read")])
    async def permissions(
        self,
        info: Info,
        page: int = 1,
        limit: int = 100,
    ) -> PaginatedPermissions:
        """Get paginated list of permissions."""
        page, limit = validate_pagination(page, limit)
        skip = (page - 1) * limit

        db = info.context["db"]
        service = PermissionService(db)

        permissions, total = await service.list_permissions(skip=skip, limit=limit)
        total_pages = ((total + limit - 1) // limit) if limit > 0 else 1

        return PaginatedPermissions(
            data=[convert_permission_to_type(p) for p in permissions],
            meta=PaginationMeta(
                page=page,
                limit=limit,
                total_items=total,
                total_pages=total_pages,
                has_next_page=page < total_pages,
                has_prev_page=page > 1,
            ),
        )

    @strawberry.field(permission_classes=[require_permissions("permissions:read")])
    async def permission(self, info: Info, id: strawberry.ID) -> PermissionType | None:
        """Get a permission by ID."""
        db = info.context["db"]
        service = PermissionService(db)

        try:
            permission = await service.get_by_id(int(id))
            return convert_permission_to_type(permission)
        except PermissionNotFoundError:
            return None

    @strawberry.field(permission_classes=[require_permissions("permissions:read")])
    async def permission_by_code(self, info: Info, code: str) -> PermissionType | None:
        """Get a permission by code."""
        db = info.context["db"]
        service = PermissionService(db)

        permission = await service.get_by_code(code)
        if not permission:
            return None
        return convert_permission_to_type(permission)

    @strawberry.field(permission_classes=[require_permissions("permissions:read")])
    async def permission_by_name(self, info: Info, name: str) -> PermissionType | None:
        """Get a permission by name."""
        db = info.context["db"]
        service = PermissionService(db)

        permission = await service.get_by_name(name)
        if not permission:
            return None
        return convert_permission_to_type(permission)


@strawberry.type
class PermissionMutation:
    """Permission mutation resolvers."""

    @strawberry.mutation(permission_classes=[require_superadmin()])
    async def create_permission(
        self, info: Info, input: CreatePermissionInput
    ) -> PermissionType:
        """Create a new permission."""
        db = info.context["db"]
        service = PermissionService(db)

        permission_data = PermissionCreate(
            code=input.code,
            name=input.name,
            description=input.description,
        )
        try:
            permission = await service.create(permission_data)
            return convert_permission_to_type(permission)
        except ServiceError as e:
            raise map_service_exception_to_graphql(e) from None

    @strawberry.mutation(permission_classes=[require_superadmin()])
    async def update_permission(
        self, info: Info, id: strawberry.ID, input: UpdatePermissionInput
    ) -> PermissionType | None:
        """Update a permission."""
        db = info.context["db"]
        service = PermissionService(db)

        update_dict = {}
        if input.code is not None:
            update_dict["code"] = input.code
        if input.name is not None:
            update_dict["name"] = input.name
        if input.description is not None:
            update_dict["description"] = input.description

        update_data = PermissionUpdate(**update_dict)
        try:
            permission = await service.update(int(id), update_data)
            return convert_permission_to_type(permission)
        except PermissionNotFoundError:
            return None

    @strawberry.mutation(permission_classes=[require_superadmin()])
    async def delete_permission(self, info: Info, id: strawberry.ID) -> Message:
        """Delete a permission."""
        db = info.context["db"]
        service = PermissionService(db)

        try:
            await service.delete(int(id))
            return Message(message="Permission deleted successfully")
        except PermissionNotFoundError:
            raise map_service_exception_to_graphql(
                ServiceError(f"Permission not found: {id}")
            ) from None

    @strawberry.mutation(permission_classes=[require_superadmin()])
    async def hard_delete_permission(self, info: Info, id: strawberry.ID) -> bool:
        """Permanently delete a permission. Super Admin only. This cannot be undone."""
        db = info.context["db"]
        service = PermissionService(db)

        try:
            await service.hard_delete(int(id), is_super_admin=True)
            return True
        except ServiceError as e:
            raise map_service_exception_to_graphql(e) from None

    @strawberry.mutation(permission_classes=[require_superadmin()])
    async def restore_permission(self, info: Info, id: strawberry.ID) -> PermissionType:
        """Restore a soft-deleted permission."""
        db = info.context["db"]
        service = PermissionService(db)

        try:
            permission = await service.restore(int(id))
            return convert_permission_to_type(permission)
        except ServiceError as e:
            raise map_service_exception_to_graphql(e) from None
