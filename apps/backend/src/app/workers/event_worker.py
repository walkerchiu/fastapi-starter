"""Event worker for processing domain events from RabbitMQ."""

import logging

from src.app.messaging.handlers.event_handler import (
    GenericEventHandler,
    UserLoggedInEventHandler,
    UserRegisteredEventHandler,
)
from src.app.workers.base import BaseWorker

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

logger = logging.getLogger(__name__)


def main() -> None:
    """Run the event worker."""
    logger.info("Starting event worker...")

    handlers = [
        UserRegisteredEventHandler(),
        UserLoggedInEventHandler(),
        GenericEventHandler(),
    ]

    worker = BaseWorker(handlers)
    worker.run()


if __name__ == "__main__":
    main()
