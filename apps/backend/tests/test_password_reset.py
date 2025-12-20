"""Unit tests for password reset feature."""

from datetime import UTC, datetime, timedelta
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from src.app.models import PasswordResetToken, User
from src.app.services.auth_service import AuthService
from src.app.services.exceptions import (
    ExpiredResetTokenError,
    InvalidResetTokenError,
    ResetTokenAlreadyUsedError,
    UserNotFoundError,
)


class TestHashToken:
    """Test _hash_token static method."""

    def test_hash_token_returns_hex_string(self):
        """Test that _hash_token returns a SHA-256 hex string."""
        result = AuthService._hash_token("test-token")
        assert isinstance(result, str)
        assert len(result) == 64  # SHA-256 produces 64 hex characters

    def test_hash_token_is_deterministic(self):
        """Test that same input produces same hash."""
        token = "my-secret-token"
        hash1 = AuthService._hash_token(token)
        hash2 = AuthService._hash_token(token)
        assert hash1 == hash2

    def test_hash_token_different_inputs_different_hashes(self):
        """Test that different inputs produce different hashes."""
        hash1 = AuthService._hash_token("token1")
        hash2 = AuthService._hash_token("token2")
        assert hash1 != hash2


class TestForgotPassword:
    """Test forgot_password method."""

    @pytest.fixture
    def mock_db(self):
        """Create mock database session."""
        db = MagicMock()
        db.execute = AsyncMock()
        db.add = MagicMock()
        db.commit = AsyncMock()
        db.refresh = AsyncMock()
        return db

    @pytest.fixture
    def service(self, mock_db):
        """Create AuthService instance with mock db."""
        return AuthService(mock_db)

    @pytest.mark.asyncio
    async def test_forgot_password_user_not_found(self, service, mock_db):
        """Test forgot_password silently returns when user not found."""
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute.return_value = mock_result

        # Should not raise, returns silently
        await service.forgot_password("nonexistent@example.com")

        # Email should not be sent
        mock_db.add.assert_not_called()

    @pytest.mark.asyncio
    async def test_forgot_password_inactive_user(self, service, mock_db):
        """Test forgot_password silently returns for inactive user."""
        inactive_user = MagicMock(spec=User)
        inactive_user.is_active = False

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = inactive_user
        mock_db.execute.return_value = mock_result

        await service.forgot_password("inactive@example.com")

        # Token should not be created
        mock_db.add.assert_not_called()

    @pytest.mark.asyncio
    async def test_forgot_password_success(self, service, mock_db):
        """Test forgot_password creates token and sends email for valid user."""
        active_user = MagicMock(spec=User)
        active_user.id = 1
        active_user.email = "user@example.com"
        active_user.name = "Test User"
        active_user.is_active = True

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = active_user
        mock_db.execute.return_value = mock_result

        with patch("src.app.services.auth_service.email_service") as mock_email_service:
            mock_email_service.send_password_reset_email = AsyncMock()

            with patch("src.app.services.auth_service.settings") as mock_settings:
                mock_settings.password_reset_expire_minutes = 60
                mock_settings.rabbitmq_enabled = False

                await service.forgot_password("user@example.com")

        # Token should be created
        mock_db.add.assert_called_once()
        mock_db.commit.assert_called_once()

        # Email should be sent
        mock_email_service.send_password_reset_email.assert_called_once()
        call_args = mock_email_service.send_password_reset_email.call_args
        assert call_args.kwargs["to_email"] == "user@example.com"
        assert call_args.kwargs["user_name"] == "Test User"


