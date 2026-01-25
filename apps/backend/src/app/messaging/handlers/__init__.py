"""Message handlers for processing RabbitMQ messages."""

from src.app.messaging.handlers.email_handler import (
    EmailHandler,
    EmailVerificationHandler,
    PasswordResetEmailHandler,
)
from src.app.messaging.handlers.event_handler import (
    GenericEventHandler,
    UserLoggedInEventHandler,
    UserRegisteredEventHandler,
)
from src.app.messaging.handlers.file_handler import FileProcessingHandler

__all__ = [
    "EmailHandler",
    "PasswordResetEmailHandler",
    "EmailVerificationHandler",
    "FileProcessingHandler",
    "UserRegisteredEventHandler",
    "UserLoggedInEventHandler",
    "GenericEventHandler",
]
