"""TimescaleDB time-series service for managing hypertables and policies."""

import logging
from dataclasses import dataclass

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from src.app.core.config import settings

logger = logging.getLogger(__name__)


@dataclass
class CreateHypertableOptions:
    """Options for creating a hypertable."""

    time_column: str = "time"
    chunk_interval: str | None = None
    migrate_data: bool = True


@dataclass
class CompressionPolicyOptions:
    """Options for compression policy."""

    compress_after: str | None = None
    segment_by: list[str] | None = None
    order_by: list[str] | None = None


@dataclass
class RetentionPolicyOptions:
    """Options for retention policy."""

    drop_after: str


@dataclass
class HypertableInfo:
    """Information about a hypertable."""

    total_size: str
    num_chunks: int
    compression_enabled: bool


class TimeseriesService:
    """Service for managing TimescaleDB hypertables and policies.

    This service provides utilities for:
    - Converting regular tables to hypertables
    - Enabling and configuring compression
    - Setting up retention policies

    Example:
        service = TimeseriesService(db_session)

        # Create hypertable
        await service.create_hypertable("metrics")

        # Enable compression
        await service.enable_compression("metrics", CompressionPolicyOptions(
            segment_by=["name"],
            order_by=["time DESC"],
        ))

        # Add compression policy
        await service.add_compression_policy("metrics")

        # Add retention policy (optional)
        await service.add_retention_policy("metrics", RetentionPolicyOptions(
            drop_after="365 days",
        ))
    """

    def __init__(self, session: AsyncSession):
        """Initialize the service with a database session."""
        self.session = session

    async def is_timescaledb_available(self) -> bool:
        """Check if TimescaleDB extension is available."""
        try:
            result = await self.session.execute(
                text("SELECT extname FROM pg_extension WHERE extname = 'timescaledb'")
            )
            return result.fetchone() is not None
        except Exception:
            return False

    async def create_hypertable(
        self,
        table_name: str,
        options: CreateHypertableOptions | None = None,
    ) -> bool:
        """Convert a regular table to a TimescaleDB hypertable.

        Args:
            table_name: Name of the table to convert
            options: Hypertable creation options

        Returns:
            True if successful, False otherwise

        Example:
            await service.create_hypertable("metrics", CreateHypertableOptions(
                time_column="time",
                chunk_interval="1 day",
                migrate_data=True,
            ))
        """
        if options is None:
            options = CreateHypertableOptions()

        chunk_interval = options.chunk_interval or settings.timescale_chunk_interval

        try:
            # Check if already a hypertable
            is_hypertable = await self.is_hypertable(table_name)
            if is_hypertable:
                logger.info("Table %s is already a hypertable", table_name)
                return True

            logger.info(
                "Converting %s to hypertable with chunk interval %s",
                table_name,
                chunk_interval,
            )

            await self.session.execute(
                text(
                    "SELECT create_hypertable(:table_name, :time_column, "
                    "chunk_time_interval => INTERVAL :chunk_interval, migrate_data => :migrate_data)"
                ),
                {
                    "table_name": table_name,
                    "time_column": options.time_column,
                    "chunk_interval": chunk_interval,
                    "migrate_data": options.migrate_data,
                },
            )
            await self.session.commit()

            logger.info("Successfully created hypertable for %s", table_name)
            return True
        except Exception as e:
            logger.error("Failed to create hypertable for %s: %s", table_name, e)
            await self.session.rollback()
            return False

    async def is_hypertable(self, table_name: str) -> bool:
        """Check if a table is a hypertable."""
        try:
            result = await self.session.execute(
                text(
                    "SELECT * FROM timescaledb_information.hypertables "
                    "WHERE hypertable_name = :table_name"
                ),
                {"table_name": table_name},
            )
            return result.fetchone() is not None
        except Exception:
            return False

    async def enable_compression(
        self,
        table_name: str,
        options: CompressionPolicyOptions | None = None,
    ) -> bool:
        """Enable compression on a hypertable.

        Args:
            table_name: Name of the hypertable
            options: Compression options

        Example:
            await service.enable_compression("metrics", CompressionPolicyOptions(
                segment_by=["name"],
                order_by=["time DESC"],
            ))
        """
        if options is None:
            options = CompressionPolicyOptions()

        segment_by = options.segment_by or []
        order_by = options.order_by or ["time DESC"]

        try:
            sql_parts = [f"ALTER TABLE {table_name} SET (timescaledb.compress"]

            if segment_by:
                sql_parts.append(
                    f", timescaledb.compress_segmentby = '{', '.join(segment_by)}'"
                )

            if order_by:
                sql_parts.append(
                    f", timescaledb.compress_orderby = '{', '.join(order_by)}'"
                )

            sql_parts.append(")")

            await self.session.execute(text("".join(sql_parts)))
            await self.session.commit()

            logger.info("Enabled compression on %s", table_name)
            return True
        except Exception as e:
            logger.error("Failed to enable compression on %s: %s", table_name, e)
            await self.session.rollback()
            return False

    async def add_compression_policy(
        self,
        table_name: str,
        compress_after: str | None = None,
    ) -> bool:
        """Add a compression policy to automatically compress old chunks.

        Args:
            table_name: Name of the hypertable
            compress_after: Compress chunks older than this interval

        Example:
            await service.add_compression_policy("metrics", "7 days")
        """
        if compress_after is None:
            compress_after = f"{settings.timescale_compression_after_days} days"

        try:
            await self.session.execute(
                text(
                    "SELECT add_compression_policy(:table_name, INTERVAL :compress_after)"
                ),
                {"table_name": table_name, "compress_after": compress_after},
            )
            await self.session.commit()

            logger.info(
                "Added compression policy to %s: compress after %s",
                table_name,
                compress_after,
            )
            return True
        except Exception as e:
            logger.error("Failed to add compression policy to %s: %s", table_name, e)
            await self.session.rollback()
            return False

    async def add_retention_policy(
        self,
        table_name: str,
        options: RetentionPolicyOptions,
    ) -> bool:
        """Add a retention policy to automatically drop old chunks.

        Args:
            table_name: Name of the hypertable
            options: Retention options

        Example:
            await service.add_retention_policy("metrics", RetentionPolicyOptions(
                drop_after="365 days",
            ))
        """
        try:
            await self.session.execute(
                text("SELECT add_retention_policy(:table_name, INTERVAL :drop_after)"),
                {"table_name": table_name, "drop_after": options.drop_after},
            )
            await self.session.commit()

            logger.info(
                "Added retention policy to %s: drop after %s",
                table_name,
                options.drop_after,
            )
            return True
        except Exception as e:
            logger.error("Failed to add retention policy to %s: %s", table_name, e)
            await self.session.rollback()
            return False

    async def get_hypertable_info(self, table_name: str) -> HypertableInfo | None:
        """Get hypertable information including chunk count and size."""
        try:
            result = await self.session.execute(
                text(
                    """
                    SELECT
                        pg_size_pretty(hypertable_size(:table_name)) as total_size,
                        (SELECT count(*) FROM timescaledb_information.chunks
                         WHERE hypertable_name = :table_name) as num_chunks,
                        COALESCE((SELECT compression_enabled FROM timescaledb_information.hypertables
                                  WHERE hypertable_name = :table_name), false) as compression_enabled
                    """
                ),
                {"table_name": table_name},
            )
            row = result.fetchone()

            if row is None:
                return None

            return HypertableInfo(
                total_size=row[0],
                num_chunks=int(row[1]),
                compression_enabled=row[2],
            )
        except Exception:
            return None


async def get_timeseries_service(session: AsyncSession) -> TimeseriesService:
    """Dependency for getting TimeseriesService instance."""
    return TimeseriesService(session)
