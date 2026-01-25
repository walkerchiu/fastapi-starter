"""Audit log service layer for database operations."""

from typing import Any
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload
from src.app.models import AuditLog
from src.app.schemas.audit_log import AuditLogCreate, AuditLogFilter


class AuditLogNotFoundError(Exception):
    """Raised when an audit log is not found."""

    pass


class AuditService:
    """Service class for audit log database operations."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, audit_log_id: UUID) -> AuditLog:
        """Get an audit log by ID.

        Args:
            audit_log_id: The audit log ID to look up.
        """
        query = (
            select(AuditLog)
            .options(joinedload(AuditLog.actor))
            .where(AuditLog.id == audit_log_id)
        )
        result = await self.db.execute(query)
        audit_log = result.unique().scalar_one_or_none()
        if not audit_log:
            raise AuditLogNotFoundError(f"Audit log with id {audit_log_id} not found")
        return audit_log

    async def list_logs(
        self,
        filter_params: AuditLogFilter | None = None,
        skip: int = 0,
        limit: int = 100,
    ) -> tuple[list[AuditLog], int]:
        """List audit logs with optional filters. Returns (logs, total_count).

        Args:
            filter_params: Optional filter parameters.
            skip: Number of records to skip.
            limit: Maximum number of records to return.
        """
        # Build base query
        base_query = select(AuditLog).options(joinedload(AuditLog.actor))
        count_query = select(func.count()).select_from(AuditLog)

        # Apply filters
        if filter_params:
            if filter_params.action:
                base_query = base_query.where(AuditLog.action == filter_params.action)
                count_query = count_query.where(AuditLog.action == filter_params.action)
            if filter_params.entity_type:
                base_query = base_query.where(
                    AuditLog.entity_type == filter_params.entity_type
                )
                count_query = count_query.where(
                    AuditLog.entity_type == filter_params.entity_type
                )
            if filter_params.entity_id:
                base_query = base_query.where(
                    AuditLog.entity_id == filter_params.entity_id
                )
                count_query = count_query.where(
                    AuditLog.entity_id == filter_params.entity_id
                )
            if filter_params.actor_id:
                base_query = base_query.where(
                    AuditLog.actor_id == filter_params.actor_id
                )
                count_query = count_query.where(
                    AuditLog.actor_id == filter_params.actor_id
                )
            if filter_params.start_date:
                base_query = base_query.where(
                    AuditLog.created_at >= filter_params.start_date
                )
                count_query = count_query.where(
                    AuditLog.created_at >= filter_params.start_date
                )
            if filter_params.end_date:
                base_query = base_query.where(
                    AuditLog.created_at <= filter_params.end_date
                )
                count_query = count_query.where(
                    AuditLog.created_at <= filter_params.end_date
                )

        # Get total count
        count_result = await self.db.execute(count_query)
        total = count_result.scalar() or 0

        # Get paginated items (ordered by created_at desc)
        result = await self.db.execute(
            base_query.order_by(AuditLog.created_at.desc()).offset(skip).limit(limit)
        )
        logs = list(result.unique().scalars().all())

        return logs, total

    async def get_by_entity(
        self,
        entity_type: str,
        entity_id: UUID,
        skip: int = 0,
        limit: int = 100,
    ) -> tuple[list[AuditLog], int]:
        """Get audit logs for a specific entity. Returns (logs, total_count).

        Args:
            entity_type: The entity type to filter by.
            entity_id: The entity ID to filter by.
            skip: Number of records to skip.
            limit: Maximum number of records to return.
        """
        filter_params = AuditLogFilter(entity_type=entity_type, entity_id=entity_id)
        return await self.list_logs(filter_params, skip, limit)

    async def get_by_actor(
        self,
        actor_id: UUID,
        skip: int = 0,
        limit: int = 100,
    ) -> tuple[list[AuditLog], int]:
        """Get audit logs for a specific actor. Returns (logs, total_count).

        Args:
            actor_id: The actor ID to filter by.
            skip: Number of records to skip.
            limit: Maximum number of records to return.
        """
        filter_params = AuditLogFilter(actor_id=actor_id)
        return await self.list_logs(filter_params, skip, limit)

    async def create(
        self,
        action: str,
        entity_type: str,
        actor_ip: str,
        actor_user_agent: str = "",
        entity_id: UUID | None = None,
        actor_id: UUID | None = None,
        changes: dict[str, Any] | None = None,
        extra_data: dict[str, Any] | None = None,
    ) -> AuditLog:
        """Create a new audit log record.

        Args:
            action: The action type (e.g., user.created).
            entity_type: The entity type (e.g., User).
            actor_ip: The IP address of the actor.
            actor_user_agent: The user agent of the actor.
            entity_id: The entity ID (optional).
            actor_id: The actor's user ID (optional).
            changes: The changes before and after (optional).
            extra_data: Additional extra_data (optional).
        """
        audit_log = AuditLog(
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            actor_id=actor_id,
            actor_ip=actor_ip,
            actor_user_agent=actor_user_agent,
            changes=changes,
            extra_data=extra_data,
        )
        self.db.add(audit_log)
        await self.db.commit()
        await self.db.refresh(audit_log)
        return audit_log

    async def create_from_schema(self, data: AuditLogCreate) -> AuditLog:
        """Create a new audit log record from a schema.

        Args:
            data: The audit log creation data.
        """
        return await self.create(
            action=data.action,
            entity_type=data.entity_type,
            entity_id=data.entity_id,
            actor_id=data.actor_id,
            actor_ip=data.actor_ip,
            actor_user_agent=data.actor_user_agent,
            changes=data.changes,
            extra_data=data.extra_data,
        )

    async def log_action(
        self,
        action: str,
        entity_type: str,
        actor_ip: str,
        actor_user_agent: str = "",
        entity_id: UUID | None = None,
        actor_id: UUID | None = None,
        before: dict[str, Any] | None = None,
        after: dict[str, Any] | None = None,
        extra_data: dict[str, Any] | None = None,
    ) -> AuditLog:
        """Log an action with optional before/after changes.

        This is a convenience method that automatically builds the changes dict.

        Args:
            action: The action type (e.g., user.updated).
            entity_type: The entity type (e.g., User).
            actor_ip: The IP address of the actor.
            actor_user_agent: The user agent of the actor.
            entity_id: The entity ID (optional).
            actor_id: The actor's user ID (optional).
            before: The state before the change (optional).
            after: The state after the change (optional).
            extra_data: Additional extra_data (optional).
        """
        changes = None
        if before is not None or after is not None:
            changes = {}
            if before is not None:
                changes["before"] = before
            if after is not None:
                changes["after"] = after

        return await self.create(
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            actor_id=actor_id,
            actor_ip=actor_ip,
            actor_user_agent=actor_user_agent,
            changes=changes,
            extra_data=extra_data,
        )
