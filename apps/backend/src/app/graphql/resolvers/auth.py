"""Authentication GraphQL resolvers."""

import strawberry
from src.app.graphql.resolvers.users import convert_user_to_type
from src.app.graphql.types import (
    LoginInput,
    Message,
    RefreshTokenInput,
    RegisterInput,
    TokenType,
    UserType,
)
from src.app.schemas import UserRegister
from src.app.services import AuthService
from src.app.services.auth_service import (
    EmailAlreadyExistsError,
    InactiveUserError,
    InvalidCredentialsError,
    InvalidTokenError,
    InvalidTokenTypeError,
    UserNotFoundError,
)
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
        db = info.context["db"]
        service = AuthService(db)

        user_data = UserRegister(
            email=input.email,
            name=input.name,
            password=input.password,
        )
        try:
            user = await service.register(user_data)
            return convert_user_to_type(user)
        except EmailAlreadyExistsError as e:
            raise Exception(str(e)) from None

    @strawberry.mutation
    async def login(self, info: Info, input: LoginInput) -> TokenType:
        """Login and get tokens."""
        db = info.context["db"]
        service = AuthService(db)

        try:
            token = await service.login(input.email, input.password)
            return TokenType(
                access_token=token.access_token,
                refresh_token=token.refresh_token,
                token_type=token.token_type,
            )
        except InvalidCredentialsError:
            raise Exception("Invalid email or password") from None
        except InactiveUserError:
            raise Exception("User account is inactive") from None

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
        except InvalidTokenTypeError:
            raise Exception("Invalid token type") from None
        except (InvalidTokenError, UserNotFoundError):
            raise Exception("Invalid or expired token") from None
        except InactiveUserError:
            raise Exception("User account is inactive") from None

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
            raise Exception("Authentication required")
        return Message(message="Logged out successfully")
