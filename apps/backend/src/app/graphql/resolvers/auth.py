"""Authentication GraphQL resolvers."""

import strawberry
from src.app.graphql.exception_mapper import map_service_exception_to_graphql
from src.app.graphql.resolvers.users import convert_user_to_type
from src.app.graphql.subscriptions import publish_user_created, publish_user_logged_out
from src.app.graphql.types import (
    LoginInput,
    Message,
    RefreshTokenInput,
    RegisterInput,
    TokenType,
    UserType,
)
from src.app.graphql.validators import validate_email, validate_name, validate_password
from src.app.schemas import UserRegister
from src.app.services import AuthService
from src.app.services.exceptions import ServiceError
from strawberry.types import Info


@strawberry.type
class AuthQuery:
    """Authentication query resolvers."""

    @strawberry.field
    async def me(self, info: Info) -> UserType | None:
        """Get current authenticated user."""
        user = info.context.get("user")
        if not user:
            return None
        return convert_user_to_type(user)


@strawberry.type
class AuthMutation:
    """Authentication mutation resolvers."""

    @strawberry.mutation
    async def register(self, info: Info, input: RegisterInput) -> UserType:
        """Register a new user."""
        # Validate inputs
        email = validate_email(input.email)
        name = validate_name(input.name)
        password = validate_password(input.password)

        db = info.context["db"]
        service = AuthService(db)

        user_data = UserRegister(
            email=email,
            name=name,
            password=password,
        )
        try:
            user = await service.register(user_data)
            # Publish user created event
            await publish_user_created(user.id, user.email)
            return convert_user_to_type(user)
        except ServiceError as e:
            raise map_service_exception_to_graphql(e) from None

    @strawberry.mutation
    async def login(self, info: Info, input: LoginInput) -> TokenType:
        """Login and get tokens."""
        # Validate email format (don't validate password on login)
        email = validate_email(input.email)

        db = info.context["db"]
        service = AuthService(db)

        try:
            token = await service.login(email, input.password)
            return TokenType(
                access_token=token.access_token,
                refresh_token=token.refresh_token,
                token_type=token.token_type,
            )
        except ServiceError as e:
            raise map_service_exception_to_graphql(e) from None

    @strawberry.mutation
    async def refresh_token(self, info: Info, input: RefreshTokenInput) -> TokenType:
        """Refresh access token."""
        db = info.context["db"]
        service = AuthService(db)

        try:
            token = await service.refresh_token(input.refresh_token)
            return TokenType(
                access_token=token.access_token,
                refresh_token=token.refresh_token,
                token_type=token.token_type,
            )
        except ServiceError as e:
            raise map_service_exception_to_graphql(e) from None

    @strawberry.mutation
    async def logout(self, info: Info) -> Message:
        """Logout current user.

        Since JWT is stateless, this endpoint primarily serves to:
        1. Allow clients to clear locally stored tokens.
        2. Optionally add the token to a blacklist (if implemented).

        The client should clear all stored tokens after calling this mutation.
        """
        user = info.context.get("user")
        if not user:
            raise map_service_exception_to_graphql(
                ServiceError("Authentication required")
            )
        await publish_user_logged_out(user.id, user.email)
        return Message(message="Logged out successfully")
