"""Tests for GraphQL subscriptions."""

import asyncio
from datetime import datetime

import pytest
from src.app.graphql.subscriptions import (
    UserActivity,
    UserActivityPubSub,
    UserActivityType,
    publish_user_created,
    publish_user_deleted,
    publish_user_logged_in,
    publish_user_updated,
    user_activity_pubsub,
)


class TestUserActivityPubSub:
    """Tests for UserActivityPubSub class."""

    @pytest.fixture
    def pubsub(self):
        """Create a fresh pubsub instance for testing."""
        return UserActivityPubSub()

    async def test_publish_to_subscriber(self, pubsub: UserActivityPubSub):
        """Test that published activities are received by subscribers."""
        received_activities = []

        async def subscriber():
            async for activity in pubsub.subscribe():
                received_activities.append(activity)
                if len(received_activities) >= 1:
                    break

        # Start subscriber in background
        subscriber_task = asyncio.create_task(subscriber())

        # Give subscriber time to start
        await asyncio.sleep(0.01)

        # Publish activity
        activity = UserActivity(
            activity_type=UserActivityType.USER_CREATED,
            user_id=1,
            email="test@example.com",
            timestamp=datetime.now(),
            message="Test user created",
        )
        await pubsub.publish(activity)

        # Wait for subscriber to receive
        await asyncio.wait_for(subscriber_task, timeout=1.0)

        assert len(received_activities) == 1
        assert received_activities[0].activity_type == UserActivityType.USER_CREATED
        assert received_activities[0].user_id == 1
        assert received_activities[0].email == "test@example.com"

    async def test_multiple_subscribers(self, pubsub: UserActivityPubSub):
        """Test that activities are delivered to all subscribers."""
        received_1 = []
        received_2 = []

        async def subscriber_1():
            async for activity in pubsub.subscribe():
                received_1.append(activity)
                if len(received_1) >= 1:
                    break

        async def subscriber_2():
            async for activity in pubsub.subscribe():
                received_2.append(activity)
                if len(received_2) >= 1:
                    break

        # Start both subscribers
        task_1 = asyncio.create_task(subscriber_1())
        task_2 = asyncio.create_task(subscriber_2())

        await asyncio.sleep(0.01)

        # Publish single activity
        activity = UserActivity(
            activity_type=UserActivityType.USER_UPDATED,
            user_id=2,
            email="updated@example.com",
            timestamp=datetime.now(),
            message="User updated",
        )
        await pubsub.publish(activity)

        # Wait for both subscribers
        await asyncio.wait_for(asyncio.gather(task_1, task_2), timeout=1.0)

        assert len(received_1) == 1
        assert len(received_2) == 1
        assert received_1[0].user_id == received_2[0].user_id == 2

    async def test_subscriber_cleanup_on_cancel(self, pubsub: UserActivityPubSub):
        """Test that subscribers are removed when cancelled."""
        assert len(pubsub._subscribers) == 0

        async def subscriber():
            async for _ in pubsub.subscribe():
                pass

        task = asyncio.create_task(subscriber())
        await asyncio.sleep(0.01)

        # Subscriber should be registered
        assert len(pubsub._subscribers) == 1

        # Cancel the subscriber
        task.cancel()
        try:
            await task
        except asyncio.CancelledError:
            pass

        # Subscriber should be cleaned up
        assert len(pubsub._subscribers) == 0


class TestPublishHelperFunctions:
    """Tests for publish helper functions."""

    @pytest.fixture(autouse=True)
    def clear_subscribers(self):
        """Clear global pubsub subscribers before each test."""
        user_activity_pubsub._subscribers.clear()
        yield
        user_activity_pubsub._subscribers.clear()

    async def test_publish_user_created(self):
        """Test publish_user_created helper."""
        received = []

        async def subscriber():
            async for activity in user_activity_pubsub.subscribe():
                received.append(activity)
                break

        task = asyncio.create_task(subscriber())
        await asyncio.sleep(0.01)

        await publish_user_created(user_id=10, email="new@example.com")

        await asyncio.wait_for(task, timeout=1.0)

        assert len(received) == 1
        assert received[0].activity_type == UserActivityType.USER_CREATED
        assert received[0].user_id == 10
        assert received[0].email == "new@example.com"
        assert "new@example.com" in received[0].message

    async def test_publish_user_updated(self):
        """Test publish_user_updated helper."""
        received = []

        async def subscriber():
            async for activity in user_activity_pubsub.subscribe():
                received.append(activity)
                break

        task = asyncio.create_task(subscriber())
        await asyncio.sleep(0.01)

        await publish_user_updated(user_id=20, email="updated@example.com")

        await asyncio.wait_for(task, timeout=1.0)

        assert len(received) == 1
        assert received[0].activity_type == UserActivityType.USER_UPDATED
        assert received[0].user_id == 20
        assert received[0].email == "updated@example.com"

    async def test_publish_user_deleted(self):
        """Test publish_user_deleted helper."""
        received = []

        async def subscriber():
            async for activity in user_activity_pubsub.subscribe():
                received.append(activity)
                break

        task = asyncio.create_task(subscriber())
        await asyncio.sleep(0.01)

        await publish_user_deleted(user_id=30)

        await asyncio.wait_for(task, timeout=1.0)

        assert len(received) == 1
        assert received[0].activity_type == UserActivityType.USER_DELETED
        assert received[0].user_id == 30
        assert received[0].email is None

    async def test_publish_user_logged_in(self):
        """Test publish_user_logged_in helper."""
        received = []

        async def subscriber():
            async for activity in user_activity_pubsub.subscribe():
                received.append(activity)
                break

        task = asyncio.create_task(subscriber())
        await asyncio.sleep(0.01)

        await publish_user_logged_in(user_id=40, email="login@example.com")

        await asyncio.wait_for(task, timeout=1.0)

        assert len(received) == 1
        assert received[0].activity_type == UserActivityType.USER_LOGGED_IN
        assert received[0].user_id == 40
        assert received[0].email == "login@example.com"


class TestUserActivityType:
    """Tests for UserActivityType enum."""

    def test_activity_types_exist(self):
        """Test that all expected activity types exist."""
        assert UserActivityType.USER_CREATED.value == "USER_CREATED"
        assert UserActivityType.USER_UPDATED.value == "USER_UPDATED"
        assert UserActivityType.USER_DELETED.value == "USER_DELETED"
        assert UserActivityType.USER_LOGGED_IN.value == "USER_LOGGED_IN"
        assert UserActivityType.USER_LOGGED_OUT.value == "USER_LOGGED_OUT"


class TestUserActivity:
    """Tests for UserActivity type."""

    def test_user_activity_creation(self):
        """Test creating a UserActivity instance."""
        now = datetime.now()
        activity = UserActivity(
            activity_type=UserActivityType.USER_CREATED,
            user_id=1,
            email="test@example.com",
            timestamp=now,
            message="Test message",
        )

        assert activity.activity_type == UserActivityType.USER_CREATED
        assert activity.user_id == 1
        assert activity.email == "test@example.com"
        assert activity.timestamp == now
        assert activity.message == "Test message"

    def test_user_activity_with_null_fields(self):
        """Test UserActivity with optional null fields."""
        activity = UserActivity(
            activity_type=UserActivityType.USER_DELETED,
            user_id=None,
            email=None,
            timestamp=datetime.now(),
            message="Anonymous activity",
        )

        assert activity.user_id is None
        assert activity.email is None
