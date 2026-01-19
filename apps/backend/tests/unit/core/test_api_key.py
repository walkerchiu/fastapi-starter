"""Tests for API Key authentication utilities."""

from unittest.mock import MagicMock, patch

import pytest
from fastapi import HTTPException

from app.core.api_key import ApiKeyAuth, _parse_api_keys, get_api_key_name


class TestParseApiKeys:
    """Tests for _parse_api_keys function."""

    def test_parse_empty_string(self) -> None:
        """Should return empty dict for empty string."""
        assert _parse_api_keys("") == {}

    def test_parse_single_key(self) -> None:
        """Should parse single key:name pair."""
        result = _parse_api_keys("sk_key1:Service 1")
        assert result == {"sk_key1": "Service 1"}

    def test_parse_multiple_keys(self) -> None:
        """Should parse multiple key:name pairs."""
        result = _parse_api_keys("sk_key1:Service 1,sk_key2:Service 2")
        assert result == {
            "sk_key1": "Service 1",
            "sk_key2": "Service 2",
        }

    def test_parse_with_whitespace(self) -> None:
        """Should handle whitespace in keys."""
        result = _parse_api_keys(" sk_key1 : Service 1 , sk_key2 : Service 2 ")
        assert result == {
            "sk_key1": "Service 1",
            "sk_key2": "Service 2",
        }

    def test_parse_invalid_format(self) -> None:
        """Should skip invalid format entries."""
        result = _parse_api_keys("sk_key1:Service 1,invalid,sk_key2:Service 2")
        assert result == {
            "sk_key1": "Service 1",
            "sk_key2": "Service 2",
        }


class TestApiKeyAuth:
    """Tests for ApiKeyAuth class."""

    @pytest.fixture
    def mock_request(self) -> MagicMock:
        """Create a mock request object."""
        request = MagicMock()
        request.state = MagicMock()
        return request

    @pytest.mark.asyncio
    async def test_require_api_key_disabled(self, mock_request: MagicMock) -> None:
        """Should raise when API key auth is disabled and required."""
        with patch("app.core.api_key.settings") as mock_settings:
            mock_settings.api_key_enabled = False

            auth = ApiKeyAuth(required=True)
            with pytest.raises(HTTPException) as exc_info:
                await auth(mock_request, None)

            assert exc_info.value.status_code == 401
            assert "not enabled" in exc_info.value.detail

    @pytest.mark.asyncio
    async def test_optional_api_key_disabled(self, mock_request: MagicMock) -> None:
        """Should return None when API key auth is disabled and optional."""
        with patch("app.core.api_key.settings") as mock_settings:
            mock_settings.api_key_enabled = False

            auth = ApiKeyAuth(required=False)
            result = await auth(mock_request, None)

            assert result is None

    @pytest.mark.asyncio
    async def test_require_api_key_missing(self, mock_request: MagicMock) -> None:
        """Should raise when API key is required but not provided."""
        with patch("app.core.api_key.settings") as mock_settings:
            mock_settings.api_key_enabled = True

            auth = ApiKeyAuth(required=True)
            with pytest.raises(HTTPException) as exc_info:
                await auth(mock_request, None)

            assert exc_info.value.status_code == 401
            assert "required" in exc_info.value.detail

    @pytest.mark.asyncio
    async def test_optional_api_key_missing(self, mock_request: MagicMock) -> None:
        """Should return None when API key is optional and not provided."""
        with patch("app.core.api_key.settings") as mock_settings:
            mock_settings.api_key_enabled = True

            auth = ApiKeyAuth(required=False)
            result = await auth(mock_request, None)

            assert result is None

    @pytest.mark.asyncio
    async def test_invalid_api_key(self, mock_request: MagicMock) -> None:
        """Should raise when API key is invalid."""
        with (
            patch("app.core.api_key.settings") as mock_settings,
            patch("app.core.api_key._api_keys", {}),
        ):
            mock_settings.api_key_enabled = True

            auth = ApiKeyAuth(required=True)
            with pytest.raises(HTTPException) as exc_info:
                await auth(mock_request, "invalid_key")

            assert exc_info.value.status_code == 401
            assert "Invalid" in exc_info.value.detail

    @pytest.mark.asyncio
    async def test_valid_api_key(self, mock_request: MagicMock) -> None:
        """Should return key name for valid API key."""
        with (
            patch("app.core.api_key.settings") as mock_settings,
            patch("app.core.api_key._api_keys", {"sk_valid": "Test Service"}),
        ):
            mock_settings.api_key_enabled = True

            auth = ApiKeyAuth(required=True)
            result = await auth(mock_request, "sk_valid")

            assert result == "Test Service"
            assert mock_request.state.api_key_name == "Test Service"


class TestGetApiKeyName:
    """Tests for get_api_key_name function."""

    def test_get_api_key_name_present(self) -> None:
        """Should return API key name when present."""
        request = MagicMock()
        request.state.api_key_name = "Test Service"

        result = get_api_key_name(request)
        assert result == "Test Service"

    def test_get_api_key_name_missing(self) -> None:
        """Should return None when API key name is missing."""
        request = MagicMock(spec=[])
        request.state = MagicMock(spec=[])

        result = get_api_key_name(request)
        assert result is None
