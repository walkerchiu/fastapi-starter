"""GraphQL File type."""

from datetime import datetime
from typing import Any

import strawberry
from strawberry.scalars import JSON


@strawberry.type
class FileType:
    """GraphQL type for File."""

    id: strawberry.ID
    key: str
    filename: str
    size: int
    content_type: str = strawberry.field(name="contentType")
    user_id: strawberry.ID = strawberry.field(name="userId")
    bucket: str
    metadata: JSON | None
    created_at: datetime = strawberry.field(name="createdAt")
    updated_at: datetime = strawberry.field(name="updatedAt")
    deleted_at: datetime | None = strawberry.field(name="deletedAt", default=None)

    @classmethod
    def from_model(cls, file: Any) -> "FileType":
        """Create FileType from a File model instance."""
        return cls(
            id=file.id,
            key=file.key,
            filename=file.filename,
            size=file.size,
            content_type=file.content_type,
            user_id=file.user_id,
            bucket=file.bucket,
            metadata=file.file_metadata,
            created_at=file.created_at,
            updated_at=file.updated_at,
            deleted_at=file.deleted_at,
        )


@strawberry.type
class PaginatedFiles:
    """Paginated files response."""

    items: list[FileType]
    total: int
    skip: int
    limit: int
    has_more: bool = strawberry.field(name="hasMore")


@strawberry.type
class PresignedUrlType:
    """GraphQL type for presigned URL response."""

    url: str
    expires_in: int = strawberry.field(name="expiresIn")


@strawberry.type
class FileUploadType:
    """GraphQL type for file upload response."""

    key: str
    filename: str
    size: int
    content_type: str = strawberry.field(name="contentType", default="")
    bucket: str
    url: str | None = None


@strawberry.type
class BatchFileUploadResultType:
    """Result for a single file in batch upload."""

    filename: str
    success: bool
    key: str | None = None
    size: int | None = None
    content_type: str | None = strawberry.field(name="contentType", default=None)
    url: str | None = None
    error: str | None = None


@strawberry.type
class BatchFileUploadResponseType:
    """Response type for batch file upload."""

    results: list[BatchFileUploadResultType]
    successful: int
    failed: int


@strawberry.input
class UpdateFileInput:
    """Input type for updating a file's metadata."""

    filename: str | None = None
    metadata: JSON | None = None


@strawberry.input
class BatchDeleteFilesInput:
    """Input type for batch file deletion."""

    file_ids: list[strawberry.ID] = strawberry.field(name="fileIds")


@strawberry.type
class BatchDeleteFilesResponse:
    """Response type for batch file deletion."""

    successful: int
    failed: int
    errors: list[str]
