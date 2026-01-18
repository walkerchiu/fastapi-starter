"""Authentication API endpoints."""

from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from src.app.core.deps import CurrentUser
from src.app.db import get_db
from src.app.models import User
from src.app.schemas import (
    BackupCodesResponse,
    ChangePasswordRequest,
    ChangePasswordResponse,
    Disable2FARequest,
    Disable2FAResponse,
    Enable2FARequest,
    Enable2FAResponse,
    ErrorResponse,
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    LoginRequest,
    LogoutResponse,
    RefreshTokenRequest,
    RegenerateBackupCodesRequest,
    ResendVerificationRequest,
    ResendVerificationResponse,
    ResetPasswordRequest,
    ResetPasswordResponse,
    Setup2FAResponse,
    Token,
    TwoFactorLoginResponse,
    UpdateProfileRequest,
    UserRead,
    UserRegister,
    Verify2FARequest,
    VerifyEmailRequest,
    VerifyEmailResponse,
)
from src.app.services import AuthService
from src.app.services.exceptions import TwoFactorRequiredError

router = APIRouter(prefix="/auth", tags=["auth"])


async def get_auth_service(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> AuthService:
    """Dependency to get auth service."""
    return AuthService(db)


@router.post(
    "/register",
    response_model=UserRead,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
    description="""
Register a new user account with email, name, and password.

**Password requirements:**
- Minimum 8 characters
- Maximum 128 characters

Returns the created user information (without password).
    """,
    responses={
        201: {
            "description": "User successfully registered",
            "content": {
                "application/json": {
                    "example": {
                        "id": 1,
                        "email": "user@example.com",
                        "name": "John Doe",
                        "is_active": True,
                        "created_at": "2024-01-01T00:00:00Z",
                        "updated_at": "2024-01-01T00:00:00Z",
                    }
                }
            },
        },
        400: {"model": ErrorResponse, "description": "Email already registered"},
        422: {"model": ErrorResponse, "description": "Validation error"},
        500: {"model": ErrorResponse, "description": "Database error"},
    },
)
async def register(
    user_in: UserRegister,
    service: Annotated[AuthService, Depends(get_auth_service)],
) -> User:
    """Register a new user."""
    return await service.register(user_in)


@router.post(
    "/login",
    response_model=Token | TwoFactorLoginResponse,
    summary="Login and get tokens",
    description="""
Authenticate with email and password to receive access and refresh tokens.

**Token types:**
- `access_token`: Short-lived token for API requests (default: 30 minutes)
- `refresh_token`: Long-lived token for obtaining new access tokens (default: 7 days)

Use the access token in the `Authorization: Bearer <token>` header.

**2FA:**
If 2FA is enabled, this endpoint returns a response indicating 2FA is required.
Use the `/auth/2fa/verify` endpoint with the provided `user_id` and TOTP code.
    """,
    responses={
        200: {
            "description": "Successfully authenticated or 2FA required",
            "content": {
                "application/json": {
                    "examples": {
                        "success": {
                            "summary": "Login successful",
                            "value": {
                                "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                                "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                                "tokenType": "Bearer",
                            },
                        },
                        "2fa_required": {
                            "summary": "2FA required",
                            "value": {
                                "requiresTwoFactor": True,
                                "userId": 1,
                            },
                        },
                    }
                }
            },
        },
        401: {"model": ErrorResponse, "description": "Invalid email or password"},
        403: {"model": ErrorResponse, "description": "User account is inactive"},
        422: {"model": ErrorResponse, "description": "Validation error"},
    },
)
async def login(
    credentials: LoginRequest,
    service: Annotated[AuthService, Depends(get_auth_service)],
) -> Token | TwoFactorLoginResponse:
    """Authenticate user and return tokens."""
    try:
        return await service.login(credentials.email, credentials.password)
    except TwoFactorRequiredError as e:
        return TwoFactorLoginResponse(user_id=e.user_id)


@router.post(
    "/refresh",
    response_model=Token,
    summary="Refresh access token",
    description="""
Get a new access token using a valid refresh token.

This endpoint should be called when the access token expires.
Both a new access token and refresh token will be returned.
    """,
    responses={
        200: {
            "description": "Tokens successfully refreshed",
            "content": {
                "application/json": {
                    "example": {
                        "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                        "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                        "tokenType": "Bearer",
                    }
                }
            },
        },
        401: {"model": ErrorResponse, "description": "Invalid or expired token"},
        403: {"model": ErrorResponse, "description": "User account is inactive"},
        422: {"model": ErrorResponse, "description": "Validation error"},
    },
)
async def refresh_token(
    request: RefreshTokenRequest,
    service: Annotated[AuthService, Depends(get_auth_service)],
) -> Token:
    """Refresh access token using refresh token."""
    return await service.refresh_token(request.refresh_token)


@router.get(
    "/me",
    response_model=UserRead,
    summary="Get current user",
    description="Get the currently authenticated user's information.",
    responses={
        200: {
            "description": "Current user information",
            "content": {
                "application/json": {
                    "example": {
                        "id": 1,
                        "email": "user@example.com",
                        "name": "John Doe",
                        "is_active": True,
                        "created_at": "2024-01-01T00:00:00Z",
                        "updated_at": "2024-01-01T00:00:00Z",
                    }
                }
            },
        },
        401: {"model": ErrorResponse, "description": "Not authenticated"},
        403: {"model": ErrorResponse, "description": "User account is inactive"},
    },
)
async def get_current_user_info(current_user: CurrentUser) -> User:
    """Get current authenticated user information."""
    return current_user


@router.post(
    "/logout",
    response_model=LogoutResponse,
    summary="Logout current user",
    description="""
Logout the currently authenticated user.

Since JWT is stateless, this endpoint primarily serves to:
1. Allow clients to clear locally stored tokens.
2. Optionally add the token to a blacklist (if implemented).

The client should clear all stored tokens after calling this endpoint.
    """,
    responses={
        200: {
            "description": "Successfully logged out",
            "content": {
                "application/json": {"example": {"message": "Logged out successfully"}}
            },
        },
        401: {"model": ErrorResponse, "description": "Not authenticated"},
    },
)
async def logout(current_user: CurrentUser) -> LogoutResponse:
    """Logout current user."""
    return LogoutResponse()


@router.post(
    "/forgot-password",
    response_model=ForgotPasswordResponse,
    summary="Request password reset",
    description="""
Request a password reset email.

**Security note:**
This endpoint always returns a success response regardless of whether
the email exists in the system. This prevents email enumeration attacks.

If the email is registered, a password reset link will be sent.
The link expires after 60 minutes (configurable).
    """,
    responses={
        200: {
            "description": "Password reset email sent (if email exists)",
            "content": {
                "application/json": {
                    "example": {
                        "message": "If the email exists, a password reset link has been sent"
                    }
                }
            },
        },
        422: {"model": ErrorResponse, "description": "Validation error"},
    },
)
async def forgot_password(
    request: ForgotPasswordRequest,
    service: Annotated[AuthService, Depends(get_auth_service)],
) -> ForgotPasswordResponse:
    """Request password reset email."""
    await service.forgot_password(request.email)
    return ForgotPasswordResponse()


@router.post(
    "/reset-password",
    response_model=ResetPasswordResponse,
    summary="Reset password",
    description="""
Reset password using a valid reset token.

The token is received via email after calling the forgot-password endpoint.

**Password requirements:**
- Minimum 8 characters
- Maximum 128 characters
    """,
    responses={
        200: {
            "description": "Password successfully reset",
            "content": {
                "application/json": {
                    "example": {"message": "Password has been reset successfully"}
                }
            },
        },
        400: {"model": ErrorResponse, "description": "Invalid or expired token"},
        422: {"model": ErrorResponse, "description": "Validation error"},
    },
)
async def reset_password(
    request: ResetPasswordRequest,
    service: Annotated[AuthService, Depends(get_auth_service)],
) -> ResetPasswordResponse:
    """Reset password using reset token."""
    await service.reset_password(request.token, request.new_password)
    return ResetPasswordResponse()


@router.post(
    "/verify-email",
    response_model=VerifyEmailResponse,
    summary="Verify email address",
    description="""
Verify a user's email address using the verification token.

The token is received via email after registration or by requesting
a new verification email.
    """,
    responses={
        200: {
            "description": "Email successfully verified",
            "content": {
                "application/json": {
                    "example": {"message": "Email has been verified successfully"}
                }
            },
        },
        400: {"model": ErrorResponse, "description": "Invalid or expired token"},
        422: {"model": ErrorResponse, "description": "Validation error"},
    },
)
async def verify_email(
    request: VerifyEmailRequest,
    service: Annotated[AuthService, Depends(get_auth_service)],
) -> VerifyEmailResponse:
    """Verify email address using verification token."""
    await service.verify_email(request.token)
    return VerifyEmailResponse()


@router.post(
    "/resend-verification",
    response_model=ResendVerificationResponse,
    summary="Resend verification email",
    description="""
Request a new email verification link.

**Security note:**
This endpoint always returns a success response regardless of whether
the email exists or is already verified. This prevents email enumeration.

If the email is registered and not verified, a new verification link will be sent.
The link expires after 24 hours (configurable).
    """,
    responses={
        200: {
            "description": "Verification email sent (if applicable)",
            "content": {
                "application/json": {
                    "example": {
                        "message": "If the email exists and is not verified, "
                        "a verification link has been sent"
                    }
                }
            },
        },
        422: {"model": ErrorResponse, "description": "Validation error"},
    },
)
async def resend_verification(
    request: ResendVerificationRequest,
    service: Annotated[AuthService, Depends(get_auth_service)],
) -> ResendVerificationResponse:
    """Resend email verification link."""
    await service.resend_verification_email(request.email)
    return ResendVerificationResponse()


@router.post(
    "/verify-email/send",
    response_model=ResendVerificationResponse,
    summary="Send verification email",
    description="""
Send a verification email to the currently authenticated user.

**Authentication required.**

If the user's email is already verified, this endpoint still returns success
but no email will be sent.
    """,
    responses={
        200: {
            "description": "Verification email sent (if not already verified)",
            "content": {
                "application/json": {
                    "example": {
                        "message": "If the email exists and is not verified, "
                        "a verification link has been sent"
                    }
                }
            },
        },
        401: {"model": ErrorResponse, "description": "Not authenticated"},
    },
)
async def send_verification_email(
    current_user: CurrentUser,
    service: Annotated[AuthService, Depends(get_auth_service)],
) -> ResendVerificationResponse:
    """Send verification email to authenticated user."""
    if not current_user.is_email_verified:
        await service.send_verification_email(current_user)
    return ResendVerificationResponse()


@router.patch(
    "/profile",
    response_model=UserRead,
    summary="Update profile",
    description="""
Update the current user's profile information.

Currently supports updating the display name.
    """,
    responses={
        200: {
            "description": "Profile successfully updated",
            "content": {
                "application/json": {
                    "example": {
                        "id": 1,
                        "email": "user@example.com",
                        "name": "New Name",
                        "is_active": True,
                        "is_email_verified": True,
                        "created_at": "2024-01-01T00:00:00Z",
                        "updated_at": "2024-01-01T00:00:00Z",
                    }
                }
            },
        },
        401: {"model": ErrorResponse, "description": "Not authenticated"},
        422: {"model": ErrorResponse, "description": "Validation error"},
    },
)
async def update_profile(
    request: UpdateProfileRequest,
    current_user: CurrentUser,
    service: Annotated[AuthService, Depends(get_auth_service)],
) -> User:
    """Update current user's profile."""
    return await service.update_profile(current_user, request.name)


@router.post(
    "/change-password",
    response_model=ChangePasswordResponse,
    summary="Change password",
    description="""
Change the current user's password.

Requires the current password for verification.

**Password requirements:**
- Minimum 8 characters
- Maximum 128 characters
- Must be different from current password
    """,
    responses={
        200: {
            "description": "Password successfully changed",
            "content": {
                "application/json": {
                    "example": {"message": "Password changed successfully"}
                }
            },
        },
        400: {"model": ErrorResponse, "description": "Same password or invalid"},
        401: {"model": ErrorResponse, "description": "Current password incorrect"},
        422: {"model": ErrorResponse, "description": "Validation error"},
    },
)
async def change_password(
    request: ChangePasswordRequest,
    current_user: CurrentUser,
    service: Annotated[AuthService, Depends(get_auth_service)],
) -> ChangePasswordResponse:
    """Change current user's password."""
    await service.change_password(
        current_user, request.current_password, request.new_password
    )
    return ChangePasswordResponse()


# 2FA Endpoints


@router.post(
    "/2fa/setup",
    response_model=Setup2FAResponse,
    summary="Setup 2FA",
    description="""
Initialize 2FA setup.

Returns a TOTP secret and QR code for authenticator apps.
Scan the QR code with Google Authenticator, Authy, or similar apps.

**Note:** 2FA is not enabled until you call `/auth/2fa/enable` with a valid code.
    """,
    responses={
        200: {
            "description": "2FA setup initiated",
            "content": {
                "application/json": {
                    "example": {
                        "secret": "JBSWY3DPEHPK3PXP",
                        "qrCodeUrl": "otpauth://totp/App:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=App",
                        "qrCodeDataUrl": "data:image/png;base64,...",
                    }
                }
            },
        },
        400: {"model": ErrorResponse, "description": "2FA already enabled"},
        401: {"model": ErrorResponse, "description": "Not authenticated"},
    },
)
async def setup_2fa(
    current_user: CurrentUser,
    service: Annotated[AuthService, Depends(get_auth_service)],
) -> Setup2FAResponse:
    """Initialize 2FA setup."""
    result = await service.setup_2fa(current_user)
    return Setup2FAResponse(
        secret=result["secret"],
        qr_code_url=result["qr_code_url"],
        qr_code_data_url=result["qr_code_data_url"],
    )


@router.post(
    "/2fa/enable",
    response_model=Enable2FAResponse,
    summary="Enable 2FA",
    description="""
Enable 2FA by verifying a TOTP code.

After calling `/auth/2fa/setup`, enter the 6-digit code from your authenticator app.
Upon success, backup codes will be returned. Store these securely.

**Backup codes:**
- One-time use codes for account recovery
- Store them in a safe place
- Each code can only be used once
    """,
    responses={
        200: {
            "description": "2FA enabled successfully",
            "content": {
                "application/json": {
                    "example": {
                        "message": "2FA enabled successfully",
                        "backup_codes": [
                            "A1B2C3D4",
                            "E5F6G7H8",
                            "I9J0K1L2",
                        ],
                    }
                }
            },
        },
        400: {
            "model": ErrorResponse,
            "description": "Invalid code or 2FA not set up",
        },
        401: {"model": ErrorResponse, "description": "Not authenticated"},
    },
)
async def enable_2fa(
    request: Enable2FARequest,
    current_user: CurrentUser,
    service: Annotated[AuthService, Depends(get_auth_service)],
) -> Enable2FAResponse:
    """Enable 2FA with verification code."""
    backup_codes = await service.enable_2fa(current_user, request.code)
    return Enable2FAResponse(backup_codes=backup_codes)


@router.post(
    "/2fa/disable",
    response_model=Disable2FAResponse,
    summary="Disable 2FA",
    description="""
Disable 2FA.

Requires password verification for security.
    """,
    responses={
        200: {
            "description": "2FA disabled successfully",
            "content": {
                "application/json": {
                    "example": {"message": "2FA disabled successfully"}
                }
            },
        },
        400: {"model": ErrorResponse, "description": "2FA not enabled"},
        401: {"model": ErrorResponse, "description": "Invalid password"},
    },
)
async def disable_2fa(
    request: Disable2FARequest,
    current_user: CurrentUser,
    service: Annotated[AuthService, Depends(get_auth_service)],
) -> Disable2FAResponse:
    """Disable 2FA."""
    await service.disable_2fa(current_user, request.password)
    return Disable2FAResponse()


@router.post(
    "/2fa/verify",
    response_model=Token,
    summary="Verify 2FA",
    description="""
Verify 2FA code during login.

Use this endpoint after receiving a 2FA required response from `/auth/login`.
Provide either a TOTP code from your authenticator app or a backup code.

**Code types:**
- TOTP code: 6-digit code from authenticator app
- Backup code: 8-character one-time code (set `is_backup_code` to true)
    """,
    responses={
        200: {
            "description": "2FA verified successfully",
            "content": {
                "application/json": {
                    "example": {
                        "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                        "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                        "tokenType": "Bearer",
                    }
                }
            },
        },
        400: {"model": ErrorResponse, "description": "Invalid code"},
        401: {"model": ErrorResponse, "description": "User not found or inactive"},
    },
)
async def verify_2fa(
    request: Verify2FARequest,
    service: Annotated[AuthService, Depends(get_auth_service)],
) -> Token:
    """Verify 2FA code and get tokens."""
    return await service.verify_2fa(
        request.user_id, request.code, request.is_backup_code
    )


@router.post(
    "/2fa/backup-codes",
    response_model=BackupCodesResponse,
    summary="Regenerate backup codes",
    description="""
Regenerate backup codes for 2FA.

This will invalidate all existing backup codes.
Store the new codes securely.
    """,
    responses={
        200: {
            "description": "Backup codes regenerated",
            "content": {
                "application/json": {
                    "example": {
                        "backup_codes": [
                            "A1B2C3D4",
                            "E5F6G7H8",
                            "I9J0K1L2",
                        ]
                    }
                }
            },
        },
        400: {"model": ErrorResponse, "description": "2FA not enabled"},
        401: {"model": ErrorResponse, "description": "Not authenticated"},
    },
)
async def regenerate_backup_codes(
    request: RegenerateBackupCodesRequest,
    current_user: CurrentUser,
    service: Annotated[AuthService, Depends(get_auth_service)],
) -> BackupCodesResponse:
    """Regenerate 2FA backup codes."""
    backup_codes = await service.regenerate_backup_codes(current_user, request.password)
    return BackupCodesResponse(backup_codes=backup_codes)
