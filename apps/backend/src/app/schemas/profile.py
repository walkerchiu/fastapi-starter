"""Profile management schemas."""

from pydantic import BaseModel, Field
from src.app.core.validators import (
    NAME_MAX_LENGTH,
    NAME_MIN_LENGTH,
    PASSWORD_MAX_LENGTH,
    PASSWORD_MIN_LENGTH,
)


class UpdateProfileRequest(BaseModel):
    """Request schema for updating user profile."""

    name: str = Field(
        ...,
        min_length=NAME_MIN_LENGTH,
        max_length=NAME_MAX_LENGTH,
        description="User display name",
    )


class UpdateProfileResponse(BaseModel):
    """Response schema for profile update."""

    message: str = Field(
        default="Profile updated successfully",
        description="Response message",
    )


class ChangePasswordRequest(BaseModel):
    """Request schema for changing password."""

    current_password: str = Field(
        ...,
        min_length=1,
        max_length=PASSWORD_MAX_LENGTH,
        description="Current password",
    )
    new_password: str = Field(
        ...,
        min_length=PASSWORD_MIN_LENGTH,
        max_length=PASSWORD_MAX_LENGTH,
        description="New password",
    )


class ChangePasswordResponse(BaseModel):
    """Response schema for password change."""

    message: str = Field(
        default="Password changed successfully",
        description="Response message",
    )
