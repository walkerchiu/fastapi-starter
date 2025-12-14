"""File upload API integration tests."""

from io import BytesIO
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from httpx import AsyncClient


@pytest.fixture
def mock_file_record():
    """Create a mock file record."""
    record = MagicMock()
    record.id = 1
    record.key = "2024/01/01/abc123_test.txt"
    record.filename = "test.txt"
    record.size = 13
    record.content_type = "text/plain"
    record.bucket = "uploads"
    record.user_id = 1  # Matches the authenticated user
    return record


@pytest.mark.asyncio
async def test_upload_file_success(client: AsyncClient, auth_headers: dict[str, str]):
    """Test successful file upload."""
    mock_result = {
        "key": "2024/01/01/abc123_test.txt",
        "size": 13,
        "content_type": "text/plain",
        "bucket": "uploads",
    }

    with (
        patch(
            "src.app.api.files.storage_service.upload_file",
            new_callable=AsyncMock,
            return_value=mock_result,
        ),
        patch(
            "src.app.api.files.storage_service.get_presigned_url",
            new_callable=AsyncMock,
            return_value="http://localhost:8333/uploads/...",
        ),
        patch(
            "src.app.api.files.FileService.create",
            new_callable=AsyncMock,
        ),
    ):
        response = await client.post(
            "/api/v1/files/upload",
            files={"file": ("test.txt", BytesIO(b"Hello, World!"), "text/plain")},
            headers=auth_headers,
        )

        assert response.status_code == 201
        data = response.json()
        assert data["key"] == mock_result["key"]
        assert data["filename"] == "test.txt"
        assert data["size"] == mock_result["size"]
        assert data["content_type"] == "text/plain"


