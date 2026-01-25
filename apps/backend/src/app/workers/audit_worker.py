"""Audit worker for processing audit log messages from RabbitMQ."""

import logging

from src.app.messaging.handlers.audit_handler import AuditLogHandler
from src.app.workers.base import BaseWorker

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

logger = logging.getLogger(__name__)


def main() -> None:
    """Run the audit worker."""
    logger.info("Starting audit worker...")

    handlers = [
        AuditLogHandler(),
    ]

    worker = BaseWorker(handlers)
    worker.run()


if __name__ == "__main__":
    main()
