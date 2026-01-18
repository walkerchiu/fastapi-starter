"""Authentication integration tests.

Tests: 20
- AUTH-INT-001 to AUTH-INT-020

These tests verify the complete authentication flow including:
- Registration
- Login/Logout
- Token refresh
- Email verification
- Password reset
- 2FA setup and verification
"""

import pyotp
import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from src.app.models import User


# AUTH-INT-001: Register new user successfully
@pytest.mark.asyncio
async def test_register_new_user_success(client: AsyncClient):
    """Should successfully register a new user."""
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "newuser@example.com",
            "name": "New User",
            "password": "NewUser123!@#",
        },
    )

    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "newuser@example.com"
    assert data["name"] == "New User"
    assert "id" in data
    assert "hashed_password" not in data


# AUTH-INT-002: Register with duplicate email fails
@pytest.mark.asyncio
async def test_register_duplicate_email_fails(client: AsyncClient):
    """Should fail to register with an existing email."""
    # First registration
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "existing@example.com",
            "name": "First User",
            "password": "First123!@#",
        },
    )

    # Second registration with same email
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "existing@example.com",
            "name": "Second User",
            "password": "Second123!@#",
        },
    )

    assert response.status_code == 409
    data = response.json()
    assert data["code"] == "EMAIL_ALREADY_EXISTS"


# AUTH-INT-003: Login successfully
@pytest.mark.asyncio
async def test_login_success(client: AsyncClient, db_session: AsyncSession):
    """Should successfully login with valid credentials."""
    # Register user
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "loginuser@example.com",
            "name": "Login User",
            "password": "Login123!@#",
        },
    )

    # Login
    response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "loginuser@example.com",
            "password": "Login123!@#",
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "Bearer"


# AUTH-INT-004: Login with invalid credentials fails
@pytest.mark.asyncio
async def test_login_invalid_credentials_fails(client: AsyncClient):
    """Should fail to login with invalid credentials."""
    # Register user
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "user@example.com",
            "name": "User",
            "password": "Correct123!@#",
        },
    )

    # Login with wrong password
    response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "user@example.com",
            "password": "WrongPassword123!@#",
        },
    )

    assert response.status_code == 401
    data = response.json()
    assert data["code"] == "INVALID_CREDENTIALS"


# AUTH-INT-005: Refresh token successfully
@pytest.mark.asyncio
async def test_refresh_token_success(client: AsyncClient):
    """Should successfully refresh access token."""
    # Register and login
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "refresh@example.com",
            "name": "Refresh User",
            "password": "Refresh123!@#",
        },
    )

    login_response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "refresh@example.com",
            "password": "Refresh123!@#",
        },
    )
    refresh_token = login_response.json()["refresh_token"]

    # Refresh token
    response = await client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": refresh_token},
    )

    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data


# AUTH-INT-006: Refresh with invalid token fails
@pytest.mark.asyncio
async def test_refresh_invalid_token_fails(client: AsyncClient):
    """Should fail to refresh with invalid token."""
    response = await client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": "invalid-token"},
    )

    assert response.status_code == 401
    data = response.json()
    assert data["code"] == "INVALID_TOKEN"


# AUTH-INT-007: Get current user info
@pytest.mark.asyncio
async def test_get_current_user_success(client: AsyncClient):
    """Should return current user information."""
    # Register and login
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "current@example.com",
            "name": "Current User",
            "password": "Current123!@#",
        },
    )

    login_response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "current@example.com",
            "password": "Current123!@#",
        },
    )
    access_token = login_response.json()["access_token"]

    # Get current user
    response = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {access_token}"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "current@example.com"
    assert data["name"] == "Current User"


# AUTH-INT-008: Access without authentication fails
@pytest.mark.asyncio
async def test_access_without_auth_fails(client: AsyncClient):
    """Should fail to access protected endpoint without authentication."""
    response = await client.get("/api/v1/auth/me")

    assert response.status_code == 401
    data = response.json()
    assert data["code"] == "UNAUTHENTICATED"


# AUTH-INT-009: Logout successfully
@pytest.mark.asyncio
async def test_logout_success(client: AsyncClient):
    """Should successfully logout."""
    # Register and login
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "logout@example.com",
            "name": "Logout User",
            "password": "Logout123!@#",
        },
    )

    login_response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "logout@example.com",
            "password": "Logout123!@#",
        },
    )
    access_token = login_response.json()["access_token"]

    # Logout
    response = await client.post(
        "/api/v1/auth/logout",
        headers={"Authorization": f"Bearer {access_token}"},
    )

    assert response.status_code == 200


