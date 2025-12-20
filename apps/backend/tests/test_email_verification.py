"""Unit tests for email verification and profile management features."""

from datetime import UTC, datetime, timedelta
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from src.app.models import User
from src.app.services.auth_service import AuthService
from src.app.services.exceptions import (
    EmailAlreadyVerifiedError,
    ExpiredVerificationTokenError,
    InvalidCredentialsError,
    InvalidVerificationTokenError,
    SamePasswordError,
)


class TestSendVerificationEmail:
    """Test send_verification_email method."""

    @pytest.fixture
    def mock_db(self):
        """Create mock database session."""
        db = MagicMock()
        db.execute = AsyncMock()
        db.commit = AsyncMock()
        db.refresh = AsyncMock()
        return db

    @pytest.fixture
    def service(self, mock_db):
        """Create AuthService instance with mock db."""
        return AuthService(mock_db)

    @pytest.mark.asyncio
    async def test_send_verification_email_already_verified(self, service, mock_db):
        """Test send_verification_email returns early if already verified."""
        verified_user = MagicMock(spec=User)
        verified_user.is_email_verified = True

        with patch("src.app.services.auth_service.email_service") as mock_email_service:
            await service.send_verification_email(verified_user)

            # Should not send email
            mock_email_service.send_email_verification.assert_not_called()

    @pytest.mark.asyncio
    async def test_send_verification_email_success(self, service, mock_db):
        """Test send_verification_email sends email for unverified user."""
        unverified_user = MagicMock(spec=User)
        unverified_user.is_email_verified = False
        unverified_user.email = "user@example.com"
        unverified_user.name = "Test User"

        with patch("src.app.services.auth_service.email_service") as mock_email_service:
            mock_email_service.send_email_verification = AsyncMock()

            with patch("src.app.services.auth_service.settings") as mock_settings:
                mock_settings.email_verification_expire_hours = 24
                mock_settings.rabbitmq_enabled = False

                await service.send_verification_email(unverified_user)

        # Token should be stored
        assert unverified_user.email_verification_token is not None
        assert unverified_user.email_verification_expires_at is not None
        mock_db.commit.assert_called_once()

        # Email should be sent
        mock_email_service.send_email_verification.assert_called_once()
        call_args = mock_email_service.send_email_verification.call_args
        assert call_args.kwargs["to_email"] == "user@example.com"
        assert call_args.kwargs["user_name"] == "Test User"


class TestVerifyEmail:
    """Test verify_email method."""

    @pytest.fixture
    def mock_db(self):
        """Create mock database session."""
        db = MagicMock()
        db.execute = AsyncMock()
        db.commit = AsyncMock()
        return db

    @pytest.fixture
    def service(self, mock_db):
        """Create AuthService instance with mock db."""
        return AuthService(mock_db)

    @pytest.mark.asyncio
    async def test_verify_email_invalid_token(self, service, mock_db):
        """Test verify_email raises error for invalid token."""
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute.return_value = mock_result

        with pytest.raises(InvalidVerificationTokenError):
            await service.verify_email("invalid-token")

    @pytest.mark.asyncio
    async def test_verify_email_already_verified(self, service, mock_db):
        """Test verify_email raises error if already verified."""
        verified_user = MagicMock(spec=User)
        verified_user.is_email_verified = True

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = verified_user
        mock_db.execute.return_value = mock_result

        with pytest.raises(EmailAlreadyVerifiedError):
            await service.verify_email("valid-token")

    @pytest.mark.asyncio
    async def test_verify_email_expired_token(self, service, mock_db):
        """Test verify_email raises error for expired token."""
        user = MagicMock(spec=User)
        user.is_email_verified = False
        user.email_verification_expires_at = datetime.now(UTC) - timedelta(hours=1)

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = user
        mock_db.execute.return_value = mock_result

        with pytest.raises(ExpiredVerificationTokenError):
            await service.verify_email("expired-token")

    @pytest.mark.asyncio
    async def test_verify_email_success(self, service, mock_db):
        """Test verify_email successfully verifies user."""
        user = MagicMock(spec=User)
        user.is_email_verified = False
        user.email_verification_expires_at = datetime.now(UTC) + timedelta(hours=1)

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = user
        mock_db.execute.return_value = mock_result

        await service.verify_email("valid-token")

        # User should be marked as verified
        assert user.is_email_verified is True
        assert user.email_verification_token is None
        assert user.email_verification_expires_at is None
        mock_db.commit.assert_called_once()


