"""GraphQL subscription resolvers."""

import asyncio
from collections.abc import AsyncGenerator
from datetime import datetime
from enum import Enum

import strawberry


@strawberry.enum
class UserActivityType(Enum):
    """Types of user activities."""

    USER_CREATED = "USER_CREATED"
    USER_UPDATED = "USER_UPDATED"
    USER_DELETED = "USER_DELETED"
    USER_LOGGED_IN = "USER_LOGGED_IN"
    USER_LOGGED_OUT = "USER_LOGGED_OUT"


@strawberry.type
class UserActivity:
    """User activity event."""

    activity_type: UserActivityType
    user_id: int | None
    email: str | None
    timestamp: datetime
    message: str


# Simple in-memory pub/sub for user activities
class UserActivityPubSub:
    """Simple pub/sub for user activities."""

    def __init__(self):
        self._subscribers: list[asyncio.Queue] = []

    async def subscribe(self) -> AsyncGenerator[UserActivity]:
        """Subscribe to user activities."""
        queue: asyncio.Queue = asyncio.Queue()
        self._subscribers.append(queue)
        try:
            while True:
                activity = await queue.get()
                yield activity
        finally:
            self._subscribers.remove(queue)

    async def publish(self, activity: UserActivity):
        """Publish a user activity to all subscribers."""
        for queue in self._subscribers:
            await queue.put(activity)


# Global instance
user_activity_pubsub = UserActivityPubSub()


# Helper functions to publish activities
async def publish_user_created(user_id: int, email: str):
    """Publish user created event."""
    activity = UserActivity(
        activity_type=UserActivityType.USER_CREATED,
        user_id=user_id,
        email=email,
        timestamp=datetime.now(),
        message=f"User {email} was created",
    )
    await user_activity_pubsub.publish(activity)


async def publish_user_updated(user_id: int, email: str):
    """Publish user updated event."""
    activity = UserActivity(
        activity_type=UserActivityType.USER_UPDATED,
        user_id=user_id,
        email=email,
        timestamp=datetime.now(),
        message=f"User {email} was updated",
    )
    await user_activity_pubsub.publish(activity)


async def publish_user_deleted(user_id: int):
    """Publish user deleted event."""
    activity = UserActivity(
        activity_type=UserActivityType.USER_DELETED,
        user_id=user_id,
        email=None,
        timestamp=datetime.now(),
        message=f"User {user_id} was deleted",
    )
    await user_activity_pubsub.publish(activity)


async def publish_user_logged_in(user_id: int, email: str):
    """Publish user login event."""
    activity = UserActivity(
        activity_type=UserActivityType.USER_LOGGED_IN,
        user_id=user_id,
        email=email,
        timestamp=datetime.now(),
        message=f"User {email} logged in",
    )
    await user_activity_pubsub.publish(activity)


async def publish_user_logged_out(user_id: int, email: str):
    """Publish user logout event."""
    activity = UserActivity(
        activity_type=UserActivityType.USER_LOGGED_OUT,
        user_id=user_id,
        email=email,
        timestamp=datetime.now(),
        message=f"User {email} logged out",
    )
    await user_activity_pubsub.publish(activity)


@strawberry.type
class Subscription:
    """GraphQL subscription resolvers."""

    @strawberry.subscription
    async def user_activities(self) -> AsyncGenerator[UserActivity]:
        """Subscribe to all user activities."""
        async for activity in user_activity_pubsub.subscribe():
            yield activity

    @strawberry.subscription
    async def countdown(self, start: int = 10) -> AsyncGenerator[int]:
        """Simple countdown subscription for testing."""
        for i in range(start, 0, -1):
            yield i
            await asyncio.sleep(1)
