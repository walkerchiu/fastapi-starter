"""Role GraphQL resolvers."""

import strawberry
from src.app.graphql.errors import (
    CannotModifySystemRoleError as GQLCannotModifySystemRoleError,
)
from src.app.graphql.errors import RoleNotFoundError as GQLRoleNotFoundError
from src.app.graphql.errors import (
    require_permissions,
    require_superadmin,
)
from src.app.graphql.exception_mapper import map_service_exception_to_graphql
from src.app.graphql.resolvers.permissions import convert_permission_to_type
from src.app.graphql.types import (
    AssignPermissionsInput,
    CreateRoleInput,
    Message,
    PaginatedRoles,
    PaginationMeta,
    PermissionType,
    RoleType,
    UpdateRoleInput,
)
from src.app.graphql.validators import validate_pagination
from src.app.schemas import RoleCreate, RoleUpdate
from src.app.services import RoleService
from src.app.services.exceptions import (
    RoleNotFoundError,
    ServiceError,
    SystemRoleModificationError,
)
from strawberry.types import Info


def convert_role_to_type(role) -> RoleType:
    """Convert database Role model to GraphQL RoleType."""
    return RoleType(
        id=role.id,
        code=role.code,
        name=role.name,
        description=role.description,
        is_system=role.is_system,
        created_at=role.created_at,
        updated_at=role.updated_at,
        permissions=[convert_permission_to_type(p) for p in role.permissions],
    )