class TestResetPassword:
    """Test reset_password method."""

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
    async def test_reset_password_invalid_token(self, service, mock_db):
        """Test reset_password raises error for invalid token."""
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute.return_value = mock_result

        with pytest.raises(InvalidResetTokenError):
            await service.reset_password("invalid-token", "newpassword123")

    @pytest.mark.asyncio
    async def test_reset_password_already_used_token(self, service, mock_db):
        """Test reset_password raises error for already used token."""
        used_token = MagicMock(spec=PasswordResetToken)
        used_token.used = True

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = used_token
        mock_db.execute.return_value = mock_result

        with pytest.raises(ResetTokenAlreadyUsedError):
            await service.reset_password("used-token", "newpassword123")

    @pytest.mark.asyncio
    async def test_reset_password_expired_token(self, service, mock_db):
        """Test reset_password raises error for expired token."""
        expired_token = MagicMock(spec=PasswordResetToken)
        expired_token.used = False
        expired_token.expires_at = datetime.now(UTC) - timedelta(hours=1)

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = expired_token
        mock_db.execute.return_value = mock_result

        with pytest.raises(ExpiredResetTokenError):
            await service.reset_password("expired-token", "newpassword123")

    @pytest.mark.asyncio
    async def test_reset_password_user_not_found(self, service, mock_db):
        """Test reset_password raises error when user not found."""
        valid_token = MagicMock(spec=PasswordResetToken)
        valid_token.used = False
        valid_token.expires_at = datetime.now(UTC) + timedelta(hours=1)
        valid_token.user_id = 999

        # First call returns token, second call returns None (user not found)
        mock_result1 = MagicMock()
        mock_result1.scalar_one_or_none.return_value = valid_token
        mock_result2 = MagicMock()
        mock_result2.scalar_one_or_none.return_value = None

        mock_db.execute.side_effect = [mock_result1, mock_result2]

        with pytest.raises(UserNotFoundError):
            await service.reset_password("valid-token", "newpassword123")

    @pytest.mark.asyncio
    async def test_reset_password_success(self, service, mock_db):
        """Test reset_password successfully updates password."""
        valid_token = MagicMock(spec=PasswordResetToken)
        valid_token.used = False
        valid_token.expires_at = datetime.now(UTC) + timedelta(hours=1)
        valid_token.user_id = 1

        user = MagicMock(spec=User)
        user.id = 1

        mock_result1 = MagicMock()
        mock_result1.scalar_one_or_none.return_value = valid_token
        mock_result2 = MagicMock()
        mock_result2.scalar_one_or_none.return_value = user

        mock_db.execute.side_effect = [mock_result1, mock_result2]

        with patch("src.app.services.auth_service.get_password_hash") as mock_hash:
            mock_hash.return_value = "hashed_new_password"

            await service.reset_password("valid-token", "newpassword123")

        # Password should be updated
        assert user.hashed_password == "hashed_new_password"
        # Token should be marked as used
        assert valid_token.used is True
        mock_db.commit.assert_called_once()


class TestCleanupExpiredTokens:
    """Test cleanup_expired_tokens method."""

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
    async def test_cleanup_expired_tokens_returns_count(self, service, mock_db):
        """Test cleanup_expired_tokens returns number of deleted tokens."""
        mock_result = MagicMock()
        mock_result.rowcount = 5
        mock_db.execute.return_value = mock_result

        count = await service.cleanup_expired_tokens()

        assert count == 5
        mock_db.commit.assert_called_once()

    @pytest.mark.asyncio
    async def test_cleanup_expired_tokens_returns_zero(self, service, mock_db):
        """Test cleanup_expired_tokens returns zero when no tokens deleted."""
        mock_result = MagicMock()
        mock_result.rowcount = None
        mock_db.execute.return_value = mock_result

        count = await service.cleanup_expired_tokens()

        assert count == 0


class TestPasswordResetExceptions:
    """Test password reset related exceptions."""

    def test_invalid_reset_token_error(self):
        """Test InvalidResetTokenError can be raised with message."""
        with pytest.raises(InvalidResetTokenError) as exc_info:
            raise InvalidResetTokenError("Token is invalid")
        assert "Token is invalid" in str(exc_info.value)

    def test_expired_reset_token_error(self):
        """Test ExpiredResetTokenError can be raised with message."""
        with pytest.raises(ExpiredResetTokenError) as exc_info:
            raise ExpiredResetTokenError("Token has expired")
        assert "Token has expired" in str(exc_info.value)

    def test_reset_token_already_used_error(self):
        """Test ResetTokenAlreadyUsedError can be raised with message."""
        with pytest.raises(ResetTokenAlreadyUsedError) as exc_info:
            raise ResetTokenAlreadyUsedError("Token already used")
        assert "Token already used" in str(exc_info.value)
