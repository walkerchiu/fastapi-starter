"""User schemas."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserBase(BaseModel):
    """Base user schema."""

    email: EmailStr = Field(..., max_length=254, description="User email address")
    name: str = Field(
        ..., min_length=1, max_length=100, description="User display name"
    )


class UserCreate(UserBase):
    """Schema for creating a user."""

    pass


class UserRegister(UserBase):
    """Schema for user registration with password."""

    password: str = Field(
        ..., min_length=8, max_length=128, description="User password"
    )


class UserUpdate(BaseModel):
    """Schema for updating a user."""

    email: EmailStr | None = Field(
        default=None, max_length=254, description="User email address"
    )
    name: str | None = Field(
        default=None, min_length=1, max_length=100, description="User display name"
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
