"""GraphQL health check types."""

from datetime import datetime
from enum import Enum

import strawberry


@strawberry.enum
class HealthStatus(Enum):
    """Health check status values."""

    HEALTHY = "healthy"
    UNHEALTHY = "unhealthy"
    DEGRADED = "degraded"


@strawberry.type
class ComponentHealthType:
    """Health status of a single component."""

    status: HealthStatus
    latency_ms: float | None = None
    message: str | None = None


@strawberry.type
class HealthType:
    """Health check response type."""

    status: HealthStatus
    timestamp: datetime
    version: str
    environment: str
    components: list["ComponentHealthEntry"]


@strawberry.type
class ComponentHealthEntry:
    """Entry for a health component."""

    name: str
    health: ComponentHealthType


@strawberry.type
class LivenessType:
    """Liveness probe response type."""

    status: str


@strawberry.type
class ReadinessType:
    """Readiness probe response type."""

    status: str
