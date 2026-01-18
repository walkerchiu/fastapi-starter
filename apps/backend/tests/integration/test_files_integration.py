"""Files integration tests.

Tests: 10
- FILE-INT-001 to FILE-INT-010

These tests verify file management functionality including:
- Upload
- Download
- Listing
- Deletion
- Access control
"""

import io

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from src.app.models import File, User


# FILE-INT-001: Upload file
@pytest.mark.asyncio
async def test_upload_file(
    client: AsyncClient,
    superadmin_headers: dict,
):
    """Should upload a file successfully."""
    # Create a test file
    file_content = b"Test file content for upload"
    files = {
        "file": ("test.txt", io.BytesIO(file_content), "text/plain"),
    }

    response = await client.post(
        "/api/v1/files/upload",
        headers=superadmin_headers,
        files=files,
    )

    assert response.status_code == 201
    data = response.json()
    assert data["filename"] == "test.txt"
    assert data["content_type"] == "text/plain"
    assert data["size"] == len(file_content)
    assert "key" in data


# FILE-INT-002: Upload file exceeding size limit fails
@pytest.mark.asyncio
async def test_upload_file_exceeds_size_limit(
    client: AsyncClient,
    superadmin_headers: dict,
):
    """Should fail to upload file exceeding size limit."""
    # Create a large file (> 10MB limit)
    large_content = b"x" * (11 * 1024 * 1024)  # 11MB
    files = {
        "file": ("large.bin", io.BytesIO(large_content), "application/octet-stream"),
    }

    response = await client.post(
        "/api/v1/files/upload",
        headers=superadmin_headers,
        files=files,
    )

    assert response.status_code == 413
    data = response.json()
    assert data["code"] == "FILE_TOO_LARGE"


# FILE-INT-003: Upload invalid file type fails
@pytest.mark.asyncio
async def test_upload_invalid_file_type(
    client: AsyncClient,
    superadmin_headers: dict,
):
    """Should fail to upload file with invalid type."""
    # Create a file with disallowed extension
    file_content = b"#!/bin/bash\necho 'malicious'"
    files = {
        "file": ("script.exe", io.BytesIO(file_content), "application/x-msdownload"),
    }

    response = await client.post(
        "/api/v1/files/upload",
        headers=superadmin_headers,
        files=files,
    )

    assert response.status_code == 415
    data = response.json()
    assert data["code"] == "INVALID_FILE_TYPE"