# AUTH-INT-010: Email verification success
@pytest.mark.asyncio
async def test_email_verification_success(
    client: AsyncClient, db_session: AsyncSession
):
    """Should successfully verify email."""
    from unittest.mock import AsyncMock, patch

    # Register user
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "verify@example.com",
            "name": "Verify User",
            "password": "Verify123!@#",
        },
    )

    # Mock the email service to capture the verification token
    captured_token = None

    async def capture_token(
        to_email: str, verification_token: str, user_name: str
    ) -> None:
        nonlocal captured_token
        captured_token = verification_token

    with patch(
        "src.app.services.auth_service.email_service.send_email_verification",
        new=AsyncMock(side_effect=capture_token),
    ):
        # Request verification email (this sends the email and captures the token)
        response = await client.post(
            "/api/v1/auth/resend-verification",
            json={"email": "verify@example.com"},
        )
        assert response.status_code == 200

    assert captured_token is not None, "Token was not captured by mock"

    # Verify email using the captured token
    response = await client.post(
        "/api/v1/auth/verify-email",
        json={"token": captured_token},
    )

    assert response.status_code == 200

    # Verify user is now verified
    result = await db_session.execute(
        select(User).where(User.email == "verify@example.com")
    )
    user = result.scalar_one()
    assert user.is_email_verified is True


# AUTH-INT-011: Email verification with invalid token fails
@pytest.mark.asyncio
async def test_email_verification_invalid_token_fails(client: AsyncClient):
    """Should fail to verify email with invalid token."""
    response = await client.post(
        "/api/v1/auth/verify-email",
        json={"token": "invalid-verification-token"},
    )

    assert response.status_code == 400
    data = response.json()
    assert data["code"] == "INVALID_VERIFICATION_TOKEN"


# AUTH-INT-012: Resend verification email
@pytest.mark.asyncio
async def test_resend_verification_email(client: AsyncClient):
    """Should resend verification email."""
    # Register user
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "resend@example.com",
            "name": "Resend User",
            "password": "Resend123!@#",
        },
    )

    # Resend verification
    response = await client.post(
        "/api/v1/auth/resend-verification",
        json={"email": "resend@example.com"},
    )

    assert response.status_code == 200


# AUTH-INT-013: Forgot password flow
@pytest.mark.asyncio
async def test_forgot_password_flow(client: AsyncClient):
    """Should initiate forgot password flow."""
    # Register user
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "forgot@example.com",
            "name": "Forgot User",
            "password": "Forgot123!@#",
        },
    )

    # Request password reset
    response = await client.post(
        "/api/v1/auth/forgot-password",
        json={"email": "forgot@example.com"},
    )

    assert response.status_code == 200


# AUTH-INT-014: Reset password success
@pytest.mark.asyncio
async def test_reset_password_success(client: AsyncClient, db_session: AsyncSession):
    """Should successfully reset password."""
    from unittest.mock import AsyncMock, patch

    # Register user
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "reset@example.com",
            "name": "Reset User",
            "password": "Reset123!@#",
        },
    )

    # Mock the email service to capture the reset token
    captured_token = None

    async def capture_token(to_email: str, reset_token: str, user_name: str) -> None:
        nonlocal captured_token
        captured_token = reset_token

    with patch(
        "src.app.services.auth_service.email_service.send_password_reset_email",
        new=AsyncMock(side_effect=capture_token),
    ):
        # Request password reset
        await client.post(
            "/api/v1/auth/forgot-password",
            json={"email": "reset@example.com"},
        )

    assert captured_token is not None, "Token was not captured by mock"

    # Reset password
    response = await client.post(
        "/api/v1/auth/reset-password",
        json={
            "token": captured_token,
            "new_password": "NewPassword123!@#",
        },
    )

    assert response.status_code == 200, f"Reset failed: {response.json()}"

    # Verify can login with new password
    login_response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "reset@example.com",
            "password": "NewPassword123!@#",
        },
    )
    assert login_response.status_code == 200


# AUTH-INT-015: 2FA setup flow
@pytest.mark.asyncio
async def test_2fa_setup_flow(client: AsyncClient):
    """Should setup 2FA successfully."""
    # Register and login
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "2fa@example.com",
            "name": "2FA User",
            "password": "2FA123!@#",
        },
    )

    login_response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "2fa@example.com",
            "password": "2FA123!@#",
        },
    )
    access_token = login_response.json()["access_token"]

    # Setup 2FA
    response = await client.post(
        "/api/v1/auth/2fa/setup",
        headers={"Authorization": f"Bearer {access_token}"},
    )

    assert response.status_code == 200
    data = response.json()
    assert "secret" in data
    assert "qr_code_data_url" in data


