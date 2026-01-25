"""Scheduled task model for recurring and one-time jobs."""

from datetime import datetime
from typing import TYPE_CHECKING
from uuid import uuid4

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.app.db.base import Base

if TYPE_CHECKING:
    from src.app.models.task_execution import TaskExecution
    from src.app.models.user import User


class ScheduledTask(Base):
    """Scheduled task entity for cron and one-time jobs."""

    __tablename__ = "scheduled_tasks"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        primary_key=True,
        default=lambda: str(uuid4()),
    )
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    task_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)

    # Scheduling: either cron_expression OR scheduled_at should be set
    cron_expression: Mapped[str | None] = mapped_column(String(100), nullable=True)
    scheduled_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    timezone: Mapped[str] = mapped_column(String(50), nullable=False, default="UTC")

    # State
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    context: Mapped[dict | None] = mapped_column(
        Text, nullable=True
    )  # JSON stored as text

    # Execution tracking
    last_run_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    next_run_at: Mapped[datetime | None] = mapped_column(
        DateTime, nullable=True, index=True
    )
    run_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    # Audit
    created_by_id: Mapped[str | None] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    # Relationships
    created_by: Mapped["User | None"] = relationship(
        "User",
        back_populates="scheduled_tasks",
        lazy="selectin",
    )
    executions: Mapped[list["TaskExecution"]] = relationship(
        "TaskExecution",
        back_populates="task",
        lazy="selectin",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<ScheduledTask(id={self.id}, name={self.name}, task_type={self.task_type})>"