class TestResendVerificationEmail:
    """Test resend_verification_email method."""

    @pytest.fixture
    def mock_db(self):
        """Create mock database session."""
        db = MagicMock()
        db.execute = AsyncMock()
        db.commit = AsyncMock()
        return db

    @pytest.fixture
    def service(self, mock_db):
        """Create AuthService instance with mock db."""
        return AuthService(mock_db)

    @pytest.mark.asyncio
    async def test_resend_verification_user_not_found(self, service, mock_db):
        """Test resend_verification_email silently returns for unknown user."""
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute.return_value = mock_result

        # Should not raise
        await service.resend_verification_email("unknown@example.com")

    @pytest.mark.asyncio
    async def test_resend_verification_inactive_user(self, service, mock_db):
        """Test resend_verification_email silently returns for inactive user."""
        inactive_user = MagicMock(spec=User)
        inactive_user.is_active = False

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = inactive_user
        mock_db.execute.return_value = mock_result

        await service.resend_verification_email("inactive@example.com")

    @pytest.mark.asyncio
    async def test_resend_verification_already_verified(self, service, mock_db):
        """Test resend_verification_email silently returns for verified user."""
        verified_user = MagicMock(spec=User)
        verified_user.is_active = True
        verified_user.is_email_verified = True

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = verified_user
        mock_db.execute.return_value = mock_result

        with patch("src.app.services.auth_service.email_service") as mock_email_service:
            await service.resend_verification_email("verified@example.com")

            # Should not send email
            mock_email_service.send_email_verification.assert_not_called()

    @pytest.mark.asyncio
    async def test_resend_verification_success(self, service, mock_db):
        """Test resend_verification_email sends email for unverified user."""
        unverified_user = MagicMock(spec=User)
        unverified_user.is_active = True
        unverified_user.is_email_verified = False
        unverified_user.email = "user@example.com"
        unverified_user.name = "Test User"

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = unverified_user
        mock_db.execute.return_value = mock_result

        with patch("src.app.services.auth_service.email_service") as mock_email_service:
            mock_email_service.send_email_verification = AsyncMock()

            with patch("src.app.services.auth_service.settings") as mock_settings:
                mock_settings.email_verification_expire_hours = 24
                mock_settings.rabbitmq_enabled = False

                await service.resend_verification_email("user@example.com")

        # Email should be sent
        mock_email_service.send_email_verification.assert_called_once()


class TestUpdateProfile:
    """Test update_profile method."""

    @pytest.fixture
    def mock_db(self):
        """Create mock database session."""
        db = MagicMock()
        db.commit = AsyncMock()
        db.refresh = AsyncMock()
        return db

    @pytest.fixture
    def service(self, mock_db):
        """Create AuthService instance with mock db."""
        return AuthService(mock_db)

    @pytest.mark.asyncio
    async def test_update_profile_success(self, service, mock_db):
        """Test update_profile successfully updates user name."""
        user = MagicMock(spec=User)
        user.name = "Old Name"

        result = await service.update_profile(user, "New Name")

        assert user.name == "New Name"
        mock_db.commit.assert_called_once()
        mock_db.refresh.assert_called_once_with(user)
        assert result == user


class TestChangePassword:
    """Test change_password method."""

    @pytest.fixture
    def mock_db(self):
        """Create mock database session."""
        db = MagicMock()
        db.commit = AsyncMock()
        return db

    @pytest.fixture
    def service(self, mock_db):
        """Create AuthService instance with mock db."""
        return AuthService(mock_db)

    @pytest.mark.asyncio
    async def test_change_password_wrong_current_password(self, service):
        """Test change_password raises error for wrong current password."""
        user = MagicMock(spec=User)
        user.hashed_password = "hashed_password"

        with patch("src.app.services.auth_service.verify_password", return_value=False):
            with pytest.raises(InvalidCredentialsError):
                await service.change_password(user, "wrong_password", "new_password")

    @pytest.mark.asyncio
    async def test_change_password_same_password(self, service):
        """Test change_password raises error when new password is same."""
        user = MagicMock(spec=User)
        user.hashed_password = "hashed_password"

        with patch("src.app.services.auth_service.verify_password") as mock_verify:
            # First call (current password check) returns True
            # Second call (same password check) returns True
            mock_verify.side_effect = [True, True]

            with pytest.raises(SamePasswordError):
                await service.change_password(
                    user, "current_password", "current_password"
                )

    @pytest.mark.asyncio
    async def test_change_password_success(self, service, mock_db):
        """Test change_password successfully updates password."""
        user = MagicMock(spec=User)
        user.hashed_password = "old_hashed_password"

        with patch("src.app.services.auth_service.verify_password") as mock_verify:
            # First call (current password check) returns True
            # Second call (same password check) returns False
            mock_verify.side_effect = [True, False]

            with patch("src.app.services.auth_service.get_password_hash") as mock_hash:
                mock_hash.return_value = "new_hashed_password"

                await service.change_password(user, "current_password", "new_password")

        assert user.hashed_password == "new_hashed_password"
        mock_db.commit.assert_called_once()


class TestEmailVerificationExceptions:
    """Test email verification related exceptions."""

    def test_invalid_verification_token_error(self):
        """Test InvalidVerificationTokenError can be raised with message."""
        with pytest.raises(InvalidVerificationTokenError) as exc_info:
            raise InvalidVerificationTokenError("Token is invalid")
        assert "Token is invalid" in str(exc_info.value)

    def test_expired_verification_token_error(self):
        """Test ExpiredVerificationTokenError can be raised with message."""
        with pytest.raises(ExpiredVerificationTokenError) as exc_info:
            raise ExpiredVerificationTokenError("Token has expired")
        assert "Token has expired" in str(exc_info.value)

    def test_email_already_verified_error(self):
        """Test EmailAlreadyVerifiedError can be raised with message."""
        with pytest.raises(EmailAlreadyVerifiedError) as exc_info:
            raise EmailAlreadyVerifiedError("Already verified")
        assert "Already verified" in str(exc_info.value)

    def test_same_password_error(self):
        """Test SamePasswordError can be raised with message."""
        with pytest.raises(SamePasswordError) as exc_info:
            raise SamePasswordError("Same password")
        assert "Same password" in str(exc_info.value)
