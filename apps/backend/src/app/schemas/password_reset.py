"""Password reset schemas."""

from pydantic import BaseModel, EmailStr, Field
from src.app.core.validators import (
    EMAIL_MAX_LENGTH,
    PASSWORD_MAX_LENGTH,
    PASSWORD_MIN_LENGTH,
)


class ForgotPasswordRequest(BaseModel):
    """Request schema for forgot password."""

    email: EmailStr = Field(
        ..., max_length=EMAIL_MAX_LENGTH, description="User email address"
    )


class ResetPasswordRequest(BaseModel):
    """Request schema for reset password."""

    token: str = Field(..., min_length=1, description="Password reset token")
    new_password: str = Field(
        ...,
        min_length=PASSWORD_MIN_LENGTH,
        max_length=PASSWORD_MAX_LENGTH,
        description="New password",
    )


class ForgotPasswordResponse(BaseModel):
    """Response schema for forgot password."""

    message: str = Field(
        default="If the email exists, a password reset link has been sent",
        description="Response message",
    )


class ResetPasswordResponse(BaseModel):
    """Response schema for reset password."""

    message: str = Field(
        default="Password has been reset successfully",
        description="Response message",
    )
