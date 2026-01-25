"""Pydantic schemas for scheduled tasks."""

from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator
from src.app.models.task_execution import TaskExecutionStatus, TaskTriggerType


# Task Type definitions
class TaskTypeInfo(BaseModel):
    """Information about a registered task type."""

    code: str
    name: str
    description: str
    default_cron: str | None = None
    context_schema: dict[str, Any] | None = None


# ScheduledTask schemas
class ScheduledTaskBase(BaseModel):
    """Base schema for scheduled tasks."""

    name: str = Field(..., min_length=1, max_length=100)
    description: str | None = Field(None, max_length=500)
    task_type: str = Field(..., min_length=1, max_length=50)
    cron_expression: str | None = Field(None, max_length=100)
    scheduled_at: datetime | None = None
    timezone: str = Field("UTC", max_length=50)
    is_active: bool = True
    context: dict[str, Any] | None = None

    @field_validator("cron_expression", "scheduled_at")
    @classmethod
    def validate_schedule(cls, v: Any, info: Any) -> Any:
        """Validate that either cron_expression or scheduled_at is set."""
        return v


class ScheduledTaskCreate(ScheduledTaskBase):
    """Schema for creating a scheduled task."""

    pass


class ScheduledTaskUpdate(BaseModel):
    """Schema for updating a scheduled task."""

    name: str | None = Field(None, min_length=1, max_length=100)
    description: str | None = Field(None, max_length=500)
    task_type: str | None = Field(None, min_length=1, max_length=50)
    cron_expression: str | None = Field(None, max_length=100)
    scheduled_at: datetime | None = None
    timezone: str | None = Field(None, max_length=50)
    is_active: bool | None = None
    context: dict[str, Any] | None = None


class ScheduledTaskResponse(ScheduledTaskBase):
    """Schema for scheduled task response."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    last_run_at: datetime | None = None
    next_run_at: datetime | None = None
    run_count: int = 0
    created_by_id: UUID | None = None
    created_at: datetime
    updated_at: datetime


class ScheduledTaskListResponse(BaseModel):
    """Schema for paginated scheduled task list."""

    items: list[ScheduledTaskResponse]
    total: int
    page: int
    limit: int
    pages: int


# TaskExecution schemas
class TaskExecutionResponse(BaseModel):
    """Schema for task execution response."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    task_id: UUID
    status: TaskExecutionStatus
    started_at: datetime | None = None
    completed_at: datetime | None = None
    duration_ms: int | None = None
    result: dict[str, Any] | None = None
    error: str | None = None
    retry_count: int = 0
    triggered_by: TaskTriggerType
    created_at: datetime


class TaskExecutionListResponse(BaseModel):
    """Schema for paginated task execution list."""

    items: list[TaskExecutionResponse]
    total: int
    page: int
    limit: int
    pages: int
