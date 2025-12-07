"""Authentication schemas."""

from pydantic import BaseModel, EmailStr, Field


class Token(BaseModel):
    """Token response schema."""

    access_token: str
    refresh_token: str
    token_type: str = "Bearer"
    expires_in: int


class TokenPayload(BaseModel):
    """Token payload schema."""

    sub: str
    exp: int
    type: str


class LoginRequest(BaseModel):
    """Login request schema."""

    email: EmailStr = Field(..., max_length=254, description="User email address")
    password: str = Field(
        ..., min_length=1, max_length=128, description="User password"
    )


class RefreshTokenRequest(BaseModel):
    """Refresh token request schema."""

    refresh_token: str = Field(..., min_length=1, description="Refresh token")


class LogoutResponse(BaseModel):
    """Logout response schema."""

    message: str = Field(
        default="Logged out successfully",
        description="Response message",
    )
