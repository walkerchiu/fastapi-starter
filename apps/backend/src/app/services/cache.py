import json
from typing import TypeVar

import redis.asyncio as redis

KEY_PREFIX = "starter:"
DEFAULT_TTL = 300

T = TypeVar("T")


class CacheConfig:
    SESSION_TTL = 86400
    RATE_LIMIT_TTL = 60
    TOKEN_BLACKLIST_TTL = 3600
    CACHE_TTL = 300
    USER_CACHE_TTL = 300
    PERMISSION_CACHE_TTL = 600


class CacheService:
    def __init__(self, redis_client: redis.Redis):
        self._redis = redis_client

    def _build_key(self, pattern: str, **params: str) -> str:
        key = KEY_PREFIX + pattern
        for param, value in params.items():
            key = key.replace(f"{{{param}}}", value)
        return key

    async def get(self, key: str) -> str | None:
        return await self._redis.get(key)

    async def get_json(self, key: str) -> dict | list | None:
        value = await self._redis.get(key)
        if value is None:
            return None
        return json.loads(value)

    async def set(self, key: str, value: str, ttl: int = DEFAULT_TTL) -> None:
        await self._redis.set(key, value, ex=ttl)

    async def set_json(
        self, key: str, value: dict | list, ttl: int = DEFAULT_TTL
    ) -> None:
        await self._redis.set(key, json.dumps(value), ex=ttl)

    async def delete(self, key: str) -> None:
        await self._redis.delete(key)

    async def exists(self, key: str) -> bool:
        return await self._redis.exists(key) > 0

    # Session operations
    async def get_session(self, user_id: str) -> dict | None:
        key = self._build_key("session:{user_id}", user_id=user_id)
        return await self.get_json(key)

    async def set_session(self, user_id: str, data: dict) -> None:
        key = self._build_key("session:{user_id}", user_id=user_id)
        await self.set_json(key, data, CacheConfig.SESSION_TTL)

    async def del_session(self, user_id: str) -> None:
        key = self._build_key("session:{user_id}", user_id=user_id)
        await self.delete(key)

    # Rate limit operations
    async def get_rate_limit(self, identifier: str, endpoint: str) -> int:
        key = self._build_key(
            "ratelimit:{identifier}:{endpoint}",
            identifier=identifier,
            endpoint=endpoint,
        )
        count = await self.get(key)
        return int(count) if count else 0

    async def incr_rate_limit(self, identifier: str, endpoint: str) -> int:
        key = self._build_key(
            "ratelimit:{identifier}:{endpoint}",
            identifier=identifier,
            endpoint=endpoint,
        )
        pipe = self._redis.pipeline()
        pipe.incr(key)
        pipe.expire(key, CacheConfig.RATE_LIMIT_TTL)
        results = await pipe.execute()
        return results[0]

    # Token blacklist operations
    async def is_token_blacklisted(self, token_jti: str) -> bool:
        key = self._build_key("blacklist:{token_jti}", token_jti=token_jti)
        return await self.exists(key)

    async def blacklist_token(self, token_jti: str, ttl: int | None = None) -> None:
        key = self._build_key("blacklist:{token_jti}", token_jti=token_jti)
        await self.set(key, "1", ttl or CacheConfig.TOKEN_BLACKLIST_TTL)

    # Entity cache operations
    async def get_entity(self, entity: str, entity_id: str) -> dict | None:
        key = self._build_key("cache:{entity}:{id}", entity=entity, id=entity_id)
        return await self.get_json(key)

    async def set_entity(self, entity: str, entity_id: str, data: dict) -> None:
        key = self._build_key("cache:{entity}:{id}", entity=entity, id=entity_id)
        await self.set_json(key, data, CacheConfig.CACHE_TTL)

    async def del_entity(self, entity: str, entity_id: str) -> None:
        key = self._build_key("cache:{entity}:{id}", entity=entity, id=entity_id)
        await self.delete(key)

    # User cache operations
    async def get_user(self, user_id: str) -> dict | None:
        key = self._build_key("cache:user:{user_id}", user_id=user_id)
        return await self.get_json(key)

    async def set_user(self, user_id: str, data: dict) -> None:
        key = self._build_key("cache:user:{user_id}", user_id=user_id)
        await self.set_json(key, data, CacheConfig.USER_CACHE_TTL)

    async def del_user(self, user_id: str) -> None:
        key = self._build_key("cache:user:{user_id}", user_id=user_id)
        await self.delete(key)

    # Permission cache operations
    async def get_permissions(self, user_id: str) -> list[str] | None:
        key = self._build_key("cache:permissions:{user_id}", user_id=user_id)
        return await self.get_json(key)

    async def set_permissions(self, user_id: str, permissions: list[str]) -> None:
        key = self._build_key("cache:permissions:{user_id}", user_id=user_id)
        await self.set_json(key, permissions, CacheConfig.PERMISSION_CACHE_TTL)

    async def del_permissions(self, user_id: str) -> None:
        key = self._build_key("cache:permissions:{user_id}", user_id=user_id)
        await self.delete(key)
