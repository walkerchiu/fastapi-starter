"""Audit logging utilities and decorators."""

import uuid
from contextvars import ContextVar
from dataclasses import dataclass, field
from functools import wraps
from typing import Any, TypeVar

from sqlalchemy.ext.asyncio import AsyncSession

# Type variable for generic return type
T = TypeVar("T")


@dataclass
class AuditContext:
    """Context for audit logging containing request information."""

    actor_id: uuid.UUID | None = None
    actor_ip: str = "unknown"
    actor_user_agent: str = ""
    request_id: str | None = None
    metadata: dict[str, Any] = field(default_factory=dict)


# Context variable to store audit context for the current request
audit_context_var: ContextVar[AuditContext | None] = ContextVar(
    "audit_context", default=None
)


def get_audit_context() -> AuditContext | None:
    """Get the current audit context from context variable."""
    return audit_context_var.get()


def set_audit_context(context: AuditContext) -> None:
    """Set the audit context for the current request."""
    audit_context_var.set(context)


def clear_audit_context() -> None:
    """Clear the audit context."""
    audit_context_var.set(None)


def get_client_ip(request: Any) -> str:
    """Extract client IP from request, handling proxy headers."""
    # Check for forwarded headers (reverse proxy)
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        # Take the first IP in the chain (original client)
        return forwarded_for.split(",")[0].strip()

    # Check for real IP header
    real_ip = request.headers.get("x-real-ip")
    if real_ip:
        return real_ip.strip()

    # Fall back to direct client IP
    if request.client:
        return request.client.host

    return "unknown"


def get_user_agent(request: Any) -> str:
    """Extract User-Agent from request headers."""
    return request.headers.get("user-agent", "")[:500]


def compute_changes(
    before: dict[str, Any] | None, after: dict[str, Any] | None
) -> dict[str, Any] | None:
    """
    Compute the changes between before and after states.

    Args:
        before: The state before the change (dict or model dict)
        after: The state after the change (dict or model dict)

    Returns:
        A dict with 'before' and 'after' keys showing changed fields only,
        or None if no changes.
    """
    if before is None or after is None:
        return None

    # Filter out sensitive fields
    sensitive_fields = {
        "password",
        "password_hash",
        "hashed_password",
        "secret",
        "token",
    }

    changes_before: dict[str, Any] = {}
    changes_after: dict[str, Any] = {}

    # Find all keys
    all_keys = set(before.keys()) | set(after.keys())

    for key in all_keys:
        # Skip sensitive fields
        if key.lower() in sensitive_fields:
            continue

        before_val = before.get(key)
        after_val = after.get(key)

        if before_val != after_val:
            changes_before[key] = before_val
            changes_after[key] = after_val

    if not changes_before and not changes_after:
        return None

    return {"before": changes_before, "after": changes_after}


def model_to_dict(model: Any, exclude: set[str] | None = None) -> dict[str, Any]:
    """
    Convert a SQLAlchemy model to a dictionary for comparison.

    Args:
        model: SQLAlchemy model instance
        exclude: Fields to exclude from the dict

    Returns:
        Dictionary representation of the model
    """
    if model is None:
        return {}

    exclude = exclude or set()
    result: dict[str, Any] = {}

    # Try to get dict from __dict__ or model attributes
    if hasattr(model, "__dict__"):
        for key, value in model.__dict__.items():
            if key.startswith("_") or key in exclude:
                continue
            # Convert UUID to string for JSON serialization
            if isinstance(value, uuid.UUID):
                result[key] = str(value)
            elif hasattr(value, "isoformat"):
                result[key] = value.isoformat()
            elif isinstance(value, (str, int, float, bool, type(None))):
                result[key] = value
            elif isinstance(value, (list, dict)):
                result[key] = value

    return result


async def log_audit_action(
    db: AsyncSession,
    action: str,
    entity_type: str,
    entity_id: str | None = None,
    actor_id: uuid.UUID | None = None,
    actor_ip: str = "unknown",
    actor_user_agent: str = "",
    changes: dict[str, Any] | None = None,
    extra_data: dict[str, Any] | None = None,
) -> None:
    """
    Log an audit action to the database.

    This is a low-level function that directly creates an audit log entry.
    For most cases, prefer using the audit_log decorator.

    Args:
        db: Database session
        action: Action type (e.g., "user.created", "role.updated")
        entity_type: Entity type (e.g., "User", "Role")
        entity_id: ID of the affected entity
        actor_id: ID of the user performing the action
        actor_ip: IP address of the actor
        actor_user_agent: User agent string
        changes: Dict with 'before' and 'after' state
        extra_data: Additional metadata
    """
    # Import here to avoid circular imports
    from src.app.models.audit_log import AuditLog

    audit_log = AuditLog(
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        actor_id=actor_id,
        actor_ip=actor_ip,
        actor_user_agent=actor_user_agent,
        changes=changes,
        extra_data=extra_data,
    )

    db.add(audit_log)
    # Note: The caller is responsible for committing the transaction


