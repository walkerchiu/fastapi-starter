"""Messaging module for RabbitMQ integration."""

from src.app.messaging.consumer import MessageConsumer
from src.app.messaging.exceptions import (
    MessageDeserializationError,
    MessagePublishError,
    MessageSerializationError,
    MessagingError,
)
from src.app.messaging.producer import message_producer
from src.app.messaging.types import (
    AuditLogMessage,
    BaseMessage,
    DomainEvent,
    EmailMessage,
    EmailVerificationMessage,
    FileProcessingMessage,
    MessagePriority,
    PasswordResetEmailMessage,
    UserLoggedInEvent,
    UserRegisteredEvent,
)

__all__ = [
    # Types
    "BaseMessage",
    "MessagePriority",
    "EmailMessage",
    "PasswordResetEmailMessage",
    "EmailVerificationMessage",
    "FileProcessingMessage",
    "DomainEvent",
    "UserRegisteredEvent",
    "UserLoggedInEvent",
    "AuditLogMessage",
    # Producer
    "message_producer",
    # Consumer
    "MessageConsumer",
    # Exceptions
    "MessagingError",
    "MessagePublishError",
    "MessageSerializationError",
    "MessageDeserializationError",
]
