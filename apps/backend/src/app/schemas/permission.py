"""Permission schemas."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

CODE_MIN_LENGTH = 1
CODE_MAX_LENGTH = 100
NAME_MIN_LENGTH = 1
NAME_MAX_LENGTH = 100
DESCRIPTION_MAX_LENGTH = 500


class PermissionBase(BaseModel):
    """Base permission schema."""

    code: str = Field(
        ...,
        min_length=CODE_MIN_LENGTH,
        max_length=CODE_MAX_LENGTH,
        description="Permission code (e.g., users:read)",
    )
    name: str = Field(
        ...,
        min_length=NAME_MIN_LENGTH,
        max_length=NAME_MAX_LENGTH,
        description="Human-readable permission name",
    )
    description: str | None = Field(
        default=None,
        max_length=DESCRIPTION_MAX_LENGTH,
        description="Permission description",
    )


class PermissionCreate(PermissionBase):
    """Schema for creating a permission."""

    pass


class PermissionUpdate(BaseModel):
    """Schema for updating a permission."""

    code: str | None = Field(
        default=None,
        min_length=CODE_MIN_LENGTH,
        max_length=CODE_MAX_LENGTH,
        description="Permission code (e.g., users:read)",
    )
    name: str | None = Field(
        default=None,
        min_length=NAME_MIN_LENGTH,
        max_length=NAME_MAX_LENGTH,
        description="Human-readable permission name",
    )
    description: str | None = Field(
        default=None,
        max_length=DESCRIPTION_MAX_LENGTH,
        description="Permission description",
    )


class PermissionRead(PermissionBase):
    """Schema for reading a permission."""

    model_config = ConfigDict(
        from_attributes=True,
    )

    id: int
    resource: str = Field(..., description="Resource name (e.g., users, roles)")
    action: str = Field(
        ..., description="Action type (e.g., read, create, update, delete)"
    )
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None = None
