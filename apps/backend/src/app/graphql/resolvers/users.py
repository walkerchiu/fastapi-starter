"""User GraphQL resolvers."""

import strawberry
from src.app.graphql.errors import UserNotFoundError as GQLUserNotFoundError
from src.app.graphql.exception_mapper import map_service_exception_to_graphql
from src.app.graphql.subscriptions import (
    publish_user_created,
    publish_user_deleted,
    publish_user_updated,
)
from src.app.graphql.types import (
    CreateUserInput,
    Message,
    PaginatedUsers,
    PaginationMeta,
    UpdateUserInput,
    UserType,
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
    return UserType(
        id=user.id,
        email=user.email,
        name=user.name,
        is_active=user.is_active,
        created_at=user.created_at,
        updated_at=user.updated_at,
    )


@strawberry.type
class UserQuery:
    """User query resolvers."""

    @strawberry.field
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

    @strawberry.field
    async def user(self, info: Info, id: int) -> UserType | None:
        """Get a user by ID."""
        db = info.context["db"]
        service = UserService(db)

        try:
            user = await service.get_by_id(id)
            return convert_user_to_type(user)
        except UserNotFoundError:
            return None


@strawberry.type
class UserMutation:
    """User mutation resolvers."""

    @strawberry.mutation
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

    @strawberry.mutation
    async def update_user(
        self, info: Info, id: int, input: UpdateUserInput
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
            user = await service.update(id, update_data)
            # Publish user updated event
            await publish_user_updated(user.id, user.email)
            return convert_user_to_type(user)
        except UserNotFoundError:
            return None

    @strawberry.mutation
    async def delete_user(self, info: Info, id: int) -> Message:
        """Delete a user. Returns message if successful, raises error if not found."""
        db = info.context["db"]
        service = UserService(db)

        try:
            await service.delete(id)
            # Publish user deleted event
            await publish_user_deleted(id)
            return Message(message="User deleted successfully")
        except UserNotFoundError:
            raise GQLUserNotFoundError(id) from None
