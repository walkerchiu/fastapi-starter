"""Audit log message handler."""

import logging

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from src.app.core.config import settings
from src.app.messaging.consumer import MessageConsumer
from src.app.messaging.types import AuditLogMessage
from src.app.models.audit_log import AuditLog

logger = logging.getLogger(__name__)


class AuditLogHandler(MessageConsumer[AuditLogMessage]):
    """Handler for audit log messages."""

    queue_name = "audit_queue"
    routing_keys = ["audit.log"]
    message_type = AuditLogMessage
    prefetch_count = 50  # Higher throughput for audit logs

    def __init__(self) -> None:
        """Initialize the handler with database session factory."""
        super().__init__()
        # Create async engine for the worker
        self._engine = create_async_engine(
            settings.database_url,
            echo=False,
            pool_size=5,
            max_overflow=10,
        )
        self._session_factory = sessionmaker(
            self._engine,
            class_=AsyncSession,
            expire_on_commit=False,
        )

    async def handle(self, message: AuditLogMessage) -> None:
        """
        Handle an audit log message by writing to the database.

        Args:
            message: The audit log message to process
        """
        logger.debug(
            "Processing audit log: action=%s, entity_type=%s, entity_id=%s",
            message.action,
            message.entity_type,
            message.entity_id,
        )

        async with self._session_factory() as session:
            audit_log = AuditLog(
                action=message.action,
                entity_type=message.entity_type,
                entity_id=message.entity_id,
                actor_id=message.actor_id,
                actor_ip=message.actor_ip,
                actor_user_agent=message.actor_user_agent,
                changes=message.changes,
                extra_data=message.extra_data,
            )

            session.add(audit_log)
            await session.commit()

        logger.info(
            "Audit log created: action=%s, entity_type=%s, entity_id=%s, message_id=%s",
            message.action,
            message.entity_type,
            message.entity_id,
            message.id,
        )

    async def close(self) -> None:
        """Close the database engine."""
        await self._engine.dispose()
