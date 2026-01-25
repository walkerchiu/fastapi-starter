"""Tests for RabbitMQ messaging module."""

from unittest.mock import AsyncMock, MagicMock, patch
from uuid import uuid4

import pytest
from src.app.messaging.exceptions import (
    ConsumerNotStartedError,
    MessageDeserializationError,
    MessagePublishError,
    MessageSerializationError,
    MessagingError,
)
from src.app.messaging.types import (
    BaseMessage,
    DomainEvent,
    EmailMessage,
    EmailVerificationMessage,
    FileProcessingMessage,
    MessagePriority,
    PasswordResetEmailMessage,
    UserLoggedInEvent,
    UserRegisteredEvent,
)


class TestMessageTypes:
    """Tests for message type definitions."""

    def test_base_message_defaults(self):
        """Test BaseMessage has correct default values."""
        msg = BaseMessage()

        assert msg.id is not None
        assert msg.timestamp is not None
        assert msg.priority == MessagePriority.NORMAL
        assert msg.retry_count == 0
        assert msg.max_retries == 3

    def test_base_message_increment_retry(self):
        """Test incrementing retry count."""
        msg = BaseMessage()
        assert msg.retry_count == 0

        msg.increment_retry()
        assert msg.retry_count == 1

        msg.increment_retry()
        assert msg.retry_count == 2

    def test_base_message_can_retry(self):
        """Test can_retry logic."""
        msg = BaseMessage(max_retries=3)

        assert msg.can_retry() is True

        msg.retry_count = 2
        assert msg.can_retry() is True

        msg.retry_count = 3
        assert msg.can_retry() is False

    def test_email_message(self):
        """Test EmailMessage creation."""
        msg = EmailMessage(
            to_email="test@example.com",
            subject="Test Subject",
            template_name="welcome.html",
            context={"name": "John"},
        )

        assert msg.to_email == "test@example.com"
        assert msg.subject == "Test Subject"
        assert msg.template_name == "welcome.html"
        assert msg.context == {"name": "John"}

    def test_password_reset_email_message(self):
        """Test PasswordResetEmailMessage creation."""
        msg = PasswordResetEmailMessage(
            to_email="test@example.com",
            reset_token="abc123",
            user_name="John Doe",
        )

        assert msg.to_email == "test@example.com"
        assert msg.reset_token == "abc123"
        assert msg.user_name == "John Doe"

    def test_email_verification_message(self):
        """Test EmailVerificationMessage creation."""
        msg = EmailVerificationMessage(
            to_email="test@example.com",
            verification_token="xyz789",
            user_name="Jane Doe",
        )

        assert msg.to_email == "test@example.com"
        assert msg.verification_token == "xyz789"
        assert msg.user_name == "Jane Doe"

    def test_file_processing_message(self):
        """Test FileProcessingMessage creation."""
        file_id = uuid4()
        user_id = uuid4()
        msg = FileProcessingMessage(
            file_id=file_id,
            file_path="/uploads/test.jpg",
            operation="thumbnail",
            params={"width": 100, "height": 100},
            user_id=user_id,
        )

        assert msg.file_id == file_id
        assert msg.file_path == "/uploads/test.jpg"
        assert msg.operation == "thumbnail"
        assert msg.params == {"width": 100, "height": 100}
        assert msg.user_id == user_id

    def test_domain_event(self):
        """Test DomainEvent creation."""
        aggregate_id = uuid4()
        event = DomainEvent(
            event_type="test.event",
            aggregate_id=aggregate_id,
            aggregate_type="TestAggregate",
            metadata={"key": "value"},
        )

        assert event.event_type == "test.event"
        assert event.aggregate_id == aggregate_id
        assert event.aggregate_type == "TestAggregate"
        assert event.metadata == {"key": "value"}

    def test_user_registered_event(self):
        """Test UserRegisteredEvent creation."""
        user_id = uuid4()
        event = UserRegisteredEvent(
            user_id=user_id,
            email="newuser@example.com",
            name="New User",
        )

        assert event.event_type == "user.registered"
        assert event.aggregate_type == "User"
        assert event.user_id == user_id
        assert event.aggregate_id == user_id
        assert event.email == "newuser@example.com"
        assert event.name == "New User"

    def test_user_logged_in_event(self):
        """Test UserLoggedInEvent creation."""
        user_id = uuid4()
        event = UserLoggedInEvent(
            user_id=user_id,
            ip_address="192.168.1.1",
            user_agent="Mozilla/5.0",
        )

        assert event.event_type == "user.logged_in"
        assert event.aggregate_type == "User"
        assert event.user_id == user_id
        assert event.aggregate_id == user_id
        assert event.ip_address == "192.168.1.1"
        assert event.user_agent == "Mozilla/5.0"

    def test_message_priority_values(self):
        """Test MessagePriority enum values."""
        assert MessagePriority.LOW == 1
        assert MessagePriority.NORMAL == 5
        assert MessagePriority.HIGH == 7
        assert MessagePriority.CRITICAL == 9

    def test_message_serialization(self):
        """Test message can be serialized to JSON."""
        msg = EmailMessage(
            to_email="test@example.com",
            subject="Test",
            template_name="test.html",
        )

        json_str = msg.model_dump_json()
        assert "test@example.com" in json_str
        assert "Test" in json_str

    def test_message_deserialization(self):
        """Test message can be deserialized from JSON."""
        msg = EmailMessage(
            to_email="test@example.com",
            subject="Test Subject",
            template_name="test.html",
        )

        json_str = msg.model_dump_json()
        restored = EmailMessage.model_validate_json(json_str)

        assert restored.to_email == msg.to_email
        assert restored.subject == msg.subject
        assert restored.template_name == msg.template_name


