"""Tests for Apollo Sandbox endpoint."""

from unittest.mock import MagicMock

import pytest
from fastapi import Request
from fastapi.testclient import TestClient
from src.app.graphql.sandbox import (
    APOLLO_SANDBOX_HTML,
    apollo_sandbox_handler,
    get_apollo_sandbox_html,
)


class TestApolloSandboxHTML:
    """Tests for Apollo Sandbox HTML template."""

    def test_html_contains_apollo_sandbox_script(self) -> None:
        """Test that HTML template contains Apollo Sandbox CDN script."""
        assert "embeddable-sandbox.cdn.apollographql.com" in APOLLO_SANDBOX_HTML

    def test_html_contains_sandbox_div(self) -> None:
        """Test that HTML template contains sandbox container div."""
        assert '<div id="sandbox"></div>' in APOLLO_SANDBOX_HTML

    def test_html_contains_title_placeholder(self) -> None:
        """Test that HTML template contains title placeholder."""
        assert "{title}" in APOLLO_SANDBOX_HTML

    def test_html_contains_endpoint_placeholder(self) -> None:
        """Test that HTML template contains endpoint placeholder."""
        assert "{endpoint}" in APOLLO_SANDBOX_HTML

    def test_html_has_proper_doctype(self) -> None:
        """Test that HTML template starts with proper DOCTYPE."""
        assert APOLLO_SANDBOX_HTML.strip().startswith("<!DOCTYPE html>")


class TestGetApolloSandboxHtml:
    """Tests for get_apollo_sandbox_html function."""

    def test_generates_html_with_correct_endpoint(self) -> None:
        """Test that function generates HTML with correct GraphQL endpoint."""
        mock_request = MagicMock(spec=Request)
        mock_request.base_url = "http://localhost:8000/"

        html = get_apollo_sandbox_html(mock_request)

        assert "http://localhost:8000/graphql" in html
        assert "Apollo Sandbox" in html

    def test_generates_html_with_custom_title(self) -> None:
        """Test that function accepts custom title."""
        mock_request = MagicMock(spec=Request)
        mock_request.base_url = "http://localhost:8000/"

        html = get_apollo_sandbox_html(mock_request, title="Custom Title")

        assert "Custom Title" in html

    def test_handles_base_url_with_trailing_slash(self) -> None:
        """Test that function handles base URL with trailing slash."""
        mock_request = MagicMock(spec=Request)
        mock_request.base_url = "http://localhost:8000/"

        html = get_apollo_sandbox_html(mock_request)

        # Should not have double slashes
        assert "http://localhost:8000//graphql" not in html
        assert "http://localhost:8000/graphql" in html

    def test_handles_base_url_without_trailing_slash(self) -> None:
        """Test that function handles base URL without trailing slash."""
        mock_request = MagicMock(spec=Request)
        mock_request.base_url = "http://localhost:8000"

        html = get_apollo_sandbox_html(mock_request)

        assert "http://localhost:8000/graphql" in html

    def test_handles_https_url(self) -> None:
        """Test that function handles HTTPS URLs."""
        mock_request = MagicMock(spec=Request)
        mock_request.base_url = "https://api.example.com/"

        html = get_apollo_sandbox_html(mock_request)

        assert "https://api.example.com/graphql" in html


class TestApolloSandboxHandler:
    """Tests for apollo_sandbox_handler endpoint."""

    @pytest.mark.asyncio
    async def test_returns_html_response(self) -> None:
        """Test that handler returns HTMLResponse."""
        mock_request = MagicMock(spec=Request)
        mock_request.base_url = "http://localhost:8000/"

        response = await apollo_sandbox_handler(mock_request)

        assert response.status_code == 200
        assert response.media_type == "text/html"

    @pytest.mark.asyncio
    async def test_response_contains_apollo_sandbox(self) -> None:
        """Test that response contains Apollo Sandbox content."""
        mock_request = MagicMock(spec=Request)
        mock_request.base_url = "http://localhost:8000/"

        response = await apollo_sandbox_handler(mock_request)

        body = response.body.decode()
        assert "EmbeddedSandbox" in body
        assert "embeddable-sandbox.cdn.apollographql.com" in body


class TestApolloSandboxIntegration:
    """Integration tests for Apollo Sandbox endpoint."""

    @pytest.fixture
    def client(self) -> TestClient:
        """Create test client with development settings."""
        import os

        # Ensure development mode for testing
        original_env = os.environ.get("ENVIRONMENT")
        os.environ["ENVIRONMENT"] = "development"

        from src.app.main import app

        yield TestClient(app)

        # Restore original environment
        if original_env:
            os.environ["ENVIRONMENT"] = original_env
        else:
            os.environ.pop("ENVIRONMENT", None)

    def test_sandbox_endpoint_returns_html(self, client: TestClient) -> None:
        """Test that /graphql returns Apollo Sandbox HTML page."""
        response = client.get("/graphql")

        assert response.status_code == 200
        assert "text/html" in response.headers["content-type"]

    def test_sandbox_endpoint_contains_graphql_endpoint(
        self, client: TestClient
    ) -> None:
        """Test that sandbox page contains correct GraphQL endpoint."""
        response = client.get("/graphql")

        assert "/graphql" in response.text
        assert "EmbeddedSandbox" in response.text

    def test_sandbox_endpoint_has_proper_html_structure(
        self, client: TestClient
    ) -> None:
        """Test that sandbox page has proper HTML structure."""
        response = client.get("/graphql")

        assert "<!DOCTYPE html>" in response.text
        assert "<html" in response.text
        assert "</html>" in response.text
        assert '<div id="sandbox">' in response.text

    def test_graphql_post_still_works(self, client: TestClient) -> None:
        """Test that GraphQL POST requests still work."""
        response = client.post(
            "/graphql",
            json={"query": "{ __typename }"},
        )

        assert response.status_code == 200
        assert response.json() == {"data": {"__typename": "Query"}}
