"""File worker for processing file messages from RabbitMQ."""

import logging

from src.app.messaging.handlers.file_handler import FileProcessingHandler
from src.app.workers.base import BaseWorker

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

logger = logging.getLogger(__name__)


def main() -> None:
    """Run the file worker."""
    logger.info("Starting file worker...")

    handlers = [
        FileProcessingHandler(),
    ]

    worker = BaseWorker(handlers)
    worker.run()


if __name__ == "__main__":
    main()
