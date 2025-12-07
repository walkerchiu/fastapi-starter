"""Authentication service layer for business logic."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from src.app.core import (
    create_access_token,
    create_refresh_token,
    decode_token,
    get_password_hash,
    verify_password,
)
from src.app.core.config import settings
from src.app.models import User
from src.app.schemas import Token, UserRegister
from src.app.services.exceptions import (
    EmailAlreadyExistsError,
    InactiveUserError,
    InvalidCredentialsError,
    InvalidTokenError,
    InvalidTokenTypeError,
    UserNotFoundError,
)


class AuthService:
    """Service class for authentication operations."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_user_by_email(self, email: str) -> User | None:
        """Get a user by email."""
        result = await self.db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    async def get_user_by_id(self, user_id: int) -> User | None:
        """Get a user by ID."""
        result = await self.db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    async def register(self, user_in: UserRegister) -> User:
        """Register a new user."""
        # Check if email already exists
        existing = await self.get_user_by_email(user_in.email)
        if existing:
            raise EmailAlreadyExistsError(f"Email {user_in.email} already registered")

        # Create user with hashed password
        user = User(
            email=user_in.email,
            name=user_in.name,
            hashed_password=get_password_hash(user_in.password),
        )
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def login(self, email: str, password: str) -> Token:
        """Authenticate user and return tokens."""
        user = await self.get_user_by_email(email)

        if not user or not user.hashed_password:
            raise InvalidCredentialsError("Invalid email or password")

        if not verify_password(password, user.hashed_password):
            raise InvalidCredentialsError("Invalid email or password")

        if not user.is_active:
            raise InactiveUserError("User account is inactive")

        return Token(
            access_token=create_access_token(subject=user.id),
            refresh_token=create_refresh_token(subject=user.id),
            expires_in=settings.jwt_access_token_expire_minutes * 60,
        )

    async def refresh_token(self, refresh_token: str) -> Token:
        """Refresh access token using refresh token."""
        payload = decode_token(refresh_token)

        if not payload:
            raise InvalidTokenError("Token is invalid or expired.")

        if payload.get("type") != "refresh":
            raise InvalidTokenTypeError("Invalid token type")

        user_id = payload.get("sub")
        user = await self.get_user_by_id(int(user_id))

        if not user:
            raise UserNotFoundError("User not found")

        if not user.is_active:
            raise InactiveUserError("User account is inactive")

        return Token(
            access_token=create_access_token(subject=user.id),
            refresh_token=create_refresh_token(subject=user.id),
            expires_in=settings.jwt_access_token_expire_minutes * 60,
        )
