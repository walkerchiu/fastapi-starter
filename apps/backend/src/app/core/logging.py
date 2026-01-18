"""Structured logging configuration using structlog."""

import logging
import os
import sys
from typing import Any

import structlog
from src.app.core.config import settings
from structlog.types import Processor


def add_service_info(
    logger: logging.Logger, method_name: str, event_dict: dict[str, Any]
) -> dict[str, Any]:
    """Add service metadata to log entries."""
    event_dict["service"] = "backend"
    event_dict["environment"] = settings.environment
    event_dict["version"] = os.getenv("APP_VERSION", "1.0.0")
    return event_dict


def add_request_id(
    logger: logging.Logger, method_name: str, event_dict: dict[str, Any]
) -> dict[str, Any]:
    """Add request ID if available in context."""
    from src.app.middleware.request_id import get_request_id

    request_id = get_request_id()
    if request_id:
        event_dict["request_id"] = request_id
    return event_dict


def setup_logging() -> None:
    """Configure structlog for structured logging."""
    log_level_str = os.getenv("LOG_LEVEL", "info").upper()
    log_format = os.getenv("LOG_FORMAT", "json")
    is_production = settings.environment == "production"
    use_json = log_format == "json" or is_production

    # Map log level string to logging constant
    log_level = getattr(logging, log_level_str, logging.INFO)

    # Shared processors for both dev and prod
    shared_processors: list[Processor] = [
        structlog.contextvars.merge_contextvars,
        structlog.stdlib.add_log_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.PositionalArgumentsFormatter(),
        add_service_info,
        add_request_id,
        structlog.processors.TimeStamper(fmt="iso", key="timestamp"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.UnicodeDecoder(),
    ]

    if use_json:
        # JSON format for production
        processors: list[Processor] = [
            *shared_processors,
            structlog.processors.format_exc_info,
            structlog.processors.JSONRenderer(),
        ]
    else:
        # Pretty format for development
        processors = [
            *shared_processors,
            structlog.dev.ConsoleRenderer(
                colors=True,
                exception_formatter=structlog.dev.plain_traceback,
            ),
        ]

    # Configure structlog
    structlog.configure(
        processors=processors,
        wrapper_class=structlog.make_filtering_bound_logger(log_level),
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        cache_logger_on_first_use=True,
    )

    # Also configure standard library logging
    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=log_level,
    )

    # Set levels for noisy loggers
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("uvicorn.error").setLevel(logging.INFO)
    logging.getLogger("sqlalchemy.engine").setLevel(
        logging.INFO if settings.database_echo else logging.WARNING
    )


def get_logger(name: str) -> structlog.stdlib.BoundLogger:
    """Get a structured logger with the given name."""
    return structlog.get_logger(name)


# Type alias for log context
LogContext = dict[str, Any]


class Logger:
    """Wrapper class for structured logging with consistent interface."""

    def __init__(self, name: str) -> None:
        """Initialize logger with given name."""
        self._logger = structlog.get_logger(name)

    def trace(self, message: str, **context: Any) -> None:
        """Log a trace level message (mapped to debug in Python)."""
        self._logger.debug(message, **context)

    def debug(self, message: str, **context: Any) -> None:
        """Log a debug level message."""
        self._logger.debug(message, **context)

    def info(self, message: str, **context: Any) -> None:
        """Log an info level message."""
        self._logger.info(message, **context)

    def warn(self, message: str, **context: Any) -> None:
        """Log a warning level message."""
        self._logger.warning(message, **context)

    def warning(self, message: str, **context: Any) -> None:
        """Log a warning level message (alias for warn)."""
        self._logger.warning(message, **context)

    def error(
        self, message: str, error: Exception | None = None, **context: Any
    ) -> None:
        """Log an error level message."""
        if error:
            context["error"] = {
                "code": context.pop("code", None),
                "message": str(error),
            }
            self._logger.error(message, exc_info=error, **context)
        else:
            self._logger.error(message, **context)

    def fatal(
        self, message: str, error: Exception | None = None, **context: Any
    ) -> None:
        """Log a fatal/critical level message."""
        if error:
            context["error"] = {
                "code": context.pop("code", None),
                "message": str(error),
            }
            self._logger.critical(message, exc_info=error, **context)
        else:
            self._logger.critical(message, **context)

    def bind(self, **context: Any) -> "Logger":
        """Create a new logger with additional bound context."""
        new_logger = Logger.__new__(Logger)
        new_logger._logger = self._logger.bind(**context)
        return new_logger
