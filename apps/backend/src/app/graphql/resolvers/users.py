"""User GraphQL resolvers."""

import uuid

import strawberry
from src.app.graphql.errors import (
    UserNotFoundError as GQLUserNotFoundError,
)
from src.app.graphql.errors import (
    require_permissions,
    require_superadmin,
)
from src.app.graphql.exception_mapper import map_service_exception_to_graphql
from src.app.graphql.resolvers.permissions import convert_permission_to_type
from src.app.graphql.resolvers.roles import convert_role_to_type
from src.app.graphql.subscriptions import (
    publish_user_created,
    publish_user_deleted,
    publish_user_updated,
)
from src.app.graphql.types import (
    AssignRolesInput,
    CreateUserInput,
    Message,
    PaginatedUsers,
    PaginationMeta,
    PermissionType,
    RoleType,
    UpdateUserInput,
    UserType,
    UserTypeWithRoles,
)
from src.app.graphql.validators import (
    validate_email,
    validate_name,
    validate_pagination,
)
from src.app.schemas import UserCreate, UserUpdate
from src.app.services import UserService
from src.app.services.exceptions import ServiceError, UserNotFoundError
from strawberry.types import Info


def convert_user_to_type(user) -> UserType:
    """Convert database User model to GraphQL UserType."""
    # Handle roles - use empty list if roles not loaded
    roles = []
    if hasattr(user, "roles") and user.roles is not None:
        roles = [convert_role_to_type(r) for r in user.roles]
    return UserType(
        id=user.id,
        email=user.email,
        name=user.name,
        is_active=user.is_active,
        is_email_verified=user.is_email_verified,
        is_two_factor_enabled=user.is_two_factor_enabled,
        created_at=user.created_at,
        updated_at=user.updated_at,
        roles=roles,
    )


def convert_user_to_type_with_roles(user) -> UserTypeWithRoles:
    """Convert database User model to GraphQL UserTypeWithRoles."""
    return UserTypeWithRoles(
        id=user.id,
        email=user.email,
        name=user.name,
        is_active=user.is_active,
        is_email_verified=user.is_email_verified,
        is_two_factor_enabled=user.is_two_factor_enabled,
        created_at=user.created_at,
        updated_at=user.updated_at,
        roles=[convert_role_to_type(r) for r in user.roles],
    )


