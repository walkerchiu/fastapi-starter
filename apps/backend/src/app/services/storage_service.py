"""S3-compatible storage service for file operations."""

import os
import uuid
from contextlib import asynccontextmanager
from datetime import UTC, datetime
from typing import Any

import aioboto3
from botocore.exceptions import ClientError
from src.app.core.config import settings
from src.app.services.exceptions import (
    FileNotFoundError,
    FileTooLargeError,
    InvalidFileTypeError,
    StorageConnectionError,
    StorageError,
)


class StorageService:
    """Service for S3-compatible storage operations."""

    def __init__(self) -> None:
        self._session = aioboto3.Session()

    def _get_client_config(self) -> dict[str, Any]:
        """Get boto3 client configuration."""
        config: dict[str, Any] = {
            "service_name": "s3",
            "aws_access_key_id": settings.s3_access_key_id,
            "aws_secret_access_key": settings.s3_secret_access_key,
            "region_name": settings.s3_region,
        }

        if settings.s3_endpoint_url:
            config["endpoint_url"] = settings.s3_endpoint_url

        if not settings.s3_use_ssl:
            config["use_ssl"] = False

        return config

    @asynccontextmanager
    async def _get_client(self):
        """Get S3 client context manager."""
        async with self._session.client(**self._get_client_config()) as client:
            yield client

    def _validate_file(self, filename: str, file_size: int) -> None:
        """Validate file before upload."""
        if file_size > settings.s3_max_file_size:
            raise FileTooLargeError(
                f"File size {file_size} exceeds maximum allowed size "
                f"{settings.s3_max_file_size}"
            )

        ext = os.path.splitext(filename)[1].lower()
        if ext not in settings.s3_allowed_extensions:
            raise InvalidFileTypeError(
                f"File type '{ext}' is not allowed. "
                f"Allowed types: {settings.s3_allowed_extensions}"
            )

    def _generate_key(self, filename: str, prefix: str = "") -> str:
        """Generate unique storage key for file."""
        ext = os.path.splitext(filename)[1].lower()
        timestamp = datetime.now(UTC).strftime("%Y/%m/%d")
        unique_id = uuid.uuid4().hex[:12]
        base_name = os.path.splitext(filename)[0][:50]  # Limit base name length

        if prefix:
            return f"{prefix}/{timestamp}/{unique_id}_{base_name}{ext}"
        return f"{timestamp}/{unique_id}_{base_name}{ext}"

    async def ensure_bucket_exists(self) -> bool:
        """Ensure the configured bucket exists, create if not."""
        try:
            async with self._get_client() as client:
                try:
                    await client.head_bucket(Bucket=settings.s3_bucket_name)
                    return True
                except ClientError as e:
                    error_code = e.response.get("Error", {}).get("Code", "")
                    if error_code == "404":
                        await client.create_bucket(Bucket=settings.s3_bucket_name)
                        return True
                    raise
        except ClientError as e:
            raise StorageConnectionError(f"Failed to ensure bucket exists: {e}") from e

    async def upload_file(
        self,
        file_content: bytes,
        filename: str,
        content_type: str | None = None,
        prefix: str = "",
    ) -> dict[str, Any]:
        """
        Upload a file to S3 storage.

        Args:
            file_content: File content as bytes
            filename: Original filename
            content_type: MIME type of the file
            prefix: Optional prefix for the storage key

        Returns:
            Dict containing file metadata (key, size, content_type, url)
        """
        file_size = len(file_content)
        self._validate_file(filename, file_size)

        key = self._generate_key(filename, prefix)

        try:
            async with self._get_client() as client:
                extra_args: dict[str, Any] = {}
                if content_type:
                    extra_args["ContentType"] = content_type

                await client.put_object(
                    Bucket=settings.s3_bucket_name,
                    Key=key,
                    Body=file_content,
                    **extra_args,
                )

                return {
                    "key": key,
                    "size": file_size,
                    "content_type": content_type,
                    "bucket": settings.s3_bucket_name,
                }
        except ClientError as e:
            raise StorageError(f"Failed to upload file: {e}") from e

    async def download_file(self, key: str) -> tuple[bytes, dict[str, Any]]:
        """
        Download a file from S3 storage.

        Args:
            key: Storage key of the file

        Returns:
            Tuple of (file_content, metadata)
        """
        try:
            async with self._get_client() as client:
                response = await client.get_object(
                    Bucket=settings.s3_bucket_name, Key=key
                )
                content = await response["Body"].read()
                metadata = {
                    "content_type": response.get("ContentType"),
                    "size": response.get("ContentLength"),
                    "last_modified": response.get("LastModified"),
                }
                return content, metadata
        except ClientError as e:
            error_code = e.response.get("Error", {}).get("Code", "")
            if error_code == "NoSuchKey":
                raise FileNotFoundError(f"File not found: {key}") from e
            raise StorageError(f"Failed to download file: {e}") from e

    async def delete_file(self, key: str) -> bool:
        """
        Delete a file from S3 storage.

        Args:
            key: Storage key of the file

        Returns:
            True if deletion was successful
        """
        try:
            async with self._get_client() as client:
                await client.delete_object(Bucket=settings.s3_bucket_name, Key=key)
                return True
        except ClientError as e:
            raise StorageError(f"Failed to delete file: {e}") from e

    async def get_presigned_url(
        self, key: str, expires_in: int = 3600, method: str = "get_object"
    ) -> str:
        """
        Generate a presigned URL for file access.

        Args:
            key: Storage key of the file
            expires_in: URL expiration time in seconds (default: 1 hour)
            method: S3 method ('get_object' or 'put_object')

        Returns:
            Presigned URL string
        """
        try:
            async with self._get_client() as client:
                url = await client.generate_presigned_url(
                    ClientMethod=method,
                    Params={"Bucket": settings.s3_bucket_name, "Key": key},
                    ExpiresIn=expires_in,
                )
                return url
        except ClientError as e:
            raise StorageError(f"Failed to generate presigned URL: {e}") from e

    async def list_files(
        self, prefix: str = "", max_keys: int = 100
    ) -> list[dict[str, Any]]:
        """
        List files in the bucket.

        Args:
            prefix: Filter files by prefix
            max_keys: Maximum number of files to return

        Returns:
            List of file metadata dictionaries
        """
        try:
            async with self._get_client() as client:
                response = await client.list_objects_v2(
                    Bucket=settings.s3_bucket_name, Prefix=prefix, MaxKeys=max_keys
                )

                files = []
                for obj in response.get("Contents", []):
                    files.append(
                        {
                            "key": obj["Key"],
                            "size": obj["Size"],
                            "last_modified": obj["LastModified"],
                        }
                    )
                return files
        except ClientError as e:
            raise StorageError(f"Failed to list files: {e}") from e

    async def file_exists(self, key: str) -> bool:
        """
        Check if a file exists in storage.

        Args:
            key: Storage key of the file

        Returns:
            True if file exists, False otherwise
        """
        try:
            async with self._get_client() as client:
                await client.head_object(Bucket=settings.s3_bucket_name, Key=key)
                return True
        except ClientError as e:
            error_code = e.response.get("Error", {}).get("Code", "")
            if error_code == "404":
                return False
            raise StorageError(f"Failed to check file existence: {e}") from e


# Global service instance
storage_service = StorageService()
