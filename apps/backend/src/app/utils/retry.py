"""Retry utility with exponential backoff support."""

import asyncio
import logging
import random
from collections.abc import Awaitable, Callable
from enum import Enum

logger = logging.getLogger(__name__)


class RetryStrategy(str, Enum):
    """Backoff strategy for retry delays."""

    EXPONENTIAL = "exponential"
    LINEAR = "linear"
    CONSTANT = "constant"


# Common retryable error types
RETRYABLE_EXCEPTIONS = (
    ConnectionError,
    ConnectionRefusedError,
    ConnectionResetError,
    TimeoutError,
    OSError,
)


def is_retryable_error(error: Exception) -> bool:
    """Check if an error is retryable based on type and message."""
    if isinstance(error, RETRYABLE_EXCEPTIONS):
        return True

    message = str(error).lower()
    retryable_patterns = [
        "timeout",
        "connection refused",
        "temporarily unavailable",
        "service unavailable",
        "connection reset",
        "network unreachable",
    ]
    return any(pattern in message for pattern in retryable_patterns)


def _calculate_delay(
    attempt: int,
    base_delay: float,
    max_delay: float,
    strategy: RetryStrategy,
    jitter: bool,
) -> float:
    """Calculate delay based on strategy and attempt number."""
    if strategy == RetryStrategy.EXPONENTIAL:
        delay = base_delay * (2 ** (attempt - 1))
    elif strategy == RetryStrategy.LINEAR:
        delay = base_delay * attempt
    else:  # constant
        delay = base_delay

    # Add jitter (up to 10% of base delay)
    if jitter:
        delay += random.uniform(0, base_delay * 0.1)

    return min(delay, max_delay)


async def with_retry[T](
    fn: Callable[[], Awaitable[T]],
    *,
    max_retries: int = 3,
    base_delay: float = 1.0,
    max_delay: float = 30.0,
    strategy: RetryStrategy = RetryStrategy.EXPONENTIAL,
    jitter: bool = True,
    should_retry: Callable[[Exception], bool] | None = None,
    operation_name: str = "operation",
) -> T:
    """
    Execute an async function with retry logic.

    Args:
        fn: The async function to execute
        max_retries: Maximum number of retry attempts (default: 3)
        base_delay: Base delay in seconds (default: 1.0)
        max_delay: Maximum delay cap in seconds (default: 30.0)
        strategy: Backoff strategy (default: exponential)
        jitter: Add random jitter to prevent thundering herd (default: True)
        should_retry: Custom function to determine if error is retryable
        operation_name: Operation name for logging

    Returns:
        The result of the function

    Raises:
        Exception: The last error if all retries are exhausted

    Example:
        result = await with_retry(
            lambda: fetch_data(),
            max_retries=3,
            strategy=RetryStrategy.EXPONENTIAL,
        )
    """
    retry_checker = should_retry or is_retryable_error
    last_error: Exception | None = None

    for attempt in range(1, max_retries + 1):
        try:
            return await fn()
        except Exception as e:
            last_error = e

            # Check if we should retry
            if not retry_checker(e):
                raise

            # If this was the last attempt, raise
            if attempt == max_retries:
                logger.error(
                    f"{operation_name} failed after {max_retries} retries: {e}"
                )
                raise

            # Calculate delay and wait
            delay = _calculate_delay(attempt, base_delay, max_delay, strategy, jitter)
            logger.warning(
                f"Retry attempt {attempt}/{max_retries} for {operation_name} "
                f"after {delay:.2f}s: {e}"
            )

            await asyncio.sleep(delay)

    # This should never be reached, but type checker needs it
    raise last_error  # type: ignore[misc]


def with_retry_sync[T](
    fn: Callable[[], T],
    *,
    max_retries: int = 3,
    base_delay: float = 1.0,
    max_delay: float = 30.0,
    strategy: RetryStrategy = RetryStrategy.EXPONENTIAL,
    jitter: bool = True,
    should_retry: Callable[[Exception], bool] | None = None,
    operation_name: str = "operation",
) -> T:
    """
    Execute a sync function with retry logic.

    Same as with_retry but for synchronous functions.
    """
    import time

    retry_checker = should_retry or is_retryable_error
    last_error: Exception | None = None

    for attempt in range(1, max_retries + 1):
        try:
            return fn()
        except Exception as e:
            last_error = e

            if not retry_checker(e):
                raise

            if attempt == max_retries:
                logger.error(
                    f"{operation_name} failed after {max_retries} retries: {e}"
                )
                raise

            delay = _calculate_delay(attempt, base_delay, max_delay, strategy, jitter)
            logger.warning(
                f"Retry attempt {attempt}/{max_retries} for {operation_name} "
                f"after {delay:.2f}s: {e}"
            )

            time.sleep(delay)

    raise last_error  # type: ignore[misc]