class TestMessagingExceptions:
    """Tests for messaging exceptions."""

    def test_messaging_error_base(self):
        """Test MessagingError base exception."""
        error = MessagingError("Test error")
        assert str(error) == "Test error"
        assert error.cause is None

    def test_messaging_error_with_cause(self):
        """Test MessagingError with cause."""
        cause = ValueError("Original error")
        error = MessagingError("Wrapped error", cause=cause)

        assert str(error) == "Wrapped error"
        assert error.cause == cause

    def test_message_publish_error(self):
        """Test MessagePublishError exception."""
        error = MessagePublishError("Failed to publish")
        assert isinstance(error, MessagingError)

    def test_message_serialization_error(self):
        """Test MessageSerializationError exception."""
        error = MessageSerializationError("Failed to serialize")
        assert isinstance(error, MessagingError)

    def test_message_deserialization_error(self):
        """Test MessageDeserializationError exception."""
        error = MessageDeserializationError("Failed to deserialize")
        assert isinstance(error, MessagingError)

    def test_consumer_not_started_error(self):
        """Test ConsumerNotStartedError exception."""
        error = ConsumerNotStartedError("Consumer not started")
        assert isinstance(error, MessagingError)


class TestMessageProducer:
    """Tests for MessageProducer."""

    @pytest.fixture
    def mock_settings(self):
        """Mock settings with RabbitMQ disabled."""
        with patch("src.app.messaging.producer.settings") as mock:
            mock.rabbitmq_enabled = False
            mock.rabbitmq_exchange_name = "test_exchange"
            yield mock

    @pytest.fixture
    def mock_settings_enabled(self):
        """Mock settings with RabbitMQ enabled."""
        with patch("src.app.messaging.producer.settings") as mock:
            mock.rabbitmq_enabled = True
            mock.rabbitmq_exchange_name = "test_exchange"
            yield mock

    @pytest.fixture
    def mock_pool_not_initialized(self):
        """Mock RabbitMQPool as not initialized."""
        with patch("src.app.messaging.producer.RabbitMQPool") as mock:
            mock.is_initialized.return_value = False
            yield mock

    @pytest.fixture
    def mock_pool_initialized(self):
        """Mock RabbitMQPool as initialized."""
        with patch("src.app.messaging.producer.RabbitMQPool") as mock:
            mock.is_initialized.return_value = True
            yield mock

    async def test_publish_when_disabled(self, mock_settings):
        """Test publishing when RabbitMQ is disabled."""
        from src.app.messaging.producer import message_producer

        msg = EmailMessage(
            to_email="test@example.com",
            subject="Test",
            template_name="test.html",
        )

        # Should not raise, just log warning
        await message_producer.publish(msg, "email.generic")

    async def test_publish_when_pool_not_initialized(
        self, mock_settings_enabled, mock_pool_not_initialized
    ):
        """Test publishing when pool is not initialized."""
        from src.app.messaging.producer import message_producer

        msg = EmailMessage(
            to_email="test@example.com",
            subject="Test",
            template_name="test.html",
        )

        with pytest.raises(MessagePublishError, match="not initialized"):
            await message_producer.publish(msg, "email.generic")

    async def test_send_password_reset_email(self, mock_settings):
        """Test send_password_reset_email creates correct message."""
        from src.app.messaging.producer import message_producer

        # RabbitMQ is disabled, so it will just log
        await message_producer.send_password_reset_email(
            to_email="test@example.com",
            reset_token="abc123",
            user_name="John",
        )

    async def test_send_email_verification(self, mock_settings):
        """Test send_email_verification creates correct message."""
        from src.app.messaging.producer import message_producer

        await message_producer.send_email_verification(
            to_email="test@example.com",
            verification_token="xyz789",
            user_name="Jane",
        )

    async def test_send_email(self, mock_settings):
        """Test send_email creates correct message."""
        from src.app.messaging.producer import message_producer

        await message_producer.send_email(
            to_email="test@example.com",
            subject="Welcome",
            template_name="welcome.html",
            context={"name": "User"},
        )

    async def test_publish_event(self, mock_settings):
        """Test publish_event creates correct routing key."""
        from src.app.messaging.producer import message_producer

        event = UserRegisteredEvent(
            user_id=uuid4(),
            email="test@example.com",
        )

        await message_producer.publish_event(event)


