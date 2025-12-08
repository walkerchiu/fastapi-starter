"""Health check API endpoints."""

import asyncio
from datetime import UTC, datetime
from enum import Enum
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response
from pydantic import BaseModel, Field
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from src.app.core.config import settings
from src.app.db import get_db

# Health check timeout in seconds
HEALTH_CHECK_TIMEOUT = 5.0

# Type alias for dependency injection
DbSession = Annotated[AsyncSession, Depends(get_db)]

router = APIRouter(tags=["health"])


class HealthStatus(str, Enum):
    """Health check status values."""

    HEALTHY = "healthy"
    UNHEALTHY = "unhealthy"
    DEGRADED = "degraded"


class ComponentHealth(BaseModel):
    """Health status of a single component."""

    status: HealthStatus
    latency_ms: float | None = Field(default=None, description="Response time in ms")
    message: str | None = Field(default=None, description="Additional info")


class HealthResponse(BaseModel):
    """Health check response."""

    status: HealthStatus
    timestamp: datetime
    version: str
    environment: str
    components: dict[str, ComponentHealth]


async def check_database(db: AsyncSession) -> ComponentHealth:
    """Check database connectivity with timeout."""
    start = datetime.now(UTC)
    try:
        await asyncio.wait_for(
            db.execute(text("SELECT 1")),
            timeout=HEALTH_CHECK_TIMEOUT,
        )
        latency = (datetime.now(UTC) - start).total_seconds() * 1000
        return ComponentHealth(
            status=HealthStatus.HEALTHY,
            latency_ms=round(latency, 2),
        )
    except TimeoutError:
        return ComponentHealth(
            status=HealthStatus.UNHEALTHY,
            message=f"Database check timed out after {HEALTH_CHECK_TIMEOUT}s",
        )
    except Exception as e:
        return ComponentHealth(
            status=HealthStatus.UNHEALTHY,
            message=str(e),
        )


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Health check",
    description="Check the health status of the application and its dependencies.",
    responses={
        200: {"description": "Service is healthy"},
        503: {"description": "Service is unhealthy"},
    },
)
async def health_check(
    response: Response,
    db: DbSession,
) -> HealthResponse:
    """Comprehensive health check endpoint."""
    components: dict[str, ComponentHealth] = {}

    # Check database
    components["database"] = await check_database(db)

    # Determine overall status
    statuses = [c.status for c in components.values()]
    if all(s == HealthStatus.HEALTHY for s in statuses):
        overall_status = HealthStatus.HEALTHY
    elif any(s == HealthStatus.UNHEALTHY for s in statuses):
        overall_status = HealthStatus.UNHEALTHY
        response.status_code = 503
    else:
        overall_status = HealthStatus.DEGRADED

    return HealthResponse(
        status=overall_status,
        timestamp=datetime.now(UTC),
        version=settings.app_version,
        environment=settings.environment,
        components=components,
    )


@router.get(
    "/health/live",
    summary="Liveness probe",
    description="Simple liveness check for Kubernetes/Docker health checks.",
    responses={
        200: {"description": "Service is alive"},
    },
)
async def liveness() -> dict[str, str]:
    """Simple liveness probe - returns OK if the service is running."""
    return {"status": "OK"}


@router.get(
    "/health/ready",
    summary="Readiness probe",
    description="Readiness check to verify the service can handle requests.",
    responses={
        200: {"description": "Service is ready"},
        503: {"description": "Service is not ready"},
    },
)
async def readiness(
    db: DbSession,
) -> dict[str, str]:
    """Readiness probe - checks if the service can handle requests."""
    # Check database connectivity
    db_health = await check_database(db)
    if db_health.status == HealthStatus.UNHEALTHY:
        raise HTTPException(status_code=503, detail="Database not ready")

    return {"status": "ready"}
