"""Database session management."""

import logging
from collections.abc import AsyncGenerator

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import NullPool
from src.app.core.config import settings

logger = logging.getLogger(__name__)

# Determine if using SQLite (no connection pooling support)
_is_sqlite = settings.database_url.startswith("sqlite")

# Log database engine
logger.info("Database engine: %s", "sqlite" if _is_sqlite else settings.database_engine)

# Connection pool configuration
# SQLite doesn't support connection pooling, so we use NullPool
# For PostgreSQL/MySQL, we configure proper connection pooling
_pool_config = (
    {"poolclass": NullPool}
    if _is_sqlite
    else {
        "pool_size": settings.db_pool_min,  # Base pool size (min idle)
        "max_overflow": settings.db_pool_max
        - settings.db_pool_min,  # Additional connections
        "pool_timeout": settings.db_connection_timeout / 1000,  # Convert ms to seconds
        "pool_recycle": settings.db_pool_max_lifetime / 1000,  # Convert ms to seconds
        "pool_pre_ping": True,  # Verify connections before use
    }
)

engine = create_async_engine(
    settings.database_url,
    echo=settings.database_echo,
    **_pool_config,
)

if not _is_sqlite:
    logger.info(
        "Database connection pool configured: pool_size=%d, max_overflow=%d, recycle=%ds",
        settings.db_pool_min,
        settings.db_pool_max - settings.db_pool_min,
        settings.db_pool_max_lifetime // 1000,
    )

async_session_maker = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_db() -> AsyncGenerator[AsyncSession]:
    """Dependency for getting async database sessions."""
    async with async_session_maker() as session:
        yield session


async def verify_timescaledb_extension() -> bool:
    """Verify TimescaleDB extension is installed.

    Returns True if extension is installed, False otherwise.
    Only checks when database_engine is set to timescaledb.
    """
    if _is_sqlite:
        return False

    if settings.database_engine != "timescaledb":
        return False

    try:
        async with async_session_maker() as session:
            result = await session.execute(
                text(
                    "SELECT extname, extversion FROM pg_extension WHERE extname = 'timescaledb'"
                )
            )
            row = result.fetchone()
            if row:
                logger.info("TimescaleDB extension verified: version %s", row[1])
                return True
            else:
                logger.warning(
                    "DATABASE_ENGINE is set to timescaledb but TimescaleDB extension is not installed. "
                    "Run the TimescaleDB migration or install the extension manually."
                )
                return False
    except Exception as e:
        logger.warning("Failed to verify TimescaleDB extension: %s", e)
        return False
