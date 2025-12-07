"""Tests for security utilities."""

from src.app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    get_password_hash,
    verify_password,
)


def test_password_hash():
    """Test password hashing."""
    password = "testpassword123"
    hashed = get_password_hash(password)

    assert hashed != password
    assert verify_password(password, hashed)
    assert not verify_password("wrongpassword", hashed)


def test_create_access_token():
    """Test access token creation."""
    token = create_access_token(subject="123")

    assert token is not None
    assert isinstance(token, str)
    assert len(token) > 0


def test_create_refresh_token():
    """Test refresh token creation."""
    token = create_refresh_token(subject="123")

    assert token is not None
    assert isinstance(token, str)
    assert len(token) > 0


def test_decode_access_token():
    """Test access token decoding."""
    user_id = "123"
    token = create_access_token(subject=user_id)
    payload = decode_token(token)

    assert payload is not None
    assert payload["sub"] == user_id
    assert payload["type"] == "access"


def test_decode_refresh_token():
    """Test refresh token decoding."""
    user_id = "456"
    token = create_refresh_token(subject=user_id)
    payload = decode_token(token)

    assert payload is not None
    assert payload["sub"] == user_id
    assert payload["type"] == "refresh"


def test_decode_invalid_token():
    """Test decoding an invalid token."""
    payload = decode_token("invalid-token")
    assert payload is None
