from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

import redis.asyncio as redis
from src.app.core.config import settings


class RedisPool:
    _pool: redis.ConnectionPool | None = None

    @classmethod
    async def init_pool(cls) -> None:
        if cls._pool is None:
            cls._pool = redis.ConnectionPool(
                host=settings.REDIS_HOST,
                port=settings.REDIS_PORT,
                password=settings.REDIS_PASSWORD or None,
                db=settings.REDIS_DB,
                max_connections=10,
                decode_responses=True,
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
