"""Unit tests for email service."""

from unittest.mock import AsyncMock, patch

import pytest
from src.app.services.email_service import EmailService, email_service
from src.app.services.exceptions import EmailConnectionError, EmailSendError


class TestEmailService:
    """Test EmailService class."""

    @pytest.fixture
    def service(self):
        """Create EmailService instance."""
        return EmailService()

    def test_is_development_with_env(self, service):
        """Test _is_development returns True in development environment."""
        with patch("src.app.services.email_service.settings") as mock_settings:
            mock_settings.environment = "development"
            mock_settings.smtp_user = "user"
            assert service._is_development() is True

    def test_is_development_without_smtp_user(self, service):
        """Test _is_development returns True when no SMTP user configured."""
        with patch("src.app.services.email_service.settings") as mock_settings:
            mock_settings.environment = "production"
            mock_settings.smtp_user = None
            assert service._is_development() is True

    def test_is_development_production_with_smtp(self, service):
        """Test _is_development returns False in production with SMTP configured."""
        with patch("src.app.services.email_service.settings") as mock_settings:
            mock_settings.environment = "production"
            mock_settings.smtp_user = "user"
            assert service._is_development() is False

    def test_templates_lazy_loading(self, service):
        """Test Jinja2 templates are lazy loaded."""
        assert service._jinja_env is None
        templates = service._templates
        assert templates is not None
        assert service._jinja_env is not None
        # Second access should return same instance
        assert service._templates is templates


class TestEmailServiceDevelopmentMode:
    """Test EmailService in development mode."""

    @pytest.fixture
    def service(self):
        """Create EmailService instance."""
        return EmailService()

    @pytest.mark.asyncio
    async def test_send_email_logs_to_console(self, service, caplog):
        """Test send_email logs to console in development mode."""
        with patch.object(service, "_is_development", return_value=True):
            await service.send_email(
                to_email="test@example.com",
                subject="Test Subject",
                html_content="<h1>Test</h1>",
            )
            assert "Development Email" in caplog.text
            assert "test@example.com" in caplog.text
            assert "Test Subject" in caplog.text

    @pytest.mark.asyncio
    async def test_send_password_reset_email_development(self, service, caplog):
        """Test password reset email in development mode."""
        with patch.object(service, "_is_development", return_value=True):
            with patch("src.app.services.email_service.settings") as mock_settings:
                mock_settings.frontend_url = "http://localhost:3000"
                mock_settings.app_name = "Test App"
                mock_settings.password_reset_expire_minutes = 60

                await service.send_password_reset_email(
                    to_email="user@example.com",
                    reset_token="test-token-123",
                    user_name="John Doe",
                )
                assert "Development Email" in caplog.text
                assert "user@example.com" in caplog.text
                assert "Reset Your Password" in caplog.text

    @pytest.mark.asyncio
    async def test_send_email_verification_development(self, service, caplog):
        """Test email verification in development mode."""
        with patch.object(service, "_is_development", return_value=True):
            with patch("src.app.services.email_service.settings") as mock_settings:
                mock_settings.frontend_url = "http://localhost:3000"
                mock_settings.app_name = "Test App"
                mock_settings.email_verification_expire_hours = 24

                await service.send_email_verification(
                    to_email="user@example.com",
                    verification_token="verify-token-456",
                    user_name="Jane Doe",
                )
                assert "Development Email" in caplog.text
                assert "user@example.com" in caplog.text
                assert "Verify Your Email" in caplog.text


class TestEmailServiceSMTP:
    """Test EmailService SMTP functionality."""

    @pytest.fixture
    def service(self):
        """Create EmailService instance."""
        return EmailService()

    @pytest.mark.asyncio
    async def test_send_smtp_success(self, service):
        """Test successful SMTP send."""
        with patch("src.app.services.email_service.aiosmtplib.send") as mock_send:
            mock_send.return_value = None
            with patch("src.app.services.email_service.settings") as mock_settings:
                mock_settings.smtp_host = "smtp.example.com"
                mock_settings.smtp_port = 587
                mock_settings.smtp_user = "user"
                mock_settings.smtp_password = "pass"
                mock_settings.smtp_use_tls = True
                mock_settings.email_from_name = "Test"
                mock_settings.email_from_address = "test@example.com"

                await service._send_smtp(
                    to_email="recipient@example.com",
                    subject="Test",
                    html_content="<p>Test</p>",
                )
                mock_send.assert_called_once()

    @pytest.mark.asyncio
    async def test_send_smtp_connection_error_with_retry(self, service):
        """Test SMTP connection error triggers retry."""
        import aiosmtplib

        with patch("src.app.services.email_service.aiosmtplib.send") as mock_send:
            mock_send.side_effect = aiosmtplib.SMTPConnectError("Connection refused")
            with patch("src.app.services.email_service.settings") as mock_settings:
                mock_settings.smtp_host = "smtp.example.com"
                mock_settings.smtp_port = 587
                mock_settings.smtp_user = "user"
                mock_settings.smtp_password = "pass"
                mock_settings.smtp_use_tls = True
                mock_settings.email_from_name = "Test"
                mock_settings.email_from_address = "test@example.com"

                with patch("asyncio.sleep", new_callable=AsyncMock):
                    with pytest.raises(EmailConnectionError):
                        await service._send_smtp(
                            to_email="recipient@example.com",
                            subject="Test",
                            html_content="<p>Test</p>",
                        )
                # Should have retried 3 times
                assert mock_send.call_count == 3

    @pytest.mark.asyncio
    async def test_send_smtp_general_error_with_retry(self, service):
        """Test SMTP general error triggers retry."""
        import aiosmtplib

        with patch("src.app.services.email_service.aiosmtplib.send") as mock_send:
            mock_send.side_effect = aiosmtplib.SMTPException("Send failed")
            with patch("src.app.services.email_service.settings") as mock_settings:
                mock_settings.smtp_host = "smtp.example.com"
                mock_settings.smtp_port = 587
                mock_settings.smtp_user = "user"
                mock_settings.smtp_password = "pass"
                mock_settings.smtp_use_tls = True
                mock_settings.email_from_name = "Test"
                mock_settings.email_from_address = "test@example.com"

                with patch("asyncio.sleep", new_callable=AsyncMock):
                    with pytest.raises(EmailSendError):
                        await service._send_smtp(
                            to_email="recipient@example.com",
                            subject="Test",
                            html_content="<p>Test</p>",
                        )
                assert mock_send.call_count == 3


class TestEmailTemplates:
    """Test email template rendering."""

    @pytest.fixture
    def service(self):
        """Create EmailService instance."""
        return EmailService()

    def test_render_password_reset_template(self, service):
        """Test password reset template renders correctly."""
        html = service._render_template(
            "password_reset.html",
            {
                "user_name": "John",
                "reset_url": "http://example.com/reset?token=abc",
                "app_name": "Test App",
                "expire_minutes": 60,
            },
        )
        assert "John" in html
        assert "http://example.com/reset?token=abc" in html
        assert "60" in html

    def test_render_email_verification_template(self, service):
        """Test email verification template renders correctly."""
        html = service._render_template(
            "email_verification.html",
            {
                "user_name": "Jane",
                "verify_url": "http://example.com/verify?token=xyz",
                "app_name": "Test App",
                "expire_hours": 24,
            },
        )
        assert "Jane" in html
        assert "http://example.com/verify?token=xyz" in html
        assert "24" in html


class TestEmailServiceSingleton:
    """Test email_service singleton instance."""

    def test_singleton_exists(self):
        """Test email_service singleton is created."""
        assert email_service is not None
        assert isinstance(email_service, EmailService)