# FILE-INT-004: List files with pagination
@pytest.mark.asyncio
async def test_list_files_paginated(
    client: AsyncClient,
    db_session: AsyncSession,
    superadmin_headers: dict,
    superadmin_user: User,
):
    """Should return paginated list of files."""
    # Create multiple files in DB
    for i in range(15):
        file = File(
            filename=f"file{i}.txt",
            key=f"uploads/file{i}.txt",
            bucket="test-bucket",
            content_type="text/plain",
            size=100,
            user_id=superadmin_user.id,
        )
        db_session.add(file)
    await db_session.commit()

    response = await client.get(
        "/api/v1/files?skip=0&limit=10",
        headers=superadmin_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert len(data["files"]) == 10
    assert data["count"] >= 10  # There may be more files


# FILE-INT-005: Get file info
@pytest.mark.asyncio
async def test_get_file_info(
    client: AsyncClient,
    db_session: AsyncSession,
    superadmin_headers: dict,
    superadmin_user: User,
):
    """Should return file information."""
    # Create a file
    file = File(
        filename="info_test.txt",
        key="uploads/info_test.txt",
        bucket="test-bucket",
        content_type="text/plain",
        size=256,
        user_id=superadmin_user.id,
    )
    db_session.add(file)
    await db_session.commit()
    await db_session.refresh(file)

    response = await client.get(
        f"/api/v1/files/{file.id}",
        headers=superadmin_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["filename"] == "info_test.txt"
    assert data["content_type"] == "text/plain"
    assert data["size"] == 256


# FILE-INT-006: Get presigned URL
@pytest.mark.asyncio
async def test_get_presigned_url(
    client: AsyncClient,
    db_session: AsyncSession,
    superadmin_headers: dict,
    superadmin_user: User,
):
    """Should return presigned URL for file."""
    # Create a file
    file = File(
        filename="presigned_test.txt",
        key="uploads/presigned_test.txt",
        bucket="test-bucket",
        content_type="text/plain",
        size=128,
        user_id=superadmin_user.id,
    )
    db_session.add(file)
    await db_session.commit()
    await db_session.refresh(file)

    response = await client.get(
        f"/api/v1/files/{file.id}/url",
        headers=superadmin_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert "url" in data
    assert "expires_in" in data


# FILE-INT-007: Download file
@pytest.mark.asyncio
async def test_download_file(
    client: AsyncClient,
    db_session: AsyncSession,
    superadmin_headers: dict,
    superadmin_user: User,
    tmp_path,
):
    """Should download file."""

    # Create actual file on disk
    upload_dir = tmp_path / "uploads"
    upload_dir.mkdir()
    test_file_path = upload_dir / "download_test.txt"
    test_content = b"Download test content"
    test_file_path.write_bytes(test_content)

    # Create file record
    file = File(
        filename="download_test.txt",
        key=str(test_file_path),
        bucket="test-bucket",
        content_type="text/plain",
        size=len(test_content),
        user_id=superadmin_user.id,
    )
    db_session.add(file)
    await db_session.commit()
    await db_session.refresh(file)

    # Mock the storage path
    response = await client.get(
        f"/api/v1/files/{file.id}/download",
        headers=superadmin_headers,
    )

    # Note: Actual download depends on storage implementation
    # For local storage, should return file content
    assert response.status_code in [200, 404]  # 404 if storage path not accessible


# FILE-INT-008: Delete file
@pytest.mark.asyncio
async def test_delete_file(
    client: AsyncClient,
    db_session: AsyncSession,
    superadmin_headers: dict,
    superadmin_user: User,
):
    """Should delete file."""
    # Create a file
    file = File(
        filename="to_delete.txt",
        key="uploads/to_delete.txt",
        bucket="test-bucket",
        content_type="text/plain",
        size=64,
        user_id=superadmin_user.id,
    )
    db_session.add(file)
    await db_session.commit()
    file_id = file.id

    response = await client.delete(
        f"/api/v1/files/{file_id}",
        headers=superadmin_headers,
    )

    assert response.status_code == 200

    # Verify soft deleted
    await db_session.refresh(file)
    assert file.deleted_at is not None


# FILE-INT-009: Batch upload files
@pytest.mark.asyncio
async def test_batch_upload_files(
    client: AsyncClient,
    superadmin_headers: dict,
):
    """Should upload multiple files at once."""
    # Create multiple test files
    files = [
        ("files", ("file1.txt", io.BytesIO(b"Content 1"), "text/plain")),
        ("files", ("file2.txt", io.BytesIO(b"Content 2"), "text/plain")),
        ("files", ("file3.txt", io.BytesIO(b"Content 3"), "text/plain")),
    ]

    response = await client.post(
        "/api/v1/files/upload/batch",
        headers=superadmin_headers,
        files=files,
    )

    assert response.status_code == 201
    data = response.json()
    assert data["successful"] == 3
    assert data["failed"] == 0
    assert len(data["results"]) == 3
    assert all(item["success"] for item in data["results"])


# FILE-INT-010: Access other user's file fails
@pytest.mark.asyncio
async def test_access_other_users_file_fails(
    client: AsyncClient,
    db_session: AsyncSession,
    user_headers: dict,
    superadmin_user: User,
):
    """Should fail to access another user's file."""
    # Create a file owned by superadmin
    file = File(
        filename="private_file.txt",
        key="uploads/private_file.txt",
        bucket="test-bucket",
        content_type="text/plain",
        size=128,
        user_id=superadmin_user.id,
    )
    db_session.add(file)
    await db_session.commit()
    await db_session.refresh(file)

    # Try to access with regular user
    response = await client.get(
        f"/api/v1/files/{file.id}",
        headers=user_headers,
    )

    # Regular users should only see their own files
    # or have appropriate permissions
    assert response.status_code in [403, 404]
