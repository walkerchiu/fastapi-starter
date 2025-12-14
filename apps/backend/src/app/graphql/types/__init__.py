"""GraphQL types."""

from src.app.graphql.types.auth import (
    LoginInput,
    RefreshTokenInput,
    RegisterInput,
    TokenType,
)
from src.app.graphql.types.file import (
    BatchDeleteFilesInput,
    BatchDeleteFilesResponse,
    BatchFileUploadResponseType,
    BatchFileUploadResultType,
    FileType,
    FileUploadType,
    PaginatedFiles,
    PresignedUrlType,
    UpdateFileInput,
)
from src.app.graphql.types.health import (
    ComponentHealthEntry,
    ComponentHealthType,
    HealthStatus,
    HealthType,
    LivenessType,
    ReadinessType,
)
from src.app.graphql.types.inputs import (
    AssignPermissionsInput,
    AssignRolesInput,
    CreatePermissionInput,
    CreateRoleInput,
    CreateUserInput,
    UpdatePermissionInput,
    UpdateRoleInput,
    UpdateUserInput,
)
from src.app.graphql.types.pagination import (
    PaginatedPermissions,
    PaginatedRoles,
    PaginatedUsers,
    PaginationMeta,
)
from src.app.graphql.types.permission import PermissionType
from src.app.graphql.types.role import RoleType
from src.app.graphql.types.user import Message, UserType, UserTypeWithRoles

__all__ = [
    "AssignPermissionsInput",
    "AssignRolesInput",
    "BatchDeleteFilesInput",
    "BatchDeleteFilesResponse",
    "BatchFileUploadResponseType",
    "BatchFileUploadResultType",
    "ComponentHealthEntry",
    "ComponentHealthType",
    "CreatePermissionInput",
    "CreateRoleInput",
    "CreateUserInput",
    "FileType",
    "FileUploadType",
    "HealthStatus",
    "HealthType",
    "LivenessType",
    "LoginInput",
    "Message",
    "PaginatedFiles",
    "PaginatedPermissions",
    "PaginatedRoles",
    "PaginatedUsers",
    "PaginationMeta",
    "PermissionType",
    "PresignedUrlType",
    "ReadinessType",
    "RefreshTokenInput",
    "RegisterInput",
    "RoleType",
    "TokenType",
    "UpdateFileInput",
    "UpdatePermissionInput",
    "UpdateRoleInput",
    "UpdateUserInput",
    "UserType",
    "UserTypeWithRoles",
]
