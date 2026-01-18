"""File upload and storage schemas."""

import json
from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator


class FileRead(BaseModel):
    """Response schema for file details."""

    model_config = ConfigDict(
        from_attributes=True,
    )

    id: UUID = Field(..., description="File ID")
    key: str = Field(..., description="Unique storage key for the file")
    filename: str = Field(..., description="Original filename")
    size: int = Field(..., description="File size in bytes")
    content_type: str = Field("", description="MIME type of the file")
    bucket: str = Field(..., description="Storage bucket name")
    user_id: UUID = Field(..., description="ID of the user who uploaded the file")
    metadata: dict[str, Any] | None = Field(None, description="Additional metadata")
    created_at: datetime = Field(..., description="File creation time")
    updated_at: datetime = Field(..., description="File last update time")
    deleted_at: datetime | None = Field(None, description="Soft delete timestamp")

    @field_validator("metadata", mode="before")
    @classmethod
    def parse_metadata(cls, v: str | dict[str, Any] | None) -> dict[str, Any] | None:
        """Parse metadata from JSON string if needed."""
        if v is None:
            return None
        if isinstance(v, dict):
            return v
        if isinstance(v, str):
            return json.loads(v)
        return None

    def __init__(self, **data: Any):
        """Initialize FileRead with field name mapping."""
        # Map file_metadata to metadata for API response
        if "file_metadata" in data and "metadata" not in data:
            data["metadata"] = data.pop("file_metadata")
        super().__init__(**data)


class FileUploadResponse(BaseModel):
    """Response schema for file upload."""

    key: str = Field(..., description="Unique storage key for the file")
    filename: str = Field(..., description="Original filename")
    size: int = Field(..., description="File size in bytes")
    content_type: str = Field("", description="MIME type of the file")
    bucket: str = Field(..., description="Storage bucket name")
    url: str | None = Field(None, description="Presigned URL for file access")

    model_config = {
        "json_schema_extra": {
            "example": {
                "key": "2024/01/01/abc123_document.pdf",
                "filename": "document.pdf",
                "size": 102400,
                "content_type": "application/pdf",
                "bucket": "uploads",
                "url": "http://localhost:8333/uploads/2024/01/01/abc123_document.pdf?...",
            }
        }
    }


class FileInfo(BaseModel):
    """File information schema."""

    key: str = Field(..., description="Storage key of the file")
    size: int = Field(..., description="File size in bytes")
    last_modified: datetime | None = Field(None, description="Last modification time")
    content_type: str = Field("", description="MIME type of the file")

    model_config = {
        "json_schema_extra": {
            "example": {
                "key": "2024/01/01/abc123_document.pdf",
                "size": 102400,
                "last_modified": "2024-01-01T12:00:00Z",
                "content_type": "application/pdf",
            }
        }
    }


class FileListResponse(BaseModel):
    """Response schema for file listing."""

    files: list[FileInfo] = Field(default_factory=list, description="List of files")
    count: int = Field(..., description="Number of files returned")

    model_config = {
        "json_schema_extra": {
            "example": {
                "files": [
                    {
                        "key": "2024/01/01/abc123_document.pdf",
                        "size": 102400,
                        "last_modified": "2024-01-01T12:00:00Z",
                    }
                ],
                "count": 1,
            }
        }
    }


class PresignedUrlResponse(BaseModel):
    """Response schema for presigned URL."""

    url: str = Field(..., description="Presigned URL for file access")
    expires_in: int = Field(..., description="URL expiration time in seconds")

    model_config = {
        "json_schema_extra": {
            "example": {
                "url": "http://localhost:8333/uploads/...",
                "expires_in": 3600,
            }
        }
    }


class BatchFileUploadResult(BaseModel):
    """Result for a single file in batch upload."""

    filename: str = Field(..., description="Original filename")
    success: bool = Field(..., description="Whether upload was successful")
    key: str | None = Field(None, description="Storage key if successful")
    size: int | None = Field(None, description="File size if successful")
    content_type: str | None = Field(None, description="MIME type if successful")
    url: str | None = Field(None, description="Presigned URL if successful")
    error: str | None = Field(None, description="Error message if failed")

    model_config = {
        "json_schema_extra": {
            "example": {
                "filename": "document.pdf",
                "success": True,
                "key": "2024/01/01/abc123_document.pdf",
                "size": 102400,
                "content_type": "application/pdf",
                "url": "http://localhost:8333/uploads/...",
                "error": None,
            }
        }
    }


class BatchFileUploadResponse(BaseModel):
    """Response schema for batch file upload."""

    results: list[BatchFileUploadResult] = Field(
        ..., description="Results for each uploaded file"
    )
    successful: int = Field(..., description="Number of successfully uploaded files")
    failed: int = Field(..., description="Number of failed uploads")

    model_config = {
        "json_schema_extra": {
            "example": {
                "results": [
                    {
                        "filename": "doc1.pdf",
                        "success": True,
                        "key": "2024/01/01/abc123_doc1.pdf",
                        "size": 102400,
                        "content_type": "application/pdf",
                        "url": "http://localhost:8333/uploads/...",
                    },
                    {
                        "filename": "invalid.exe",
                        "success": False,
                        "error": "File type not permitted.",
                    },
                ],
                "successful": 1,
                "failed": 1,
            }
        }
    }


class FileUpdate(BaseModel):
    """Request schema for updating file metadata."""

    filename: str | None = Field(None, description="New filename")
    metadata: dict[str, Any] | None = Field(None, description="New metadata")

    model_config = {
        "json_schema_extra": {
            "example": {
                "filename": "renamed_document.pdf",
                "metadata": {"description": "Updated document"},
            }
        }
    }


class BatchDeleteRequest(BaseModel):
    """Request schema for batch file deletion."""

    file_ids: list[UUID] = Field(
        ..., description="List of file IDs to delete", min_length=1
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "file_ids": [
                    "550e8400-e29b-41d4-a716-446655440000",
                    "550e8400-e29b-41d4-a716-446655440001",
                    "550e8400-e29b-41d4-a716-446655440002",
                ],
            }
        }
    }


class BatchDeleteResponse(BaseModel):
    """Response schema for batch file deletion."""

    successful: int = Field(..., description="Number of successfully deleted files")
    failed: int = Field(..., description="Number of failed deletions")
    errors: list[str] = Field(
        default_factory=list, description="Error messages for failed deletions"
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "successful": 2,
                "failed": 1,
                "errors": ["file 3: not found"],
            }
        }
    }
