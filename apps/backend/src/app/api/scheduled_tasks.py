"""Scheduled Task API endpoints."""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Path, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from src.app.core.deps import require_permissions, require_superadmin
from src.app.core.exceptions import NotFoundException
from src.app.core.rabbitmq import RabbitMQPool
from src.app.db import get_db
from src.app.messaging.producer import MessageProducer
from src.app.messaging.types import ScheduledTaskMessage
from src.app.models import User
from src.app.models.task_execution import TaskTriggerType
from src.app.schemas import (
    ErrorResponse,
    MessageResponse,
    ScheduledTaskCreate,
    ScheduledTaskListResponse,
    ScheduledTaskResponse,
    ScheduledTaskUpdate,
    TaskExecutionListResponse,
    TaskExecutionResponse,
    TaskTypeInfo,
)
from src.app.services import ScheduledTaskService
from src.app.tasks.registry import task_registry

router = APIRouter(prefix="/scheduled-tasks", tags=["scheduled-tasks"])

# Permission dependencies
RequireTasksRead = Annotated[User, Depends(require_permissions("tasks:read"))]
RequireSuperAdmin = Annotated[User, Depends(require_superadmin())]


async def get_task_service(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> ScheduledTaskService:
    """Dependency to get scheduled task service."""
    return ScheduledTaskService(db)


@router.get(
    "/types",
    response_model=list[TaskTypeInfo],
    summary="List available task types",
    description="Retrieve a list of all registered task executor types.",
    responses={
        200: {"description": "List of task types"},
    },
)
async def list_task_types(
    _current_user: RequireTasksRead,
) -> list[TaskTypeInfo]:
    """List all registered task types."""
    return [
        TaskTypeInfo(
            code=info["type"],
            name=info["name"],
            description=info["description"],
            default_cron=info.get("default_cron"),
        )
        for info in task_registry.get_info()
    ]


@router.get(
    "",
    summary="List scheduled tasks",
    description="""
Retrieve a paginated list of scheduled tasks.

**Pagination parameters:**
- `page`: Page number (default: 1)
- `limit`: Maximum number of items to return (default: 20, max: 100)

**Filter parameters:**
- `is_active`: Filter by active status (optional)
- `task_type`: Filter by task type (optional)
    """,
    responses={
        200: {"description": "List of scheduled tasks with pagination info"},
        422: {"model": ErrorResponse, "description": "Validation error"},
    },
)
async def list_scheduled_tasks(
    _current_user: RequireTasksRead,
    service: Annotated[ScheduledTaskService, Depends(get_task_service)],
    page: Annotated[int, Query(ge=1, description="Page number")] = 1,
    limit: Annotated[int, Query(ge=1, le=100, description="Items per page")] = 20,
    is_active: Annotated[
        bool | None, Query(description="Filter by active status")
    ] = None,
    task_type: Annotated[str | None, Query(description="Filter by task type")] = None,
) -> ScheduledTaskListResponse:
    """List all scheduled tasks with pagination."""
    result = await service.list_tasks(
        page=page,
        limit=limit,
        is_active=is_active,
        task_type=task_type,
    )
    pages = (result.total + limit - 1) // limit if result.total > 0 else 1
    return ScheduledTaskListResponse(
        items=[ScheduledTaskResponse.model_validate(t) for t in result.items],
        total=result.total,
        page=page,
        limit=limit,
        pages=pages,
    )


@router.post(
    "",
    response_model=ScheduledTaskResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create scheduled task",
    description="""
Create a new scheduled task.

**Required fields:**
- `name`: Task name
- `task_type`: Type of task (must be a registered executor)

**Schedule (one required):**
- `cron_expression`: Cron expression for recurring tasks
- `scheduled_at`: Datetime for one-time tasks

**Optional fields:**
- `description`: Task description
- `timezone`: Timezone for schedule (default: UTC)
- `is_active`: Whether task is active (default: true)
- `context`: Additional context data for the task
    """,
    responses={
        201: {"description": "Task successfully created"},
        400: {"model": ErrorResponse, "description": "Invalid task type or schedule"},
        422: {"model": ErrorResponse, "description": "Validation error"},
    },
)
async def create_scheduled_task(
    current_user: RequireSuperAdmin,
    task_in: ScheduledTaskCreate,
    service: Annotated[ScheduledTaskService, Depends(get_task_service)],
) -> ScheduledTaskResponse:
    """Create a new scheduled task."""
    task = await service.create(task_in, created_by_id=current_user.id)
    return ScheduledTaskResponse.model_validate(task)


@router.get(
    "/{id}",
    response_model=ScheduledTaskResponse,
    summary="Get scheduled task by ID",
    description="Retrieve a specific scheduled task by its ID.",
    responses={
        200: {"description": "Scheduled task details"},
        404: {"model": ErrorResponse, "description": "Task not found"},
        422: {"model": ErrorResponse, "description": "Validation error"},
    },
)
async def get_scheduled_task(
    _current_user: RequireTasksRead,
    id: Annotated[UUID, Path(description="The ID of the task to retrieve")],
    service: Annotated[ScheduledTaskService, Depends(get_task_service)],
) -> ScheduledTaskResponse:
    """Get a scheduled task by ID."""
    task = await service.get_by_id(id)
    if not task:
        raise NotFoundException(
            detail=f"Scheduled task with ID '{id}' not found",
            resource="scheduled_task",
            resource_id=str(id),
        )
    return ScheduledTaskResponse.model_validate(task)


@router.patch(
    "/{id}",
    response_model=ScheduledTaskResponse,
    summary="Update scheduled task",
    description="""
Update a scheduled task's information. Only provided fields will be updated.

**Updatable fields:**
- `name`: Task name
- `description`: Task description
- `task_type`: Task type
- `cron_expression`: Cron expression
- `scheduled_at`: One-time schedule datetime
- `timezone`: Schedule timezone
- `is_active`: Active status
- `context`: Additional context data
    """,
    responses={
        200: {"description": "Task successfully updated"},
        404: {"model": ErrorResponse, "description": "Task not found"},
        422: {"model": ErrorResponse, "description": "Validation error"},
    },
)
async def update_scheduled_task(
    _current_user: RequireSuperAdmin,
    id: Annotated[UUID, Path(description="The ID of the task to update")],
    task_in: ScheduledTaskUpdate,
    service: Annotated[ScheduledTaskService, Depends(get_task_service)],
) -> ScheduledTaskResponse:
    """Update a scheduled task."""
    task = await service.update(id, task_in)
    if not task:
        raise NotFoundException(
            detail=f"Scheduled task with ID '{id}' not found",
            resource="scheduled_task",
            resource_id=str(id),
        )
    return ScheduledTaskResponse.model_validate(task)


@router.delete(
    "/{id}",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Delete scheduled task",
    description="Permanently delete a scheduled task by its ID.",
    responses={
        200: {"description": "Task successfully deleted"},
        404: {"model": ErrorResponse, "description": "Task not found"},
        422: {"model": ErrorResponse, "description": "Validation error"},
    },
)
async def delete_scheduled_task(
    _current_user: RequireSuperAdmin,
    id: Annotated[UUID, Path(description="The ID of the task to delete")],
    service: Annotated[ScheduledTaskService, Depends(get_task_service)],
) -> MessageResponse:
    """Delete a scheduled task."""
    deleted = await service.delete(id)
    if not deleted:
        raise NotFoundException(
            detail=f"Scheduled task with ID '{id}' not found",
            resource="scheduled_task",
            resource_id=str(id),
        )
    return MessageResponse(message="Scheduled task deleted successfully")


@router.post(
    "/{id}/enable",
    response_model=ScheduledTaskResponse,
    summary="Enable scheduled task",
    description="Enable a disabled scheduled task.",
    responses={
        200: {"description": "Task enabled"},
        404: {"model": ErrorResponse, "description": "Task not found"},
        422: {"model": ErrorResponse, "description": "Validation error"},
    },
)
async def enable_scheduled_task(
    _current_user: RequireSuperAdmin,
    id: Annotated[UUID, Path(description="The ID of the task to enable")],
    service: Annotated[ScheduledTaskService, Depends(get_task_service)],
) -> ScheduledTaskResponse:
    """Enable a scheduled task."""
    task = await service.enable(id)
    if not task:
        raise NotFoundException(
            detail=f"Scheduled task with ID '{id}' not found",
            resource="scheduled_task",
            resource_id=str(id),
        )
    return ScheduledTaskResponse.model_validate(task)


@router.post(
    "/{id}/disable",
    response_model=ScheduledTaskResponse,
    summary="Disable scheduled task",
    description="Disable an active scheduled task.",
    responses={
        200: {"description": "Task disabled"},
        404: {"model": ErrorResponse, "description": "Task not found"},
        422: {"model": ErrorResponse, "description": "Validation error"},
    },
)
async def disable_scheduled_task(
    _current_user: RequireSuperAdmin,
    id: Annotated[UUID, Path(description="The ID of the task to disable")],
    service: Annotated[ScheduledTaskService, Depends(get_task_service)],
) -> ScheduledTaskResponse:
    """Disable a scheduled task."""
    task = await service.disable(id)
    if not task:
        raise NotFoundException(
            detail=f"Scheduled task with ID '{id}' not found",
            resource="scheduled_task",
            resource_id=str(id),
        )
    return ScheduledTaskResponse.model_validate(task)


@router.post(
    "/{id}/trigger",
    response_model=TaskExecutionResponse,
    summary="Manually trigger task execution",
    description="""
Manually trigger a scheduled task execution.

This creates an execution record and publishes the task to the queue
for immediate execution, regardless of the task's schedule.
    """,
    responses={
        200: {"description": "Task triggered, execution created"},
        404: {"model": ErrorResponse, "description": "Task not found"},
        422: {"model": ErrorResponse, "description": "Validation error"},
        503: {"model": ErrorResponse, "description": "RabbitMQ not available"},
    },
)
async def trigger_scheduled_task(
    _current_user: RequireSuperAdmin,
    id: Annotated[UUID, Path(description="The ID of the task to trigger")],
    service: Annotated[ScheduledTaskService, Depends(get_task_service)],
) -> TaskExecutionResponse:
    """Manually trigger a scheduled task."""
    # Get the task
    task = await service.get_by_id(id)
    if not task:
        raise NotFoundException(
            detail=f"Scheduled task with ID '{id}' not found",
            resource="scheduled_task",
            resource_id=str(id),
        )

    # Create execution record
    execution = await service.create_execution(
        task_id=id,
        triggered_by=TaskTriggerType.MANUAL,
    )

    # Publish to RabbitMQ if enabled
    from src.app.core.config import settings

    if settings.rabbitmq_enabled:
        await RabbitMQPool.init_pool()
        producer = MessageProducer()

        # Parse context
        import json

        context = {}
        if task.context:
            try:
                context = (
                    json.loads(task.context)
                    if isinstance(task.context, str)
                    else task.context
                )
            except json.JSONDecodeError:
                context = {}

        message = ScheduledTaskMessage(
            task_id=str(task.id),
            task_type=task.task_type,
            execution_id=str(execution.id),
            context=context,
            triggered_by="manual",
        )
        await producer.publish(message, routing_key="task.execute", exchange="tasks")

    return TaskExecutionResponse.model_validate(execution)


@router.get(
    "/{id}/executions",
    summary="List task executions",
    description="""
Retrieve the execution history of a scheduled task.

**Pagination parameters:**
- `page`: Page number (default: 1)
- `limit`: Maximum number of items to return (default: 20, max: 100)
    """,
    responses={
        200: {"description": "List of task executions with pagination info"},
        404: {"model": ErrorResponse, "description": "Task not found"},
        422: {"model": ErrorResponse, "description": "Validation error"},
    },
)
async def list_task_executions(
    _current_user: RequireTasksRead,
    id: Annotated[UUID, Path(description="The ID of the task")],
    service: Annotated[ScheduledTaskService, Depends(get_task_service)],
    page: Annotated[int, Query(ge=1, description="Page number")] = 1,
    limit: Annotated[int, Query(ge=1, le=100, description="Items per page")] = 20,
) -> TaskExecutionListResponse:
    """List executions for a scheduled task."""
    # Verify task exists
    task = await service.get_by_id(id)
    if not task:
        raise NotFoundException(
            detail=f"Scheduled task with ID '{id}' not found",
            resource="scheduled_task",
            resource_id=str(id),
        )

    result = await service.get_executions(
        task_id=id,
        page=page,
        limit=limit,
    )
    pages = (result.total + limit - 1) // limit if result.total > 0 else 1
    return TaskExecutionListResponse(
        items=[TaskExecutionResponse.model_validate(e) for e in result.items],
        total=result.total,
        page=page,
        limit=limit,
        pages=pages,
    )
