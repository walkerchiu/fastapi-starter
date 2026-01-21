"""Time-series models for TimescaleDB hypertables."""

from datetime import datetime
from typing import Any

from sqlalchemy import Column, DateTime, Float, Index, String
from sqlalchemy.dialects.postgresql import JSONB
from src.app.db.base import Base


class Metric(Base):
    """Metric model for storing time-series monitoring data.

    This model is designed to be used with TimescaleDB hypertables.
    The 'time' column is the primary key and should be used for
    time-based queries and aggregations.

    Example:
        metric = Metric(
            time=datetime.utcnow(),
            name="cpu_usage",
            value=85.5,
            tags={"host": "server-1", "region": "us-west-2"},
        )

        # Convert to hypertable (requires TimescaleDB)
        await timeseries_service.create_hypertable("metrics", "time")
    """

    __tablename__ = "metrics"
    __table_args__ = (
        Index("ix_metrics_name_time", "name", "time"),
        {"extend_existing": True},
    )

    time: datetime = Column(
        DateTime(timezone=True), primary_key=True, default=datetime.utcnow
    )
    name: str = Column(String(255), nullable=False, index=True)
    value: float = Column(Float, nullable=False)
    tags: dict[str, str] | None = Column(JSONB, nullable=True)


class DeviceReading(Base):
    """DeviceReading model for storing IoT sensor data.

    Designed for high-volume time-series data from IoT devices.
    Use with TimescaleDB for efficient storage and querying.

    Example:
        reading = DeviceReading(
            time=datetime.utcnow(),
            device_id="sensor-001",
            sensor_type="temperature",
            value=23.5,
            extra_data={"unit": "celsius", "accuracy": 0.1},
        )
    """

    __tablename__ = "device_readings"
    __table_args__ = (
        Index("ix_device_readings_device_id_time", "device_id", "time"),
        Index("ix_device_readings_sensor_type_time", "sensor_type", "time"),
        {"extend_existing": True},
    )

    time: datetime = Column(
        DateTime(timezone=True), primary_key=True, default=datetime.utcnow
    )
    device_id: str = Column(String(255), nullable=False, index=True)
    sensor_type: str = Column(String(100), nullable=False)
    value: float = Column(Float, nullable=False)
    extra_data: dict[str, Any] | None = Column(JSONB, nullable=True)


class AuditLog(Base):
    """AuditLog model for storing time-series event logs.

    Captures system events, user actions, and audit trails.
    Optimized for append-only workloads with time-based queries.

    Example:
        log = AuditLog(
            time=datetime.utcnow(),
            event_type="user.login",
            actor_id="user-123",
            resource="auth",
            action="login",
            details={"ip": "192.168.1.1", "user_agent": "..."},
        )
    """

    __tablename__ = "audit_logs"
    __table_args__ = (
        Index("ix_audit_logs_event_type_time", "event_type", "time"),
        Index("ix_audit_logs_actor_id_time", "actor_id", "time"),
        {"extend_existing": True},
    )

    time: datetime = Column(
        DateTime(timezone=True), primary_key=True, default=datetime.utcnow
    )
    event_type: str = Column(String(255), nullable=False, index=True)
    actor_id: str | None = Column(String(255), nullable=True)
    resource: str = Column(String(255), nullable=False)
    action: str = Column(String(100), nullable=False)
    details: dict[str, Any] | None = Column(JSONB, nullable=True)