@pytest.mark.asyncio
async def test_upload_file_unauthorized(client: AsyncClient):
    """Test file upload without authentication."""
    response = await client.post(
        "/api/v1/files/upload",
        files={"file": ("test.txt", BytesIO(b"Hello, World!"), "text/plain")},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_upload_file_with_prefix(
    client: AsyncClient, auth_headers: dict[str, str]
):
    """Test file upload with custom prefix."""
    mock_result = {
        "key": "documents/2024/01/01/abc123_test.txt",
        "size": 13,
        "content_type": "text/plain",
        "bucket": "uploads",
    }

    with (
        patch(
            "src.app.api.files.storage_service.upload_file",
            new_callable=AsyncMock,
            return_value=mock_result,
        ),
        patch(
            "src.app.api.files.storage_service.get_presigned_url",
            new_callable=AsyncMock,
            return_value="http://localhost:8333/uploads/...",
        ),
        patch(
            "src.app.api.files.FileService.create",
            new_callable=AsyncMock,
        ),
    ):
        response = await client.post(
            "/api/v1/files/upload?prefix=documents",
            files={"file": ("test.txt", BytesIO(b"Hello, World!"), "text/plain")},
            headers=auth_headers,
        )

        assert response.status_code == 201
        data = response.json()
        assert data["key"].startswith("documents/")


@pytest.mark.asyncio
async def test_upload_file_too_large(client: AsyncClient, auth_headers: dict[str, str]):
    """Test file upload exceeding size limit."""
    from src.app.services.exceptions import FileTooLargeError

    with patch(
        "src.app.api.files.storage_service.upload_file",
        new_callable=AsyncMock,
        side_effect=FileTooLargeError("File too large"),
    ):
        response = await client.post(
            "/api/v1/files/upload",
            files={"file": ("large.txt", BytesIO(b"x" * 100), "text/plain")},
            headers=auth_headers,
        )

        assert response.status_code == 413
        data = response.json()
        assert data["code"] == "FILE_TOO_LARGE"


@pytest.mark.asyncio
async def test_upload_file_invalid_type(
    client: AsyncClient, auth_headers: dict[str, str]
):
    """Test file upload with invalid file type."""
    from src.app.services.exceptions import InvalidFileTypeError

    with patch(
        "src.app.api.files.storage_service.upload_file",
        new_callable=AsyncMock,
        side_effect=InvalidFileTypeError("Invalid file type"),
    ):
        response = await client.post(
            "/api/v1/files/upload",
            files={
                "file": ("script.exe", BytesIO(b"content"), "application/x-msdownload")
            },
            headers=auth_headers,
        )

        assert response.status_code == 415
        data = response.json()
        assert data["code"] == "INVALID_FILE_TYPE"


@pytest.mark.asyncio
async def test_list_files_success(client: AsyncClient, auth_headers: dict[str, str]):
    """Test listing files."""
    mock_files = [MagicMock(), MagicMock()]
    mock_files[0].key = "2024/01/01/file1.txt"
    mock_files[0].size = 100
    mock_files[0].updated_at = None
    mock_files[0].content_type = "text/plain"
    mock_files[1].key = "2024/01/01/file2.txt"
    mock_files[1].size = 200
    mock_files[1].updated_at = None
    mock_files[1].content_type = "text/plain"

    with patch(
        "src.app.api.files.FileService.list_files",
        new_callable=AsyncMock,
        return_value=(mock_files, 2),
    ):
        response = await client.get("/api/v1/files", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert data["count"] == 2
        assert len(data["files"]) == 2


@pytest.mark.asyncio
async def test_list_files_unauthorized(client: AsyncClient):
    """Test listing files without authentication."""
    response = await client.get("/api/v1/files")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_list_files_with_pagination(
    client: AsyncClient, auth_headers: dict[str, str]
):
    """Test listing files with pagination parameters."""
    mock_file = MagicMock()
    mock_file.key = "documents/file1.txt"
    mock_file.size = 100
    mock_file.updated_at = None
    mock_file.content_type = "text/plain"

    with patch(
        "src.app.api.files.FileService.list_files",
        new_callable=AsyncMock,
        return_value=([mock_file], 10),
    ):
        response = await client.get(
            "/api/v1/files?skip=5&limit=10", headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert data["count"] == 10


@pytest.mark.asyncio
async def test_get_file_by_key_success(
    client: AsyncClient, auth_headers: dict[str, str], mock_file_record
):
    """Test getting file by key."""
    with patch(
        "src.app.api.files.FileService.get_by_key",
        new_callable=AsyncMock,
        return_value=mock_file_record,
    ):
        response = await client.get(
            "/api/v1/files/key/2024/01/01/abc123_test.txt", headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert data["key"] == mock_file_record.key
        assert data["filename"] == mock_file_record.filename


@pytest.mark.asyncio
async def test_get_file_by_key_unauthorized(client: AsyncClient):
    """Test getting file by key without authentication."""
    response = await client.get("/api/v1/files/key/2024/01/01/test.txt")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_file_by_key_not_found(
    client: AsyncClient, auth_headers: dict[str, str]
):
    """Test getting non-existent file by key."""
    with patch(
        "src.app.api.files.FileService.get_by_key",
        new_callable=AsyncMock,
        return_value=None,
    ):
        response = await client.get(
            "/api/v1/files/key/nonexistent/file.txt", headers=auth_headers
        )

        assert response.status_code == 404
        data = response.json()
        assert data["code"] == "FILE_NOT_FOUND"


@pytest.mark.asyncio
async def test_get_file_by_key_forbidden(
    client: AsyncClient, auth_headers: dict[str, str]
):
    """Test getting file by key owned by another user."""
    other_user_file = MagicMock()
    other_user_file.user_id = 999  # Different from authenticated user

    with patch(
        "src.app.api.files.FileService.get_by_key",
        new_callable=AsyncMock,
        return_value=other_user_file,
    ):
        response = await client.get(
            "/api/v1/files/key/2024/01/01/test.txt", headers=auth_headers
        )

        assert response.status_code == 403
        data = response.json()
        assert data["code"] == "FORBIDDEN"


@pytest.mark.asyncio
async def test_get_presigned_url_success(
    client: AsyncClient, auth_headers: dict[str, str], mock_file_record
):
    """Test getting presigned URL."""
    with (
        patch(
            "src.app.api.files.FileService.get_by_key",
            new_callable=AsyncMock,
            return_value=mock_file_record,
        ),
        patch(
            "src.app.api.files.storage_service.file_exists",
            new_callable=AsyncMock,
            return_value=True,
        ),
        patch(
            "src.app.api.files.storage_service.get_presigned_url",
            new_callable=AsyncMock,
            return_value="http://localhost:8333/uploads/test.txt?signature=...",
        ),
    ):
        response = await client.get(
            "/api/v1/files/key/url/2024/01/01/test.txt", headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert "url" in data
        assert data["expires_in"] == 3600


@pytest.mark.asyncio
async def test_get_presigned_url_unauthorized(client: AsyncClient):
    """Test getting presigned URL without authentication."""
    response = await client.get("/api/v1/files/key/url/2024/01/01/test.txt")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_presigned_url_forbidden(
    client: AsyncClient, auth_headers: dict[str, str]
):
    """Test getting presigned URL for file owned by another user."""
    other_user_file = MagicMock()
    other_user_file.user_id = 999  # Different from authenticated user

    with patch(
        "src.app.api.files.FileService.get_by_key",
        new_callable=AsyncMock,
        return_value=other_user_file,
    ):
        response = await client.get(
            "/api/v1/files/key/url/2024/01/01/test.txt", headers=auth_headers
        )

        assert response.status_code == 403
        data = response.json()
        assert data["code"] == "FORBIDDEN"


@pytest.mark.asyncio
async def test_get_presigned_url_custom_expiry(
    client: AsyncClient, auth_headers: dict[str, str], mock_file_record
):
    """Test getting presigned URL with custom expiry."""
    with (
        patch(
            "src.app.api.files.FileService.get_by_key",
            new_callable=AsyncMock,
            return_value=mock_file_record,
        ),
        patch(
            "src.app.api.files.storage_service.file_exists",
            new_callable=AsyncMock,
            return_value=True,
        ),
        patch(
            "src.app.api.files.storage_service.get_presigned_url",
            new_callable=AsyncMock,
            return_value="http://localhost:8333/uploads/test.txt?signature=...",
        ),
    ):
        response = await client.get(
            "/api/v1/files/key/url/2024/01/01/test.txt?expires_in=7200",
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert data["expires_in"] == 7200


@pytest.mark.asyncio
async def test_get_presigned_url_file_not_found(
    client: AsyncClient, auth_headers: dict[str, str]
):
    """Test getting presigned URL for non-existent file."""
    with patch(
        "src.app.api.files.FileService.get_by_key",
        new_callable=AsyncMock,
        return_value=None,
    ):
        response = await client.get(
            "/api/v1/files/key/url/nonexistent/file.txt", headers=auth_headers
        )

        assert response.status_code == 404
        data = response.json()
        assert data["code"] == "FILE_NOT_FOUND"


@pytest.mark.asyncio
async def test_delete_file_success(
    client: AsyncClient, auth_headers: dict[str, str], mock_file_record
):
    """Test successful file deletion."""
    with (
        patch(
            "src.app.api.files.FileService.get_by_key",
            new_callable=AsyncMock,
            return_value=mock_file_record,
        ),
        patch(
            "src.app.api.files.storage_service.delete_file",
            new_callable=AsyncMock,
            return_value=True,
        ),
        patch(
            "src.app.api.files.FileService.delete",
            new_callable=AsyncMock,
        ),
    ):
        response = await client.delete(
            "/api/v1/files/key/2024/01/01/test.txt", headers=auth_headers
        )

        assert response.status_code == 200
        assert response.json()["message"] == "File deleted successfully"


@pytest.mark.asyncio
async def test_delete_file_unauthorized(client: AsyncClient):
    """Test file deletion without authentication."""
    response = await client.delete("/api/v1/files/key/2024/01/01/test.txt")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_delete_file_forbidden(client: AsyncClient, auth_headers: dict[str, str]):
    """Test deleting file owned by another user."""
    other_user_file = MagicMock()
    other_user_file.user_id = 999  # Different from authenticated user

    with patch(
        "src.app.api.files.FileService.get_by_key",
        new_callable=AsyncMock,
        return_value=other_user_file,
    ):
        response = await client.delete(
            "/api/v1/files/key/2024/01/01/test.txt", headers=auth_headers
        )

        assert response.status_code == 403
        data = response.json()
        assert data["code"] == "FORBIDDEN"


@pytest.mark.asyncio
async def test_delete_file_not_found(client: AsyncClient, auth_headers: dict[str, str]):
    """Test deleting non-existent file."""
    with patch(
        "src.app.api.files.FileService.get_by_key",
        new_callable=AsyncMock,
        return_value=None,
    ):
        response = await client.delete(
            "/api/v1/files/key/nonexistent/file.txt", headers=auth_headers
        )

        assert response.status_code == 404
        data = response.json()
        assert data["code"] == "FILE_NOT_FOUND"


# Batch upload tests


@pytest.mark.asyncio
async def test_batch_upload_success(client: AsyncClient, auth_headers: dict[str, str]):
    """Test successful batch file upload."""
    mock_result1 = {
        "key": "2024/01/01/abc123_file1.txt",
        "size": 10,
        "content_type": "text/plain",
        "bucket": "uploads",
    }
    mock_result2 = {
        "key": "2024/01/01/def456_file2.txt",
        "size": 10,
        "content_type": "text/plain",
        "bucket": "uploads",
    }

    with (
        patch(
            "src.app.api.files.storage_service.upload_file",
            new_callable=AsyncMock,
            side_effect=[mock_result1, mock_result2],
        ),
        patch(
            "src.app.api.files.storage_service.get_presigned_url",
            new_callable=AsyncMock,
            return_value="http://localhost:8333/uploads/...",
        ),
        patch(
            "src.app.api.files.FileService.create",
            new_callable=AsyncMock,
        ),
    ):
        response = await client.post(
            "/api/v1/files/upload/batch",
            files=[
                ("files", ("file1.txt", BytesIO(b"content 1"), "text/plain")),
                ("files", ("file2.txt", BytesIO(b"content 2"), "text/plain")),
            ],
            headers=auth_headers,
        )

        assert response.status_code == 201
        data = response.json()
        assert data["successful"] == 2
        assert data["failed"] == 0
        assert len(data["results"]) == 2
        assert all(r["success"] for r in data["results"])


@pytest.mark.asyncio
async def test_batch_upload_unauthorized(client: AsyncClient):
    """Test batch upload without authentication."""
    response = await client.post(
        "/api/v1/files/upload/batch",
        files=[("files", ("file.txt", BytesIO(b"content"), "text/plain"))],
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_batch_upload_partial_success(
    client: AsyncClient, auth_headers: dict[str, str]
):
    """Test batch upload with some files failing."""
    from src.app.services.exceptions import InvalidFileTypeError

    mock_result = {
        "key": "2024/01/01/abc123_valid.txt",
        "size": 10,
        "content_type": "text/plain",
        "bucket": "uploads",
    }

    with (
        patch(
            "src.app.api.files.storage_service.upload_file",
            new_callable=AsyncMock,
            side_effect=[mock_result, InvalidFileTypeError("Not allowed")],
        ),
        patch(
            "src.app.api.files.storage_service.get_presigned_url",
            new_callable=AsyncMock,
            return_value="http://localhost:8333/uploads/...",
        ),
        patch(
            "src.app.api.files.FileService.create",
            new_callable=AsyncMock,
        ),
    ):
        response = await client.post(
            "/api/v1/files/upload/batch",
            files=[
                ("files", ("valid.txt", BytesIO(b"content"), "text/plain")),
                ("files", ("invalid.exe", BytesIO(b"content"), "application/x-exe")),
            ],
            headers=auth_headers,
        )

        assert response.status_code == 201
        data = response.json()
        assert data["successful"] == 1
        assert data["failed"] == 1
        assert data["results"][0]["success"] is True
        assert data["results"][1]["success"] is False
        assert data["results"][1]["error"] == "File type not permitted."


@pytest.mark.asyncio
async def test_batch_upload_all_failed(
    client: AsyncClient, auth_headers: dict[str, str]
):
    """Test batch upload where all files fail."""
    from src.app.services.exceptions import FileTooLargeError

    with patch(
        "src.app.api.files.storage_service.upload_file",
        new_callable=AsyncMock,
        side_effect=FileTooLargeError("Too large"),
    ):
        response = await client.post(
            "/api/v1/files/upload/batch",
            files=[
                ("files", ("large1.txt", BytesIO(b"x" * 100), "text/plain")),
                ("files", ("large2.txt", BytesIO(b"x" * 100), "text/plain")),
            ],
            headers=auth_headers,
        )

        assert response.status_code == 201
        data = response.json()
        assert data["successful"] == 0
        assert data["failed"] == 2
        assert all(not r["success"] for r in data["results"])


# Hard delete tests


@pytest.mark.asyncio
async def test_hard_delete_file_by_key_success(
    client: AsyncClient, superadmin_headers: dict[str, str]
):
    """Test permanently deleting a file by key (super admin only)."""
    with patch(
        "src.app.api.files.FileService.hard_delete_by_key",
        new_callable=AsyncMock,
    ):
        response = await client.delete(
            "/api/v1/files/key/2024/01/01/test.txt/hard",
            headers=superadmin_headers,
        )

        assert response.status_code == 200
        assert response.json()["message"] == "File permanently deleted"


@pytest.mark.asyncio
async def test_hard_delete_file_by_key_unauthorized(client: AsyncClient):
    """Test hard delete file without authentication."""
    response = await client.delete("/api/v1/files/key/2024/01/01/test.txt/hard")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_hard_delete_file_by_key_forbidden(
    client: AsyncClient, auth_headers: dict[str, str]
):
    """Test hard delete file without permission."""
    response = await client.delete(
        "/api/v1/files/key/2024/01/01/test.txt/hard",
        headers=auth_headers,
    )
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_hard_delete_file_by_key_not_found(
    client: AsyncClient, superadmin_headers: dict[str, str]
):
    """Test hard delete non-existent file by key."""
    from src.app.services.exceptions import FileNotFoundError

    with patch(
        "src.app.api.files.FileService.hard_delete_by_key",
        new_callable=AsyncMock,
        side_effect=FileNotFoundError("File not found"),
    ):
        response = await client.delete(
            "/api/v1/files/key/nonexistent/file.txt/hard",
            headers=superadmin_headers,
        )

        assert response.status_code == 404
        data = response.json()
        assert data["code"] == "FILE_NOT_FOUND"