class TestMessageConsumer:
    """Tests for MessageConsumer base class."""

    def test_consumer_init_with_defaults(self):
        """Test consumer initialization with class defaults."""
        from src.app.messaging.handlers.email_handler import EmailHandler

        handler = EmailHandler()

        assert handler._queue_name == "email_queue"
        assert handler._routing_keys == ["email.generic"]
        assert handler._prefetch_count == 10

    def test_consumer_init_with_overrides(self):
        """Test consumer initialization with overrides."""
        from src.app.messaging.handlers.email_handler import EmailHandler

        handler = EmailHandler(
            queue_name="custom_queue",
            routing_keys=["custom.*"],
            prefetch_count=5,
        )

        assert handler._queue_name == "custom_queue"
        assert handler._routing_keys == ["custom.*"]
        assert handler._prefetch_count == 5

    def test_deserialize_valid_message(self):
        """Test deserializing a valid message."""
        from src.app.messaging.handlers.email_handler import EmailHandler

        handler = EmailHandler()
        msg = EmailMessage(
            to_email="test@example.com",
            subject="Test",
            template_name="test.html",
        )

        json_bytes = msg.model_dump_json().encode()
        deserialized = handler._deserialize(json_bytes)

        assert deserialized.to_email == msg.to_email
        assert deserialized.subject == msg.subject

    def test_deserialize_invalid_message(self):
        """Test deserializing an invalid message raises error."""
        from src.app.messaging.handlers.email_handler import EmailHandler

        handler = EmailHandler()

        with pytest.raises(MessageDeserializationError):
            handler._deserialize(b"invalid json")

    async def test_stop_when_not_started(self):
        """Test stopping consumer that hasn't started."""
        from src.app.messaging.handlers.email_handler import EmailHandler

        handler = EmailHandler()

        with pytest.raises(ConsumerNotStartedError):
            await handler.stop()


