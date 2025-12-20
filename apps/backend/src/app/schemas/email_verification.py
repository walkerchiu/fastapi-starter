"""Email verification schemas."""

from pydantic import BaseModel, EmailStr, Field
from src.app.core.validators import EMAIL_MAX_LENGTH


class VerifyEmailRequest(BaseModel):
    """Request schema for email verification."""

    token: str = Field(..., min_length=1, description="Email verification token")


class ResendVerificationRequest(BaseModel):
    """Request schema for resending verification email."""

    email: EmailStr = Field(
        ..., max_length=EMAIL_MAX_LENGTH, description="User email address"
    )


class VerifyEmailResponse(BaseModel):
    """Response schema for email verification."""

    message: str = Field(
        default="Email has been verified successfully",
        description="Response message",
    )


class ResendVerificationResponse(BaseModel):
    """Response schema for resending verification email."""

    message: str = Field(
        default="If the email exists and is not verified, a verification link has been sent",
        description="Response message",
    )
