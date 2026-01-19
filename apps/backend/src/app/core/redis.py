import logging
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

import redis.asyncio as redis
from src.app.core.config import settings

logger = logging.getLogger(__name__)


class RedisPool:
    _pool: redis.ConnectionPool | None = None

    @classmethod
    async def init_pool(cls) -> None:
        if cls._pool is None:
            cls._pool = redis.ConnectionPool(
                host=settings.redis_host,
                port=settings.redis_port,
                password=settings.redis_password or None,
                db=settings.redis_db,
                max_connections=settings.redis_pool_size,
                socket_timeout=settings.redis_read_timeout
                / 1000,  # Convert ms to seconds
                socket_connect_timeout=settings.redis_connection_timeout / 1000,
                decode_responses=True,
            )
            logger.info(
                "Redis connection pool configured: max_connections=%d, connect_timeout=%dms, read_timeout=%dms",
                settings.redis_pool_size,
                settings.redis_connection_timeout,
                settings.redis_read_timeout,
            )

    @classmethod
    async def close_pool(cls) -> None:
        if cls._pool is not None:
            await cls._pool.disconnect()
            cls._pool = None

    @classmethod
    def get_pool(cls) -> redis.ConnectionPool:
        if cls._pool is None:
            raise RuntimeError("Redis pool not initialized")
        return cls._pool


async def get_redis() -> AsyncGenerator[redis.Redis]:
    pool = RedisPool.get_pool()
    client = redis.Redis(connection_pool=pool)
    try:
        yield client
    finally:
        await client.aclose()


@asynccontextmanager
async def redis_lifespan():
    await RedisPool.init_pool()
    yield
    await RedisPool.close_pool()
