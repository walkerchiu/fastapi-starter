"""Message producer for publishing messages to RabbitMQ."""

import logging
from typing import Any

from aio_pika import DeliveryMode, Message
from src.app.core.config import settings
from src.app.core.rabbitmq import RabbitMQPool, get_channel
from src.app.messaging.exceptions import MessagePublishError, MessageSerializationError
from src.app.messaging.types import (
    BaseMessage,
    DomainEvent,
    EmailMessage,
    EmailVerificationMessage,
    PasswordResetEmailMessage,
)

logger = logging.getLogger(__name__)


class MessageProducer:
    """Service for publishing messages to RabbitMQ."""

    async def publish(
        self,
        message: BaseMessage,
        routing_key: str,
        exchange_name: str | None = None,
    ) -> None:
        """
        Publish a message to RabbitMQ.

        Args:
            message: The message to publish
            routing_key: The routing key for the message
            exchange_name: Optional exchange name (defaults to main exchange)

        Raises:
            MessagePublishError: If the message fails to publish
            MessageSerializationError: If the message fails to serialize
        """
        if not settings.rabbitmq_enabled:
            logger.warning(
                "RabbitMQ is disabled, message not published: %s",
                message.id,
            )
            return

        if not RabbitMQPool.is_initialized():
            raise MessagePublishError("RabbitMQ pool not initialized")

        try:
            body = message.model_dump_json().encode()
        except Exception as e:
            raise MessageSerializationError(
                f"Failed to serialize message: {e}",
                cause=e,
            ) from e

        try:
            async with get_channel() as channel:
                exchange = await channel.get_exchange(
                    exchange_name or settings.rabbitmq_exchange_name
                )

                await exchange.publish(
                    Message(
                        body=body,
                        content_type="application/json",
                        delivery_mode=DeliveryMode.PERSISTENT,
                        priority=message.priority,
                        message_id=str(message.id),
                        timestamp=message.timestamp,
                    ),
                    routing_key=routing_key,
                )

                logger.debug(
                    "Message published: id=%s, routing_key=%s",
                    message.id,
                    routing_key,
                )

        except Exception as e:
            logger.error(
                "Failed to publish message: id=%s, error=%s",
                message.id,
                str(e),
            )
            raise MessagePublishError(
                f"Failed to publish message: {e}",
                cause=e,
            ) from e

    async def send_email(
        self,
        to_email: str,
        subject: str,
        template_name: str,
        context: dict[str, Any] | None = None,
    ) -> None:
        """
        Send a generic email via RabbitMQ.

        Args:
            to_email: Recipient email address
            subject: Email subject
            template_name: Name of the email template
            context: Template context variables
        """
        message = EmailMessage(
            to_email=to_email,
            subject=subject,
            template_name=template_name,
            context=context or {},
        )
        await self.publish(message, "email.generic")

    async def send_password_reset_email(
        self,
        to_email: str,
        reset_token: str,
        user_name: str | None = None,
    ) -> None:
        """
        Send a password reset email via RabbitMQ.

        Args:
            to_email: Recipient email address
            reset_token: Password reset token
            user_name: Optional user name for personalization
        """
        message = PasswordResetEmailMessage(
            to_email=to_email,
            reset_token=reset_token,
            user_name=user_name,
        )
        await self.publish(message, "email.password_reset")

    async def send_email_verification(
        self,
        to_email: str,
        verification_token: str,
        user_name: str | None = None,
    ) -> None:
        """
        Send an email verification via RabbitMQ.

        Args:
            to_email: Recipient email address
            verification_token: Email verification token
            user_name: Optional user name for personalization
        """
        message = EmailVerificationMessage(
            to_email=to_email,
            verification_token=verification_token,
            user_name=user_name,
        )
        await self.publish(message, "email.verification")

    async def publish_event(self, event: DomainEvent) -> None:
        """
        Publish a domain event via RabbitMQ.

        Args:
            event: The domain event to publish
        """
        routing_key = f"event.{event.event_type}"
        await self.publish(event, routing_key)


# Singleton instance
message_producer = MessageProducer()
