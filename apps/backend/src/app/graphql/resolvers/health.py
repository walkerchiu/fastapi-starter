"""Health check GraphQL resolvers."""

import asyncio
from datetime import UTC, datetime

import strawberry
from sqlalchemy import text
from src.app.core.config import settings
from src.app.graphql.types import (
    ComponentHealthEntry,
    ComponentHealthType,
    HealthStatus,
    HealthType,
    LivenessType,
    ReadinessType,
)
from strawberry.types import Info

# Health check timeout in seconds
HEALTH_CHECK_TIMEOUT = 5.0


async def check_database(info: Info) -> ComponentHealthType:
    """Check database connectivity with timeout."""
    start = datetime.now(UTC)
    try:
        db = info.context["db"]
        await asyncio.wait_for(
            db.execute(text("SELECT 1")),
            timeout=HEALTH_CHECK_TIMEOUT,
        )
        latency = (datetime.now(UTC) - start).total_seconds() * 1000
        return ComponentHealthType(
            status=HealthStatus.HEALTHY,
            latency_ms=round(latency, 2),
        )
    except TimeoutError:
        return ComponentHealthType(
            status=HealthStatus.UNHEALTHY,
            message=f"Database check timed out after {HEALTH_CHECK_TIMEOUT}s",
        )
    except Exception as e:
        return ComponentHealthType(
            status=HealthStatus.UNHEALTHY,
            message=str(e),
        )


@strawberry.type
class HealthQuery:
    """Health check query resolvers."""

    @strawberry.field
    async def health(self, info: Info) -> HealthType:
        """Comprehensive health check endpoint."""
        components: list[ComponentHealthEntry] = []

        # Check database
        db_health = await check_database(info)
        components.append(ComponentHealthEntry(name="database", health=db_health))

        # Determine overall status
        statuses = [c.health.status for c in components]
        if all(s == HealthStatus.HEALTHY for s in statuses):
            overall_status = HealthStatus.HEALTHY
        elif any(s == HealthStatus.UNHEALTHY for s in statuses):
            overall_status = HealthStatus.UNHEALTHY
        else:
            overall_status = HealthStatus.DEGRADED

        return HealthType(
            status=overall_status,
            timestamp=datetime.now(UTC),
            version=settings.app_version,
            environment=settings.environment,
            components=components,
        )

    @strawberry.field
    async def health_live(self) -> LivenessType:
        """Simple liveness probe - returns OK if the service is running."""
        return LivenessType(status="OK")

    @strawberry.field
    async def health_ready(self, info: Info) -> ReadinessType:
        """Readiness probe - checks if the service can handle requests."""
        db_health = await check_database(info)
        if db_health.status == HealthStatus.UNHEALTHY:
            return ReadinessType(status="not_ready")
        return ReadinessType(status="ready")
