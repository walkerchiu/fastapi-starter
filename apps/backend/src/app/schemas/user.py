"""User schemas."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr


class UserBase(BaseModel):
    """Base user schema."""

    email: EmailStr
    name: str


class UserCreate(UserBase):
    """Schema for creating a user."""

    pass


class UserUpdate(BaseModel):
    """Schema for updating a user."""

    email: EmailStr | None = None
    name: str | None = None
    is_active: bool | None = None


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
