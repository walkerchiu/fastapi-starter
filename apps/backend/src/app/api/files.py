"""File upload API endpoints."""

from typing import Annotated

from fastapi import APIRouter, Depends, File, Path, Query, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession
from src.app.core.config import settings
from src.app.core.deps import CurrentUser, require_permissions
from src.app.core.exceptions import (
    FileNotFoundException,
    ForbiddenException,
    StorageException,
)
from src.app.db.session import get_db
from src.app.models import User
from src.app.schemas import (
    BatchDeleteRequest,
    BatchDeleteResponse,
    BatchFileUploadResponse,
    BatchFileUploadResult,
    ErrorResponse,
    FileInfo,
    FileListResponse,
    FileRead,
    FileUpdate,
    FileUploadResponse,
    MessageResponse,
    PresignedUrlResponse,
)
from src.app.services import (
    FileService,
    FileTooLargeError,
    InvalidFileTypeError,
    StorageError,
    storage_service,
)

router = APIRouter(prefix="/files", tags=["files"])


@router.post(
    "/upload",
    response_model=FileUploadResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload file",
    description="""
Upload a file to storage.

**Authentication required.**

**Constraints:**
- Maximum file size: configurable (default 10MB)
- Allowed file types: configurable (images, PDFs, documents)
    """,
    responses={
        201: {"description": "File successfully uploaded"},
        401: {"model": ErrorResponse, "description": "Not authenticated"},
        413: {"model": ErrorResponse, "description": "File too large"},
        415: {"model": ErrorResponse, "description": "File type not allowed"},
        500: {"model": ErrorResponse, "description": "Storage error"},
    },
)
async def upload_file(
    current_user: CurrentUser,
    file: Annotated[UploadFile, File(description="File to upload")],
    db: Annotated[AsyncSession, Depends(get_db)],
    prefix: Annotated[
        str,
        Query(description="Optional prefix for file storage path", max_length=100),
    ] = "",
) -> FileUploadResponse:
    """Upload a file to S3 storage."""
    # Read file content
    content = await file.read()

    # Upload to storage (exceptions handled by global handler)
    result = await storage_service.upload_file(
        file_content=content,
        filename=file.filename or "unnamed",
        content_type=file.content_type,
        prefix=prefix,
    )

    # Save file record to database
    file_service = FileService(db)
    await file_service.create(
        key=result["key"],
        filename=file.filename or "unnamed",
        size=result["size"],
        bucket=result["bucket"],
        user_id=current_user.id,
        content_type=result["content_type"],
    )

    # Generate presigned URL for immediate access
    url = await storage_service.get_presigned_url(result["key"])

    return FileUploadResponse(
        key=result["key"],
        filename=file.filename or "unnamed",
        size=result["size"],
        content_type=result["content_type"],
        bucket=result["bucket"],
        url=url,
    )


