"""Authentication service layer for business logic."""

import base64
import hashlib
import io
import json
import secrets
from datetime import UTC, datetime, timedelta
from uuid import UUID

import pyotp
import qrcode
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from src.app.core import (
    create_access_token,
    create_refresh_token,
    decode_token,
    get_password_hash,
    verify_password,
)
from src.app.core.config import settings
from src.app.models import PasswordResetToken, User
from src.app.schemas import Token, UserRegister
from src.app.services.email_service import email_service
from src.app.services.exceptions import (
    EmailAlreadyExistsError,
    EmailAlreadyVerifiedError,
    ExpiredResetTokenError,
    ExpiredVerificationTokenError,
    InactiveUserError,
    Invalid2FACodeError,
    InvalidCredentialsError,
    InvalidResetTokenError,
    InvalidTokenError,
    InvalidTokenTypeError,
    InvalidVerificationTokenError,
    ResetTokenAlreadyUsedError,
    SamePasswordError,
    TwoFactorAlreadyEnabledError,
    TwoFactorNotEnabledError,
    TwoFactorNotSetupError,
    TwoFactorRequiredError,
    UserNotFoundError,
)


class AuthService:
    """Service class for authentication operations."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_user_by_email(self, email: str) -> User | None:
        """Get a user by email."""
        result = await self.db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    async def get_user_by_id(self, user_id: UUID) -> User | None:
        """Get a user by ID."""
        result = await self.db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    async def register(self, user_in: UserRegister) -> User:
        """Register a new user."""
        # Check if email already exists
        existing = await self.get_user_by_email(user_in.email)
        if existing:
            raise EmailAlreadyExistsError(f"Email {user_in.email} already registered")

        # Create user with hashed password
        user = User(
            email=user_in.email,
            name=user_in.name,
            hashed_password=get_password_hash(user_in.password),
        )
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def login(
        self, email: str, password: str, skip_2fa_check: bool = False
    ) -> Token:
        """
        Authenticate user and return tokens.

        Args:
            email: User email
            password: User password
            skip_2fa_check: Skip 2FA check (used after 2FA verification)

        Returns:
            Token object with access and refresh tokens

        Raises:
            InvalidCredentialsError: If credentials are invalid
            InactiveUserError: If user account is inactive
            TwoFactorRequiredError: If 2FA is enabled and not verified
        """
        user = await self.get_user_by_email(email)

        if not user or not user.hashed_password:
            raise InvalidCredentialsError("Invalid email or password")

        if not verify_password(password, user.hashed_password):
            raise InvalidCredentialsError("Invalid email or password")

        if not user.is_active:
            raise InactiveUserError("User account is disabled.")

        # Check if 2FA is enabled
        if user.is_two_factor_enabled and not skip_2fa_check:
            raise TwoFactorRequiredError("2FA required", user_id=user.id)

        return Token(
            access_token=create_access_token(subject=user.id),
            refresh_token=create_refresh_token(subject=user.id),
            expires_in=settings.jwt_access_token_expire_minutes * 60,
        )

    async def refresh_token(self, refresh_token: str) -> Token:
        """Refresh access token using refresh token."""
        payload = decode_token(refresh_token)

        if not payload:
            raise InvalidTokenError("Token is invalid or expired.")

        if payload.get("type") != "refresh":
            raise InvalidTokenTypeError("Invalid token type")

        user_id = payload.get("sub")
        user = await self.get_user_by_id(UUID(user_id))

        if not user:
            raise UserNotFoundError("User not found")

        if not user.is_active:
            raise InactiveUserError("User account is disabled.")

        return Token(
            access_token=create_access_token(subject=user.id),
            refresh_token=create_refresh_token(subject=user.id),
            expires_in=settings.jwt_access_token_expire_minutes * 60,
        )

    @staticmethod
    def _hash_token(token: str) -> str:
        """Hash a token using SHA-256."""
        return hashlib.sha256(token.encode()).hexdigest()

    async def forgot_password(self, email: str) -> None:
        """
        Initiate password reset process.

        This method always returns successfully to prevent email enumeration.
        If the email exists, a reset email is sent.
        """
        user = await self.get_user_by_email(email)

        if not user or not user.is_active:
            # Return silently to prevent email enumeration
            return

        # Generate a secure random token
        token = secrets.token_urlsafe(32)
        token_hash = self._hash_token(token)

        # Calculate expiration time
        expires_at = datetime.now(UTC) + timedelta(
            minutes=settings.password_reset_expire_minutes
        )

        # Create password reset token record
        reset_token = PasswordResetToken(
            token_hash=token_hash,
            user_id=user.id,
            expires_at=expires_at,
        )
        self.db.add(reset_token)
        await self.db.commit()

        # Send password reset email
        await email_service.send_password_reset_email(
            to_email=user.email,
            reset_token=token,
            user_name=user.name,
        )

    async def reset_password(self, token: str, new_password: str) -> None:
        """
        Reset user password using a valid reset token.

        Args:
            token: The password reset token
            new_password: The new password to set
        """
        token_hash = self._hash_token(token)

        # Find the token in database
        result = await self.db.execute(
            select(PasswordResetToken).where(
                PasswordResetToken.token_hash == token_hash
            )
        )
        reset_token = result.scalar_one_or_none()

        if not reset_token:
            raise InvalidResetTokenError("Invalid password reset token")

        if reset_token.used:
            raise ResetTokenAlreadyUsedError(
                "Password reset token has already been used"
            )

        if reset_token.expires_at < datetime.now(UTC):
            raise ExpiredResetTokenError("Password reset token has expired")

        # Get the user
        user = await self.get_user_by_id(reset_token.user_id)
        if not user:
            raise UserNotFoundError("User not found")

        # Update password
        user.hashed_password = get_password_hash(new_password)

        # Mark token as used
        reset_token.used = True

        await self.db.commit()

    async def cleanup_expired_tokens(self) -> int:
        """
        Remove expired password reset tokens.

        Returns:
            Number of tokens deleted
        """
        result = await self.db.execute(
            delete(PasswordResetToken).where(
                PasswordResetToken.expires_at < datetime.now(UTC)
            )
        )
        await self.db.commit()
        return result.rowcount or 0

    async def send_verification_email(self, user: User) -> None:
        """
        Send email verification to user.

        Args:
            user: The user to send verification email to
        """
        if user.is_email_verified:
            return

        # Generate a secure random token and hash it
        token = secrets.token_urlsafe(32)
        token_hash = self._hash_token(token)

        # Calculate expiration time
        expires_at = datetime.now(UTC) + timedelta(
            hours=settings.email_verification_expire_hours
        )

        # Store the hashed token
        user.email_verification_token = token_hash
        user.email_verification_expires_at = expires_at
        await self.db.commit()

        # Send verification email with the original token
        await email_service.send_email_verification(
            to_email=user.email,
            verification_token=token,
            user_name=user.name,
        )

    async def verify_email(self, token: str) -> None:
        """
        Verify user email using the verification token.

        Args:
            token: The email verification token
        """
        token_hash = self._hash_token(token)

        # Find user with this verification token
        result = await self.db.execute(
            select(User).where(User.email_verification_token == token_hash)
        )
        user = result.scalar_one_or_none()

        if not user:
            raise InvalidVerificationTokenError("Invalid email verification token")

        if user.is_email_verified:
            raise EmailAlreadyVerifiedError("Email is already verified")

        if (
            user.email_verification_expires_at
            and user.email_verification_expires_at < datetime.now(UTC)
        ):
            raise ExpiredVerificationTokenError("Email verification token has expired")

        # Mark email as verified
        user.is_email_verified = True
        user.email_verification_token = None
        user.email_verification_expires_at = None
        await self.db.commit()

    async def resend_verification_email(self, email: str) -> None:
        """
        Resend email verification.

        This method always returns successfully to prevent email enumeration.

        Args:
            email: The email address to resend verification to
        """
        user = await self.get_user_by_email(email)

        if not user or not user.is_active:
            # Return silently to prevent email enumeration
            return

        if user.is_email_verified:
            # Already verified, return silently
            return

        # Send new verification email
        await self.send_verification_email(user)

    async def update_profile(self, user: User, name: str) -> User:
        """
        Update user profile.

        Args:
            user: The user to update
            name: The new display name

        Returns:
            Updated user
        """
        user.name = name
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def change_password(
        self, user: User, current_password: str, new_password: str
    ) -> None:
        """
        Change user password.

        Args:
            user: The user changing password
            current_password: The current password for verification
            new_password: The new password to set
        """
        # Verify current password
        if not user.hashed_password or not verify_password(
            current_password, user.hashed_password
        ):
            raise InvalidCredentialsError("Current password is incorrect")

        # Ensure new password is different
        if verify_password(new_password, user.hashed_password):
            raise SamePasswordError("New password must be different from current")

        # Update password
        user.hashed_password = get_password_hash(new_password)
        await self.db.commit()

    # 2FA Methods

    def _generate_backup_codes(self, count: int | None = None) -> list[str]:
        """
        Generate random backup codes.

        Args:
            count: Number of codes to generate

        Returns:
            List of backup codes
        """
        if count is None:
            count = settings.two_factor_backup_codes_count
        return [secrets.token_hex(4).upper() for _ in range(count)]

    def _hash_backup_codes(self, codes: list[str]) -> str:
        """
        Hash backup codes for storage.

        Args:
            codes: List of plaintext backup codes

        Returns:
            JSON string of hashed codes
        """
        hashed = [self._hash_token(code.upper()) for code in codes]
        return json.dumps(hashed)

    def _verify_backup_code(self, user: User, code: str) -> bool:
        """
        Verify and consume a backup code.

        Args:
            user: The user
            code: The backup code to verify

        Returns:
            True if valid, False otherwise
        """
        if not user.two_factor_backup_codes:
            return False

        code_hash = self._hash_token(code.upper())
        hashed_codes = json.loads(user.two_factor_backup_codes)

        if code_hash in hashed_codes:
            # Remove used code
            hashed_codes.remove(code_hash)
            user.two_factor_backup_codes = json.dumps(hashed_codes)
            return True

        return False

    async def setup_2fa(self, user: User) -> dict[str, str]:
        """
        Set up 2FA for a user.

        Args:
            user: The user to set up 2FA for

        Returns:
            Dict with secret, qr_code_url, and qr_code_data_url
        """
        if user.is_two_factor_enabled:
            raise TwoFactorAlreadyEnabledError("2FA is already enabled")

        # Generate TOTP secret
        secret = pyotp.random_base32()

        # Store secret temporarily (not yet enabled)
        user.two_factor_secret = secret
        await self.db.commit()

        # Generate provisioning URI
        totp = pyotp.TOTP(secret)
        provisioning_uri = totp.provisioning_uri(
            name=user.email, issuer_name=settings.two_factor_issuer_name
        )

        # Generate QR code
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(provisioning_uri)
        qr.make(fit=True)
        img = qr.make_image(fill_color="black", back_color="white")

        # Convert to base64
        buffer = io.BytesIO()
        img.save(buffer, format="PNG")
        qr_code_base64 = base64.b64encode(buffer.getvalue()).decode()

        return {
            "secret": secret,
            "qr_code_url": provisioning_uri,
            "qr_code_data_url": f"data:image/png;base64,{qr_code_base64}",
        }

    async def enable_2fa(self, user: User, code: str) -> list[str]:
        """
        Enable 2FA after verifying the code.

        Args:
            user: The user
            code: The TOTP code to verify

        Returns:
            List of backup codes
        """
        if user.is_two_factor_enabled:
            raise TwoFactorAlreadyEnabledError("2FA is already enabled")

        if not user.two_factor_secret:
            raise TwoFactorNotSetupError("2FA setup not initiated")

        # Verify the code
        totp = pyotp.TOTP(user.two_factor_secret)
        if not totp.verify(code, valid_window=settings.two_factor_totp_window):
            raise Invalid2FACodeError("Invalid 2FA code")

        # Generate backup codes
        backup_codes = self._generate_backup_codes()

        # Enable 2FA
        user.is_two_factor_enabled = True
        user.two_factor_backup_codes = self._hash_backup_codes(backup_codes)
        await self.db.commit()

        return backup_codes

    async def disable_2fa(self, user: User, password: str) -> None:
        """
        Disable 2FA for a user.

        Args:
            user: The user
            password: Current password for verification
        """
        if not user.is_two_factor_enabled:
            raise TwoFactorNotEnabledError("2FA is not enabled")

        # Verify password
        if not user.hashed_password or not verify_password(
            password, user.hashed_password
        ):
            raise InvalidCredentialsError("Invalid password")

        # Disable 2FA
        user.is_two_factor_enabled = False
        user.two_factor_secret = None
        user.two_factor_backup_codes = None
        await self.db.commit()

    async def verify_2fa(
        self, user_id: UUID, code: str, is_backup_code: bool = False
    ) -> Token:
        """
        Verify 2FA code and return tokens.

        Args:
            user_id: The user ID
            code: The TOTP code or backup code
            is_backup_code: Whether the code is a backup code

        Returns:
            Token object with access and refresh tokens
        """
        user = await self.get_user_by_id(user_id)
        if not user:
            raise UserNotFoundError("User not found")

        if not user.is_active:
            raise InactiveUserError("User account is disabled.")

        if not user.is_two_factor_enabled:
            raise TwoFactorNotEnabledError("2FA is not enabled")

        if is_backup_code:
            # Verify backup code
            if not self._verify_backup_code(user, code):
                raise Invalid2FACodeError("Invalid backup code")
            await self.db.commit()
        else:
            # Verify TOTP code
            if not user.two_factor_secret:
                raise TwoFactorNotSetupError("2FA not properly configured")

            totp = pyotp.TOTP(user.two_factor_secret)
            if not totp.verify(code, valid_window=settings.two_factor_totp_window):
                raise Invalid2FACodeError("Invalid 2FA code")

        return Token(
            access_token=create_access_token(subject=user.id),
            refresh_token=create_refresh_token(subject=user.id),
            expires_in=settings.jwt_access_token_expire_minutes * 60,
        )

    async def regenerate_backup_codes(self, user: User, password: str) -> list[str]:
        """
        Regenerate backup codes for a user.

        Args:
            user: The user
            password: Current password for verification

        Returns:
            List of new backup codes
        """
        if not user.is_two_factor_enabled:
            raise TwoFactorNotEnabledError("2FA is not enabled")

        # Verify password
        if not user.hashed_password or not verify_password(
            password, user.hashed_password
        ):
            raise InvalidCredentialsError("Invalid password")

        # Generate new backup codes
        backup_codes = self._generate_backup_codes()
        user.two_factor_backup_codes = self._hash_backup_codes(backup_codes)
        await self.db.commit()

        return backup_codes

    async def verify_totp_code(self, user: User, code: str) -> bool:
        """
        Verify TOTP code for an already authenticated user.

        Args:
            user: The authenticated user
            code: The TOTP code to verify

        Returns:
            True if verification successful

        Raises:
            TwoFactorNotEnabledError: If 2FA is not enabled
            Invalid2FACodeError: If the code is invalid
        """
        if not user.is_two_factor_enabled:
            raise TwoFactorNotEnabledError("2FA is not enabled")

        if not user.two_factor_secret:
            raise TwoFactorNotSetupError("2FA not properly configured")

        totp = pyotp.TOTP(user.two_factor_secret)
        if not totp.verify(code, valid_window=settings.two_factor_totp_window):
            raise Invalid2FACodeError("Invalid 2FA code")

        return True

    async def verify_and_consume_backup_code(self, user: User, code: str) -> bool:
        """
        Verify and consume a backup code for an already authenticated user.

        Args:
            user: The authenticated user
            code: The backup code to verify

        Returns:
            True if verification successful

        Raises:
            TwoFactorNotEnabledError: If 2FA is not enabled
            Invalid2FACodeError: If the code is invalid
        """
        if not user.is_two_factor_enabled:
            raise TwoFactorNotEnabledError("2FA is not enabled")

        if not self._verify_backup_code(user, code):
            raise Invalid2FACodeError("Invalid backup code")

        await self.db.commit()
        return True
