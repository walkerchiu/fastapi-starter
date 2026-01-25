"""Graceful shutdown state management."""

import asyncio
import signal
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from typing import Any

from src.app.core.config import settings
from src.app.core.logging import get_logger

logger = get_logger(__name__)


class ShutdownState:
    """Manages application shutdown state for graceful shutdown."""

    def __init__(self) -> None:
        self._is_shutting_down = False
        self._shutdown_event = asyncio.Event()

    @property
    def is_shutting_down(self) -> bool:
        """Check if the application is in shutdown state."""
        return self._is_shutting_down

    def initiate_shutdown(self, signal_name: str | None = None) -> None:
        """Initiate graceful shutdown."""
        if not self._is_shutting_down:
            self._is_shutting_down = True
            self._shutdown_event.set()
            logger.info(
                "Graceful shutdown initiated",
                extra={"signal": signal_name or "unknown"},
            )

    async def wait_for_shutdown(self) -> None:
        """Wait for shutdown signal."""
        await self._shutdown_event.wait()


# Global shutdown state instance
shutdown_state = ShutdownState()


def _signal_handler(signum: int, frame: Any) -> None:
    """Handle OS signals for graceful shutdown."""
    signal_name = signal.Signals(signum).name
    shutdown_state.initiate_shutdown(signal_name)


def setup_signal_handlers() -> None:
    """Setup signal handlers for graceful shutdown."""
    signal.signal(signal.SIGTERM, _signal_handler)
    signal.signal(signal.SIGINT, _signal_handler)
    logger.info("Signal handlers registered for graceful shutdown")


@asynccontextmanager
async def lifespan(app: Any) -> AsyncGenerator[None]:
    """Application lifespan context manager for startup and shutdown events."""
    # Startup
    setup_signal_handlers()

    # Initialize Redis pool
    from src.app.core.redis import RedisPool

    await RedisPool.init_pool()

    # Initialize RabbitMQ pool (if enabled)
    if settings.rabbitmq_enabled:
        from src.app.core.rabbitmq import RabbitMQPool

        try:
            await RabbitMQPool.init_pool()
            logger.info("RabbitMQ connection pool initialized")
        except Exception as e:
            logger.warning(
                "Failed to initialize RabbitMQ, continuing without it",
                extra={"error": str(e)},
            )

    logger.info("Application startup complete")

    yield

    # Shutdown
    shutdown_state.initiate_shutdown("lifespan_shutdown")

    # Allow time for load balancer to detect unhealthy state
    logger.info("Waiting for connections to drain...")
    await asyncio.sleep(settings.shutdown_drain_delay)

    # Close RabbitMQ connection (if enabled)
    if settings.rabbitmq_enabled:
        try:
            from src.app.core.rabbitmq import RabbitMQPool

            await RabbitMQPool.close_pool()
            logger.info("RabbitMQ connection closed")
        except Exception as e:
            logger.warning("Failed to close RabbitMQ", extra={"error": str(e)})

    # Close Redis connection
    try:
        await RedisPool.close_pool()
        logger.info("Redis connection closed")
    except Exception as e:
        logger.warning("Failed to close Redis", extra={"error": str(e)})

    # Close database connection
    try:
        from src.app.db.session import engine

        await engine.dispose()
        logger.info("Database connection closed")
    except Exception as e:
        logger.warning("Failed to close database", extra={"error": str(e)})

    logger.info("Application shutdown complete")
