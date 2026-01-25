"""Task executor registry for managing available task types."""

from __future__ import annotations

import logging
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from src.app.tasks.base import TaskExecutor

logger = logging.getLogger(__name__)


class TaskExecutorRegistry:
    """Registry for managing task executors."""

    def __init__(self) -> None:
        """Initialize the registry."""
        self._executors: dict[str, TaskExecutor] = {}

    def register(self, executor: TaskExecutor) -> None:
        """
        Register a task executor.

        Args:
            executor: The executor instance to register

        Raises:
            ValueError: If task_type is empty or already registered
        """
        if not executor.task_type:
            raise ValueError("Executor must have a non-empty task_type")

        if executor.task_type in self._executors:
            raise ValueError(
                f"Executor for task_type '{executor.task_type}' already registered"
            )

        self._executors[executor.task_type] = executor
        logger.info(f"Registered task executor: {executor.task_type} ({executor.name})")

    def unregister(self, task_type: str) -> bool:
        """
        Unregister a task executor.

        Args:
            task_type: The task type to unregister

        Returns:
            True if unregistered, False if not found
        """
        if task_type in self._executors:
            del self._executors[task_type]
            logger.info(f"Unregistered task executor: {task_type}")
            return True
        return False

    def get(self, task_type: str) -> TaskExecutor | None:
        """
        Get a task executor by type.

        Args:
            task_type: The task type to look up

        Returns:
            The executor or None if not found
        """
        return self._executors.get(task_type)

    def get_all(self) -> dict[str, TaskExecutor]:
        """
        Get all registered executors.

        Returns:
            Dictionary of task_type -> executor
        """
        return self._executors.copy()

    def list_types(self) -> list[str]:
        """
        List all registered task types.

        Returns:
            List of task type codes
        """
        return list(self._executors.keys())

    def get_info(self) -> list[dict]:
        """
        Get information about all registered executors.

        Returns:
            List of executor info dictionaries
        """
        return [
            {
                "code": executor.task_type,
                "name": executor.name,
                "description": executor.description,
                "default_cron": executor.default_cron,
            }
            for executor in self._executors.values()
        ]


# Global registry instance
task_registry = TaskExecutorRegistry()


def register_default_executors() -> None:
    """Register all default task executors."""
    from src.app.tasks.cleanup import CleanupTaskExecutor
    from src.app.tasks.notification import NotificationTaskExecutor
    from src.app.tasks.report import ReportTaskExecutor

    task_registry.register(CleanupTaskExecutor())
    task_registry.register(ReportTaskExecutor())
    task_registry.register(NotificationTaskExecutor())

    logger.info(f"Registered {len(task_registry.list_types())} default task executors")
