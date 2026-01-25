"""Email worker for processing email messages from RabbitMQ."""

import logging

from src.app.messaging.handlers.email_handler import (
    EmailHandler,
    EmailVerificationHandler,
    PasswordResetEmailHandler,
)
from src.app.workers.base import BaseWorker

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

logger = logging.getLogger(__name__)


def main() -> None:
    """Run the email worker."""
    logger.info("Starting email worker...")

    handlers = [
        EmailHandler(),
        PasswordResetEmailHandler(),
        EmailVerificationHandler(),
    ]

    worker = BaseWorker(handlers)
    worker.run()


if __name__ == "__main__":
    main()
