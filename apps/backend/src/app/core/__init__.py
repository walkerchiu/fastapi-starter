"""Core module exports."""

from src.app.core.audit import (
    AuditContext,
    AuditLogConfig,
    audit_context_var,
    audit_log,
    clear_audit_context,
    compute_changes,
    get_audit_context,
    get_client_ip,
    get_user_agent,
    log_audit_action,
    log_audit_from_context,
    model_to_dict,
    set_audit_context,
)
from src.app.core.config import settings
from src.app.core.error_codes import ErrorCode
from src.app.core.exception_handlers import (
    service_exception_handler,
    sqlalchemy_exception_handler,
)
from src.app.core.logging import Logger, get_logger, setup_logging
from src.app.core.redis import RedisPool, get_redis, redis_lifespan
from src.app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    get_password_hash,
    verify_password,
)
from src.app.core.validators import (
    EMAIL_MAX_LENGTH,
    NAME_MAX_LENGTH,
    NAME_MIN_LENGTH,
    PAGINATION_DEFAULT_LIMIT,
    PAGINATION_DEFAULT_SKIP,
    PAGINATION_MAX_LIMIT,
    PASSWORD_MAX_LENGTH,
    PASSWORD_MIN_LENGTH,
    ValidationResult,
    normalize_email,
    normalize_name,
    validate_email_format,
    validate_name_format,
    validate_pagination_params,
    validate_password_strength,
)

__all__ = [
    # Audit
    "AuditContext",
    "AuditLogConfig",
    "audit_context_var",
    "audit_log",
    "clear_audit_context",
    "compute_changes",
    "get_audit_context",
    "get_client_ip",
    "get_user_agent",
    "log_audit_action",
    "log_audit_from_context",
    "model_to_dict",
    "set_audit_context",
    # Error codes
    "ErrorCode",
    # Config
    "settings",
    # Logging
    "Logger",
    "get_logger",
    "setup_logging",
    # Redis
    "RedisPool",
    "get_redis",
    "redis_lifespan",
    # Exception handlers
    "service_exception_handler",
    "sqlalchemy_exception_handler",
    # Security
    "create_access_token",
    "create_refresh_token",
    "decode_token",
    "get_password_hash",
    "verify_password",
    # Validation constants
    "EMAIL_MAX_LENGTH",
    "PASSWORD_MIN_LENGTH",
    "PASSWORD_MAX_LENGTH",
    "NAME_MIN_LENGTH",
    "NAME_MAX_LENGTH",
    "PAGINATION_DEFAULT_SKIP",
    "PAGINATION_DEFAULT_LIMIT",
    "PAGINATION_MAX_LIMIT",
    # Validation functions
    "ValidationResult",
    "validate_email_format",
    "validate_password_strength",
    "validate_name_format",
    "validate_pagination_params",
    "normalize_email",
    "normalize_name",
]