@strawberry.type
class UserQuery:
    """User query resolvers."""

    @strawberry.field(permission_classes=[require_permissions("users:read")])
    async def users(
        self,
        info: Info,
        page: int = 1,
        limit: int = 20,
    ) -> PaginatedUsers:
        """Get paginated list of users."""
        # Validate pagination
        page, limit = validate_pagination(page, limit)

        db = info.context["db"]
        service = UserService(db)

        offset = (page - 1) * limit
        users, total = await service.list_users(skip=offset, limit=limit)

        total_pages = ((total + limit - 1) // limit) if limit > 0 else 1
        return PaginatedUsers(
            data=[convert_user_to_type(user) for user in users],
            meta=PaginationMeta(
                page=page,
                limit=limit,
                total_items=total,
                total_pages=total_pages,
                has_next_page=page < total_pages,
                has_prev_page=page > 1,
            ),
        )

    @strawberry.field(permission_classes=[require_permissions("users:read")])
    async def user(self, info: Info, id: strawberry.ID) -> UserType | None:
        """Get a user by ID."""
        db = info.context["db"]
        service = UserService(db)

        try:
            user = await service.get_by_id(uuid.UUID(str(id)))
            return convert_user_to_type(user)
        except UserNotFoundError:
            return None

    @strawberry.field(permission_classes=[require_permissions("users:read")])
    async def user_with_roles(
        self, info: Info, id: strawberry.ID
    ) -> UserTypeWithRoles | None:
        """Get a user by ID with roles loaded."""
        db = info.context["db"]
        service = UserService(db)

        try:
            user = await service.get_by_id(uuid.UUID(str(id)), include_roles=True)
            return convert_user_to_type_with_roles(user)
        except UserNotFoundError:
            return None

    @strawberry.field(permission_classes=[require_permissions("users:read")])
    async def user_permissions(
        self, info: Info, user_id: strawberry.ID
    ) -> list[PermissionType]:
        """Get all permissions for a user."""
        db = info.context["db"]
        service = UserService(db)

        try:
            permissions = await service.get_user_permissions(uuid.UUID(str(user_id)))
            return [convert_permission_to_type(p) for p in permissions]
        except UserNotFoundError:
            raise GQLUserNotFoundError(str(user_id)) from None

    @strawberry.field(permission_classes=[require_permissions("users:read")])
    async def user_roles(self, info: Info, user_id: strawberry.ID) -> list[RoleType]:
        """Get all roles for a user."""
        db = info.context["db"]
        service = UserService(db)

        try:
            user = await service.get_by_id(uuid.UUID(str(user_id)), include_roles=True)
            return [convert_role_to_type(r) for r in user.roles]
        except UserNotFoundError:
            raise GQLUserNotFoundError(str(user_id)) from None


@strawberry.type
class UserMutation:
    """User mutation resolvers."""

    @strawberry.mutation(permission_classes=[require_permissions("users:create")])
    async def create_user(self, info: Info, input: CreateUserInput) -> UserType:
        """Create a new user."""
        # Validate inputs
        email = validate_email(input.email)
        name = validate_name(input.name)

        db = info.context["db"]
        service = UserService(db)

        user_data = UserCreate(email=email, name=name)
        try:
            user = await service.create(user_data)
            # Publish user created event
            await publish_user_created(user.id, user.email)
            return convert_user_to_type(user)
        except ServiceError as e:
            raise map_service_exception_to_graphql(e) from None

    @strawberry.mutation(permission_classes=[require_permissions("users:update")])
    async def update_user(
        self, info: Info, id: strawberry.ID, input: UpdateUserInput
    ) -> UserType | None:
        """Update a user."""
        # Validate inputs if provided
        update_dict = {}
        if input.email is not None:
            update_dict["email"] = validate_email(input.email)
        if input.name is not None:
            update_dict["name"] = validate_name(input.name)
        if input.is_active is not None:
            update_dict["is_active"] = input.is_active

        db = info.context["db"]
        service = UserService(db)

        update_data = UserUpdate(**update_dict)
        try:
            user = await service.update(uuid.UUID(str(id)), update_data)
            # Publish user updated event
            await publish_user_updated(user.id, user.email)
            return convert_user_to_type(user)
        except UserNotFoundError:
            return None

    @strawberry.mutation(permission_classes=[require_permissions("users:delete")])
    async def delete_user(self, info: Info, id: strawberry.ID) -> Message:
        """Delete a user. Returns message if successful, raises error if not found."""
        db = info.context["db"]
        service = UserService(db)

        try:
            user_id = uuid.UUID(str(id))
            await service.delete(user_id)
            # Publish user deleted event
            await publish_user_deleted(user_id)
            return Message(message="User deleted successfully")
        except UserNotFoundError:
            raise GQLUserNotFoundError(str(id)) from None

    @strawberry.mutation(permission_classes=[require_permissions("users:update")])
    async def assign_role_to_user(
        self, info: Info, user_id: strawberry.ID, role_id: strawberry.ID
    ) -> Message:
        """Assign a role to a user."""
        db = info.context["db"]
        service = UserService(db)

        try:
            await service.assign_role(uuid.UUID(str(user_id)), int(role_id))
            return Message(message="Role assigned to user successfully")
        except ServiceError as e:
            raise map_service_exception_to_graphql(e) from None

    @strawberry.mutation(permission_classes=[require_permissions("users:update")])
    async def remove_role_from_user(
        self, info: Info, user_id: strawberry.ID, role_id: strawberry.ID
    ) -> Message:
        """Remove a single role from a user."""
        db = info.context["db"]
        service = UserService(db)

        try:
            await service.remove_role(uuid.UUID(str(user_id)), int(role_id))
            return Message(message="Role removed from user successfully")
        except ServiceError as e:
            raise map_service_exception_to_graphql(e) from None

    @strawberry.mutation(permission_classes=[require_permissions("users:update")])
    async def assign_user_roles(
        self, info: Info, user_id: strawberry.ID, input: AssignRolesInput
    ) -> list[RoleType]:
        """Replace all roles for a user with the specified roles."""
        db = info.context["db"]
        service = UserService(db)

        try:
            user = await service.replace_roles(
                uuid.UUID(str(user_id)), [int(rid) for rid in input.role_ids]
            )
            return [convert_role_to_type(r) for r in user.roles]
        except ServiceError as e:
            raise map_service_exception_to_graphql(e) from None

    @strawberry.mutation(permission_classes=[require_permissions("users:update")])
    async def remove_roles_from_user(
        self, info: Info, user_id: strawberry.ID, input: AssignRolesInput
    ) -> Message:
        """Remove multiple roles from a user (bulk operation)."""
        db = info.context["db"]
        service = UserService(db)

        try:
            await service.remove_roles(
                uuid.UUID(str(user_id)), [int(rid) for rid in input.role_ids]
            )
            return Message(message="Roles removed from user successfully")
        except ServiceError as e:
            raise map_service_exception_to_graphql(e) from None

    @strawberry.mutation(permission_classes=[require_permissions("users:update")])
    async def add_roles_to_user(
        self, info: Info, user_id: strawberry.ID, input: AssignRolesInput
    ) -> list[RoleType]:
        """Add multiple roles to a user without replacing existing roles."""
        db = info.context["db"]
        service = UserService(db)

        try:
            user = await service.add_roles(
                uuid.UUID(str(user_id)), [int(rid) for rid in input.role_ids]
            )
            return [convert_role_to_type(r) for r in user.roles]
        except ServiceError as e:
            raise map_service_exception_to_graphql(e) from None

    @strawberry.mutation(permission_classes=[require_permissions("users:delete")])
    async def hard_delete_user(self, info: Info, id: strawberry.ID) -> bool:
        """Permanently delete a user. Super Admin only. This cannot be undone."""
        db = info.context["db"]
        service = UserService(db)
        current_user = info.context.get("user")

        # Check if user is super admin
        is_super_admin = False
        if current_user:
            for role in getattr(current_user, "roles", []):
                if role.code == "super_admin":
                    is_super_admin = True
                    break

        try:
            await service.hard_delete(id, is_super_admin=is_super_admin)
            await publish_user_deleted(id)
            return True
        except ServiceError as e:
            raise map_service_exception_to_graphql(e) from None

    @strawberry.mutation(permission_classes=[require_superadmin()])
    async def restore_user(self, info: Info, id: strawberry.ID) -> UserType:
        """Restore a soft-deleted user. Super Admin only."""
        db = info.context["db"]
        service = UserService(db)

        try:
            user = await service.restore(id)
            return convert_user_to_type(user)
        except ServiceError as e:
            raise map_service_exception_to_graphql(e) from None