@router.post(
    "/upload/batch",
    response_model=BatchFileUploadResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Batch upload files",
    description="""
Upload multiple files to storage in a single request.

**Authentication required.**

**Constraints:**
- Maximum 10 files per request
- Maximum file size: configurable (default 10MB per file)
- Allowed file types: configurable (images, PDFs, documents)

**Note:** This endpoint returns partial success. Check each result's `success` field.
    """,
    responses={
        201: {"description": "Batch upload completed (check individual results)"},
        401: {"model": ErrorResponse, "description": "Not authenticated"},
    },
)
async def upload_files_batch(
    current_user: CurrentUser,
    files: Annotated[list[UploadFile], File(description="Files to upload (max 10)")],
    db: Annotated[AsyncSession, Depends(get_db)],
    prefix: Annotated[
        str,
        Query(description="Optional prefix for file storage path", max_length=100),
    ] = "",
) -> BatchFileUploadResponse:
    """Upload multiple files to S3 storage."""
    # Limit number of files
    max_files = 10
    if len(files) > max_files:
        files = files[:max_files]

    results: list[BatchFileUploadResult] = []
    file_service = FileService(db)

    for file in files:
        filename = file.filename or "unnamed"
        try:
            # Read file content
            content = await file.read()

            # Upload to storage
            result = await storage_service.upload_file(
                file_content=content,
                filename=filename,
                content_type=file.content_type,
                prefix=prefix,
            )

            # Save file record to database
            await file_service.create(
                key=result["key"],
                filename=filename,
                size=result["size"],
                bucket=result["bucket"],
                user_id=current_user.id,
                content_type=result["content_type"],
            )

            # Generate presigned URL
            url = await storage_service.get_presigned_url(result["key"])

            results.append(
                BatchFileUploadResult(
                    filename=filename,
                    success=True,
                    key=result["key"],
                    size=result["size"],
                    content_type=result["content_type"],
                    url=url,
                )
            )
        except FileTooLargeError:
            results.append(
                BatchFileUploadResult(
                    filename=filename,
                    success=False,
                    error=f"File exceeds maximum size of {settings.s3_max_file_size} bytes",
                )
            )
        except InvalidFileTypeError:
            results.append(
                BatchFileUploadResult(
                    filename=filename,
                    success=False,
                    error="File type not permitted.",
                )
            )
        except StorageError as e:
            results.append(
                BatchFileUploadResult(
                    filename=filename,
                    success=False,
                    error=f"Storage error: {e}",
                )
            )

    successful = sum(1 for r in results if r.success)
    failed = len(results) - successful

    return BatchFileUploadResponse(
        results=results,
        successful=successful,
        failed=failed,
    )


@router.get(
    "",
    response_model=FileListResponse,
    summary="List files",
    description="""
List files owned by the current user.

**Authentication required.**
    """,
    responses={
        200: {"description": "List of files"},
        401: {"model": ErrorResponse, "description": "Not authenticated"},
        500: {"model": ErrorResponse, "description": "Storage error"},
    },
)
async def list_files(
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
    skip: Annotated[int, Query(description="Number of files to skip", ge=0)] = 0,
    limit: Annotated[
        int, Query(description="Maximum number of files to return", ge=1, le=1000)
    ] = 100,
) -> FileListResponse:
    """List files owned by the current user."""
    file_service = FileService(db)
    files, total = await file_service.list_files(
        user_id=current_user.id, skip=skip, limit=limit
    )

    return FileListResponse(
        files=[
            FileInfo(
                key=f.key,
                size=f.size,
                last_modified=f.updated_at,
                content_type=f.content_type,
            )
            for f in files
        ],
        count=total,
    )


