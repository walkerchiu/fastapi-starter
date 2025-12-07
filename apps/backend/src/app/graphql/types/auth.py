"""GraphQL authentication types."""

import strawberry


@strawberry.type
class TokenType:
    """Token response type."""

    access_token: str = strawberry.field(name="accessToken")
    refresh_token: str = strawberry.field(name="refreshToken")
    token_type: str = strawberry.field(name="tokenType", default="bearer")


@strawberry.input
class RegisterInput:
    """Input for user registration."""

    email: str
    name: str
    password: str


@strawberry.input
class LoginInput:
    """Input for user login."""

    email: str
    password: str


@strawberry.input
class RefreshTokenInput:
    """Input for token refresh."""

    refresh_token: str = strawberry.field(name="refreshToken")
