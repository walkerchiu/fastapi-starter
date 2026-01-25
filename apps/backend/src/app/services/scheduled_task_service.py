"""Scheduled task service for CRUD operations."""

from __future__ import annotations

import json
import logging
from datetime import UTC, datetime
from math import ceil
from uuid import UUID

from croniter import croniter
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from src.app.models.scheduled_task import ScheduledTask
from src.app.models.task_execution import (
    TaskExecution,
    TaskExecutionStatus,
    TaskTriggerType,
)
from src.app.schemas.scheduled_task import (
    ScheduledTaskCreate,
    ScheduledTaskListResponse,
    ScheduledTaskResponse,
    ScheduledTaskUpdate,
    TaskExecutionListResponse,
    TaskExecutionResponse,
)

logger = logging.getLogger(__name__)


class ScheduledTaskService:
    """Service for managing scheduled tasks."""

    def __init__(self, db: AsyncSession) -> None:
        """Initialize the service with a database session."""
        self.db = db

    async def create(
        self,
        data: ScheduledTaskCreate,
        created_by_id: UUID | None = None,
    ) -> ScheduledTask:
        """Create a new scheduled task."""
        # Calculate next run time
        next_run_at = self._calculate_next_run(
            data.cron_expression,
            data.scheduled_at,
            data.timezone,
        )

        # Serialize context to JSON string
        context_json = json.dumps(data.context) if data.context else None

        task = ScheduledTask(
            name=data.name,
            description=data.description,
            task_type=data.task_type,
            cron_expression=data.cron_expression,
            scheduled_at=data.scheduled_at,
            timezone=data.timezone,
            is_active=data.is_active,
            context=context_json,
            next_run_at=next_run_at,
            created_by_id=str(created_by_id) if created_by_id else None,
        )

        self.db.add(task)
        await self.db.commit()
        await self.db.refresh(task)

        logger.info(f"Created scheduled task: {task.id} ({task.name})")
        return task

    async def get_by_id(self, task_id: UUID) -> ScheduledTask | None:
        """Get a scheduled task by ID."""
        result = await self.db.execute(
            select(ScheduledTask).where(ScheduledTask.id == str(task_id))
        )
        return result.scalar_one_or_none()

    async def get_by_name(self, name: str) -> ScheduledTask | None:
        """Get a scheduled task by name."""
        result = await self.db.execute(
            select(ScheduledTask).where(ScheduledTask.name == name)
        )
        return result.scalar_one_or_none()

    async def list(
        self,
        page: int = 1,
        limit: int = 20,
        is_active: bool | None = None,
        task_type: str | None = None,
    ) -> ScheduledTaskListResponse:
        """List scheduled tasks with pagination."""
        query = select(ScheduledTask)

        if is_active is not None:
            query = query.where(ScheduledTask.is_active == is_active)
        if task_type is not None:
            query = query.where(ScheduledTask.task_type == task_type)

        # Count total
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await self.db.execute(count_query)
        total = total_result.scalar() or 0

        # Get paginated results
        query = query.order_by(ScheduledTask.created_at.desc())
        query = query.offset((page - 1) * limit).limit(limit)
        result = await self.db.execute(query)
        tasks = result.scalars().all()

        return ScheduledTaskListResponse(
            items=[self._to_response(task) for task in tasks],
            total=total,
            page=page,
            limit=limit,
            pages=ceil(total / limit) if limit > 0 else 0,
        )

    async def update(
        self,
        task_id: UUID,
        data: ScheduledTaskUpdate,
    ) -> ScheduledTask | None:
        """Update a scheduled task."""
        task = await self.get_by_id(task_id)
        if not task:
            return None

        update_data = data.model_dump(exclude_unset=True)

        # Handle context serialization
        if "context" in update_data:
            update_data["context"] = (
                json.dumps(update_data["context"]) if update_data["context"] else None
            )

        for field, value in update_data.items():
            setattr(task, field, value)

        # Recalculate next_run_at if schedule changed
        if "cron_expression" in update_data or "scheduled_at" in update_data:
            task.next_run_at = self._calculate_next_run(
                task.cron_expression,
                task.scheduled_at,
                task.timezone,
            )

        await self.db.commit()
        await self.db.refresh(task)

        logger.info(f"Updated scheduled task: {task.id}")
        return task

    async def delete(self, task_id: UUID) -> bool:
        """Delete a scheduled task."""
        task = await self.get_by_id(task_id)
        if not task:
            return False

        await self.db.delete(task)
        await self.db.commit()

        logger.info(f"Deleted scheduled task: {task_id}")
        return True

    async def enable(self, task_id: UUID) -> ScheduledTask | None:
        """Enable a scheduled task."""
        task = await self.get_by_id(task_id)
        if not task:
            return None

        task.is_active = True
        task.next_run_at = self._calculate_next_run(
            task.cron_expression,
            task.scheduled_at,
            task.timezone,
        )

        await self.db.commit()
        await self.db.refresh(task)

        logger.info(f"Enabled scheduled task: {task_id}")
        return task

    async def disable(self, task_id: UUID) -> ScheduledTask | None:
        """Disable a scheduled task."""
        task = await self.get_by_id(task_id)
        if not task:
            return None

        task.is_active = False
        await self.db.commit()
        await self.db.refresh(task)

        logger.info(f"Disabled scheduled task: {task_id}")
        return task

    async def get_due_tasks(self) -> list[ScheduledTask]:
        """Get all active tasks that are due to run."""
        now = datetime.now(UTC)
        result = await self.db.execute(
            select(ScheduledTask)
            .where(ScheduledTask.is_active == True)  # noqa: E712
            .where(ScheduledTask.next_run_at <= now)
        )
        return list(result.scalars().all())

    async def mark_task_run(self, task_id: UUID) -> None:
        """Mark a task as having been run and calculate next run time."""
        task = await self.get_by_id(task_id)
        if not task:
            return

        now = datetime.now(UTC)
        task.last_run_at = now
        task.run_count += 1

        # Calculate next run for cron tasks
        if task.cron_expression:
            task.next_run_at = self._calculate_next_run(
                task.cron_expression,
                None,
                task.timezone,
            )
        else:
            # One-time task: disable after running
            task.is_active = False
            task.next_run_at = None

        await self.db.commit()

    async def create_execution(
        self,
        task_id: UUID,
        triggered_by: TaskTriggerType = TaskTriggerType.SCHEDULER,
    ) -> TaskExecution:
        """Create a new task execution record."""
        execution = TaskExecution(
            task_id=str(task_id),
            status=TaskExecutionStatus.PENDING,
            triggered_by=triggered_by,
        )

        self.db.add(execution)
        await self.db.commit()
        await self.db.refresh(execution)

        return execution

    async def update_execution_status(
        self,
        execution_id: UUID,
        status: TaskExecutionStatus,
        result: dict | None = None,
        error: str | None = None,
    ) -> TaskExecution | None:
        """Update execution status."""
        query = select(TaskExecution).where(TaskExecution.id == str(execution_id))
        db_result = await self.db.execute(query)
        execution = db_result.scalar_one_or_none()

        if not execution:
            return None

        now = datetime.now(UTC)

        if status == TaskExecutionStatus.RUNNING and execution.started_at is None:
            execution.started_at = now

        if status in (
            TaskExecutionStatus.SUCCESS,
            TaskExecutionStatus.FAILED,
            TaskExecutionStatus.CANCELLED,
        ):
            execution.completed_at = now
            if execution.started_at:
                execution.duration_ms = int(
                    (now - execution.started_at).total_seconds() * 1000
                )

        execution.status = status
        if result is not None:
            execution.result = json.dumps(result)
        if error is not None:
            execution.error = error

        await self.db.commit()
        await self.db.refresh(execution)

        return execution

    async def get_executions(
        self,
        task_id: UUID,
        page: int = 1,
        limit: int = 20,
    ) -> TaskExecutionListResponse:
        """Get task execution history."""
        query = select(TaskExecution).where(TaskExecution.task_id == str(task_id))

        # Count total
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await self.db.execute(count_query)
        total = total_result.scalar() or 0

        # Get paginated results
        query = query.order_by(TaskExecution.created_at.desc())
        query = query.offset((page - 1) * limit).limit(limit)
        result = await self.db.execute(query)
        executions = result.scalars().all()

        return TaskExecutionListResponse(
            items=[self._execution_to_response(e) for e in executions],
            total=total,
            page=page,
            limit=limit,
            pages=ceil(total / limit) if limit > 0 else 0,
        )

    def _calculate_next_run(
        self,
        cron_expression: str | None,
        scheduled_at: datetime | None,
        timezone: str,
    ) -> datetime | None:
        """Calculate the next run time based on cron expression or scheduled_at."""
        if scheduled_at:
            return scheduled_at

        if cron_expression:
            try:
                cron = croniter(cron_expression, datetime.now(UTC))
                return cron.get_next(datetime)
            except (KeyError, ValueError) as e:
                logger.warning(
                    f"Invalid cron expression: {cron_expression}, error: {e}"
                )
                return None

        return None

    def _to_response(self, task: ScheduledTask) -> ScheduledTaskResponse:
        """Convert a task entity to response schema."""
        # Parse context from JSON string
        context = None
        if task.context:
            try:
                context = (
                    json.loads(task.context)
                    if isinstance(task.context, str)
                    else task.context
                )
            except json.JSONDecodeError:
                context = None

        return ScheduledTaskResponse(
            id=UUID(task.id),
            name=task.name,
            description=task.description,
            task_type=task.task_type,
            cron_expression=task.cron_expression,
            scheduled_at=task.scheduled_at,
            timezone=task.timezone,
            is_active=task.is_active,
            context=context,
            last_run_at=task.last_run_at,
            next_run_at=task.next_run_at,
            run_count=task.run_count,
            created_by_id=UUID(task.created_by_id) if task.created_by_id else None,
            created_at=task.created_at,
            updated_at=task.updated_at,
        )

    def _execution_to_response(self, execution: TaskExecution) -> TaskExecutionResponse:
        """Convert an execution entity to response schema."""
        # Parse result from JSON string
        result = None
        if execution.result:
            try:
                result = (
                    json.loads(execution.result)
                    if isinstance(execution.result, str)
                    else execution.result
                )
            except json.JSONDecodeError:
                result = None

        return TaskExecutionResponse(
            id=UUID(execution.id),
            task_id=UUID(execution.task_id),
            status=TaskExecutionStatus(execution.status),
            started_at=execution.started_at,
            completed_at=execution.completed_at,
            duration_ms=execution.duration_ms,
            result=result,
            error=execution.error,
            retry_count=execution.retry_count,
            triggered_by=TaskTriggerType(execution.triggered_by),
            created_at=execution.created_at,
        )
