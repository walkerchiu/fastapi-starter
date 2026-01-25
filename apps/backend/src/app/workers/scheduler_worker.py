"""Scheduler worker for checking and dispatching due tasks."""

from __future__ import annotations

import asyncio
import logging
import signal

from src.app.core.config import settings
from src.app.core.rabbitmq import RabbitMQPool
from src.app.db.session import async_session_maker
from src.app.messaging.producer import MessageProducer
from src.app.messaging.types import ScheduledTaskMessage
from src.app.models.task_execution import TaskTriggerType
from src.app.services.scheduled_task_service import ScheduledTaskService

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

logger = logging.getLogger(__name__)


class SchedulerWorker:
    """
    Worker that periodically checks for due tasks and dispatches them.

    This worker runs as a separate process and:
    1. Periodically checks the database for tasks that are due
    2. Creates execution records for due tasks
    3. Publishes task messages to RabbitMQ for execution
    """

    def __init__(self, check_interval: int = 60) -> None:
        """
        Initialize the scheduler worker.

        Args:
            check_interval: Interval in seconds between checks (default: 60)
        """
        self._check_interval = check_interval
        self._running = False
        self._producer: MessageProducer | None = None

    async def _setup(self) -> None:
        """Set up the worker (initialize connections, etc.)."""
        if not settings.rabbitmq_enabled:
            raise RuntimeError("RabbitMQ is disabled, cannot start scheduler worker")

        await RabbitMQPool.init_pool()
        self._producer = MessageProducer()
        logger.info("Scheduler worker setup complete")

    async def _teardown(self) -> None:
        """Tear down the worker (close connections, etc.)."""
        await RabbitMQPool.close_pool()
        logger.info("Scheduler worker teardown complete")

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
        """Handle a shutdown signal."""
        logger.info("Received signal %s, initiating shutdown...", sig.name)
        await self.stop()

    async def _check_and_dispatch_tasks(self) -> int:
        """
        Check for due tasks and dispatch them for execution.

        Returns:
            Number of tasks dispatched
        """
        dispatched = 0

        async with async_session_maker() as db:
            service = ScheduledTaskService(db)

            # Get all due tasks
            due_tasks = await service.get_due_tasks()

            for task in due_tasks:
                try:
                    # Create execution record
                    execution = await service.create_execution(
                        task_id=task.id,
                        triggered_by=TaskTriggerType.SCHEDULER,
                    )

                    # Parse context (stored as JSON string)
                    import json

                    context = {}
                    if task.context:
                        try:
                            context = (
                                json.loads(task.context)
                                if isinstance(task.context, str)
                                else task.context
                            )
                        except json.JSONDecodeError:
                            context = {}

                    # Create and publish task message
                    message = ScheduledTaskMessage(
                        task_id=task.id,
                        task_type=task.task_type,
                        execution_id=execution.id,
                        context=context,
                        triggered_by="scheduler",
                    )

                    await self._producer.publish(
                        message,
                        routing_key="task.execute",
                        exchange="tasks",
                    )

                    # Mark task as run (updates next_run_at)
                    await service.mark_task_run(task.id)

                    dispatched += 1
                    logger.info(
                        "Dispatched task: id=%s, name=%s, type=%s, execution_id=%s",
                        task.id,
                        task.name,
                        task.task_type,
                        execution.id,
                    )

                except Exception as e:
                    logger.error(
                        "Error dispatching task %s: %s",
                        task.id,
                        str(e),
                    )

        return dispatched

    async def start(self) -> None:
        """Start the scheduler worker."""
        if self._running:
            logger.warning("Scheduler worker already running")
            return

        self._running = True
        self._setup_signal_handlers()

        try:
            await self._setup()

            logger.info(
                "Scheduler worker started (check interval: %d seconds)",
                self._check_interval,
            )

            while self._running:
                try:
                    dispatched = await self._check_and_dispatch_tasks()
                    if dispatched > 0:
                        logger.info("Dispatched %d tasks", dispatched)
                except Exception as e:
                    logger.error("Error in scheduler loop: %s", str(e))

                # Wait for next check interval
                await asyncio.sleep(self._check_interval)

        except Exception as e:
            logger.error("Scheduler worker error: %s", str(e))
            raise
        finally:
            await self._teardown()

    async def stop(self) -> None:
        """Stop the scheduler worker."""
        if not self._running:
            return

        self._running = False
        logger.info("Scheduler worker stopped")

    def run(self) -> None:
        """Run the scheduler worker (blocking)."""
        asyncio.run(self.start())


def main() -> None:
    """Run the scheduler worker."""
    logger.info("Starting scheduler worker...")

    # Check interval can be configured via environment
    check_interval = int(settings.scheduler_check_interval_seconds or 60)

    worker = SchedulerWorker(check_interval=check_interval)
    worker.run()


if __name__ == "__main__":
    main()
