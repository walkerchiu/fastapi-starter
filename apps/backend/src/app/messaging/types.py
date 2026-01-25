"""Message type definitions for RabbitMQ messaging."""

from datetime import UTC, datetime
from enum import IntEnum
from typing import Any
from uuid import UUID, uuid4

from pydantic import BaseModel, Field


class MessagePriority(IntEnum):
    """Message priority levels (0-9, higher is more important)."""

    LOW = 1
    NORMAL = 5
    HIGH = 7
    CRITICAL = 9


class BaseMessage(BaseModel):
    """Base class for all messages."""

    id: UUID = Field(default_factory=uuid4)
    timestamp: datetime = Field(default_factory=lambda: datetime.now(UTC))
    priority: MessagePriority = MessagePriority.NORMAL
    retry_count: int = 0
    max_retries: int = 3

    model_config = {"frozen": False}

    def increment_retry(self) -> "BaseMessage":
        """Increment retry count and return self."""
        self.retry_count += 1
        return self

    def can_retry(self) -> bool:
        """Check if the message can be retried."""
        return self.retry_count < self.max_retries


# Email Messages


class EmailMessage(BaseMessage):
    """Generic email message."""

    to_email: str
    subject: str
    template_name: str
    context: dict[str, Any] = Field(default_factory=dict)


class PasswordResetEmailMessage(BaseMessage):
    """Password reset email message."""

    to_email: str
    reset_token: str
    user_name: str | None = None


class EmailVerificationMessage(BaseMessage):
    """Email verification message."""

    to_email: str
    verification_token: str
    user_name: str | None = None


# File Processing Messages


class FileProcessingMessage(BaseMessage):
    """File processing task message."""

    file_id: UUID
    file_path: str
    operation: str  # e.g., "compress", "thumbnail", "convert"
    params: dict[str, Any] = Field(default_factory=dict)
    user_id: UUID | None = None


# Domain Events


class DomainEvent(BaseMessage):
    """Base class for domain events."""

    event_type: str
    aggregate_id: UUID | None = None
    aggregate_type: str | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)


class UserRegisteredEvent(DomainEvent):
    """Event fired when a new user registers."""

    event_type: str = "user.registered"
    aggregate_type: str = "User"
    user_id: UUID
    email: str
    name: str | None = None

    def __init__(self, **data: Any) -> None:
        if "aggregate_id" not in data and "user_id" in data:
            data["aggregate_id"] = data["user_id"]
        super().__init__(**data)


class UserLoggedInEvent(DomainEvent):
    """Event fired when a user logs in."""

    event_type: str = "user.logged_in"
    aggregate_type: str = "User"
    user_id: UUID
    ip_address: str | None = None
    user_agent: str | None = None

    def __init__(self, **data: Any) -> None:
        if "aggregate_id" not in data and "user_id" in data:
            data["aggregate_id"] = data["user_id"]
        super().__init__(**data)
