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
    responses={
        400: {"model": ErrorResponse, "description": "Email already registered"},
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
    responses={
        401: {"model": ErrorResponse, "description": "Invalid credentials"},
        403: {"model": ErrorResponse, "description": "User account inactive"},
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
    responses={
        401: {"model": ErrorResponse, "description": "Invalid or expired token"},
        403: {"model": ErrorResponse, "description": "User account inactive"},
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


@router.get("/me", response_model=UserRead)
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