class TestEmailHandlers:
    """Tests for email message handlers."""

    @pytest.fixture
    def mock_email_service(self):
        """Mock the email service."""
        with patch("src.app.messaging.handlers.email_handler.email_service") as mock:
            mock.send_email = AsyncMock()
            mock.send_password_reset_email = AsyncMock()
            mock.send_email_verification = AsyncMock()
            mock._render_template = MagicMock(return_value="<html>Test</html>")
            yield mock

    async def test_email_handler(self, mock_email_service):
        """Test EmailHandler processes message correctly."""
        from src.app.messaging.handlers.email_handler import EmailHandler

        handler = EmailHandler()
        msg = EmailMessage(
            to_email="test@example.com",
            subject="Test Subject",
            template_name="test.html",
            context={"key": "value"},
        )

        await handler.handle(msg)

        mock_email_service._render_template.assert_called_once_with(
            "test.html", {"key": "value"}
        )
        mock_email_service.send_email.assert_called_once()

    async def test_password_reset_handler(self, mock_email_service):
        """Test PasswordResetEmailHandler processes message correctly."""
        from src.app.messaging.handlers.email_handler import PasswordResetEmailHandler

        handler = PasswordResetEmailHandler()
        msg = PasswordResetEmailMessage(
            to_email="test@example.com",
            reset_token="abc123",
            user_name="John",
        )

        await handler.handle(msg)

        mock_email_service.send_password_reset_email.assert_called_once_with(
            to_email="test@example.com",
            reset_token="abc123",
            user_name="John",
        )

    async def test_email_verification_handler(self, mock_email_service):
        """Test EmailVerificationHandler processes message correctly."""
        from src.app.messaging.handlers.email_handler import EmailVerificationHandler

        handler = EmailVerificationHandler()
        msg = EmailVerificationMessage(
            to_email="test@example.com",
            verification_token="xyz789",
            user_name="Jane",
        )

        await handler.handle(msg)

        mock_email_service.send_email_verification.assert_called_once_with(
            to_email="test@example.com",
            verification_token="xyz789",
            user_name="Jane",
        )


class TestFileHandler:
    """Tests for file processing handler."""

    async def test_file_processing_handler(self):
        """Test FileProcessingHandler processes message."""
        from src.app.messaging.handlers.file_handler import FileProcessingHandler

        handler = FileProcessingHandler()
        msg = FileProcessingMessage(
            file_id=uuid4(),
            file_path="/uploads/test.jpg",
            operation="compress",
        )

        # Should not raise (just logs)
        await handler.handle(msg)

    async def test_file_processing_unknown_operation(self):
        """Test FileProcessingHandler with unknown operation."""
        from src.app.messaging.handlers.file_handler import FileProcessingHandler

        handler = FileProcessingHandler()
        msg = FileProcessingMessage(
            file_id=uuid4(),
            file_path="/uploads/test.jpg",
            operation="unknown_operation",
        )

        # Should not raise, just log warning
        await handler.handle(msg)


class TestEventHandlers:
    """Tests for event message handlers."""

    async def test_user_registered_handler(self):
        """Test UserRegisteredEventHandler processes event."""
        from src.app.messaging.handlers.event_handler import UserRegisteredEventHandler

        handler = UserRegisteredEventHandler()
        event = UserRegisteredEvent(
            user_id=uuid4(),
            email="test@example.com",
            name="Test User",
        )

        # Should not raise (just logs)
        await handler.handle(event)

    async def test_user_logged_in_handler(self):
        """Test UserLoggedInEventHandler processes event."""
        from src.app.messaging.handlers.event_handler import UserLoggedInEventHandler

        handler = UserLoggedInEventHandler()
        event = UserLoggedInEvent(
            user_id=uuid4(),
            ip_address="192.168.1.1",
            user_agent="Mozilla/5.0",
        )

        # Should not raise (just logs)
        await handler.handle(event)

    async def test_generic_event_handler(self):
        """Test GenericEventHandler processes any event."""
        from src.app.messaging.handlers.event_handler import GenericEventHandler

        handler = GenericEventHandler()
        event = DomainEvent(
            event_type="custom.event",
            aggregate_id=uuid4(),
        )

        # Should not raise (just logs)
        await handler.handle(event)


