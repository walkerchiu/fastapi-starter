"""Tests for custom middleware."""

import pytest
from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient
from src.app.middleware import (
    AccessLogMiddleware,
    GzipMiddleware,
    HTTPSRedirectMiddleware,
    ProcessTimeMiddleware,
    TrustedHostMiddleware,
)


# Test app factory
def create_test_app() -> FastAPI:
    """Create a minimal FastAPI app for testing middleware."""
    app = FastAPI()

    @app.get("/")
    async def root():
        return {"message": "Hello, World!"}

    @app.get("/large")
    async def large():
        return {"data": "x" * 1000}

    @app.get("/health")
    async def health():
        return {"status": "ok"}

    return app


# AccessLogMiddleware tests


@pytest.mark.asyncio
async def test_access_log_middleware():
    """Test that access log middleware logs requests."""
    app = create_test_app()
    app.add_middleware(AccessLogMiddleware)

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get("/")
        assert response.status_code == 200


@pytest.mark.asyncio
async def test_access_log_middleware_error():
    """Test that access log middleware logs errors."""
    app = create_test_app()
    app.add_middleware(AccessLogMiddleware)

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get("/nonexistent")
        assert response.status_code == 404


# ProcessTimeMiddleware tests


@pytest.mark.asyncio
async def test_process_time_middleware():
    """Test that process time header is added to response."""
    app = create_test_app()
    app.add_middleware(ProcessTimeMiddleware)

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get("/")
        assert response.status_code == 200
        assert "x-process-time" in response.headers
        # Verify it's a valid float
        process_time = float(response.headers["x-process-time"])
        assert process_time >= 0


# TrustedHostMiddleware tests


@pytest.mark.asyncio
async def test_trusted_host_middleware_allowed():
    """Test that allowed hosts pass through."""
    app = create_test_app()
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=["test"])

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get("/", headers={"host": "test"})
        assert response.status_code == 200


@pytest.mark.asyncio
async def test_trusted_host_middleware_localhost():
    """Test that localhost is allowed by default."""
    app = create_test_app()
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=["example.com"])

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://localhost"
    ) as client:
        response = await client.get("/", headers={"host": "localhost"})
        assert response.status_code == 200


@pytest.mark.asyncio
async def test_trusted_host_middleware_blocked():
    """Test that untrusted hosts are blocked."""
    app = create_test_app()
    app.add_middleware(
        TrustedHostMiddleware, allowed_hosts=["example.com"], allow_localhost=False
    )

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://malicious.com"
    ) as client:
        response = await client.get("/", headers={"host": "malicious.com"})
        assert response.status_code == 400
        assert "Invalid host header" in response.text


@pytest.mark.asyncio
async def test_trusted_host_middleware_allow_all():
    """Test that wildcard allows all hosts."""
    app = create_test_app()
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=["*"])

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://any-host.com"
    ) as client:
        response = await client.get("/", headers={"host": "any-host.com"})
        assert response.status_code == 200


# HTTPSRedirectMiddleware tests


@pytest.mark.asyncio
async def test_https_redirect_middleware_http():
    """Test that HTTP is redirected to HTTPS."""
    app = create_test_app()
    app.add_middleware(HTTPSRedirectMiddleware)

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
        follow_redirects=False,
    ) as client:
        response = await client.get("/")
        assert response.status_code == 301
        assert response.headers["location"].startswith("https://")


@pytest.mark.asyncio
async def test_https_redirect_middleware_excluded_path():
    """Test that excluded paths are not redirected."""
    app = create_test_app()
    app.add_middleware(HTTPSRedirectMiddleware)

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
        follow_redirects=False,
    ) as client:
        response = await client.get("/health")
        assert response.status_code == 200


@pytest.mark.asyncio
async def test_https_redirect_middleware_forwarded_proto():
    """Test that X-Forwarded-Proto is respected."""
    app = create_test_app()
    app.add_middleware(HTTPSRedirectMiddleware)

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
        follow_redirects=False,
    ) as client:
        response = await client.get("/", headers={"x-forwarded-proto": "https"})
        assert response.status_code == 200


# GzipMiddleware tests


@pytest.mark.asyncio
async def test_gzip_middleware_compresses_large_response():
    """Test that large responses are compressed."""
    app = create_test_app()
    app.add_middleware(GzipMiddleware, minimum_size=100)

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get(
            "/large", headers={"accept-encoding": "gzip, deflate"}
        )
        assert response.status_code == 200
        assert response.headers.get("content-encoding") == "gzip"


@pytest.mark.asyncio
async def test_gzip_middleware_skips_small_response():
    """Test that small responses are not compressed."""
    app = create_test_app()
    app.add_middleware(GzipMiddleware, minimum_size=1000)

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get("/", headers={"accept-encoding": "gzip, deflate"})
        assert response.status_code == 200
        assert response.headers.get("content-encoding") is None


@pytest.mark.asyncio
async def test_gzip_middleware_no_accept_encoding():
    """Test that responses are not compressed without accept-encoding: gzip header."""
    app = create_test_app()
    app.add_middleware(GzipMiddleware, minimum_size=100)

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        # Explicitly set accept-encoding to identity to disable compression
        response = await client.get("/large", headers={"accept-encoding": "identity"})
        assert response.status_code == 200
        assert response.headers.get("content-encoding") is None
