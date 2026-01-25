"""Base worker class for RabbitMQ consumers."""

import asyncio
import logging
import signal
from collections.abc import Sequence

from src.app.core.config import settings
from src.app.core.rabbitmq import RabbitMQPool
from src.app.messaging.consumer import MessageConsumer

logger = logging.getLogger(__name__)


class BaseWorker:
    """
    Base class for worker processes that consume RabbitMQ messages.

    This class manages the lifecycle of multiple message consumers,
    including startup, shutdown, and signal handling.
    """

    def __init__(self, handlers: Sequence[MessageConsumer]) -> None:
        """
        Initialize the worker with a list of message handlers.

        Args:
            handlers: List of message consumers to run
        """
        self._handlers = list(handlers)
        self._running = False
        self._tasks: list[asyncio.Task] = []

    async def _setup(self) -> None:
        """Set up the worker (initialize connections, etc.)."""
        if not settings.rabbitmq_enabled:
            raise RuntimeError("RabbitMQ is disabled, cannot start worker")

        await RabbitMQPool.init_pool()
        logger.info("Worker setup complete")

    async def _teardown(self) -> None:
        """Tear down the worker (close connections, etc.)."""
        await RabbitMQPool.close_pool()
        logger.info("Worker teardown complete")

    def _setup_signal_handlers(self) -> None:
        """Set up signal handlers for graceful shutdown."""
        loop = asyncio.get_event_loop()

        for sig in (signal.SIGTERM, signal.SIGINT):
            loop.add_signal_handler(
                sig,
                lambda s=sig: asyncio.create_task(self._handle_signal(s)),
            )

        logger.info("Signal handlers registered")

    async def _handle_signal(self, sig: signal.Signals) -> None:
        """
        Handle a shutdown signal.

        Args:
            sig: The signal received
        """
        logger.info("Received signal %s, initiating shutdown...", sig.name)
        await self.stop()

    async def start(self) -> None:
        """Start the worker and all handlers."""
        if self._running:
            logger.warning("Worker already running")
            return

        self._running = True
        self._setup_signal_handlers()

        try:
            await self._setup()

            # Start all handlers as concurrent tasks
            for handler in self._handlers:
                task = asyncio.create_task(
                    handler.start(),
                    name=f"handler_{handler._queue_name}",
                )
                self._tasks.append(task)

            logger.info(
                "Worker started with %d handlers: %s",
                len(self._handlers),
                [h._queue_name for h in self._handlers],
            )

            # Wait for all tasks to complete (or be cancelled)
            await asyncio.gather(*self._tasks, return_exceptions=True)

        except Exception as e:
            logger.error("Worker error: %s", str(e))
            raise
        finally:
            await self._teardown()

    async def stop(self) -> None:
        """Stop the worker and all handlers."""
        if not self._running:
            return

        self._running = False
        logger.info("Stopping worker...")

        # Stop all handlers
        for handler in self._handlers:
            try:
                await handler.stop()
            except Exception as e:
                logger.warning(
                    "Error stopping handler %s: %s",
                    handler._queue_name,
                    str(e),
                )

        # Cancel all tasks
        for task in self._tasks:
            if not task.done():
                task.cancel()

        # Wait for tasks to be cancelled
        if self._tasks:
            await asyncio.gather(*self._tasks, return_exceptions=True)

        self._tasks.clear()
        logger.info("Worker stopped")

    def run(self) -> None:
        """Run the worker (blocking)."""
        asyncio.run(self.start())
