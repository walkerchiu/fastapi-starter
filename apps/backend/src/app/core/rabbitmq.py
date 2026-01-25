"""RabbitMQ connection pool management."""

import logging
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from typing import Any

import aio_pika
from aio_pika import Channel, Connection, ExchangeType
from aio_pika.abc import AbstractRobustConnection
from aio_pika.pool import Pool
from src.app.core.config import settings
from src.app.utils.retry import RetryStrategy, with_retry

logger = logging.getLogger(__name__)


class RabbitMQPool:
    """Manages RabbitMQ connection and channel pools."""

    _connection_pool: Pool[Connection] | None = None
    _channel_pool: Pool[Channel] | None = None

    @classmethod
    async def _get_connection(cls) -> AbstractRobustConnection:
        """Create a new RabbitMQ connection."""
        return await aio_pika.connect_robust(
            host=settings.rabbitmq_host,
            port=settings.rabbitmq_port,
            login=settings.rabbitmq_user,
            password=settings.rabbitmq_password,
            virtualhost=settings.rabbitmq_vhost,
            timeout=settings.rabbitmq_connection_timeout
            / 1000,  # Convert ms to seconds
            heartbeat=settings.rabbitmq_heartbeat,
        )

    @classmethod
    async def _get_channel(cls) -> Channel:
        """Get a channel from the connection pool."""
        if cls._connection_pool is None:
            raise RuntimeError("RabbitMQ pool not initialized")

        async with cls._connection_pool.acquire() as connection:
            return await connection.channel()

    @classmethod
    async def init_pool(cls) -> None:
        """Initialize RabbitMQ connection and channel pools."""
        if not settings.rabbitmq_enabled:
            logger.info("RabbitMQ is disabled, skipping pool initialization")
            return

        if cls._connection_pool is not None:
            logger.warning("RabbitMQ pool already initialized")
            return

        async def create_pool() -> None:
            cls._connection_pool = Pool(
                cls._get_connection,
                max_size=settings.rabbitmq_pool_size,
            )

            cls._channel_pool = Pool(
                cls._get_channel,
                max_size=settings.rabbitmq_pool_size * 2,
            )

            # Test connection
            async with cls._connection_pool.acquire() as connection:
                async with connection.channel() as channel:
                    # Declare main exchange
                    await channel.declare_exchange(
                        settings.rabbitmq_exchange_name,
                        ExchangeType.TOPIC,
                        durable=True,
                    )

                    # Declare dead letter exchange
                    await channel.declare_exchange(
                        settings.rabbitmq_dead_letter_exchange,
                        ExchangeType.TOPIC,
                        durable=True,
                    )

            logger.info(
                "RabbitMQ exchanges declared: %s, %s",
                settings.rabbitmq_exchange_name,
                settings.rabbitmq_dead_letter_exchange,
            )

        await with_retry(
            create_pool,
            max_retries=3,
            base_delay=0.5,
            max_delay=5.0,
            strategy=RetryStrategy.EXPONENTIAL,
            operation_name="rabbitmq_init",
        )

        logger.info(
            "RabbitMQ connection pool configured: pool_size=%d, host=%s:%d",
            settings.rabbitmq_pool_size,
            settings.rabbitmq_host,
            settings.rabbitmq_port,
        )

    @classmethod
    async def close_pool(cls) -> None:
        """Close RabbitMQ connection pools."""
        if cls._channel_pool is not None:
            await cls._channel_pool.close()
            cls._channel_pool = None

        if cls._connection_pool is not None:
            await cls._connection_pool.close()
            cls._connection_pool = None

        logger.info("RabbitMQ connection pools closed")

    @classmethod
    def is_initialized(cls) -> bool:
        """Check if the pool is initialized."""
        return cls._connection_pool is not None

    @classmethod
    def get_connection_pool(cls) -> Pool[Connection]:
        """Get the connection pool."""
        if cls._connection_pool is None:
            raise RuntimeError("RabbitMQ pool not initialized")
        return cls._connection_pool

    @classmethod
    def get_channel_pool(cls) -> Pool[Channel]:
        """Get the channel pool."""
        if cls._channel_pool is None:
            raise RuntimeError("RabbitMQ pool not initialized")
        return cls._channel_pool


@asynccontextmanager
async def get_channel() -> AsyncGenerator[Channel]:
    """
    Get a RabbitMQ channel from the pool.

    Usage:
        async with get_channel() as channel:
            await channel.default_exchange.publish(...)
    """
    if not settings.rabbitmq_enabled:
        raise RuntimeError("RabbitMQ is disabled")

    pool = RabbitMQPool.get_channel_pool()
    async with pool.acquire() as channel:
        yield channel


@asynccontextmanager
async def get_connection() -> AsyncGenerator[Connection]:
    """
    Get a RabbitMQ connection from the pool.

    Usage:
        async with get_connection() as connection:
            channel = await connection.channel()
            ...
    """
    if not settings.rabbitmq_enabled:
        raise RuntimeError("RabbitMQ is disabled")

    pool = RabbitMQPool.get_connection_pool()
    async with pool.acquire() as connection:
        yield connection


async def declare_queue(
    channel: Channel,
    queue_name: str,
    routing_keys: list[str],
    *,
    durable: bool = True,
    dead_letter: bool = True,
    arguments: dict[str, Any] | None = None,
) -> aio_pika.Queue:
    """
    Declare a queue and bind it to the exchange.

    Args:
        channel: RabbitMQ channel
        queue_name: Name of the queue
        routing_keys: List of routing keys to bind
        durable: Whether the queue should survive broker restarts
        dead_letter: Whether to configure dead letter routing
        arguments: Additional queue arguments

    Returns:
        The declared queue
    """
    queue_arguments = arguments or {}

    if dead_letter:
        queue_arguments["x-dead-letter-exchange"] = (
            settings.rabbitmq_dead_letter_exchange
        )
        queue_arguments["x-dead-letter-routing-key"] = f"{queue_name}.dead"

    queue = await channel.declare_queue(
        queue_name,
        durable=durable,
        arguments=queue_arguments,
    )

    # Get the exchange
    exchange = await channel.get_exchange(settings.rabbitmq_exchange_name)

    # Bind queue to exchange with routing keys
    for routing_key in routing_keys:
        await queue.bind(exchange, routing_key=routing_key)

    logger.debug(
        "Queue declared: %s, routing_keys=%s",
        queue_name,
        routing_keys,
    )

    return queue


async def declare_dead_letter_queue(
    channel: Channel,
    queue_name: str,
) -> aio_pika.Queue:
    """
    Declare a dead letter queue.

    Args:
        channel: RabbitMQ channel
        queue_name: Name of the original queue (will append '_dlq')

    Returns:
        The declared dead letter queue
    """
    dlq_name = f"{queue_name}_dlq"

    queue = await channel.declare_queue(
        dlq_name,
        durable=True,
    )

    # Get the dead letter exchange
    dlx = await channel.get_exchange(settings.rabbitmq_dead_letter_exchange)

    # Bind to dead letter routing key
    await queue.bind(dlx, routing_key=f"{queue_name}.dead")

    logger.debug("Dead letter queue declared: %s", dlq_name)

    return queue
