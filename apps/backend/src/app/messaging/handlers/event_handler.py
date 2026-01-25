"""Domain event message handlers."""

import logging

from src.app.messaging.consumer import MessageConsumer
from src.app.messaging.types import DomainEvent, UserLoggedInEvent, UserRegisteredEvent

logger = logging.getLogger(__name__)


class UserRegisteredEventHandler(MessageConsumer[UserRegisteredEvent]):
    """Handler for user registered events."""

    queue_name = "event_queue"
    routing_keys = ["event.user.registered"]
    message_type = UserRegisteredEvent
    prefetch_count = 10

    async def handle(self, message: UserRegisteredEvent) -> None:
        """
        Handle a user registered event.

        Args:
            message: The user registered event to process
        """
        logger.info(
            "Processing user registered event: user_id=%s, email=%s",
            message.user_id,
            message.email,
        )

        # TODO: Implement actual event handling logic
        # Examples:
        # - Send welcome email
        # - Create default user preferences
        # - Notify admin of new registration
        # - Update analytics

        logger.info(
            "User registered event processed: user_id=%s, message_id=%s",
            message.user_id,
            message.id,
        )


class UserLoggedInEventHandler(MessageConsumer[UserLoggedInEvent]):
    """Handler for user logged in events."""

    queue_name = "event_queue"
    routing_keys = ["event.user.logged_in"]
    message_type = UserLoggedInEvent
    prefetch_count = 10

    async def handle(self, message: UserLoggedInEvent) -> None:
        """
        Handle a user logged in event.

        Args:
            message: The user logged in event to process
        """
        logger.info(
            "Processing user logged in event: user_id=%s, ip=%s",
            message.user_id,
            message.ip_address,
        )

        # TODO: Implement actual event handling logic
        # Examples:
        # - Update last login timestamp
        # - Log login activity
        # - Check for suspicious login patterns
        # - Send security notification

        logger.info(
            "User logged in event processed: user_id=%s, message_id=%s",
            message.user_id,
            message.id,
        )


class GenericEventHandler(MessageConsumer[DomainEvent]):
    """Handler for generic domain events."""

    queue_name = "event_queue"
    routing_keys = ["event.#"]
    message_type = DomainEvent
    prefetch_count = 10

    async def handle(self, message: DomainEvent) -> None:
        """
        Handle a generic domain event.

        Args:
            message: The domain event to process
        """
        logger.info(
            "Processing domain event: type=%s, aggregate_id=%s",
            message.event_type,
            message.aggregate_id,
        )

        # TODO: Implement actual event handling logic
        # This handler catches all events that don't have specific handlers

        logger.info(
            "Domain event processed: type=%s, message_id=%s",
            message.event_type,
            message.id,
        )
