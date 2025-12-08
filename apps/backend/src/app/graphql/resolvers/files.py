"""File GraphQL resolvers."""

import strawberry
from src.app.core.config import settings
from src.app.graphql.errors import (
    ForbiddenError,
    IsAuthenticated,
    NotFoundError,
    ValidationError,
)
from src.app.graphql.types import Message
from src.app.graphql.types.file import (
    BatchDeleteFilesInput,
    BatchDeleteFilesResponse,
    BatchFileUploadResponseType,
    BatchFileUploadResultType,
    FileType,
    FileUploadType,
    PaginatedFiles,
    PresignedUrlType,
    UpdateFileInput,
)
from src.app.graphql.validators import validate_pagination
from src.app.services import (
    FileNotFoundError,
    FileService,
    FileTooLargeError,
    InvalidFileTypeError,
    StorageError,
    storage_service,
)
from src.app.services.exceptions import ServiceError
from strawberry.file_uploads import Upload
from strawberry.types import Info


def convert_file_to_type(file) -> FileType:
    """Convert database File model to GraphQL FileType."""
    return FileType.from_model(file)


@strawberry.type
class FileQuery:
    """File query resolvers."""

    @strawberry.field(permission_classes=[IsAuthenticated])
    async def files(
        self,
        info: Info,
        skip: int = 0,
        limit: int = 100,
    ) -> PaginatedFiles:
        """Get paginated list of files owned by the current user."""
        skip, limit = validate_pagination(skip, limit, max_limit=1000)

        db = info.context["db"]
        user = info.context["user"]
        service = FileService(db)

        files, total = await service.list_files(user_id=user.id, skip=skip, limit=limit)

        items = [convert_file_to_type(f) for f in files]
        has_more = skip + len(items) < total

        return PaginatedFiles(
            items=items,
            total=total,
            skip=skip,
            limit=limit,
            has_more=has_more,
        )

    @strawberry.field(permission_classes=[IsAuthenticated])
    async def file(self, info: Info, id: strawberry.ID) -> FileType:
        """Get a file by ID."""
        db = info.context["db"]
        user = info.context["user"]
        service = FileService(db)

        try:
            file = await service.get_by_id(int(id))
            # Check ownership
            if file.user_id != user.id:
                raise NotFoundError("File", str(id))
            return convert_file_to_type(file)
        except FileNotFoundError:
            raise NotFoundError("File", str(id)) from None

    @strawberry.field(permission_classes=[IsAuthenticated])
    async def file_by_key(self, info: Info, key: str) -> FileType:
        """Get a file by storage key."""
        db = info.context["db"]
        user = info.context["user"]
        service = FileService(db)

        file = await service.get_by_key(key)
        if not file:
            raise NotFoundError("File", key)
        # Check ownership
        if file.user_id != user.id:
            raise NotFoundError("File", key)
        return convert_file_to_type(file)

    @strawberry.field(permission_classes=[IsAuthenticated])
    async def presigned_url_by_id(
        self, info: Info, id: strawberry.ID, expires_in: int = 3600
    ) -> PresignedUrlType:
        """Get a presigned URL for file download by ID."""
        db = info.context["db"]
        user = info.context["user"]
        service = FileService(db)

        try:
            file = await service.get_by_id(int(id))
        except FileNotFoundError:
            raise NotFoundError("File", id) from None

        if file.user_id != user.id:
            raise ForbiddenError("You do not have access to this file")

        try:
            if not await storage_service.file_exists(file.key):
                raise NotFoundError("File", id)

            url = await storage_service.get_presigned_url(
                file.key, expires_in=expires_in
            )
            return PresignedUrlType(url=url, expires_in=expires_in)
        except StorageError:
            raise NotFoundError("File", id) from None

    @strawberry.field(permission_classes=[IsAuthenticated])
    async def presigned_url(
        self, info: Info, key: str, expires_in: int = 3600
    ) -> PresignedUrlType:
        """Get a presigned URL for file download by key."""
        db = info.context["db"]
        user = info.context["user"]
        service = FileService(db)

        file = await service.get_by_key(key)
        if not file:
            raise NotFoundError("File", key)

        if file.user_id != user.id:
            raise ForbiddenError("You do not have access to this file")

        try:
            if not await storage_service.file_exists(key):
                raise NotFoundError("File", key)

            url = await storage_service.get_presigned_url(key, expires_in=expires_in)
            return PresignedUrlType(url=url, expires_in=expires_in)
        except StorageError:
            raise NotFoundError("File", key) from None


