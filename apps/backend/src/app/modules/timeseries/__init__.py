"""TimescaleDB time-series module.

This module provides:
- TimeseriesService for managing hypertables and policies
- Example models (Metric, DeviceReading, AuditLog)

Example:
    # Use in your router
    from src.app.modules.timeseries import TimeseriesService, get_timeseries_service
    from src.app.modules.timeseries.models import Metric

    @router.post("/metrics")
    async def create_metric(
        metric: MetricCreate,
        service: TimeseriesService = Depends(get_timeseries_service),
    ):
        # Service is available for hypertable operations
        pass

    # Initialize time-series on startup (in main.py)
    from src.app.modules.timeseries import TimeseriesService

    @app.on_event("startup")
    async def init_timeseries():
        async with async_session_maker() as session:
            service = TimeseriesService(session)

            if not await service.is_timescaledb_available():
                logger.info("TimescaleDB not available, using regular tables")
                return

            # Convert to hypertable
            await service.create_hypertable("metrics")

            # Enable compression
            await service.enable_compression("metrics")

            # Add compression policy
            await service.add_compression_policy("metrics")
"""

from .models import AuditLog, DeviceReading, Metric
from .service import (
    CompressionPolicyOptions,
    CreateHypertableOptions,
    HypertableInfo,
    RetentionPolicyOptions,
    TimeseriesService,
    get_timeseries_service,
)

__all__ = [
    # Service
    "TimeseriesService",
    "get_timeseries_service",
    # Options
    "CreateHypertableOptions",
    "CompressionPolicyOptions",
    "RetentionPolicyOptions",
    "HypertableInfo",
    # Models
    "Metric",
    "DeviceReading",
    "AuditLog",
]
