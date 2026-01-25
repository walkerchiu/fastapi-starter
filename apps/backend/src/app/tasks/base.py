"""Base classes for task executors."""

from __future__ import annotations

import logging
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any

logger = logging.getLogger(__name__)


@dataclass
class TaskContext:
    """Context passed to task executors."""

    task_id: str
    task_name: str
    task_type: str
    execution_id: str
    context: dict[str, Any] = field(default_factory=dict)
    triggered_by: str = "scheduler"


@dataclass
class TaskResult:
    """Result returned by task executors."""

    success: bool
    message: str
    data: dict[str, Any] = field(default_factory=dict)
    started_at: datetime | None = None
    completed_at: datetime | None = None

    @property
    def duration_ms(self) -> int | None:
        """Calculate duration in milliseconds."""
        if self.started_at and self.completed_at:
            return int((self.completed_at - self.started_at).total_seconds() * 1000)
        return None


class TaskExecutor(ABC):
    """Base class for all task executors."""

    # Task type code (must be unique)
    task_type: str = ""
    # Human-readable name
    name: str = ""
    # Description
    description: str = ""
    # Default cron expression (optional)
    default_cron: str | None = None

    def __init__(self) -> None:
        """Initialize the executor."""
        self.logger = logging.getLogger(f"{__name__}.{self.__class__.__name__}")

    @abstractmethod
    async def execute(self, context: TaskContext) -> TaskResult:
        """
        Execute the task.

        Args:
            context: Task execution context with parameters

        Returns:
            TaskResult indicating success/failure and details
        """
        pass

    async def validate_context(self, context: TaskContext) -> tuple[bool, str]:
        """
        Validate the task context before execution.

        Override this method to add custom validation.

        Args:
            context: Task execution context

        Returns:
            Tuple of (is_valid, error_message)
        """
        return True, ""

    async def on_success(self, context: TaskContext, result: TaskResult) -> None:
        """
        Called after successful task execution.

        Override this method to add post-success logic.
        """
        self.logger.info(
            f"Task {context.task_name} completed successfully: {result.message}"
        )

    async def on_failure(self, context: TaskContext, result: TaskResult) -> None:
        """
        Called after failed task execution.

        Override this method to add post-failure logic.
        """
        self.logger.error(f"Task {context.task_name} failed: {result.message}")

    async def run(self, context: TaskContext) -> TaskResult:
        """
        Run the task with validation and callbacks.

        This is the main entry point for executing tasks.
        """
        from datetime import UTC

        started_at = datetime.now(UTC)

        # Validate context
        is_valid, error_message = await self.validate_context(context)
        if not is_valid:
            result = TaskResult(
                success=False,
                message=f"Validation failed: {error_message}",
                started_at=started_at,
                completed_at=datetime.now(UTC),
            )
            await self.on_failure(context, result)
            return result

        try:
            # Execute the task
            result = await self.execute(context)
            result.started_at = started_at
            result.completed_at = datetime.now(UTC)

            # Call appropriate callback
            if result.success:
                await self.on_success(context, result)
            else:
                await self.on_failure(context, result)

            return result

        except Exception as e:
            self.logger.exception(f"Task {context.task_name} raised an exception")
            result = TaskResult(
                success=False,
                message=f"Exception: {str(e)}",
                started_at=started_at,
                completed_at=datetime.now(UTC),
            )
            await self.on_failure(context, result)
            return result