@strawberry.type
class FileMutation:
    """File mutation resolvers."""

    @strawberry.mutation(permission_classes=[IsAuthenticated])
    async def delete_file(self, info: Info, id: strawberry.ID) -> Message:
        """Delete a file by ID."""
        db = info.context["db"]
        user = info.context["user"]
        service = FileService(db)

        try:
            file = await service.get_by_id(int(id))
        except FileNotFoundError:
            raise NotFoundError("File", id) from None

        if file.user_id != user.id:
            raise ForbiddenError("You do not have permission to delete this file")

        try:
            # Delete from storage
            await storage_service.delete_file(file.key)
            # Delete from database
            await service.delete(file.id)
            return Message(message="File deleted successfully")
        except StorageError:
            raise NotFoundError("File", id) from None

    @strawberry.mutation(permission_classes=[IsAuthenticated])
    async def delete_file_by_key(self, info: Info, key: str) -> Message:
        """Delete a file by storage key."""
        db = info.context["db"]
        user = info.context["user"]
        service = FileService(db)

        file = await service.get_by_key(key)
        if not file:
            raise NotFoundError("File", key)

        if file.user_id != user.id:
            raise ForbiddenError("You do not have permission to delete this file")

        try:
            # Delete from storage
            await storage_service.delete_file(key)
            # Delete from database
            await service.delete(file.id)
            return Message(message="File deleted successfully")
        except StorageError:
            raise NotFoundError("File", key) from None

    @strawberry.mutation(permission_classes=[IsAuthenticated])
    async def upload_file(
        self, info: Info, file: Upload, prefix: str = ""
    ) -> FileUploadType:
        """Upload a file to storage."""
        db = info.context["db"]
        user = info.context["user"]

        # Read file content
        content = await file.read()
        filename = file.filename or "unnamed"
        content_type = file.content_type

        try:
            # Upload to storage
            result = await storage_service.upload_file(
                file_content=content,
                filename=filename,
                content_type=content_type,
                prefix=prefix,
            )

            # Save file record to database
            file_service = FileService(db)
            await file_service.create(
                key=result["key"],
                filename=filename,
                size=result["size"],
                bucket=result["bucket"],
                user_id=user.id,
                content_type=result["content_type"],
            )

            # Generate presigned URL for download
            url = await storage_service.get_presigned_url(
                result["key"], expires_in=3600
            )

            return FileUploadType(
                key=result["key"],
                filename=filename,
                size=result["size"],
                content_type=result["content_type"],
                bucket=result["bucket"],
                url=url,
            )
        except FileTooLargeError:
            raise ValidationError(
                f"File exceeds maximum size of {settings.s3_max_file_size} bytes",
                field="file",
            ) from None
        except InvalidFileTypeError:
            raise ValidationError("File type not permitted.", field="file") from None
        except StorageError as e:
            raise ValidationError(f"Storage error: {e}", field="file") from None

    @strawberry.mutation(permission_classes=[IsAuthenticated])
    async def upload_files(
        self, info: Info, files: list[Upload], prefix: str = ""
    ) -> BatchFileUploadResponseType:
        """Upload multiple files to storage."""
        db = info.context["db"]
        user = info.context["user"]

        # Limit number of files
        max_files = 10
        if len(files) > max_files:
            files = files[:max_files]

        results: list[BatchFileUploadResultType] = []
        successful = 0
        failed = 0
        file_service = FileService(db)

        for upload_file in files:
            filename = upload_file.filename or "unnamed"
            try:
                # Read file content
                content = await upload_file.read()

                # Upload to storage
                result = await storage_service.upload_file(
                    file_content=content,
                    filename=filename,
                    content_type=upload_file.content_type,
                    prefix=prefix,
                )

                # Save file record to database
                await file_service.create(
                    key=result["key"],
                    filename=filename,
                    size=result["size"],
                    bucket=result["bucket"],
                    user_id=user.id,
                    content_type=result["content_type"],
                )

                # Generate presigned URL for download
                url = await storage_service.get_presigned_url(
                    result["key"], expires_in=3600
                )

                results.append(
                    BatchFileUploadResultType(
                        filename=filename,
                        success=True,
                        key=result["key"],
                        size=result["size"],
                        content_type=result["content_type"],
                        url=url,
                    )
                )
                successful += 1
            except (FileTooLargeError, InvalidFileTypeError, StorageError) as e:
                results.append(
                    BatchFileUploadResultType(
                        filename=filename,
                        success=False,
                        error=str(e) if str(e) else "Upload failed",
                    )
                )
                failed += 1

        return BatchFileUploadResponseType(
            results=results,
            successful=successful,
            failed=failed,
        )

    @strawberry.mutation(permission_classes=[IsAuthenticated])
    async def hard_delete_file(self, info: Info, id: strawberry.ID) -> bool:
        """Permanently delete a file. Super Admin only. This cannot be undone."""
        db = info.context["db"]
        service = FileService(db)

        try:
            await service.hard_delete(int(id), is_super_admin=True)
            return True
        except ServiceError as e:
            raise ValidationError(str(e), field="file") from None

    @strawberry.mutation(permission_classes=[IsAuthenticated])
    async def restore_file(self, info: Info, id: strawberry.ID) -> FileType:
        """Restore a soft-deleted file."""
        db = info.context["db"]
        user = info.context["user"]
        service = FileService(db)

        try:
            file = await service.restore(int(id))
            # Check ownership
            if file.user_id != user.id:
                raise ForbiddenError("You do not have permission to restore this file")
            return convert_file_to_type(file)
        except ServiceError as e:
            raise ValidationError(str(e), field="file") from None

    @strawberry.mutation(permission_classes=[IsAuthenticated])
    async def hard_delete_file_by_key(self, info: Info, key: str) -> bool:
        """Permanently delete a file by key. Super Admin only. This cannot be undone."""
        db = info.context["db"]
        service = FileService(db)

        try:
            await service.hard_delete_by_key(key, is_super_admin=True)
            return True
        except ServiceError as e:
            raise ValidationError(str(e), field="file") from None

    @strawberry.mutation(permission_classes=[IsAuthenticated])
    async def restore_file_by_key(self, info: Info, key: str) -> FileType:
        """Restore a soft-deleted file by key."""
        db = info.context["db"]
        user = info.context["user"]
        service = FileService(db)

        try:
            file = await service.restore_by_key(key)
            # Check ownership
            if file.user_id != user.id:
                raise ForbiddenError("You do not have permission to restore this file")
            return convert_file_to_type(file)
        except ServiceError as e:
            raise ValidationError(str(e), field="file") from None

    @strawberry.mutation(permission_classes=[IsAuthenticated])
    async def update_file(
        self, info: Info, id: strawberry.ID, input: UpdateFileInput
    ) -> FileType | None:
        """Update a file's metadata."""
        db = info.context["db"]
        user = info.context["user"]
        service = FileService(db)

        try:
            file = await service.get_by_id(int(id))
            # Check ownership
            if file.user_id != user.id:
                raise ForbiddenError("You do not have permission to update this file")
            file = await service.update(
                int(id), filename=input.filename, metadata=input.metadata
            )
            return convert_file_to_type(file)
        except FileNotFoundError:
            return None

    @strawberry.mutation(permission_classes=[IsAuthenticated])
    async def delete_files(
        self, info: Info, input: BatchDeleteFilesInput
    ) -> BatchDeleteFilesResponse:
        """Delete multiple files by IDs."""
        db = info.context["db"]
        user = info.context["user"]
        service = FileService(db)

        successful, failed, errors = await service.delete_by_ids(
            [int(fid) for fid in input.file_ids], user.id
        )

        return BatchDeleteFilesResponse(
            successful=successful,
            failed=failed,
            errors=errors,
        )