async def log_audit_from_context(
    db: AsyncSession,
    action: str,
    entity_type: str,
    entity_id: str | None = None,
    changes: dict[str, Any] | None = None,
    extra_metadata: dict[str, Any] | None = None,
) -> None:
    """
    Log an audit action using the current audit context.

    This function automatically retrieves actor information from the
    audit context that was set by the middleware.

    Args:
        db: Database session
        action: Action type (e.g., "user.created", "role.updated")
        entity_type: Entity type (e.g., "User", "Role")
        entity_id: ID of the affected entity
        changes: Dict with 'before' and 'after' state
        extra_metadata: Additional metadata to include
    """
    context = get_audit_context()

    actor_id = None
    actor_ip = "unknown"
    actor_user_agent = ""
    extra_data_dict: dict[str, Any] = {}

    if context:
        actor_id = context.actor_id
        actor_ip = context.actor_ip
        actor_user_agent = context.actor_user_agent
        extra_data_dict = dict(context.metadata)
        if context.request_id:
            extra_data_dict["request_id"] = context.request_id

    if extra_metadata:
        extra_data_dict.update(extra_metadata)

    await log_audit_action(
        db=db,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        actor_id=actor_id,
        actor_ip=actor_ip,
        actor_user_agent=actor_user_agent,
        changes=changes,
        extra_data=extra_data_dict if extra_data_dict else None,
    )


class AuditLogConfig:
    """Configuration for the audit_log decorator."""

    def __init__(
        self,
        action: str,
        entity_type: str,
        entity_id_param: str | None = None,
        capture_changes: bool = False,
        exclude_fields: set[str] | None = None,
    ):
        """
        Initialize audit log configuration.

        Args:
            action: Action type (e.g., "user.created", "role.updated")
            entity_type: Entity type (e.g., "User", "Role")
            entity_id_param: Name of the parameter containing entity ID
            capture_changes: Whether to capture before/after changes
            exclude_fields: Fields to exclude from change capture
        """
        self.action = action
        self.entity_type = entity_type
        self.entity_id_param = entity_id_param
        self.capture_changes = capture_changes
        self.exclude_fields = exclude_fields or {"password", "password_hash", "secret"}


def audit_log(
    action: str,
    entity_type: str,
    entity_id_param: str | None = None,
    capture_changes: bool = False,
    exclude_fields: set[str] | None = None,
):
    """
    Decorator for automatically logging audit events on service methods.

    This decorator wraps service methods to automatically create audit log
    entries when the method is called. It can optionally capture before/after
    changes for update operations.

    Args:
        action: Action type (e.g., "user.created", "role.updated")
        entity_type: Entity type (e.g., "User", "Role")
        entity_id_param: Name of the parameter containing entity ID (for updates/deletes)
        capture_changes: Whether to capture before/after changes
        exclude_fields: Fields to exclude from change capture

    Usage:
        @audit_log(action="user.created", entity_type="User")
        async def create_user(self, user_data: UserCreate) -> User:
            ...

        @audit_log(
            action="user.updated",
            entity_type="User",
            entity_id_param="user_id",
            capture_changes=True
        )
        async def update_user(self, user_id: UUID, data: UserUpdate) -> User:
            ...
    """
    config = AuditLogConfig(
        action=action,
        entity_type=entity_type,
        entity_id_param=entity_id_param,
        capture_changes=capture_changes,
        exclude_fields=exclude_fields,
    )

    def decorator(func):
        @wraps(func)
        async def wrapper(self, *args, **kwargs):
            # Get the database session from self (service instance)
            db = getattr(self, "db", None)
            if db is None:
                # Just call the function if no db available
                return await func(self, *args, **kwargs)

            # Get entity ID from kwargs if specified
            entity_id = None
            if config.entity_id_param:
                entity_id = kwargs.get(config.entity_id_param)
                if entity_id is None and args:
                    # Try to get from positional args
                    # This is a simple heuristic; for complex cases, use kwargs
                    import inspect

                    sig = inspect.signature(func)
                    params = list(sig.parameters.keys())
                    if config.entity_id_param in params:
                        idx = params.index(config.entity_id_param) - 1  # -1 for self
                        if 0 <= idx < len(args):
                            entity_id = args[idx]

            # Capture before state if needed
            before_state = None
            if config.capture_changes and entity_id:
                # Try to get current state - this requires the service to have a get method
                get_method = getattr(self, "get_by_id", None) or getattr(
                    self, "get", None
                )
                if get_method:
                    try:
                        existing = await get_method(entity_id)
                        if existing:
                            before_state = model_to_dict(
                                existing, exclude=config.exclude_fields
                            )
                    except Exception:
                        pass  # Ignore errors in getting before state

            # Call the actual method
            result = await func(self, *args, **kwargs)

            # Capture after state and compute changes
            changes = None
            if config.capture_changes and result:
                after_state = model_to_dict(result, exclude=config.exclude_fields)
                if before_state:
                    changes = compute_changes(before_state, after_state)
                elif after_state:
                    # For create operations, show the created state
                    changes = {"after": after_state}

            # Get entity ID from result if not provided
            if entity_id is None and result and hasattr(result, "id"):
                entity_id = result.id

            # Convert entity_id to string for storage
            entity_id_str: str | None = None
            if entity_id is not None:
                entity_id_str = str(entity_id)

            # Log the audit action
            await log_audit_from_context(
                db=db,
                action=config.action,
                entity_type=config.entity_type,
                entity_id=entity_id_str,
                changes=changes,
            )

            return result

        return wrapper

    return decorator