@strawberry.type
class RoleQuery:
    """Role query resolvers."""

    @strawberry.field(permission_classes=[require_permissions("roles:read")])
    async def roles(
        self,
        info: Info,
        page: int = 1,
        limit: int = 100,
    ) -> PaginatedRoles:
        """Get paginated list of roles."""
        page, limit = validate_pagination(page, limit)
        skip = (page - 1) * limit

        db = info.context["db"]
        service = RoleService(db)

        roles, total = await service.list_roles(
            skip=skip, limit=limit, include_permissions=True
        )
        total_pages = ((total + limit - 1) // limit) if limit > 0 else 1

        return PaginatedRoles(
            data=[convert_role_to_type(r) for r in roles],
            meta=PaginationMeta(
                page=page,
                limit=limit,
                total_items=total,
                total_pages=total_pages,
                has_next_page=page < total_pages,
                has_prev_page=page > 1,
            ),
        )

    @strawberry.field(permission_classes=[require_permissions("roles:read")])
    async def role(self, info: Info, id: strawberry.ID) -> RoleType | None:
        """Get a role by ID."""
        db = info.context["db"]
        service = RoleService(db)

        try:
            role = await service.get_by_id(id, include_permissions=True)
            return convert_role_to_type(role)
        except RoleNotFoundError:
            return None

    @strawberry.field(permission_classes=[require_permissions("roles:read")])
    async def role_by_code(self, info: Info, code: str) -> RoleType | None:
        """Get a role by code."""
        db = info.context["db"]
        service = RoleService(db)

        role = await service.get_by_code(code)
        if not role:
            return None
        # Load permissions
        role = await service.get_by_id(role.id, include_permissions=True)
        return convert_role_to_type(role)

    @strawberry.field(permission_classes=[require_permissions("roles:read")])
    async def role_by_name(self, info: Info, name: str) -> RoleType | None:
        """Get a role by name."""
        db = info.context["db"]
        service = RoleService(db)

        role = await service.get_by_name(name)
        if not role:
            return None
        # Load permissions
        role = await service.get_by_id(role.id, include_permissions=True)
        return convert_role_to_type(role)

    @strawberry.field(permission_classes=[require_permissions("roles:read")])
    async def role_permissions(
        self, info: Info, role_id: strawberry.ID
    ) -> list[PermissionType]:
        """Get permissions assigned to a role."""
        db = info.context["db"]
        service = RoleService(db)

        try:
            role = await service.get_by_id(role_id, include_permissions=True)
            return [convert_permission_to_type(p) for p in role.permissions]
        except RoleNotFoundError:
            raise GQLRoleNotFoundError(role_id) from None


@strawberry.type
class RoleMutation:
    """Role mutation resolvers."""

    @strawberry.mutation(permission_classes=[require_superadmin()])
    async def create_role(self, info: Info, input: CreateRoleInput) -> RoleType:
        """Create a new role."""
        db = info.context["db"]
        service = RoleService(db)

        role_data = RoleCreate(
            code=input.code,
            name=input.name,
            description=input.description,
            is_system=input.is_system,
            permission_ids=[int(pid) for pid in input.permission_ids]
            if input.permission_ids
            else [],
        )
        try:
            role = await service.create(role_data)
            return convert_role_to_type(role)
        except ServiceError as e:
            raise map_service_exception_to_graphql(e) from None

    @strawberry.mutation(permission_classes=[require_superadmin()])
    async def update_role(
        self, info: Info, id: strawberry.ID, input: UpdateRoleInput
    ) -> RoleType | None:
        """Update a role."""
        db = info.context["db"]
        service = RoleService(db)

        update_dict = {}
        if input.code is not None:
            update_dict["code"] = input.code
        if input.name is not None:
            update_dict["name"] = input.name
        if input.description is not None:
            update_dict["description"] = input.description
        if input.permission_ids is not None:
            update_dict["permission_ids"] = [int(pid) for pid in input.permission_ids]

        update_data = RoleUpdate(**update_dict)
        try:
            role = await service.update(int(id), update_data)
            return convert_role_to_type(role)
        except RoleNotFoundError:
            return None
        except SystemRoleModificationError:
            raise GQLCannotModifySystemRoleError(id) from None

    @strawberry.mutation(permission_classes=[require_superadmin()])
    async def delete_role(self, info: Info, id: strawberry.ID) -> Message:
        """Delete a role."""
        db = info.context["db"]
        service = RoleService(db)

        try:
            await service.delete(id)
            return Message(message="Role deleted successfully")
        except RoleNotFoundError:
            raise GQLRoleNotFoundError(id) from None
        except SystemRoleModificationError:
            raise GQLCannotModifySystemRoleError(id) from None

    @strawberry.mutation(permission_classes=[require_superadmin()])
    async def add_permission_to_role(
        self, info: Info, role_id: strawberry.ID, permission_id: strawberry.ID
    ) -> Message:
        """Add a permission to a role."""
        db = info.context["db"]
        service = RoleService(db)

        try:
            await service.add_permission(int(role_id), int(permission_id))
            return Message(message="Permission added to role successfully")
        except ServiceError as e:
            raise map_service_exception_to_graphql(e) from None

    @strawberry.mutation(permission_classes=[require_superadmin()])
    async def remove_permission_from_role(
        self, info: Info, role_id: strawberry.ID, permission_id: strawberry.ID
    ) -> Message:
        """Remove a permission from a role."""
        db = info.context["db"]
        service = RoleService(db)

        try:
            await service.remove_permission(int(role_id), int(permission_id))
            return Message(message="Permission removed from role successfully")
        except ServiceError as e:
            raise map_service_exception_to_graphql(e) from None

    @strawberry.mutation(permission_classes=[require_superadmin()])
    async def assign_role_permissions(
        self, info: Info, role_id: strawberry.ID, input: AssignPermissionsInput
    ) -> list[PermissionType]:
        """Assign multiple permissions to a role."""
        db = info.context["db"]
        service = RoleService(db)

        try:
            role = await service.assign_permissions(
                int(role_id), [int(pid) for pid in input.permission_ids]
            )
            return [convert_permission_to_type(p) for p in role.permissions]
        except ServiceError as e:
            raise map_service_exception_to_graphql(e) from None

    @strawberry.mutation(permission_classes=[require_superadmin()])
    async def hard_delete_role(self, info: Info, id: strawberry.ID) -> bool:
        """Permanently delete a role. Super Admin only. This cannot be undone."""
        db = info.context["db"]
        service = RoleService(db)

        try:
            await service.hard_delete(id, is_super_admin=True)
            return True
        except ServiceError as e:
            raise map_service_exception_to_graphql(e) from None

    @strawberry.mutation(permission_classes=[require_superadmin()])
    async def restore_role(self, info: Info, id: strawberry.ID) -> RoleType:
        """Restore a soft-deleted role."""
        db = info.context["db"]
        service = RoleService(db)

        try:
            role = await service.restore(id)
            return convert_role_to_type(role)
        except ServiceError as e:
            raise map_service_exception_to_graphql(e) from None
