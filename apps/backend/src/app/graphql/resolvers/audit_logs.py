"""Audit Log GraphQL resolvers."""

import uuid

import strawberry
from src.app.graphql.errors import (
    IsAuthenticated,
    require_permissions,
)
from src.app.graphql.types.audit_log import (
    AuditLogFilterInput,
    AuditLogType,
    PaginatedAuditLogs,
)
from src.app.graphql.validators import validate_pagination
from src.app.schemas.audit_log import AuditLogFilter
from src.app.services import AuditLogNotFoundError, AuditService
from strawberry.types import Info


def convert_audit_log_to_type(audit_log) -> AuditLogType:
    """Convert database AuditLog model to GraphQL AuditLogType."""
    return AuditLogType.from_model(audit_log)


# Create permission class for audit:read
RequireAuditRead = require_permissions("audit:read")


@strawberry.type
class AuditLogQuery:
    """Audit log query resolvers."""

    @strawberry.field(permission_classes=[IsAuthenticated, RequireAuditRead])
    async def audit_logs(
        self,
        info: Info,
        filter: AuditLogFilterInput | None = None,
        skip: int = 0,
        limit: int = 100,
    ) -> PaginatedAuditLogs:
        """Get paginated list of audit logs with optional filters.

        Requires audit:read permission.
        """
        skip, limit = validate_pagination(skip, limit, max_limit=1000)

        db = info.context["db"]
        service = AuditService(db)

        # Convert GraphQL input to service filter
        filter_params = None
        if filter:
            filter_params = AuditLogFilter(
                action=filter.action,
                entity_type=filter.entity_type,
                entity_id=uuid.UUID(str(filter.entity_id))
                if filter.entity_id
                else None,
                actor_id=uuid.UUID(str(filter.actor_id)) if filter.actor_id else None,
                start_date=filter.start_date,
                end_date=filter.end_date,
            )

        logs, total = await service.list_logs(filter_params, skip, limit)

        items = [convert_audit_log_to_type(log) for log in logs]
        has_more = skip + len(items) < total

        return PaginatedAuditLogs(
            items=items,
            total=total,
            skip=skip,
            limit=limit,
            has_more=has_more,
        )

    @strawberry.field(permission_classes=[IsAuthenticated, RequireAuditRead])
    async def audit_log(self, info: Info, id: strawberry.ID) -> AuditLogType | None:
        """Get a single audit log by ID.

        Requires audit:read permission.
        """
        db = info.context["db"]
        service = AuditService(db)

        try:
            log = await service.get_by_id(uuid.UUID(str(id)))
            return convert_audit_log_to_type(log)
        except AuditLogNotFoundError:
            return None

    @strawberry.field(permission_classes=[IsAuthenticated, RequireAuditRead])
    async def audit_logs_by_entity(
        self,
        info: Info,
        entity_type: str,
        entity_id: strawberry.ID,
        skip: int = 0,
        limit: int = 100,
    ) -> PaginatedAuditLogs:
        """Get audit logs for a specific entity.

        Requires audit:read permission.
        """
        skip, limit = validate_pagination(skip, limit, max_limit=1000)

        db = info.context["db"]
        service = AuditService(db)

        logs, total = await service.get_by_entity(
            entity_type, uuid.UUID(str(entity_id)), skip, limit
        )

        items = [convert_audit_log_to_type(log) for log in logs]
        has_more = skip + len(items) < total

        return PaginatedAuditLogs(
            items=items,
            total=total,
            skip=skip,
            limit=limit,
            has_more=has_more,
        )

    @strawberry.field(permission_classes=[IsAuthenticated, RequireAuditRead])
    async def audit_logs_by_actor(
        self,
        info: Info,
        actor_id: strawberry.ID,
        skip: int = 0,
        limit: int = 100,
    ) -> PaginatedAuditLogs:
        """Get audit logs for a specific actor.

        Requires audit:read permission.
        """
        skip, limit = validate_pagination(skip, limit, max_limit=1000)

        db = info.context["db"]
        service = AuditService(db)

        logs, total = await service.get_by_actor(uuid.UUID(str(actor_id)), skip, limit)

        items = [convert_audit_log_to_type(log) for log in logs]
        has_more = skip + len(items) < total

        return PaginatedAuditLogs(
            items=items,
            total=total,
            skip=skip,
            limit=limit,
            has_more=has_more,
        )
