"""User schemas."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field
from src.app.core.validators import (
    EMAIL_MAX_LENGTH,
    NAME_MAX_LENGTH,
    NAME_MIN_LENGTH,
    PASSWORD_MAX_LENGTH,
    PASSWORD_MIN_LENGTH,
)


class UserBase(BaseModel):
    """Base user schema."""

    email: EmailStr = Field(
        ..., max_length=EMAIL_MAX_LENGTH, description="User email address"
    )
    name: str = Field(
        ...,
        min_length=NAME_MIN_LENGTH,
        max_length=NAME_MAX_LENGTH,
        description="User display name",
    )


class UserCreate(UserBase):
    """Schema for creating a user."""

    pass


class UserRegister(UserBase):
    """Schema for user registration with password."""

    password: str = Field(
        ...,
        min_length=PASSWORD_MIN_LENGTH,
        max_length=PASSWORD_MAX_LENGTH,
        description="User password",
    )


class UserUpdate(BaseModel):
    """Schema for updating a user."""

    email: EmailStr | None = Field(
        default=None, max_length=EMAIL_MAX_LENGTH, description="User email address"
    )
    name: str | None = Field(
        default=None,
        min_length=NAME_MIN_LENGTH,
        max_length=NAME_MAX_LENGTH,
        description="User display name",
    )
    is_active: bool | None = Field(default=None, description="Whether user is active")


class UserRead(UserBase):
    """Schema for reading a user."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime


class MessageResponse(BaseModel):
    """Generic message response schema."""

    message: str
