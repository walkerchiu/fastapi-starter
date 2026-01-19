"""Circuit Breaker implementation for fault tolerance.

States:
- CLOSED: Normal operation, requests pass through
- OPEN: Circuit is tripped, requests fail immediately
- HALF_OPEN: Testing if service recovered, limited requests allowed
"""

import asyncio
import logging
import time
from collections.abc import Awaitable, Callable
from enum import Enum
from typing import Any

logger = logging.getLogger(__name__)


class CircuitState(str, Enum):
    """Circuit breaker states."""

    CLOSED = "CLOSED"
    OPEN = "OPEN"
    HALF_OPEN = "HALF_OPEN"


class CircuitBreakerError(Exception):
    """Exception raised when circuit breaker is open."""

    def __init__(self, message: str, circuit_name: str) -> None:
        super().__init__(message)
        self.circuit_name = circuit_name


class CircuitBreaker:
    """Circuit breaker implementation with async support."""

    def __init__(
        self,
        name: str = "default",
        failure_threshold: int = 5,
        success_threshold: int = 3,
        timeout: float = 30.0,
        is_failure: Callable[[Exception], bool] | None = None,
    ) -> None:
        """
        Initialize circuit breaker.

        Args:
            name: Name for logging and identification
            failure_threshold: Number of failures before opening circuit
            success_threshold: Number of successes in half-open to close circuit
            timeout: Time in seconds before attempting recovery
            is_failure: Custom function to determine if error should trip circuit
        """
        self.name = name
        self.failure_threshold = failure_threshold
        self.success_threshold = success_threshold
        self.timeout = timeout
        self.is_failure = is_failure or (lambda _: True)

        self._state = CircuitState.CLOSED
        self._failure_count = 0
        self._success_count = 0
        self._last_failure_time: float | None = None
        self._lock = asyncio.Lock()

    @property
    def state(self) -> CircuitState:
        """Get current circuit state, checking for timeout-based transition."""
        if self._state == CircuitState.OPEN and self._should_attempt_reset():
            self._transition_to(CircuitState.HALF_OPEN)
        return self._state

    async def call[T](self, fn: Callable[[], Awaitable[T]]) -> T:
        """
        Execute an async function with circuit breaker protection.

        Args:
            fn: Async function to execute

        Returns:
            Result of the function

        Raises:
            CircuitBreakerError: If circuit is open
            Exception: If the wrapped function raises
        """
        async with self._lock:
            current_state = self.state

            if current_state == CircuitState.OPEN:
                raise CircuitBreakerError(
                    f"Circuit breaker '{self.name}' is open",
                    self.name,
                )

        try:
            result = await fn()
            await self._on_success()
            return result
        except Exception as e:
            await self._on_failure(e)
            raise

    def call_sync[T](self, fn: Callable[[], T]) -> T:
        """
        Execute a sync function with circuit breaker protection.

        Args:
            fn: Sync function to execute

        Returns:
            Result of the function

        Raises:
            CircuitBreakerError: If circuit is open
            Exception: If the wrapped function raises
        """
        current_state = self.state

        if current_state == CircuitState.OPEN:
            raise CircuitBreakerError(
                f"Circuit breaker '{self.name}' is open",
                self.name,
            )

        try:
            result = fn()
            self._on_success_sync()
            return result
        except Exception as e:
            self._on_failure_sync(e)
            raise

    def is_allowed(self) -> bool:
        """Check if circuit breaker allows the request."""
        return self.state != CircuitState.OPEN

    def reset(self) -> None:
        """Manually reset the circuit breaker to closed state."""
        self._failure_count = 0
        self._success_count = 0
        self._last_failure_time = None
        self._transition_to(CircuitState.CLOSED)

    def get_stats(self) -> dict[str, Any]:
        """Get circuit breaker statistics."""
        return {
            "name": self.name,
            "state": self.state.value,
            "failure_count": self._failure_count,
            "success_count": self._success_count,
            "last_failure_time": self._last_failure_time,
        }

    def _should_attempt_reset(self) -> bool:
        """Check if enough time has passed to attempt reset."""
        if self._last_failure_time is None:
            return False
        return time.time() - self._last_failure_time >= self.timeout

    async def _on_success(self) -> None:
        """Handle successful execution."""
        async with self._lock:
            self._on_success_sync()

    def _on_success_sync(self) -> None:
        """Handle successful execution (sync version)."""
        if self._state == CircuitState.HALF_OPEN:
            self._success_count += 1
            if self._success_count >= self.success_threshold:
                self._transition_to(CircuitState.CLOSED)
                self._failure_count = 0
                self._success_count = 0
        elif self._state == CircuitState.CLOSED:
            self._failure_count = 0

    async def _on_failure(self, error: Exception) -> None:
        """Handle failed execution."""
        async with self._lock:
            self._on_failure_sync(error)

    def _on_failure_sync(self, error: Exception) -> None:
        """Handle failed execution (sync version)."""
        if not self.is_failure(error):
            return

        self._last_failure_time = time.time()

        if self._state == CircuitState.HALF_OPEN:
            self._transition_to(CircuitState.OPEN)
            self._success_count = 0
        elif self._state == CircuitState.CLOSED:
            self._failure_count += 1
            if self._failure_count >= self.failure_threshold:
                self._transition_to(CircuitState.OPEN)

    def _transition_to(self, new_state: CircuitState) -> None:
        """Transition to a new state with logging."""
        if self._state != new_state:
            logger.info(
                "Circuit breaker '%s' state change: %s -> %s",
                self.name,
                self._state.value,
                new_state.value,
            )
            self._state = new_state


def create_circuit_breaker(
    name: str = "default",
    failure_threshold: int = 5,
    success_threshold: int = 3,
    timeout: float = 30.0,
) -> CircuitBreaker:
    """Create a circuit breaker with the given options."""
    return CircuitBreaker(
        name=name,
        failure_threshold=failure_threshold,
        success_threshold=success_threshold,
        timeout=timeout,
    )
