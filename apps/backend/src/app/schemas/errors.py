"""REST API error schemas.

This module provides Pydantic schemas for REST API error responses.
ErrorCode is imported from the shared core module.
"""

from typing import Any

from pydantic import BaseModel, Field
from src.app.core.error_codes import ErrorCode

# Re-export ErrorCode for backwards compatibility
__all__ = ["ErrorCode", "ErrorDetail", "ErrorContent", "ErrorResponse"]


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
