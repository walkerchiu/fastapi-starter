"""Health check API endpoints."""

import asyncio
import time
from datetime import UTC, datetime
from enum import Enum
from typing import Annotated

import redis.asyncio as redis
from fastapi import APIRouter, Depends, Response
from pydantic import BaseModel, Field
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from src.app.core.config import settings
from src.app.core.deps import require_roles
from src.app.core.redis import RedisPool
from src.app.db import get_db
from src.app.models import User
from src.app.services.storage_service import storage_service

# Health check timeout in seconds
HEALTH_CHECK_TIMEOUT = 5.0

# App start time for uptime calculation
APP_START_TIME = time.time()

# Type alias for dependency injection
DbSession = Annotated[AsyncSession, Depends(get_db)]

router = APIRouter(tags=["health"])


class HealthStatus(str, Enum):
    """Health check status values."""

    HEALTHY = "healthy"
    UNHEALTHY = "unhealthy"
    DEGRADED = "degraded"


class CheckStatus(str, Enum):
    """Component check status values."""

    UP = "up"
    DOWN = "down"


class ComponentHealth(BaseModel):
    """Health status of a single component."""

    status: CheckStatus
    latency_ms: float | None = Field(default=None, description="Response time in ms")
    message: str | None = Field(default=None, description="Additional info")


class HealthResponse(BaseModel):
    """Health check response."""

    status: HealthStatus
    timestamp: datetime
    version: str
    environment: str
    components: dict[str, ComponentHealth]


class ReadyResponse(BaseModel):
    """Readiness check response."""

    status: str = Field(description="ready or not_ready")
    timestamp: datetime
    checks: dict[str, ComponentHealth]


class MemoryInfo(BaseModel):
    """Memory usage information."""

    used: int
    total: int


class DetailedHealthResponse(BaseModel):
    """Detailed health check response for admin."""

    status: HealthStatus
    version: str
    uptime: int = Field(description="Uptime in seconds")
    memory: MemoryInfo
    checks: dict[str, ComponentHealth]


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
            status=CheckStatus.UP,
            latency_ms=round(latency, 2),
        )
    except TimeoutError:
        return ComponentHealth(
            status=CheckStatus.DOWN,
            message=f"Database check timed out after {HEALTH_CHECK_TIMEOUT}s",
        )
    except Exception as e:
        return ComponentHealth(
            status=CheckStatus.DOWN,
            message=str(e),
        )


async def check_redis() -> ComponentHealth:
    """Check Redis connectivity with timeout."""
    start = datetime.now(UTC)
    try:
        pool = RedisPool.get_pool()
        client = redis.Redis(connection_pool=pool)
        try:
            await asyncio.wait_for(
                client.ping(),
                timeout=HEALTH_CHECK_TIMEOUT,
            )
            latency = (datetime.now(UTC) - start).total_seconds() * 1000
            return ComponentHealth(
                status=CheckStatus.UP,
                latency_ms=round(latency, 2),
            )
        finally:
            await client.aclose()
    except RuntimeError as e:
        # Redis pool not initialized
        return ComponentHealth(
            status=CheckStatus.DOWN,
            message=str(e),
        )
    except TimeoutError:
        return ComponentHealth(
            status=CheckStatus.DOWN,
            message=f"Redis check timed out after {HEALTH_CHECK_TIMEOUT}s",
        )
    except Exception as e:
        return ComponentHealth(
            status=CheckStatus.DOWN,
            message=str(e),
        )


async def check_storage() -> ComponentHealth:
    """Check storage connectivity by verifying bucket exists."""
    start = datetime.now(UTC)
    try:
        await asyncio.wait_for(
            storage_service.ensure_bucket_exists(),
            timeout=HEALTH_CHECK_TIMEOUT,
        )
        latency = (datetime.now(UTC) - start).total_seconds() * 1000
        return ComponentHealth(
            status=CheckStatus.UP,
            latency_ms=round(latency, 2),
        )
    except TimeoutError:
        return ComponentHealth(
            status=CheckStatus.DOWN,
            message=f"Storage check timed out after {HEALTH_CHECK_TIMEOUT}s",
        )
    except Exception as e:
        return ComponentHealth(
            status=CheckStatus.DOWN,
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
    if all(s == CheckStatus.UP for s in statuses):
        overall_status = HealthStatus.HEALTHY
    elif any(s == CheckStatus.DOWN for s in statuses):
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
    return {"status": "up"}


@router.get(
    "/health/ready",
    response_model=ReadyResponse,
    summary="Readiness probe",
    description="Readiness check to verify the service can handle requests.",
    responses={
        200: {"description": "Service is ready"},
        503: {"description": "Service is not ready"},
    },
)
async def readiness(
    response: Response,
    db: DbSession,
) -> ReadyResponse:
    """Readiness probe - checks if the service can handle requests."""
    checks: dict[str, ComponentHealth] = {}

    # Check database
    checks["database"] = await check_database(db)

    # Check Redis
    checks["redis"] = await check_redis()

    # Check Storage
    checks["storage"] = await check_storage()

    # Determine if all checks passed
    all_healthy = all(c.status == CheckStatus.UP for c in checks.values())

    if not all_healthy:
        response.status_code = 503

    return ReadyResponse(
        status="ready" if all_healthy else "not_ready",
        timestamp=datetime.now(UTC),
        checks=checks,
    )


@router.get(
    "/health/details",
    response_model=DetailedHealthResponse,
    summary="Detailed health status (admin only)",
    description="Detailed health check with system information. Requires admin role.",
    responses={
        200: {"description": "Detailed health information"},
        401: {"description": "Unauthorized"},
        403: {"description": "Forbidden - admin role required"},
        503: {"description": "Service is unhealthy"},
    },
)
async def health_details(
    response: Response,
    db: DbSession,
    _current_user: Annotated[User, Depends(require_roles("super_admin", "admin"))],
) -> DetailedHealthResponse:
    """Detailed health check endpoint for administrators."""
    checks: dict[str, ComponentHealth] = {}

    # Check database
    checks["database"] = await check_database(db)

    # Check Redis
    checks["redis"] = await check_redis()

    # Check Storage
    checks["storage"] = await check_storage()

    # Determine overall status
    statuses = [c.status for c in checks.values()]
    if all(s == CheckStatus.UP for s in statuses):
        overall_status = HealthStatus.HEALTHY
    elif any(s == CheckStatus.DOWN for s in statuses):
        overall_status = HealthStatus.UNHEALTHY
        response.status_code = 503
    else:
        overall_status = HealthStatus.DEGRADED

    # Get memory info (Python doesn't have easy access to total memory, use 0 as placeholder)
    import resource

    mem_usage = resource.getrusage(resource.RUSAGE_SELF)
    used_memory = mem_usage.ru_maxrss * 1024  # Convert KB to bytes on macOS/Linux

    return DetailedHealthResponse(
        status=overall_status,
        version=settings.app_version,
        uptime=int(time.time() - APP_START_TIME),
        memory=MemoryInfo(
            used=used_memory,
            total=0,  # Total system memory not easily available in Python
        ),
        checks=checks,
    )
