"""2FA schemas."""

from uuid import UUID

from pydantic import BaseModel, Field
from src.app.core.validators import PASSWORD_MAX_LENGTH


class Setup2FAResponse(BaseModel):
    """Response schema for 2FA setup."""

    secret: str = Field(..., description="TOTP secret key (Base32 encoded)")
    qr_code_url: str = Field(..., description="OTPAuth URL for QR code generation")
    qr_code_data_url: str | None = Field(None, description="QR code as data URL")


class Enable2FARequest(BaseModel):
    """Request schema for enabling 2FA."""

    code: str = Field(
        ...,
        min_length=6,
        max_length=6,
        pattern=r"^\d{6}$",
        description="TOTP verification code",
    )


class Enable2FAResponse(BaseModel):
    """Response schema for enabling 2FA."""

    backup_codes: list[str] = Field(
        ..., description="One-time backup codes for account recovery"
    )


class BackupCodesResponse(BaseModel):
    """Response schema for backup codes."""

    backup_codes: list[str] = Field(
        ..., description="One-time backup codes for account recovery"
    )


class Verify2FARequest(BaseModel):
    """Request schema for 2FA verification during login."""

    user_id: UUID = Field(..., description="User ID from initial login")
    code: str = Field(
        ...,
        min_length=6,
        max_length=10,
        description="TOTP code or backup code",
    )
    is_backup_code: bool = Field(
        default=False, description="Whether the code is a backup code"
    )


class Disable2FARequest(BaseModel):
    """Request schema for disabling 2FA."""

    password: str = Field(
        ...,
        min_length=1,
        max_length=PASSWORD_MAX_LENGTH,
        description="Current password for verification",
    )


class Disable2FAResponse(BaseModel):
    """Response schema for disabling 2FA."""

    message: str = Field(
        default="2FA disabled successfully",
        description="Response message",
    )


class TwoFactorLoginResponse(BaseModel):
    """Response schema when 2FA is required during login."""

    requires_two_factor: bool = Field(
        default=True, description="Indicates 2FA is required"
    )
    user_id: UUID = Field(..., description="User ID for 2FA verification")


class RegenerateBackupCodesRequest(BaseModel):
    """Request schema for regenerating backup codes."""

    password: str = Field(
        ...,
        min_length=1,
        max_length=PASSWORD_MAX_LENGTH,
        description="Current password for verification",
    )
