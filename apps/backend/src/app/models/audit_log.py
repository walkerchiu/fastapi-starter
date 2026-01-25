"""AuditLog model for tracking user operations, security events, and data changes."""

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import JSON, DateTime, ForeignKey, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.app.db.base import Base

if TYPE_CHECKING:
    from src.app.models.user import User


class AuditLog(Base):
    """AuditLog database model for tracking user operations and security events."""

    __tablename__ = "audit_logs"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True
    )
    action: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
        comment="Operation type (e.g., user.created)",
    )
    entity_type: Mapped[str] = mapped_column(
        String(50), nullable=False, index=True, comment="Entity type (e.g., User, Role)"
    )
    entity_id: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
        index=True,
        comment="Entity ID (UUID or integer ID as string)",
    )
    actor_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=True,
        index=True,
        comment="User ID who performed the action",
    )
    actor_ip: Mapped[str] = mapped_column(
        String(45), nullable=False, comment="IP address of the actor"
    )
    actor_user_agent: Mapped[str] = mapped_column(
        String(500), nullable=False, default="", comment="User agent of the actor"
    )
    changes: Mapped[dict | None] = mapped_column(
        JSON, nullable=True, comment="Changes before and after (for update operations)"
    )
    extra_data: Mapped[dict | None] = mapped_column(
        JSON, nullable=True, comment="Additional metadata"
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), index=True
    )

    # Relationships
    actor: Mapped["User | None"] = relationship(
        "User", back_populates="audit_logs", lazy="joined"
    )
