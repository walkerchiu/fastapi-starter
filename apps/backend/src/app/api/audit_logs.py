"""Audit log API endpoints."""

from datetime import datetime
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Path, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from src.app.core.deps import require_permissions
from src.app.core.exceptions import AuditLogNotFoundException
from src.app.db.session import get_db
from src.app.models import User
from src.app.schemas import (
    AuditLogFilter,
    AuditLogRead,
    ErrorResponse,
    PaginatedAuditLogs,
)
from src.app.services import AuditLogNotFoundError, AuditService

router = APIRouter(prefix="/audit-logs", tags=["audit"])


@router.get(
    "",
    response_model=PaginatedAuditLogs,
    status_code=status.HTTP_200_OK,
    summary="Get audit logs",
    description="""
Get a list of audit logs with optional filters.

**Requires `audit:read` permission.**

Supports filtering by:
- action: Filter by action type (e.g., user.created)
- entity_type: Filter by entity type (e.g., User, Role)
- entity_id: Filter by entity ID
- actor_id: Filter by actor ID
- start_date: Filter logs after this date
- end_date: Filter logs before this date
    """,
    responses={
        200: {"description": "List of audit logs"},
        401: {"model": ErrorResponse, "description": "Not authenticated"},
        403: {"model": ErrorResponse, "description": "Insufficient permissions"},
    },
)
async def get_audit_logs(
    _: Annotated[User, Depends(require_permissions("audit:read"))],
    db: Annotated[AsyncSession, Depends(get_db)],
    action: Annotated[str | None, Query(description="Filter by action type")] = None,
    entity_type: Annotated[
        str | None, Query(description="Filter by entity type")
    ] = None,
    entity_id: Annotated[UUID | None, Query(description="Filter by entity ID")] = None,
    actor_id: Annotated[UUID | None, Query(description="Filter by actor ID")] = None,
    start_date: Annotated[
        datetime | None, Query(description="Filter logs after this date")
    ] = None,
    end_date: Annotated[
        datetime | None, Query(description="Filter logs before this date")
    ] = None,
    skip: Annotated[int, Query(ge=0, description="Number of records to skip")] = 0,
    limit: Annotated[
        int, Query(ge=1, le=100, description="Maximum records to return")
    ] = 20,
) -> PaginatedAuditLogs:
    """Get audit logs with optional filters."""
    filter_params = AuditLogFilter(
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        actor_id=actor_id,
        start_date=start_date,
        end_date=end_date,
    )

    service = AuditService(db)
    logs, total = await service.list_logs(filter_params, skip, limit)

    page = (skip // limit) + 1 if limit > 0 else 1
    total_pages = ((total + limit - 1) // limit) if limit > 0 else 1
    return PaginatedAuditLogs(
        data=[AuditLogRead.model_validate(log) for log in logs],
        meta={
            "page": page,
            "limit": limit,
            "total_items": total,
            "total_pages": total_pages,
            "has_next_page": page < total_pages,
            "has_prev_page": page > 1,
        },
    )


@router.get(
    "/{audit_log_id}",
    response_model=AuditLogRead,
    status_code=status.HTTP_200_OK,
    summary="Get audit log by ID",
    description="""
Get a single audit log by its ID.

**Requires `audit:read` permission.**
    """,
    responses={
        200: {"description": "Audit log details"},
        401: {"model": ErrorResponse, "description": "Not authenticated"},
        403: {"model": ErrorResponse, "description": "Insufficient permissions"},
        404: {"model": ErrorResponse, "description": "Audit log not found"},
    },
)
async def get_audit_log(
    _: Annotated[User, Depends(require_permissions("audit:read"))],
    db: Annotated[AsyncSession, Depends(get_db)],
    audit_log_id: Annotated[UUID, Path(description="Audit log ID")],
) -> AuditLogRead:
    """Get a single audit log by ID."""
    service = AuditService(db)
    try:
        log = await service.get_by_id(audit_log_id)
        return AuditLogRead.model_validate(log)
    except AuditLogNotFoundError as e:
        raise AuditLogNotFoundException(str(e)) from e


@router.get(
    "/entity/{entity_type}/{entity_id}",
    response_model=PaginatedAuditLogs,
    status_code=status.HTTP_200_OK,
    summary="Get audit logs by entity",
    description="""
Get audit logs for a specific entity.

**Requires `audit:read` permission.**

Returns all audit logs related to the specified entity, ordered by creation time (newest first).
    """,
    responses={
        200: {"description": "List of audit logs for the entity"},
        401: {"model": ErrorResponse, "description": "Not authenticated"},
        403: {"model": ErrorResponse, "description": "Insufficient permissions"},
    },
)
async def get_audit_logs_by_entity(
    _: Annotated[User, Depends(require_permissions("audit:read"))],
    db: Annotated[AsyncSession, Depends(get_db)],
    entity_type: Annotated[str, Path(description="Entity type (e.g., User, Role)")],
    entity_id: Annotated[UUID, Path(description="Entity ID")],
    skip: Annotated[int, Query(ge=0, description="Number of records to skip")] = 0,
    limit: Annotated[
        int, Query(ge=1, le=100, description="Maximum records to return")
    ] = 20,
) -> PaginatedAuditLogs:
    """Get audit logs for a specific entity."""
    service = AuditService(db)
    logs, total = await service.get_by_entity(entity_type, entity_id, skip, limit)

    page = (skip // limit) + 1 if limit > 0 else 1
    total_pages = ((total + limit - 1) // limit) if limit > 0 else 1
    return PaginatedAuditLogs(
        data=[AuditLogRead.model_validate(log) for log in logs],
        meta={
            "page": page,
            "limit": limit,
            "total_items": total,
            "total_pages": total_pages,
            "has_next_page": page < total_pages,
            "has_prev_page": page > 1,
        },
    )


@router.get(
    "/actor/{actor_id}",
    response_model=PaginatedAuditLogs,
    status_code=status.HTTP_200_OK,
    summary="Get audit logs by actor",
    description="""
Get audit logs for a specific actor (user).

**Requires `audit:read` permission.**

Returns all audit logs performed by the specified user, ordered by creation time (newest first).
    """,
    responses={
        200: {"description": "List of audit logs by the actor"},
        401: {"model": ErrorResponse, "description": "Not authenticated"},
        403: {"model": ErrorResponse, "description": "Insufficient permissions"},
    },
)
async def get_audit_logs_by_actor(
    _: Annotated[User, Depends(require_permissions("audit:read"))],
    db: Annotated[AsyncSession, Depends(get_db)],
    actor_id: Annotated[UUID, Path(description="Actor (user) ID")],
    skip: Annotated[int, Query(ge=0, description="Number of records to skip")] = 0,
    limit: Annotated[
        int, Query(ge=1, le=100, description="Maximum records to return")
    ] = 20,
) -> PaginatedAuditLogs:
    """Get audit logs for a specific actor."""
    service = AuditService(db)
    logs, total = await service.get_by_actor(actor_id, skip, limit)

    page = (skip // limit) + 1 if limit > 0 else 1
    total_pages = ((total + limit - 1) // limit) if limit > 0 else 1
    return PaginatedAuditLogs(
        data=[AuditLogRead.model_validate(log) for log in logs],
        meta={
            "page": page,
            "limit": limit,
            "total_items": total,
            "total_pages": total_pages,
            "has_next_page": page < total_pages,
            "has_prev_page": page > 1,
        },
    )
