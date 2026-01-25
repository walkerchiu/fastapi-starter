"""Task worker for executing scheduled tasks from RabbitMQ."""

import logging

from src.app.messaging.handlers.task_handler import ScheduledTaskHandler
from src.app.tasks.registry import register_default_executors
from src.app.workers.base import BaseWorker

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

logger = logging.getLogger(__name__)


def main() -> None:
    """Run the task worker."""
    logger.info("Starting task worker...")

    # Register default task executors
    register_default_executors()
    logger.info("Task executors registered")

    handlers = [
        ScheduledTaskHandler(),
    ]

    worker = BaseWorker(handlers)
    worker.run()


if __name__ == "__main__":
    main()
