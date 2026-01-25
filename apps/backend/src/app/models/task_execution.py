"""Task execution model for tracking scheduled task runs."""

from datetime import datetime
from enum import Enum
from uuid import uuid4

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.app.db.base import Base


class TaskExecutionStatus(str, Enum):
    """Task execution status enum."""

    PENDING = "pending"
    RUNNING = "running"
    SUCCESS = "success"
    FAILED = "failed"
    CANCELLED = "cancelled"


class TaskTriggerType(str, Enum):
    """Task trigger type enum."""

    SCHEDULER = "scheduler"
    MANUAL = "manual"
    API = "api"


class TaskExecution(Base):
    """Task execution entity for tracking job runs."""

    __tablename__ = "task_executions"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        primary_key=True,
        default=lambda: str(uuid4()),
    )
    task_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("scheduled_tasks.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Execution state
    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default=TaskExecutionStatus.PENDING.value,
        index=True,
    )
    started_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    duration_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # Result
    result: Mapped[str | None] = mapped_column(
        Text, nullable=True
    )  # JSON stored as text
    error: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Retry tracking
    retry_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    # Trigger info
    triggered_by: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default=TaskTriggerType.SCHEDULER.value,
    )

    # Audit
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.now(),
    )

    # Relationships
    task: Mapped["ScheduledTask"] = relationship(
        "ScheduledTask",
        back_populates="executions",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<TaskExecution(id={self.id}, task_id={self.task_id}, status={self.status})>"


# Import at the end to avoid circular imports
from src.app.models.scheduled_task import ScheduledTask  # noqa: E402, F401
