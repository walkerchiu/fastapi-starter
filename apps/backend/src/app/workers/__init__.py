"""Worker processes for consuming RabbitMQ messages."""

from src.app.workers.base import BaseWorker

__all__ = ["BaseWorker"]
