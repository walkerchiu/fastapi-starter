"""Messaging-related exceptions."""


class MessagingError(Exception):
    """Base exception for messaging errors."""

    def __init__(self, message: str, cause: Exception | None = None) -> None:
        super().__init__(message)
        self.cause = cause


class MessagePublishError(MessagingError):
    """Raised when a message fails to publish."""

    pass


class MessageSerializationError(MessagingError):
    """Raised when a message fails to serialize."""

    pass


class MessageDeserializationError(MessagingError):
    """Raised when a message fails to deserialize."""

    pass


class MessageHandlerError(MessagingError):
    """Raised when a message handler fails."""

    pass


class MessageRetryExhaustedError(MessagingError):
    """Raised when a message has exhausted all retries."""

    pass


class ConsumerNotStartedError(MessagingError):
    """Raised when trying to stop a consumer that hasn't started."""

    pass
