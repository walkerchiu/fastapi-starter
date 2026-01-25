"""Message consumer base class for RabbitMQ."""

import asyncio
import logging
from abc import ABC, abstractmethod

from aio_pika import Message
from aio_pika.abc import AbstractIncomingMessage
from src.app.core.config import settings
from src.app.core.rabbitmq import (
    RabbitMQPool,
    declare_dead_letter_queue,
    declare_queue,
    get_connection,
)
from src.app.messaging.exceptions import (
    ConsumerNotStartedError,
    MessageDeserializationError,
    MessageHandlerError,
    MessageRetryExhaustedError,
)
from src.app.messaging.types import BaseMessage

logger = logging.getLogger(__name__)


class MessageConsumer[T: BaseMessage](ABC):
    """
    Abstract base class for message consumers.

    Subclasses must implement the `handle` method to process messages.
    """

    queue_name: str
    routing_keys: list[str]
    message_type: type[T]
    prefetch_count: int = 10

    def __init__(
        self,
        queue_name: str | None = None,
        routing_keys: list[str] | None = None,
        message_type: type[T] | None = None,
        prefetch_count: int | None = None,
    ) -> None:
        """
        Initialize the consumer.

        Args:
            queue_name: Override class queue_name
            routing_keys: Override class routing_keys
            message_type: Override class message_type
            prefetch_count: Number of messages to prefetch
        """
        self._queue_name = queue_name or getattr(self, "queue_name", "default_queue")
        self._routing_keys = routing_keys or getattr(self, "routing_keys", ["#"])
        self._message_type = message_type or getattr(self, "message_type", BaseMessage)
        self._prefetch_count = prefetch_count or getattr(self, "prefetch_count", 10)
        self._running = False
        self._consumer_tag: str | None = None

    @abstractmethod
    async def handle(self, message: T) -> None:
        """
        Handle a message.

        Args:
            message: The deserialized message

        Raises:
            MessageHandlerError: If the message handling fails
        """
        pass

    def _deserialize(self, raw: bytes) -> T:
        """
        Deserialize a message body.

        Args:
            raw: Raw message bytes

        Returns:
            Deserialized message

        Raises:
            MessageDeserializationError: If deserialization fails
        """
        try:
            return self._message_type.model_validate_json(raw)
        except Exception as e:
            raise MessageDeserializationError(
                f"Failed to deserialize message: {e}",
                cause=e,
            ) from e

    async def _process_message(self, raw_message: AbstractIncomingMessage) -> None:
        """
        Process an incoming message.

        Args:
            raw_message: The raw message from RabbitMQ
        """
        async with raw_message.process(requeue=False):
            try:
                message = self._deserialize(raw_message.body)

                logger.debug(
                    "Processing message: id=%s, queue=%s",
                    message.id,
                    self._queue_name,
                )

                await self.handle(message)

                logger.debug(
                    "Message processed successfully: id=%s",
                    message.id,
                )

            except MessageDeserializationError as e:
                logger.error(
                    "Failed to deserialize message, sending to DLQ: %s",
                    str(e),
                )
                # Message will be nacked and sent to DLQ
                raise

            except Exception as e:
                await self._handle_failure(raw_message, e)

    async def _handle_failure(
        self,
        raw_message: AbstractIncomingMessage,
        error: Exception,
    ) -> None:
        """
        Handle a message processing failure.

        Args:
            raw_message: The raw message that failed
            error: The exception that occurred
        """
        try:
            message = self._deserialize(raw_message.body)
            message.increment_retry()

            if message.can_retry():
                # Calculate retry delay with exponential backoff
                delay_ms = min(
                    settings.rabbitmq_retry_delay_base
                    * (2 ** (message.retry_count - 1)),
                    settings.rabbitmq_retry_delay_max,
                )

                logger.warning(
                    "Message failed, scheduling retry %d/%d in %dms: id=%s, error=%s",
                    message.retry_count,
                    message.max_retries,
                    delay_ms,
                    message.id,
                    str(error),
                )

                # Wait before retry
                await asyncio.sleep(delay_ms / 1000)

                # Republish with updated retry count
                async with get_connection() as connection:
                    channel = await connection.channel()
                    exchange = await channel.get_exchange(
                        settings.rabbitmq_exchange_name
                    )

                    await exchange.publish(
                        Message(
                            body=message.model_dump_json().encode(),
                            content_type="application/json",
                            priority=message.priority,
                        ),
                        routing_key=raw_message.routing_key or "",
                    )

            else:
                logger.error(
                    "Message exhausted retries, sending to DLQ: id=%s, error=%s",
                    message.id,
                    str(error),
                )
                raise MessageRetryExhaustedError(
                    f"Message {message.id} exhausted all retries",
                    cause=error,
                )

        except MessageDeserializationError:
            logger.error("Cannot deserialize failed message for retry, sending to DLQ")
            raise
        except MessageRetryExhaustedError:
            raise
        except Exception as retry_error:
            logger.error(
                "Failed to handle message failure: %s",
                str(retry_error),
            )
            raise MessageHandlerError(
                f"Failed to handle message failure: {retry_error}",
                cause=retry_error,
            ) from retry_error

    async def start(self) -> None:
        """
        Start consuming messages.

        This method sets up the queue and starts consuming messages.
        """
        if self._running:
            logger.warning("Consumer already running: %s", self._queue_name)
            return

        if not RabbitMQPool.is_initialized():
            raise RuntimeError("RabbitMQ pool not initialized")

        async with get_connection() as connection:
            channel = await connection.channel()
            await channel.set_qos(prefetch_count=self._prefetch_count)

            # Declare the queue
            queue = await declare_queue(
                channel,
                self._queue_name,
                self._routing_keys,
            )

            # Declare the dead letter queue
            await declare_dead_letter_queue(channel, self._queue_name)

            # Start consuming
            self._consumer_tag = await queue.consume(self._process_message)
            self._running = True

            logger.info(
                "Consumer started: queue=%s, routing_keys=%s",
                self._queue_name,
                self._routing_keys,
            )

            # Keep the consumer running
            while self._running:
                await asyncio.sleep(1)

    async def stop(self) -> None:
        """
        Stop consuming messages.
        """
        if not self._running:
            raise ConsumerNotStartedError("Consumer not started")

        self._running = False
        logger.info("Consumer stopped: %s", self._queue_name)