@router.get(
    "/{file_id}",
    response_model=FileRead,
    summary="Get file by ID",
    description="""
Get a file's details by its ID.

**Authentication required.**
    """,
    responses={
        200: {"description": "File details"},
        401: {"model": ErrorResponse, "description": "Not authenticated"},
        403: {"model": ErrorResponse, "description": "Not authorized to access file"},
        404: {"model": ErrorResponse, "description": "File not found"},
    },
)
async def get_file(
    current_user: CurrentUser,
    file_id: Annotated[int, Path(description="The ID of the file to retrieve", ge=1)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> FileRead:
    """Get a file by ID."""
    file_service = FileService(db)

    try:
        file_record = await file_service.get_by_id(file_id)
    except FileNotFoundError:
        raise FileNotFoundException(file_key=str(file_id)) from None

    if file_record.user_id != current_user.id:
        raise ForbiddenException(detail="You do not have access to this file")

    return FileRead.model_validate(file_record)


@router.get(
    "/{file_id}/url",
    response_model=PresignedUrlResponse,
    summary="Get presigned URL by file ID",
    description="""
Generate a presigned URL for file download using file ID.

**Authentication required.**

The URL is temporary and expires after the specified duration (default: 1 hour).
    """,
    responses={
        200: {"description": "Presigned URL generated"},
        401: {"model": ErrorResponse, "description": "Not authenticated"},
        403: {"model": ErrorResponse, "description": "Not authorized to access file"},
        404: {"model": ErrorResponse, "description": "File not found"},
        500: {"model": ErrorResponse, "description": "Storage error"},
    },
)
async def get_presigned_url_by_id(
    current_user: CurrentUser,
    file_id: Annotated[int, Path(description="The ID of the file", ge=1)],
    db: Annotated[AsyncSession, Depends(get_db)],
    expires_in: Annotated[
        int,
        Query(description="URL expiration time in seconds", ge=60, le=86400),
    ] = 3600,
) -> PresignedUrlResponse:
    """Get a presigned URL for file access by file ID."""
    try:
        file_service = FileService(db)
        file_record = await file_service.get_by_id(file_id)

        if file_record.user_id != current_user.id:
            raise ForbiddenException(detail="You do not have access to this file")

        # Check if file exists in storage
        if not await storage_service.file_exists(file_record.key):
            raise FileNotFoundException(file_key=str(file_id))

        url = await storage_service.get_presigned_url(
            file_record.key, expires_in=expires_in
        )
        return PresignedUrlResponse(url=url, expires_in=expires_in)
    except FileNotFoundError:
        raise FileNotFoundException(file_key=str(file_id)) from None
    except StorageError as e:
        raise StorageException(detail=str(e)) from None


@router.delete(
    "/batch",
    response_model=BatchDeleteResponse,
    summary="Batch delete files",
    description="""
Delete multiple files by their IDs.

**Authentication required.**

Returns the count of successful and failed deletions.
    """,
    responses={
        200: {"description": "Batch delete completed (check results)"},
        401: {"model": ErrorResponse, "description": "Not authenticated"},
        422: {"model": ErrorResponse, "description": "Validation error"},
    },
)
async def batch_delete_files(
    current_user: CurrentUser,
    request: BatchDeleteRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> BatchDeleteResponse:
    """Delete multiple files by IDs."""
    file_service = FileService(db)

    successful, failed, errors = await file_service.delete_by_ids(
        file_ids=request.file_ids,
        user_id=current_user.id,
    )

    return BatchDeleteResponse(
        successful=successful,
        failed=failed,
        errors=errors,
    )


@router.delete(
    "/{file_id}",
    
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete file by ID",
    description="""
Delete a file from storage by its ID.

**Authentication required.**
    """,
    responses={
        204: {"description": "File successfully deleted"},
        401: {"model": ErrorResponse, "description": "Not authenticated"},
        403: {"model": ErrorResponse, "description": "Not authorized to delete file"},
        404: {"model": ErrorResponse, "description": "File not found"},
        500: {"model": ErrorResponse, "description": "Storage error"},
    },
)
async def delete_file_by_id(
    current_user: CurrentUser,
    file_id: Annotated[int, Path(description="The ID of the file to delete", ge=1)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> None:
    """Delete a file from storage by its ID."""
    file_service = FileService(db)

    try:
        file_record = await file_service.get_by_id(file_id)
    except FileNotFoundError:
        raise FileNotFoundException(file_key=str(file_id)) from None

    if file_record.user_id != current_user.id:
        raise ForbiddenException(
            detail="You do not have permission to delete this file"
        )

    # Delete from storage (exceptions handled by global handler)
    await storage_service.delete_file(file_record.key)

    # Delete from database
    await file_service.delete(file_record.id)


@router.delete(
    "/{file_id}/hard",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Hard delete file",
    description="""
Permanently delete a file from storage and database.

**Super Admin only.** Requires `files:hard_delete` permission.

This operation bypasses soft delete and permanently removes the file.
The file cannot be recovered after hard deletion.
    """,
    responses={
        200: {"description": "File permanently deleted"},
        401: {"model": ErrorResponse, "description": "Not authenticated"},
        403: {"model": ErrorResponse, "description": "Insufficient permissions"},
        404: {"model": ErrorResponse, "description": "File not found"},
        500: {"model": ErrorResponse, "description": "Storage error"},
    },
)
async def hard_delete_file(
    file_id: Annotated[int, Path(description="The ID of the file to delete", ge=1)],
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[User, Depends(require_permissions("files:hard_delete"))],
) -> MessageResponse:
    """Permanently delete a file (Super Admin only)."""
    file_service = FileService(db)

    try:
        file_record = await file_service.get_by_id(file_id, include_deleted=True)
    except FileNotFoundError:
        raise FileNotFoundException(file_key=str(file_id)) from None

    # Try to delete from storage (ignore errors if file doesn't exist in storage)
    try:
        await storage_service.delete_file(file_record.key)
    except StorageError:
        pass

    # Hard delete from database
    await file_service.hard_delete(file_id, is_super_admin=True)
    return MessageResponse(message="File permanently deleted")


@router.post(
    "/{file_id}/restore",
    response_model=FileRead,
    summary="Restore soft-deleted file",
    description="""
Restore a previously soft-deleted file.

**Super Admin only.** Requires `files:hard_delete` permission.
    """,
    responses={
        200: {"description": "File restored"},
        401: {"model": ErrorResponse, "description": "Not authenticated"},
        403: {"model": ErrorResponse, "description": "Insufficient permissions"},
        404: {"model": ErrorResponse, "description": "File not found"},
        500: {"model": ErrorResponse, "description": "Database error"},
    },
)
async def restore_file(
    file_id: Annotated[int, Path(description="The ID of the file to restore", ge=1)],
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[User, Depends(require_permissions("files:hard_delete"))],
) -> FileRead:
    """Restore a soft-deleted file."""
    file_service = FileService(db)
    file_record = await file_service.restore(file_id)
    return FileRead.model_validate(file_record)


@router.patch(
    "/{file_id}",
    response_model=FileRead,
    summary="Update file",
    description="""
Update a file's metadata (filename and/or custom metadata).

**Authentication required.**
    """,
    responses={
        200: {"description": "File successfully updated"},
        401: {"model": ErrorResponse, "description": "Not authenticated"},
        403: {"model": ErrorResponse, "description": "Not authorized to update file"},
        404: {"model": ErrorResponse, "description": "File not found"},
        422: {"model": ErrorResponse, "description": "Validation error"},
    },
)
async def update_file(
    current_user: CurrentUser,
    file_id: Annotated[int, Path(description="The ID of the file to update", ge=1)],
    file_update: FileUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> FileRead:
    """Update a file's metadata."""
    file_service = FileService(db)

    try:
        file_record = await file_service.get_by_id(file_id)
    except FileNotFoundError:
        raise FileNotFoundException(file_key=str(file_id)) from None

    if file_record.user_id != current_user.id:
        raise ForbiddenException(
            detail="You do not have permission to update this file"
        )

    updated_file = await file_service.update(
        file_id=file_id,
        filename=file_update.filename,
        metadata=file_update.metadata,
    )

    return FileRead.model_validate(updated_file)


@router.get(
    "/key/url/{file_key:path}",
    response_model=PresignedUrlResponse,
    summary="Get presigned URL by key",
    description="""
Generate a presigned URL for file download using the file key.

**Authentication required.**
    """,
    responses={
        200: {"description": "Presigned URL generated"},
        401: {"model": ErrorResponse, "description": "Not authenticated"},
        403: {"model": ErrorResponse, "description": "Not authorized to access file"},
        404: {"model": ErrorResponse, "description": "File not found"},
        500: {"model": ErrorResponse, "description": "Storage error"},
    },
)
async def get_presigned_url(
    current_user: CurrentUser,
    file_key: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    expires_in: Annotated[
        int,
        Query(description="URL expiration time in seconds", ge=60, le=86400),
    ] = 3600,
) -> PresignedUrlResponse:
    """Get a presigned URL for file access."""
    # Check file ownership in database
    file_service = FileService(db)
    file_record = await file_service.get_by_key(file_key)

    if not file_record:
        raise FileNotFoundException(file_key=file_key)

    if file_record.user_id != current_user.id:
        raise ForbiddenException(detail="You do not have access to this file")

    # Check if file exists in storage
    if not await storage_service.file_exists(file_key):
        raise FileNotFoundException(file_key=file_key)

    url = await storage_service.get_presigned_url(file_key, expires_in=expires_in)
    return PresignedUrlResponse(url=url, expires_in=expires_in)


@router.get(
    "/key/{file_key:path}",
    response_model=FileRead,
    summary="Get file by key",
    description="""
Get a file's details by its storage key.

**Authentication required.**
    """,
    responses={
        200: {"description": "File details"},
        401: {"model": ErrorResponse, "description": "Not authenticated"},
        403: {"model": ErrorResponse, "description": "Not authorized to access file"},
        404: {"model": ErrorResponse, "description": "File not found"},
    },
)
async def get_file_by_key(
    current_user: CurrentUser,
    file_key: str,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> FileRead:
    """Get a file by storage key."""
    file_service = FileService(db)
    file_record = await file_service.get_by_key(file_key)

    if not file_record:
        raise FileNotFoundException(file_key=file_key)

    if file_record.user_id != current_user.id:
        raise ForbiddenException(detail="You do not have access to this file")

    return FileRead.model_validate(file_record)


@router.delete(
    "/key/{file_key:path}/hard",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Permanently delete file by key",
    description="""
Permanently delete a file from storage using the file key.

This operation cannot be undone. The file will be permanently removed from both
the database and storage.

**Super Admin only.** Requires `files:hard_delete` permission.
    """,
    responses={
        200: {"description": "File permanently deleted"},
        401: {"model": ErrorResponse, "description": "Not authenticated"},
        403: {"model": ErrorResponse, "description": "Insufficient permissions"},
        404: {"model": ErrorResponse, "description": "File not found"},
        500: {"model": ErrorResponse, "description": "Storage error"},
    },
)
async def hard_delete_file_by_key(
    file_key: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[User, Depends(require_permissions("files:hard_delete"))],
) -> MessageResponse:
    """Permanently delete a file by key."""
    file_service = FileService(db)
    await file_service.hard_delete_by_key(file_key, is_super_admin=True)
    return MessageResponse(message="File permanently deleted")


@router.delete(
    "/key/{file_key:path}",
    
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete file by key",
    description="""
Delete a file from storage using the file key.

**Authentication required.**
    """,
    responses={
        204: {"description": "File successfully deleted"},
        401: {"model": ErrorResponse, "description": "Not authenticated"},
        403: {"model": ErrorResponse, "description": "Not authorized to delete file"},
        404: {"model": ErrorResponse, "description": "File not found"},
        500: {"model": ErrorResponse, "description": "Storage error"},
    },
)
async def delete_file(
    current_user: CurrentUser,
    file_key: str,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> None:
    """Delete a file from storage."""
    # Check file ownership in database
    file_service = FileService(db)
    file_record = await file_service.get_by_key(file_key)

    if not file_record:
        raise FileNotFoundException(file_key=file_key)

    if file_record.user_id != current_user.id:
        raise ForbiddenException(
            detail="You do not have permission to delete this file"
        )

    # Delete from storage (exceptions handled by global handler)
    await storage_service.delete_file(file_key)

    # Delete from database
    await file_service.delete(file_record.id)
<<<<<<< HEAD
=======
    return MessageResponse(message="File deleted successfully")


@router.post(
    "/key/restore/{file_key:path}",
    response_model=FileRead,
    summary="Restore soft-deleted file by key",
    description="""
Restore a previously soft-deleted file using the file key.

**Super Admin only.** Requires `files:hard_delete` permission.
    """,
    responses={
        200: {"description": "File restored"},
        401: {"model": ErrorResponse, "description": "Not authenticated"},
        403: {"model": ErrorResponse, "description": "Insufficient permissions"},
        404: {"model": ErrorResponse, "description": "File not found"},
        500: {"model": ErrorResponse, "description": "Database error"},
    },
)
async def restore_file_by_key(
    file_key: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[User, Depends(require_permissions("files:hard_delete"))],
) -> FileRead:
    """Restore a soft-deleted file by key."""
    file_service = FileService(db)
    file_record = await file_service.restore_by_key(file_key)
    return FileRead.model_validate(file_record)
>>>>>>> 41ea1315c (Feat(Module): Add role-based access control (RBAC) system)
