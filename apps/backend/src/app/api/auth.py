"""Authentication API endpoints."""

from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession
from src.app.core.deps import CurrentUser
from src.app.core.exceptions import (
    DatabaseException,
    EmailAlreadyExistsException,
    InactiveUserException,
    InvalidCredentialsException,
    InvalidTokenException,
    InvalidTokenTypeException,
)
from src.app.db import get_db
from src.app.models import User
from src.app.schemas import (
    ErrorResponse,
    LoginRequest,
    LogoutResponse,
    RefreshTokenRequest,
    Token,
    UserRead,
    UserRegister,
)
from src.app.services import (
    AuthService,
    EmailAlreadyExistsError,
    InactiveUserError,
    InvalidCredentialsError,
    InvalidTokenError,
    InvalidTokenTypeError,
    UserNotFoundError,
)

router = APIRouter(prefix="/auth", tags=["auth"])


async def get_auth_service(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> AuthService:
    """Dependency to get auth service."""
    return AuthService(db)


@router.post(
    "/register",
    response_model=UserRead,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
    description="""
Register a new user account with email, name, and password.

**Password requirements:**
- Minimum 8 characters
- Maximum 128 characters

Returns the created user information (without password).
    """,
    responses={
        201: {
            "description": "User successfully registered",
            "content": {
                "application/json": {
                    "example": {
                        "id": 1,
                        "email": "user@example.com",
                        "name": "John Doe",
                        "is_active": True,
                        "created_at": "2024-01-01T00:00:00Z",
                        "updated_at": "2024-01-01T00:00:00Z",
                    }
                }
            },
        },
        400: {"model": ErrorResponse, "description": "Email already registered"},
        422: {"model": ErrorResponse, "description": "Validation error"},
        500: {"model": ErrorResponse, "description": "Database error"},
    },
)
async def register(
    user_in: UserRegister,
    service: Annotated[AuthService, Depends(get_auth_service)],
) -> User:
    """Register a new user."""
    try:
        return await service.register(user_in)
    except EmailAlreadyExistsError:
        raise EmailAlreadyExistsException() from None
    except SQLAlchemyError:
        raise DatabaseException(detail="Failed to create user") from None


@router.post(
    "/login",
    response_model=Token,
    summary="Login and get tokens",
    description="""
Authenticate with email and password to receive access and refresh tokens.

**Token types:**
- `access_token`: Short-lived token for API requests (default: 30 minutes)
- `refresh_token`: Long-lived token for obtaining new access tokens (default: 7 days)

Use the access token in the `Authorization: Bearer <token>` header.
    """,
    responses={
        200: {
            "description": "Successfully authenticated",
            "content": {
                "application/json": {
                    "example": {
                        "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                        "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                        "token_type": "bearer",
                    }
                }
            },
        },
        401: {"model": ErrorResponse, "description": "Invalid email or password"},
        403: {"model": ErrorResponse, "description": "User account is inactive"},
        422: {"model": ErrorResponse, "description": "Validation error"},
    },
)
async def login(
    credentials: LoginRequest,
    service: Annotated[AuthService, Depends(get_auth_service)],
) -> Token:
    """Authenticate user and return tokens."""
    try:
        return await service.login(credentials.email, credentials.password)
    except InvalidCredentialsError:
        raise InvalidCredentialsException() from None
    except InactiveUserError:
        raise InactiveUserException() from None


@router.post(
    "/refresh",
    response_model=Token,
    summary="Refresh access token",
    description="""
Get a new access token using a valid refresh token.

This endpoint should be called when the access token expires.
Both a new access token and refresh token will be returned.
    """,
    responses={
        200: {
            "description": "Tokens successfully refreshed",
            "content": {
                "application/json": {
                    "example": {
                        "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                        "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                        "token_type": "bearer",
                    }
                }
            },
        },
        401: {"model": ErrorResponse, "description": "Invalid or expired token"},
        403: {"model": ErrorResponse, "description": "User account is inactive"},
        422: {"model": ErrorResponse, "description": "Validation error"},
    },
)
async def refresh_token(
    request: RefreshTokenRequest,
    service: Annotated[AuthService, Depends(get_auth_service)],
) -> Token:
    """Refresh access token using refresh token."""
    try:
        return await service.refresh_token(request.refresh_token)
    except InvalidTokenTypeError:
        raise InvalidTokenTypeException() from None
    except (InvalidTokenError, UserNotFoundError):
        raise InvalidTokenException() from None
    except InactiveUserError:
        raise InactiveUserException() from None


@router.get(
    "/me",
    response_model=UserRead,
    summary="Get current user",
    description="Get the currently authenticated user's information.",
    responses={
        200: {
            "description": "Current user information",
            "content": {
                "application/json": {
                    "example": {
                        "id": 1,
                        "email": "user@example.com",
                        "name": "John Doe",
                        "is_active": True,
                        "created_at": "2024-01-01T00:00:00Z",
                        "updated_at": "2024-01-01T00:00:00Z",
                    }
                }
            },
        },
        401: {"model": ErrorResponse, "description": "Not authenticated"},
        403: {"model": ErrorResponse, "description": "User account is inactive"},
    },
)
async def get_current_user_info(current_user: CurrentUser) -> User:
    """Get current authenticated user information."""
    return current_user


@router.post("/logout", response_model=LogoutResponse)
async def logout(current_user: CurrentUser) -> LogoutResponse:
    """Logout current user.

    Since JWT is stateless, this endpoint primarily serves to:
    1. Allow clients to clear locally stored tokens.
    2. Optionally add the token to a blacklist (if implemented).

    The client should clear all stored tokens after calling this endpoint.
    """
    return LogoutResponse()
