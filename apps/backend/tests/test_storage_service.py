"""Storage service unit tests."""

import pytest
from src.app.core.config import settings
from src.app.services.exceptions import (
    FileTooLargeError,
    InvalidFileTypeError,
)
from src.app.services.storage_service import StorageService


@pytest.fixture
def storage_settings(monkeypatch):
    """Configure S3 settings for tests."""
    monkeypatch.setattr(settings, "s3_endpoint_url", "http://localhost:8333")
    monkeypatch.setattr(settings, "s3_access_key_id", "testing")
    monkeypatch.setattr(settings, "s3_secret_access_key", "testing")
    monkeypatch.setattr(settings, "s3_bucket_name", "test-bucket")
    monkeypatch.setattr(settings, "s3_region", "us-east-1")
    monkeypatch.setattr(settings, "s3_use_ssl", False)
    monkeypatch.setattr(settings, "s3_max_file_size", 1024 * 1024)  # 1MB
    monkeypatch.setattr(
        settings, "s3_allowed_extensions", [".txt", ".pdf", ".jpg", ".png"]
    )


@pytest.fixture
def storage_service_instance(storage_settings):
    """Create storage service instance."""
    return StorageService()


def test_validate_file_success(storage_service_instance):
    """Test file validation with valid file."""
    # Should not raise any exception
    storage_service_instance._validate_file("test.txt", 100)
    storage_service_instance._validate_file("document.pdf", 500)
    storage_service_instance._validate_file("image.jpg", 1000)


def test_validate_file_too_large(storage_service_instance):
    """Test file validation with oversized file."""
    with pytest.raises(FileTooLargeError):
        storage_service_instance._validate_file("test.txt", 1024 * 1024 + 1)


def test_validate_file_invalid_type(storage_service_instance):
    """Test file validation with invalid file type."""
    with pytest.raises(InvalidFileTypeError):
        storage_service_instance._validate_file("script.exe", 100)

    with pytest.raises(InvalidFileTypeError):
        storage_service_instance._validate_file("malware.bat", 100)


def test_generate_key_without_prefix(storage_service_instance):
    """Test key generation without prefix."""
    key = storage_service_instance._generate_key("test.txt")
    assert key.endswith(".txt")
    assert "/" in key  # Contains date path


def test_generate_key_with_prefix(storage_service_instance):
    """Test key generation with prefix."""
    key = storage_service_instance._generate_key("test.txt", prefix="documents")
    assert key.startswith("documents/")
    assert key.endswith(".txt")


def test_generate_key_truncates_long_filename(storage_service_instance):
    """Test key generation truncates long filenames."""
    long_name = "a" * 100 + ".txt"
    key = storage_service_instance._generate_key(long_name)
    # Base name should be truncated to 50 chars
    assert len(key.split("/")[-1].split("_")[1]) <= 54  # 50 + ".txt"


def test_generate_key_preserves_extension(storage_service_instance):
    """Test key generation preserves file extension."""
    key = storage_service_instance._generate_key("IMAGE.PNG")
    assert key.endswith(".png")  # Extension should be lowercase


def test_get_client_config_with_endpoint(storage_service_instance):
    """Test client config includes endpoint URL."""
    config = storage_service_instance._get_client_config()
    assert config["endpoint_url"] == "http://localhost:8333"
    assert config["use_ssl"] is False


def test_get_client_config_without_endpoint(storage_settings, monkeypatch):
    """Test client config without custom endpoint."""
    monkeypatch.setattr(settings, "s3_endpoint_url", None)
    monkeypatch.setattr(settings, "s3_use_ssl", True)

    service = StorageService()
    config = service._get_client_config()

    assert "endpoint_url" not in config
    assert "use_ssl" not in config  # True is default, not explicitly set
