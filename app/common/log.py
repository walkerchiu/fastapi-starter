from __future__ import annotations
import os

from loguru import logger
import loguru

from app.core import LogPath
from app.core.conf import settings


class Logger:
    def __init__(self):
        # Initialize the logger with the log path
        self.log_path = LogPath

    def log(self) -> loguru.Logger:
        # Check if the log path exists, create it if not
        if not os.path.exists(self.log_path):
            os.mkdir(self.log_path)

        # Define log file paths for stdout and stderr
        log_stdout_file = os.path.join(self.log_path, settings.LOG_STDOUT_FILENAME)
        log_stderr_file = os.path.join(self.log_path, settings.LOG_STDERR_FILENAME)

        # Configure log rotation, retention, and compression settings
        log_config = dict(
            rotation="10 MB", retention="7 days", compression="tar.gz", enqueue=True
        )
        # Configure logger for stdout
        logger.add(
            log_stdout_file,
            level="INFO",
            filter=lambda record: record["level"].name == "INFO"
            or record["level"].no <= 25,
            **log_config,
            backtrace=False,
            diagnose=False,
        )
        # Configure logger for stderr
        logger.add(
            log_stderr_file,
            level="ERROR",
            filter=lambda record: record["level"].name == "ERROR"
            or record["level"].no >= 30,
            **log_config,
            backtrace=True,
            diagnose=True,
        )

        return logger


# Create a logger instance and assign it to log variable
log = Logger().log()
