"""Audit log schemas."""

from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field
from src.app.schemas.user import UserRead


class AuditLogRead(BaseModel):
    """Response schema for audit log details."""

    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
    )

    id: UUID = Field(..., description="Audit log ID")
    action: str = Field(..., description="Operation type (e.g., user.created)")
    entity_type: str = Field(..., description="Entity type (e.g., User, Role)")
    entity_id: UUID | None = Field(None, description="Entity ID")
    actor_id: UUID | None = Field(None, description="User ID who performed the action")
    actor: UserRead | None = Field(None, description="User who performed the action")
    actor_ip: str = Field(..., description="IP address of the actor")
    actor_user_agent: str = Field(..., description="User agent of the actor")
    changes: dict[str, Any] | None = Field(None, description="Changes before and after")
    metadata: dict[str, Any] | None = Field(
        None, description="Additional metadata", validation_alias="extra_data"
    )
    created_at: datetime = Field(..., description="Log creation time")


class AuditLogFilter(BaseModel):
    """Filter schema for audit log queries."""

    action: str | None = Field(None, description="Filter by action type")
    entity_type: str | None = Field(None, description="Filter by entity type")
    entity_id: UUID | None = Field(None, description="Filter by entity ID")
    actor_id: UUID | None = Field(None, description="Filter by actor ID")
    start_date: datetime | None = Field(None, description="Filter logs after this date")
    end_date: datetime | None = Field(None, description="Filter logs before this date")


class AuditLogCreate(BaseModel):
    """Schema for creating audit log entries (internal use)."""

    action: str = Field(..., description="Operation type", max_length=100)
    entity_type: str = Field(..., description="Entity type", max_length=50)
    entity_id: UUID | None = Field(None, description="Entity ID")
    actor_id: UUID | None = Field(None, description="User ID who performed the action")
    actor_ip: str = Field(..., description="IP address of the actor", max_length=45)
    actor_user_agent: str = Field(
        "", description="User agent of the actor", max_length=500
    )
    changes: dict[str, Any] | None = Field(None, description="Changes before and after")
    extra_data: dict[str, Any] | None = Field(None, description="Additional metadata")


class AuditLogPaginationMeta(BaseModel):
    """Pagination metadata for audit logs."""

    page: int = Field(..., description="Current page number")
    limit: int = Field(..., description="Number of items per page")
    total_items: int = Field(..., description="Total number of items")
    total_pages: int = Field(..., description="Total number of pages")
    has_next_page: bool = Field(..., description="Whether there is a next page")
    has_prev_page: bool = Field(..., description="Whether there is a previous page")


class PaginatedAuditLogs(BaseModel):
    """Paginated response for audit logs."""

    data: list[AuditLogRead] = Field(
        default_factory=list, description="List of audit logs"
    )
    meta: AuditLogPaginationMeta = Field(..., description="Pagination metadata")

    model_config = {
        "json_schema_extra": {
            "example": {
                "data": [
                    {
                        "id": "550e8400-e29b-41d4-a716-446655440000",
                        "action": "user.created",
                        "entity_type": "User",
                        "entity_id": "660e8400-e29b-41d4-a716-446655440001",
                        "actor_id": "770e8400-e29b-41d4-a716-446655440002",
                        "actor_ip": "192.168.1.1",
                        "actor_user_agent": "Mozilla/5.0",
                        "changes": None,
                        "metadata": {"source": "web"},
                        "created_at": "2024-01-01T00:00:00Z",
                    }
                ],
                "meta": {
                    "page": 1,
                    "limit": 20,
                    "total_items": 1,
                    "total_pages": 1,
                    "has_next_page": False,
                    "has_prev_page": False,
                },
            }
        }
    }
