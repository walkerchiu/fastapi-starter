"""Email message handlers."""

import logging

from src.app.messaging.consumer import MessageConsumer
from src.app.messaging.types import (
    EmailMessage,
    EmailVerificationMessage,
    PasswordResetEmailMessage,
)
from src.app.services.email_service import email_service

logger = logging.getLogger(__name__)


class EmailHandler(MessageConsumer[EmailMessage]):
    """Handler for generic email messages."""

    queue_name = "email_queue"
    routing_keys = ["email.generic"]
    message_type = EmailMessage
    prefetch_count = 10

    async def handle(self, message: EmailMessage) -> None:
        """
        Handle a generic email message.

        Args:
            message: The email message to process
        """
        logger.info(
            "Processing generic email: to=%s, subject=%s",
            message.to_email,
            message.subject,
        )

        html_content = email_service._render_template(
            message.template_name,
            message.context,
        )

        await email_service.send_email(
            to_email=message.to_email,
            subject=message.subject,
            html_content=html_content,
        )

        logger.info(
            "Generic email sent successfully: to=%s, message_id=%s",
            message.to_email,
            message.id,
        )


class PasswordResetEmailHandler(MessageConsumer[PasswordResetEmailMessage]):
    """Handler for password reset email messages."""

    queue_name = "email_queue"
    routing_keys = ["email.password_reset"]
    message_type = PasswordResetEmailMessage
    prefetch_count = 10

    async def handle(self, message: PasswordResetEmailMessage) -> None:
        """
        Handle a password reset email message.

        Args:
            message: The password reset email message to process
        """
        logger.info(
            "Processing password reset email: to=%s",
            message.to_email,
        )

        await email_service.send_password_reset_email(
            to_email=message.to_email,
            reset_token=message.reset_token,
            user_name=message.user_name,
        )

        logger.info(
            "Password reset email sent successfully: to=%s, message_id=%s",
            message.to_email,
            message.id,
        )


class EmailVerificationHandler(MessageConsumer[EmailVerificationMessage]):
    """Handler for email verification messages."""

    queue_name = "email_queue"
    routing_keys = ["email.verification"]
    message_type = EmailVerificationMessage
    prefetch_count = 10

    async def handle(self, message: EmailVerificationMessage) -> None:
        """
        Handle an email verification message.

        Args:
            message: The email verification message to process
        """
        logger.info(
            "Processing email verification: to=%s",
            message.to_email,
        )

        await email_service.send_email_verification(
            to_email=message.to_email,
            verification_token=message.verification_token,
            user_name=message.user_name,
        )

        logger.info(
            "Email verification sent successfully: to=%s, message_id=%s",
            message.to_email,
            message.id,
        )
