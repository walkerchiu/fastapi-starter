"""GraphQL Audit Log type."""

from datetime import datetime
from typing import Any

import strawberry
from src.app.graphql.types.user import UserType
from strawberry.scalars import JSON


@strawberry.type
class AuditLogType:
    """GraphQL type for AuditLog."""

    id: strawberry.ID
    action: str
    entity_type: str = strawberry.field(name="entityType")
    entity_id: strawberry.ID | None = strawberry.field(name="entityId", default=None)
    actor_id: strawberry.ID | None = strawberry.field(name="actorId", default=None)
    actor: UserType | None = None
    actor_ip: str = strawberry.field(name="actorIp")
    actor_user_agent: str = strawberry.field(name="actorUserAgent")
    changes: JSON | None = None
    metadata: JSON | None = None
    created_at: datetime = strawberry.field(name="createdAt")

    @classmethod
    def from_model(cls, audit_log: Any) -> "AuditLogType":
        """Create AuditLogType from an AuditLog model instance."""
        actor = None
        if audit_log.actor:
            actor = UserType.from_model(audit_log.actor)

        return cls(
            id=audit_log.id,
            action=audit_log.action,
            entity_type=audit_log.entity_type,
            entity_id=audit_log.entity_id,
            actor_id=audit_log.actor_id,
            actor=actor,
            actor_ip=audit_log.actor_ip,
            actor_user_agent=audit_log.actor_user_agent,
            changes=audit_log.changes,
            metadata=audit_log.extra_data,
            created_at=audit_log.created_at,
        )


@strawberry.type
class PaginatedAuditLogs:
    """Paginated audit logs response."""

    items: list[AuditLogType]
    total: int
    skip: int
    limit: int
    has_more: bool = strawberry.field(name="hasMore")


@strawberry.input
class AuditLogFilterInput:
    """Input type for filtering audit logs."""

    action: str | None = None
    entity_type: str | None = strawberry.field(name="entityType", default=None)
    entity_id: strawberry.ID | None = strawberry.field(name="entityId", default=None)
    actor_id: strawberry.ID | None = strawberry.field(name="actorId", default=None)
    start_date: datetime | None = strawberry.field(name="startDate", default=None)
    end_date: datetime | None = strawberry.field(name="endDate", default=None)
