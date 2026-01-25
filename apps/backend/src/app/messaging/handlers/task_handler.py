"""Scheduled task message handler."""

from __future__ import annotations

import logging
from uuid import UUID

from src.app.db.session import async_session_maker
from src.app.messaging.consumer import MessageConsumer
from src.app.messaging.types import ScheduledTaskMessage
from src.app.models.task_execution import TaskExecutionStatus
from src.app.services.scheduled_task_service import ScheduledTaskService
from src.app.tasks.base import TaskContext
from src.app.tasks.registry import task_registry

logger = logging.getLogger(__name__)


class ScheduledTaskHandler(MessageConsumer[ScheduledTaskMessage]):
    """Handler for scheduled task messages."""

    queue_name = "task_queue"
    routing_keys = ["task.execute"]
    message_type = ScheduledTaskMessage
    prefetch_count = 5

    async def handle(self, message: ScheduledTaskMessage) -> None:
        """
        Handle a scheduled task message.

        Args:
            message: The task message to process
        """
        logger.info(
            "Processing scheduled task: task_id=%s, execution_id=%s, type=%s",
            message.task_id,
            message.execution_id,
            message.task_type,
        )

        async with async_session_maker() as db:
            service = ScheduledTaskService(db)

            try:
                # Update execution status to RUNNING
                await service.update_execution_status(
                    UUID(message.execution_id),
                    TaskExecutionStatus.RUNNING,
                )

                # Get the executor for this task type
                executor = task_registry.get(message.task_type)
                if not executor:
                    error_msg = f"No executor found for task type: {message.task_type}"
                    logger.error(error_msg)
                    await service.update_execution_status(
                        UUID(message.execution_id),
                        TaskExecutionStatus.FAILED,
                        error=error_msg,
                    )
                    return

                # Get task details for context
                task = await service.get_by_id(UUID(message.task_id))
                task_name = task.name if task else "unknown"

                # Build execution context
                context = TaskContext(
                    task_id=message.task_id,
                    task_name=task_name,
                    task_type=message.task_type,
                    execution_id=message.execution_id,
                    context=message.context or {},
                    triggered_by=message.triggered_by,
                )

                # Execute the task
                result = await executor.run(context)

                # Update execution status based on result
                if result.success:
                    await service.update_execution_status(
                        UUID(message.execution_id),
                        TaskExecutionStatus.SUCCESS,
                        result=result.data,
                    )
                    logger.info(
                        "Task completed successfully: task_id=%s, execution_id=%s",
                        message.task_id,
                        message.execution_id,
                    )
                else:
                    await service.update_execution_status(
                        UUID(message.execution_id),
                        TaskExecutionStatus.FAILED,
                        result=result.data,
                        error=result.message,
                    )
                    logger.warning(
                        "Task failed: task_id=%s, execution_id=%s, error=%s",
                        message.task_id,
                        message.execution_id,
                        result.message,
                    )

            except Exception as e:
                logger.exception(
                    "Error executing task: task_id=%s, execution_id=%s",
                    message.task_id,
                    message.execution_id,
                )
                await service.update_execution_status(
                    UUID(message.execution_id),
                    TaskExecutionStatus.FAILED,
                    error=str(e),
                )
                raise
