"""REST API error schemas and error codes."""

from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class ErrorCode(str, Enum):
    """REST API error codes - aligned with GraphQL error codes."""

    # Authentication errors (1xxx)
    UNAUTHENTICATED = "UNAUTHENTICATED"
    INVALID_CREDENTIALS = "INVALID_CREDENTIALS"
    INVALID_TOKEN = "INVALID_TOKEN"
    TOKEN_EXPIRED = "TOKEN_EXPIRED"
    INACTIVE_USER = "INACTIVE_USER"

    # Authorization errors (2xxx)
    FORBIDDEN = "FORBIDDEN"
    INSUFFICIENT_PERMISSIONS = "INSUFFICIENT_PERMISSIONS"

    # Validation errors (3xxx)
    VALIDATION_ERROR = "VALIDATION_ERROR"
    INVALID_INPUT = "INVALID_INPUT"
    INVALID_EMAIL = "INVALID_EMAIL"
    WEAK_PASSWORD = "WEAK_PASSWORD"

    # Resource errors (4xxx)
    NOT_FOUND = "NOT_FOUND"
    USER_NOT_FOUND = "USER_NOT_FOUND"
    ALREADY_EXISTS = "ALREADY_EXISTS"
    EMAIL_ALREADY_EXISTS = "EMAIL_ALREADY_EXISTS"

    # Server errors (5xxx)
    INTERNAL_ERROR = "INTERNAL_ERROR"
    DATABASE_ERROR = "DATABASE_ERROR"

    # Rate limiting (6xxx)
    RATE_LIMITED = "RATE_LIMITED"


class ErrorDetail(BaseModel):
    """Additional error details for a specific field or resource."""

    field: str | None = Field(default=None, description="Field that caused the error")
    message: str | None = Field(default=None, description="Error message for this field")
    code: str | None = Field(default=None, description="Error code for this field")
    value: Any | None = Field(default=None, description="Invalid value")
    resource: str | None = Field(default=None, description="Resource type")
    id: int | str | None = Field(default=None, description="Resource ID")


class ErrorContent(BaseModel):
    """Error content with code, message and optional details."""

    code: str = Field(..., description="Machine-readable error code")
    message: str = Field(..., description="Human-readable error message")
    details: list[ErrorDetail] | None = Field(
        default=None, description="Additional error details"
    )


class ErrorResponse(BaseModel):
    """Standardized error response schema following API conventions."""

    success: bool = Field(default=False, description="Always false for error responses")
    error: ErrorContent = Field(..., description="Error content")

    model_config = {
        "json_schema_extra": {
            "example": {
                "success": False,
                "error": {
                    "code": "USER_NOT_FOUND",
                    "message": "User not found",
                    "details": [{"resource": "User", "id": 123}],
                },
            }
        }
    }