# AUTH-INT-016: 2FA verify success
@pytest.mark.asyncio
async def test_2fa_verify_success(client: AsyncClient, db_session: AsyncSession):
    """Should verify 2FA successfully."""
    # Register and login
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "2faverify@example.com",
            "name": "2FA Verify User",
            "password": "2FAVerify123!@#",
        },
    )

    login_response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "2faverify@example.com",
            "password": "2FAVerify123!@#",
        },
    )
    access_token = login_response.json()["access_token"]

    # Setup 2FA
    setup_response = await client.post(
        "/api/v1/auth/2fa/setup",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    secret = setup_response.json()["secret"]

    # Generate TOTP code
    totp = pyotp.TOTP(secret)
    code = totp.now()

    # Enable 2FA (not verify - verify is for login)
    response = await client.post(
        "/api/v1/auth/2fa/enable",
        headers={"Authorization": f"Bearer {access_token}"},
        json={"code": code},
    )

    assert response.status_code == 200
    data = response.json()
    assert "backup_codes" in data


# AUTH-INT-017: 2FA enable with wrong code fails
@pytest.mark.asyncio
async def test_2fa_verify_wrong_code_fails(client: AsyncClient):
    """Should fail to enable 2FA with wrong code."""
    # Register and login
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "2fawrong@example.com",
            "name": "2FA Wrong User",
            "password": "2FAWrong123!@#",
        },
    )

    login_response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "2fawrong@example.com",
            "password": "2FAWrong123!@#",
        },
    )
    access_token = login_response.json()["access_token"]

    # Setup 2FA
    await client.post(
        "/api/v1/auth/2fa/setup",
        headers={"Authorization": f"Bearer {access_token}"},
    )

    # Enable with wrong code
    response = await client.post(
        "/api/v1/auth/2fa/enable",
        headers={"Authorization": f"Bearer {access_token}"},
        json={"code": "000000"},
    )

    assert response.status_code == 400
    data = response.json()
    assert data["code"] == "INVALID_TWO_FACTOR_CODE"


# AUTH-INT-018: 2FA disable success
@pytest.mark.asyncio
async def test_2fa_disable_success(client: AsyncClient, db_session: AsyncSession):
    """Should disable 2FA successfully."""
    password = "2FADisable123!@#"
    # Register and login
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "2fadisable@example.com",
            "name": "2FA Disable User",
            "password": password,
        },
    )

    login_response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "2fadisable@example.com",
            "password": password,
        },
    )
    access_token = login_response.json()["access_token"]

    # Setup and enable 2FA
    setup_response = await client.post(
        "/api/v1/auth/2fa/setup",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    secret = setup_response.json()["secret"]

    totp = pyotp.TOTP(secret)
    code = totp.now()

    await client.post(
        "/api/v1/auth/2fa/enable",
        headers={"Authorization": f"Bearer {access_token}"},
        json={"code": code},
    )

    # Disable 2FA (requires password, not code)
    response = await client.post(
        "/api/v1/auth/2fa/disable",
        headers={"Authorization": f"Bearer {access_token}"},
        json={"password": password},
    )

    assert response.status_code == 200


# AUTH-INT-019: Backup code verify success
@pytest.mark.asyncio
async def test_backup_code_verify_success(
    client: AsyncClient, db_session: AsyncSession
):
    """Should verify with backup code successfully."""
    password = "Backup123!@#"
    # Register and login
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "backup@example.com",
            "name": "Backup User",
            "password": password,
        },
    )

    login_response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "backup@example.com",
            "password": password,
        },
    )
    access_token = login_response.json()["access_token"]

    # Setup and enable 2FA
    setup_response = await client.post(
        "/api/v1/auth/2fa/setup",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    secret = setup_response.json()["secret"]

    totp = pyotp.TOTP(secret)
    code = totp.now()

    enable_response = await client.post(
        "/api/v1/auth/2fa/enable",
        headers={"Authorization": f"Bearer {access_token}"},
        json={"code": code},
    )
    backup_codes = enable_response.json()["backup_codes"]

    # Login again (2FA required)
    login_response2 = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "backup@example.com",
            "password": password,
        },
    )

    assert login_response2.status_code == 200
    data = login_response2.json()
    assert data.get("requires_two_factor") is True
    user_id = data.get("user_id")

    # Verify with backup code using /2fa/verify endpoint
    response = await client.post(
        "/api/v1/auth/2fa/verify",
        json={
            "user_id": user_id,
            "code": backup_codes[0],
            "is_backup_code": True,
        },
    )

    assert response.status_code == 200
    assert "access_token" in response.json()


# AUTH-INT-020: Regenerate backup codes
@pytest.mark.asyncio
async def test_regenerate_backup_codes(client: AsyncClient, db_session: AsyncSession):
    """Should regenerate backup codes successfully."""
    password = "Regen123!@#"
    # Register and login
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "regen@example.com",
            "name": "Regen User",
            "password": password,
        },
    )

    login_response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "regen@example.com",
            "password": password,
        },
    )
    access_token = login_response.json()["access_token"]

    # Setup and enable 2FA
    setup_response = await client.post(
        "/api/v1/auth/2fa/setup",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    secret = setup_response.json()["secret"]

    totp = pyotp.TOTP(secret)
    code = totp.now()

    enable_response = await client.post(
        "/api/v1/auth/2fa/enable",
        headers={"Authorization": f"Bearer {access_token}"},
        json={"code": code},
    )
    old_backup_codes = enable_response.json()["backup_codes"]

    # Regenerate backup codes (requires password)
    response = await client.post(
        "/api/v1/auth/2fa/backup-codes",
        headers={"Authorization": f"Bearer {access_token}"},
        json={"password": password},
    )

    assert response.status_code == 200
    data = response.json()
    assert "backup_codes" in data
    # New codes should be different
    assert data["backup_codes"] != old_backup_codes
