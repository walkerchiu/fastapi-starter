from src.app.services.auth_service import AuthService
from src.app.services.email_service import EmailService, email_service
from src.app.services.exceptions import (
    EmailAlreadyExistsError,
    EmailAlreadyVerifiedError,
    EmailConnectionError,
    EmailError,
    EmailSendError,
    ExpiredResetTokenError,
    ExpiredVerificationTokenError,
    FileNotFoundError,
    FileTooLargeError,
    InactiveUserError,
    Invalid2FACodeError,
    InvalidCredentialsError,
    InvalidFileTypeError,
    InvalidResetTokenError,
    InvalidTokenError,
    InvalidTokenTypeError,
    InvalidVerificationTokenError,
    PermissionCodeAlreadyExistsError,
    PermissionNotFoundError,
    ResetTokenAlreadyUsedError,
    RoleCodeAlreadyExistsError,
    RoleNotFoundError,
    SamePasswordError,
    ServiceError,
    StorageConnectionError,
    StorageError,
    SystemRoleModificationError,
    TwoFactorAlreadyEnabledError,
    TwoFactorNotEnabledError,
    TwoFactorNotSetupError,
    TwoFactorRequiredError,
    UserNotFoundError,
)
from src.app.services.file_service import FileService
from src.app.services.permission_service import PermissionService
from src.app.services.role_service import RoleService
from src.app.services.storage_service import StorageService, storage_service
from src.app.services.user_service import UserService

__all__ = [
    # Services
    "AuthService",
    "EmailService",
    "FileService",
    "PermissionService",
    "RoleService",
    "StorageService",
    "UserService",
    # Service instances
    "email_service",
    "storage_service",
    # Exceptions
    "ServiceError",
    "UserNotFoundError",
    "EmailAlreadyExistsError",
    "InvalidCredentialsError",
    "InactiveUserError",
    "InvalidTokenError",
    "InvalidTokenTypeError",
    # Permission exceptions
    "PermissionNotFoundError",
    "PermissionCodeAlreadyExistsError",
    # Role exceptions
    "RoleNotFoundError",
    "RoleCodeAlreadyExistsError",
    "SystemRoleModificationError",
    # Storage exceptions
    "StorageError",
    "FileNotFoundError",
    "FileTooLargeError",
    "InvalidFileTypeError",
    "StorageConnectionError",
    # Email exceptions
    "EmailError",
    "EmailSendError",
    "EmailConnectionError",
    # Password reset exceptions
    "InvalidResetTokenError",
    "ExpiredResetTokenError",
    "ResetTokenAlreadyUsedError",
    # Email verification exceptions
    "InvalidVerificationTokenError",
    "ExpiredVerificationTokenError",
    "EmailAlreadyVerifiedError",
    # Profile exceptions
    "SamePasswordError",
    # 2FA exceptions
    "TwoFactorAlreadyEnabledError",
    "TwoFactorNotEnabledError",
    "TwoFactorNotSetupError",
    "Invalid2FACodeError",
    "TwoFactorRequiredError",
]
