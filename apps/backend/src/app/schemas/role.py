"""Role schemas."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field
from src.app.schemas.permission import PermissionRead

CODE_MIN_LENGTH = 1
CODE_MAX_LENGTH = 50
NAME_MIN_LENGTH = 1
NAME_MAX_LENGTH = 100
DESCRIPTION_MAX_LENGTH = 500


class RoleBase(BaseModel):
    """Base role schema."""

    code: str = Field(
        ...,
        min_length=CODE_MIN_LENGTH,
        max_length=CODE_MAX_LENGTH,
        description="Role code (e.g., admin)",
    )
    name: str = Field(
        ...,
        min_length=NAME_MIN_LENGTH,
        max_length=NAME_MAX_LENGTH,
        description="Human-readable role name",
    )
    description: str | None = Field(
        default=None,
        max_length=DESCRIPTION_MAX_LENGTH,
        description="Role description",
    )


class RoleCreate(RoleBase):
    """Schema for creating a role."""

    is_system: bool = Field(
        default=False,
        description="Whether this is a system-protected role",
    )
    permission_ids: list[int] = Field(
        default_factory=list,
        description="List of permission IDs to assign to the role",
    )


class RoleUpdate(BaseModel):
    """Schema for updating a role."""

    code: str | None = Field(
        default=None,
        min_length=CODE_MIN_LENGTH,
        max_length=CODE_MAX_LENGTH,
        description="Role code (e.g., admin)",
    )
    name: str | None = Field(
        default=None,
        min_length=NAME_MIN_LENGTH,
        max_length=NAME_MAX_LENGTH,
        description="Human-readable role name",
    )
    description: str | None = Field(
        default=None,
        max_length=DESCRIPTION_MAX_LENGTH,
        description="Role description",
    )
    permission_ids: list[int] | None = Field(
        default=None,
        description="List of permission IDs to assign to the role",
    )


class RoleRead(RoleBase):
    """Schema for reading a role."""

    model_config = ConfigDict(
        from_attributes=True,
    )

    id: int
    is_system: bool
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None = None


class RoleReadWithPermissions(RoleRead):
    """Schema for reading a role with its permissions."""

    permissions: list[PermissionRead] = Field(default_factory=list)


class AssignRolesRequest(BaseModel):
    """Schema for bulk role assignment/removal."""

    role_ids: list[int] = Field(
        ...,
        min_length=1,
        description="List of role IDs to assign or remove",
    )


class AssignPermissionsRequest(BaseModel):
    """Schema for assigning permissions to a role."""

    permission_ids: list[int] = Field(
        ...,
        description="List of permission IDs to assign to the role",
    )
