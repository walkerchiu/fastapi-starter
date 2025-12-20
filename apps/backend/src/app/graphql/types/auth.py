"""GraphQL authentication types."""

from typing import TYPE_CHECKING, Annotated

import strawberry

if TYPE_CHECKING:
    from src.app.graphql.types.user import UserType


@strawberry.type
class TokenType:
    """Token response type."""

    access_token: str = strawberry.field(name="accessToken")
    refresh_token: str = strawberry.field(name="refreshToken")
    token_type: str = strawberry.field(name="tokenType", default="Bearer")
    expires_in: int = strawberry.field(name="expiresIn", default=3600)


@strawberry.type(name="AuthPayload")
class AuthPayloadType:
    """Authentication payload returned after registration."""

    access_token: str = strawberry.field(name="accessToken")
    refresh_token: str = strawberry.field(name="refreshToken")
    token_type: str = strawberry.field(name="tokenType", default="Bearer")
    user: (
        Annotated["UserType", strawberry.lazy("src.app.graphql.types.user")] | None
    ) = None


@strawberry.input
class RegisterInput:
    """Input for user registration."""

    email: str
    name: str
    password: str


@strawberry.input
class LoginInput:
    """Input for user login."""

    email: str
    password: str


@strawberry.input
class RefreshTokenInput:
    """Input for token refresh."""

    refresh_token: str = strawberry.field(name="refreshToken")


@strawberry.input
class RequestPasswordResetInput:
    """Input for requesting password reset."""

    email: str


@strawberry.input
class ResetPasswordInput:
    """Input for password reset."""

    token: str
    new_password: str = strawberry.field(name="newPassword")


@strawberry.type
class ForgotPasswordType:
    """Response type for forgot password."""

    message: str = "If the email exists, a password reset link has been sent"


@strawberry.type
class ResetPasswordType:
    """Response type for password reset."""

    message: str = "Password has been reset successfully"


@strawberry.input
class VerifyEmailInput:
    """Input for email verification."""

    token: str


@strawberry.input
class ResendVerificationInput:
    """Input for resending verification email."""

    email: str


@strawberry.type
class VerifyEmailType:
    """Response type for email verification."""

    message: str = "Email has been verified successfully"


@strawberry.type
class ResendVerificationType:
    """Response type for resending verification email."""

    message: str = (
        "If the email exists and is not verified, a verification link has been sent"
    )


@strawberry.input
class UpdateProfileInput:
    """Input for updating user profile."""

    name: str


@strawberry.input
class ChangePasswordInput:
    """Input for changing password."""

    current_password: str = strawberry.field(name="currentPassword")
    new_password: str = strawberry.field(name="newPassword")


@strawberry.type
class ChangePasswordType:
    """Response type for password change."""

    message: str = "Password changed successfully"


# 2FA Types


@strawberry.type(name="TwoFASetupResponse")
class Setup2FAType:
    """Response type for 2FA setup."""

    secret: str
    qr_code_url: str = strawberry.field(name="qrCodeUrl")
    qr_code_data_url: str | None = strawberry.field(name="qrCodeDataUrl", default=None)


@strawberry.input
class Enable2FAInput:
    """Input for enabling 2FA."""

    code: str


@strawberry.type(name="TwoFAEnableResponse")
class Enable2FAType:
    """Response type for enabling 2FA."""

    backup_codes: list[str] = strawberry.field(name="backupCodes")


@strawberry.input
class Disable2FAInput:
    """Input for disabling 2FA."""

    password: str


@strawberry.type
class Disable2FAType:
    """Response type for disabling 2FA."""

    message: str = "2FA disabled successfully"


@strawberry.input
class Verify2FAInput:
    """Input for 2FA verification."""

    user_id: strawberry.ID = strawberry.field(name="userId")
    code: str
    is_backup_code: bool = strawberry.field(name="isBackupCode", default=False)


@strawberry.input
class Verify2FACodeInput:
    """Input for verifying TOTP code for authenticated user."""

    code: str


@strawberry.input
class Verify2FABackupCodeInput:
    """Input for verifying backup code for authenticated user."""

    code: str


@strawberry.input
class RegenerateBackupCodesInput:
    """Input for regenerating 2FA backup codes."""

    password: str


@strawberry.type
class BackupCodesType:
    """Response type for backup codes."""

    backup_codes: list[str] = strawberry.field(name="backupCodes")


@strawberry.type(name="TwoFactorRequired")
class TwoFactorRequiredType:
    """Response type when 2FA is required during login."""

    requires_two_factor: bool = strawberry.field(name="requiresTwoFactor", default=True)
    user_id: strawberry.ID = strawberry.field(name="userId")


LoginResultType = Annotated[
    AuthPayloadType | TwoFactorRequiredType, strawberry.union("LoginResult")
]
