"""Pydantic schemas."""

from src.app.schemas.auth import (
    LoginRequest,
    LogoutResponse,
    RefreshTokenRequest,
    Token,
    TokenPayload,
)
from src.app.schemas.errors import ErrorCode, ErrorDetail, ErrorResponse
from src.app.schemas.file import (
    BatchDeleteRequest,
    BatchDeleteResponse,
    BatchFileUploadResponse,
    BatchFileUploadResult,
    FileInfo,
    FileListResponse,
    FileRead,
    FileUpdate,
    FileUploadResponse,
    PresignedUrlResponse,
)
from src.app.schemas.pagination import PaginatedResponse, PaginationParams
from src.app.schemas.permission import (
    PermissionCreate,
    PermissionRead,
    PermissionUpdate,
)
from src.app.schemas.role import (
    AssignPermissionsRequest,
    AssignRolesRequest,
    RoleCreate,
    RoleRead,
    RoleReadWithPermissions,
    RoleUpdate,
)
from src.app.schemas.user import (
    MessageResponse,
    UserCreate,
    UserRead,
    UserReadWithRoles,
    UserRegister,
    UserUpdate,
)

__all__ = [
    "AssignPermissionsRequest",
    "AssignRolesRequest",
    "BatchDeleteRequest",
    "BatchDeleteResponse",
    "BatchFileUploadResponse",
    "BatchFileUploadResult",
    "ErrorCode",
    "ErrorDetail",
    "ErrorResponse",
    "FileInfo",
    "FileListResponse",
    "FileRead",
    "FileUpdate",
    "FileUploadResponse",
    "LoginRequest",
    "LogoutResponse",
    "MessageResponse",
    "PaginatedResponse",
    "PaginationParams",
    "PermissionCreate",
    "PermissionRead",
    "PermissionUpdate",
    "PresignedUrlResponse",
    "RefreshTokenRequest",
    "RoleCreate",
    "RoleRead",
    "RoleReadWithPermissions",
    "RoleUpdate",
    "Token",
    "TokenPayload",
    "UserCreate",
    "UserRead",
    "UserReadWithRoles",
    "UserRegister",
    "UserUpdate",
]