class TestRabbitMQPool:
    """Tests for RabbitMQ connection pool."""

    @pytest.fixture
    def mock_settings_disabled(self):
        """Mock settings with RabbitMQ disabled."""
        with patch("src.app.core.rabbitmq.settings") as mock:
            mock.rabbitmq_enabled = False
            yield mock

    @pytest.fixture
    def mock_settings_enabled(self):
        """Mock settings with RabbitMQ enabled."""
        with patch("src.app.core.rabbitmq.settings") as mock:
            mock.rabbitmq_enabled = True
            mock.rabbitmq_host = "localhost"
            mock.rabbitmq_port = 5672
            mock.rabbitmq_user = "guest"
            mock.rabbitmq_password = "guest"
            mock.rabbitmq_vhost = "/"
            mock.rabbitmq_pool_size = 10
            mock.rabbitmq_connection_timeout = 10000
            mock.rabbitmq_heartbeat = 60
            mock.rabbitmq_exchange_name = "test_exchange"
            mock.rabbitmq_dead_letter_exchange = "test_dlx"
            yield mock

    async def test_init_pool_when_disabled(self, mock_settings_disabled):
        """Test init_pool skips when RabbitMQ is disabled."""
        from src.app.core.rabbitmq import RabbitMQPool

        # Reset pool state
        RabbitMQPool._connection_pool = None
        RabbitMQPool._channel_pool = None

        await RabbitMQPool.init_pool()

        assert RabbitMQPool._connection_pool is None

    def test_is_initialized_false(self):
        """Test is_initialized returns False when not initialized."""
        from src.app.core.rabbitmq import RabbitMQPool

        RabbitMQPool._connection_pool = None
        RabbitMQPool._channel_pool = None

        assert RabbitMQPool.is_initialized() is False

    def test_get_connection_pool_raises_when_not_initialized(self):
        """Test get_connection_pool raises when not initialized."""
        from src.app.core.rabbitmq import RabbitMQPool

        RabbitMQPool._connection_pool = None

        with pytest.raises(RuntimeError, match="not initialized"):
            RabbitMQPool.get_connection_pool()

    def test_get_channel_pool_raises_when_not_initialized(self):
        """Test get_channel_pool raises when not initialized."""
        from src.app.core.rabbitmq import RabbitMQPool

        RabbitMQPool._channel_pool = None

        with pytest.raises(RuntimeError, match="not initialized"):
            RabbitMQPool.get_channel_pool()

    async def test_get_channel_raises_when_disabled(self, mock_settings_disabled):
        """Test get_channel raises when RabbitMQ is disabled."""
        from src.app.core.rabbitmq import get_channel

        with pytest.raises(RuntimeError, match="disabled"):
            async with get_channel():
                pass

    async def test_get_connection_raises_when_disabled(self, mock_settings_disabled):
        """Test get_connection raises when RabbitMQ is disabled."""
        from src.app.core.rabbitmq import get_connection

        with pytest.raises(RuntimeError, match="disabled"):
            async with get_connection():
                pass


class TestBaseWorker:
    """Tests for BaseWorker."""

    @pytest.fixture
    def mock_settings_disabled(self):
        """Mock settings with RabbitMQ disabled."""
        with patch("src.app.workers.base.settings") as mock:
            mock.rabbitmq_enabled = False
            yield mock

    @pytest.fixture
    def mock_settings_enabled(self):
        """Mock settings with RabbitMQ enabled."""
        with patch("src.app.workers.base.settings") as mock:
            mock.rabbitmq_enabled = True
            yield mock

    @pytest.fixture
    def mock_pool(self):
        """Mock RabbitMQPool."""
        with patch("src.app.workers.base.RabbitMQPool") as mock:
            mock.init_pool = AsyncMock()
            mock.close_pool = AsyncMock()
            yield mock

    def test_worker_init(self):
        """Test BaseWorker initialization."""
        from src.app.messaging.handlers.email_handler import EmailHandler
        from src.app.workers.base import BaseWorker

        handlers = [EmailHandler()]
        worker = BaseWorker(handlers)

        assert len(worker._handlers) == 1
        assert worker._running is False

    async def test_worker_setup_raises_when_disabled(self, mock_settings_disabled):
        """Test worker setup raises when RabbitMQ is disabled."""
        from src.app.messaging.handlers.email_handler import EmailHandler
        from src.app.workers.base import BaseWorker

        worker = BaseWorker([EmailHandler()])

        with pytest.raises(RuntimeError, match="disabled"):
            await worker._setup()

    async def test_worker_teardown(self, mock_settings_enabled, mock_pool):
        """Test worker teardown closes pool."""
        from src.app.messaging.handlers.email_handler import EmailHandler
        from src.app.workers.base import BaseWorker

        worker = BaseWorker([EmailHandler()])
        await worker._teardown()

        mock_pool.close_pool.assert_called_once()

    async def test_worker_stop_when_not_running(self):
        """Test stopping worker that isn't running."""
        from src.app.messaging.handlers.email_handler import EmailHandler
        from src.app.workers.base import BaseWorker

        worker = BaseWorker([EmailHandler()])
        worker._running = False

        # Should not raise
        await worker.stop()
