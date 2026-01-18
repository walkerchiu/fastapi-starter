"""Email service with async SMTP support."""

import asyncio
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Any

import aiosmtplib
from jinja2 import Environment, PackageLoader, select_autoescape
from src.app.core.config import settings
from src.app.services.exceptions import EmailConnectionError, EmailSendError

logger = logging.getLogger(__name__)


class EmailService:
    """Service for sending emails via SMTP."""

    def __init__(self) -> None:
        self._jinja_env: Environment | None = None

    @property
    def _templates(self) -> Environment:
        """Lazy-load Jinja2 environment."""
        if self._jinja_env is None:
            self._jinja_env = Environment(
                loader=PackageLoader("src.app", "templates/email"),
                autoescape=select_autoescape(["html", "xml"]),
            )
        return self._jinja_env

    def _is_development(self) -> bool:
        """Check if running in development mode."""
        return settings.environment == "development" or not settings.smtp_user

    async def _send_smtp(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: str | None = None,
    ) -> None:
        """Send email via SMTP with retry logic."""
        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = f"{settings.email_from_name} <{settings.email_from_address}>"
        message["To"] = to_email

        if text_content:
            message.attach(MIMEText(text_content, "plain"))
        message.attach(MIMEText(html_content, "html"))

        max_retries = 3
        base_delay = 1.0

        # Convert milliseconds to seconds for aiosmtplib
        timeout_seconds = settings.smtp_socket_timeout / 1000

        for attempt in range(max_retries):
            try:
                await aiosmtplib.send(
                    message,
                    hostname=settings.smtp_host,
                    port=settings.smtp_port,
                    username=settings.smtp_user if settings.smtp_user else None,
                    password=settings.smtp_password if settings.smtp_password else None,
                    start_tls=settings.smtp_use_tls,
                    timeout=timeout_seconds,
                )
                logger.info(f"Email sent successfully to {to_email}")
                return
            except aiosmtplib.SMTPConnectError as e:
                logger.error(f"SMTP connection error (attempt {attempt + 1}): {e}")
                if attempt == max_retries - 1:
                    raise EmailConnectionError(
                        f"Failed to connect to SMTP server after {max_retries} attempts"
                    ) from e
            except aiosmtplib.SMTPException as e:
                logger.error(f"SMTP error (attempt {attempt + 1}): {e}")
                if attempt == max_retries - 1:
                    raise EmailSendError(f"Failed to send email: {e}") from e

            delay = base_delay * (2**attempt)
            logger.info(f"Retrying in {delay} seconds...")
            await asyncio.sleep(delay)

    def _log_to_console(
        self,
        to_email: str,
        subject: str,
        html_content: str,
    ) -> None:
        """Log email to console in development mode."""
        logger.info(
            f"\n{'=' * 60}\n"
            f"📧 Development Email\n"
            f"{'=' * 60}\n"
            f"To: {to_email}\n"
            f"Subject: {subject}\n"
            f"{'=' * 60}\n"
            f"{html_content}\n"
            f"{'=' * 60}\n"
        )

    async def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: str | None = None,
    ) -> None:
        """
        Send an email.

        In development mode or when SMTP is not configured,
        the email is logged to console instead.

        Args:
            to_email: Recipient email address
            subject: Email subject
            html_content: HTML content of the email
            text_content: Optional plain text content
        """
        if self._is_development():
            self._log_to_console(to_email, subject, html_content)
            return

        await self._send_smtp(to_email, subject, html_content, text_content)

    def _render_template(self, template_name: str, context: dict[str, Any]) -> str:
        """Render an email template."""
        template = self._templates.get_template(template_name)
        return template.render(**context)

    async def send_password_reset_email(
        self,
        to_email: str,
        reset_token: str,
        user_name: str | None = None,
    ) -> None:
        """
        Send password reset email.

        Args:
            to_email: Recipient email address
            reset_token: Password reset token
            user_name: Optional user name for personalization
        """
        reset_url = f"{settings.frontend_url}/reset-password?token={reset_token}"

        context = {
            "user_name": user_name or "User",
            "reset_url": reset_url,
            "app_name": settings.app_name,
            "expire_minutes": settings.password_reset_expire_minutes,
        }

        html_content = self._render_template("password_reset.html", context)
        text_content = (
            f"Hi {context['user_name']},\n\n"
            f"You requested to reset your password. "
            f"Click the link below to reset it:\n\n"
            f"{reset_url}\n\n"
            f"This link will expire in {settings.password_reset_expire_minutes} minutes.\n\n"
            f"If you didn't request this, please ignore this email.\n\n"
            f"Best regards,\n{settings.app_name} Team"
        )

        await self.send_email(
            to_email=to_email,
            subject=f"Reset Your Password - {settings.app_name}",
            html_content=html_content,
            text_content=text_content,
        )

    async def send_email_verification(
        self,
        to_email: str,
        verification_token: str,
        user_name: str | None = None,
    ) -> None:
        """
        Send email verification email.

        Args:
            to_email: Recipient email address
            verification_token: Email verification token
            user_name: Optional user name for personalization
        """
        verify_url = f"{settings.frontend_url}/verify-email?token={verification_token}"

        context = {
            "user_name": user_name or "User",
            "verify_url": verify_url,
            "app_name": settings.app_name,
            "expire_hours": settings.email_verification_expire_hours,
        }

        html_content = self._render_template("email_verification.html", context)
        text_content = (
            f"Hi {context['user_name']},\n\n"
            f"Welcome to {settings.app_name}! "
            f"Please verify your email address by clicking the link below:\n\n"
            f"{verify_url}\n\n"
            f"This link will expire in {settings.email_verification_expire_hours} hours.\n\n"
            f"If you didn't create an account, please ignore this email.\n\n"
            f"Best regards,\n{settings.app_name} Team"
        )

        await self.send_email(
            to_email=to_email,
            subject=f"Verify Your Email - {settings.app_name}",
            html_content=html_content,
            text_content=text_content,
        )


email_service = EmailService()
