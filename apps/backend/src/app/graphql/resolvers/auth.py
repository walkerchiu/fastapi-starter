"""Authentication GraphQL resolvers."""

import strawberry
from src.app.graphql.exception_mapper import map_service_exception_to_graphql
from src.app.graphql.resolvers.users import convert_user_to_type
from src.app.graphql.subscriptions import publish_user_created, publish_user_logged_out
from src.app.graphql.types import (
    AuthPayloadType,
    ChangePasswordInput,
    Disable2FAInput,
    Enable2FAInput,
    Enable2FAType,
    LoginInput,
    LoginResultType,
    Message,
    RefreshTokenInput,
    RegenerateBackupCodesInput,
    RegisterInput,
    RequestPasswordResetInput,
    ResendVerificationInput,
    ResetPasswordInput,
    Setup2FAType,
    TwoFactorRequiredType,
    UpdateProfileInput,
    UserType,
    Verify2FABackupCodeInput,
    Verify2FACodeInput,
    Verify2FAInput,
    VerifyEmailInput,
)
from src.app.graphql.validators import validate_email, validate_name, validate_password
from src.app.schemas import UserRegister
from src.app.services import AuthService
from src.app.services.exceptions import ServiceError, TwoFactorRequiredError
from strawberry.types import Info


@strawberry.type
class AuthQuery:
    """Authentication query resolvers."""

    @strawberry.field
    async def me(self, info: Info) -> UserType | None:
        """Get current authenticated user."""
        user = info.context.get("user")
        if not user:
            return None
        return convert_user_to_type(user)


@strawberry.type
class AuthMutation:
    """Authentication mutation resolvers."""

    @strawberry.mutation
    async def register(self, info: Info, input: RegisterInput) -> AuthPayloadType:
        """Register a new user and return tokens."""
        # Validate inputs
        email = validate_email(input.email)
        name = validate_name(input.name)
        password = validate_password(input.password)

        db = info.context["db"]
        service = AuthService(db)

        user_data = UserRegister(
            email=email,
            name=name,
            password=password,
        )
        try:
            user = await service.register(user_data)
            # Publish user created event
            await publish_user_created(user.id, user.email)

            # Auto-login after registration to get tokens
            token = await service.login(email, input.password)

            return AuthPayloadType(
                access_token=token.access_token,
                refresh_token=token.refresh_token,
                token_type=token.token_type,
                user=convert_user_to_type(user),
            )
        except ServiceError as e:
            raise map_service_exception_to_graphql(e) from None

    @strawberry.mutation
    async def login(self, info: Info, input: LoginInput) -> LoginResultType:
        """Login and get tokens."""
        # Validate email format (don't validate password on login)
        email = validate_email(input.email)

        db = info.context["db"]
        service = AuthService(db)

        try:
            token = await service.login(email, input.password)
            return AuthPayloadType(
                access_token=token.access_token,
                refresh_token=token.refresh_token,
                token_type=token.token_type,
            )
        except TwoFactorRequiredError as e:
            return TwoFactorRequiredType(user_id=e.user_id)
        except ServiceError as e:
            raise map_service_exception_to_graphql(e) from None

    @strawberry.mutation
    async def refresh_token(
        self, info: Info, input: RefreshTokenInput
    ) -> AuthPayloadType:
        """Refresh access token."""
        db = info.context["db"]
        service = AuthService(db)

        try:
            token = await service.refresh_token(input.refresh_token)
            return AuthPayloadType(
                access_token=token.access_token,
                refresh_token=token.refresh_token,
                token_type=token.token_type,
            )
        except ServiceError as e:
            raise map_service_exception_to_graphql(e) from None

    @strawberry.mutation
    async def logout(self, info: Info) -> Message:
        """Logout current user.

        Since JWT is stateless, this endpoint primarily serves to:
        1. Allow clients to clear locally stored tokens.
        2. Optionally add the token to a blacklist (if implemented).

        The client should clear all stored tokens after calling this mutation.
        """
        user = info.context.get("user")
        if not user:
            raise map_service_exception_to_graphql(
                ServiceError("User not authenticated.")
            )
        await publish_user_logged_out(user.id, user.email)
        return Message(message="Logged out successfully")

    @strawberry.mutation
    async def request_password_reset(
        self, info: Info, input: RequestPasswordResetInput
    ) -> Message:
        """Request password reset email."""
        # Validate email format
        email = validate_email(input.email)

        db = info.context["db"]
        service = AuthService(db)

        # This method always succeeds to prevent email enumeration
        await service.forgot_password(email)
        return Message(
            message="If the email exists, a password reset link has been sent"
        )

    @strawberry.mutation
    async def reset_password(self, info: Info, input: ResetPasswordInput) -> Message:
        """Reset password using reset token."""
        # Validate password
        password = validate_password(input.new_password)

        db = info.context["db"]
        service = AuthService(db)

        try:
            await service.reset_password(input.token, password)
            return Message(message="Password has been reset successfully")
        except ServiceError as e:
            raise map_service_exception_to_graphql(e) from None

    @strawberry.mutation
    async def verify_email(self, info: Info, input: VerifyEmailInput) -> Message:
        """Verify email address using verification token."""
        db = info.context["db"]
        service = AuthService(db)

        try:
            await service.verify_email(input.token)
            return Message(message="Email has been verified successfully")
        except ServiceError as e:
            raise map_service_exception_to_graphql(e) from None

    @strawberry.mutation
    async def resend_verification(
        self, info: Info, input: ResendVerificationInput
    ) -> Message:
        """Resend email verification link."""
        # Validate email format
        email = validate_email(input.email)

        db = info.context["db"]
        service = AuthService(db)

        # This method always succeeds to prevent email enumeration
        await service.resend_verification_email(email)
        return Message(
            message="If the email exists and is not verified, a verification link has been sent"
        )

    @strawberry.mutation
    async def send_verification_email(self, info: Info) -> bool:
        """Send verification email to authenticated user."""
        user = info.context.get("user")
        if not user:
            raise map_service_exception_to_graphql(
                ServiceError("User not authenticated.")
            )

        db = info.context["db"]
        service = AuthService(db)

        await service.resend_verification_email(user.email)
        return True

    @strawberry.mutation
    async def update_profile(self, info: Info, input: UpdateProfileInput) -> UserType:
        """Update current user's profile."""
        user = info.context.get("user")
        if not user:
            raise map_service_exception_to_graphql(
                ServiceError("User not authenticated.")
            )

        # Validate name
        name = validate_name(input.name)

        db = info.context["db"]
        service = AuthService(db)

        try:
            updated_user = await service.update_profile(user, name)
            return convert_user_to_type(updated_user)
        except ServiceError as e:
            raise map_service_exception_to_graphql(e) from None

    @strawberry.mutation
    async def change_password(self, info: Info, input: ChangePasswordInput) -> Message:
        """Change current user's password."""
        user = info.context.get("user")
        if not user:
            raise map_service_exception_to_graphql(
                ServiceError("User not authenticated.")
            )

        # Validate new password
        new_password = validate_password(input.new_password)

        db = info.context["db"]
        service = AuthService(db)

        try:
            await service.change_password(user, input.current_password, new_password)
            return Message(message="Password changed successfully")
        except ServiceError as e:
            raise map_service_exception_to_graphql(e) from None

    # 2FA Mutations

    @strawberry.mutation(name="setup2FA")
    async def setup_2fa(self, info: Info) -> Setup2FAType:
        """Initialize 2FA setup."""
        user = info.context.get("user")
        if not user:
            raise map_service_exception_to_graphql(
                ServiceError("User not authenticated.")
            )

        db = info.context["db"]
        service = AuthService(db)

        try:
            result = await service.setup_2fa(user)
            return Setup2FAType(
                secret=result["secret"],
                qr_code_url=result["qr_code_url"],
                qr_code_data_url=result["qr_code_data_url"],
            )
        except ServiceError as e:
            raise map_service_exception_to_graphql(e) from None

    @strawberry.mutation(name="enable2FA")
    async def enable_2fa(self, info: Info, input: Enable2FAInput) -> Enable2FAType:
        """Enable 2FA with verification code."""
        user = info.context.get("user")
        if not user:
            raise map_service_exception_to_graphql(
                ServiceError("User not authenticated.")
            )

        db = info.context["db"]
        service = AuthService(db)

        try:
            backup_codes = await service.enable_2fa(user, input.code)
            return Enable2FAType(backup_codes=backup_codes)
        except ServiceError as e:
            raise map_service_exception_to_graphql(e) from None

    @strawberry.mutation(name="disable2FA")
    async def disable_2fa(self, info: Info, input: Disable2FAInput) -> Message:
        """Disable 2FA."""
        user = info.context.get("user")
        if not user:
            raise map_service_exception_to_graphql(
                ServiceError("User not authenticated.")
            )

        db = info.context["db"]
        service = AuthService(db)

        try:
            await service.disable_2fa(user, input.password)
            return Message(message="2FA disabled successfully")
        except ServiceError as e:
            raise map_service_exception_to_graphql(e) from None

    @strawberry.mutation(name="verify2FA")
    async def verify_2fa(self, info: Info, input: Verify2FAInput) -> AuthPayloadType:
        """Verify 2FA code and get tokens."""
        db = info.context["db"]
        service = AuthService(db)

        try:
            token = await service.verify_2fa(
                input.user_id, input.code, input.is_backup_code
            )
            return AuthPayloadType(
                access_token=token.access_token,
                refresh_token=token.refresh_token,
                token_type=token.token_type,
            )
        except ServiceError as e:
            raise map_service_exception_to_graphql(e) from None

    @strawberry.mutation
    async def regenerate_backup_codes(
        self, info: Info, input: RegenerateBackupCodesInput
    ) -> Enable2FAType:
        """Regenerate 2FA backup codes."""
        user = info.context.get("user")
        if not user:
            raise map_service_exception_to_graphql(
                ServiceError("User not authenticated.")
            )

        db = info.context["db"]
        service = AuthService(db)

        try:
            backup_codes = await service.regenerate_backup_codes(user, input.password)
            return Enable2FAType(backup_codes=backup_codes)
        except ServiceError as e:
            raise map_service_exception_to_graphql(e) from None

    @strawberry.mutation(name="verify2FACode")
    async def verify_2fa_code(self, info: Info, input: Verify2FACodeInput) -> bool:
        """Verify TOTP code for current authenticated user."""
        user = info.context.get("user")
        if not user:
            raise map_service_exception_to_graphql(
                ServiceError("User not authenticated.")
            )

        db = info.context["db"]
        service = AuthService(db)

        try:
            return await service.verify_totp_code(user, input.code)
        except ServiceError as e:
            raise map_service_exception_to_graphql(e) from None

    @strawberry.mutation(name="verify2FABackupCode")
    async def verify_2fa_backup_code(
        self, info: Info, input: Verify2FABackupCodeInput
    ) -> bool:
        """Verify and consume a backup code for current authenticated user."""
        user = info.context.get("user")
        if not user:
            raise map_service_exception_to_graphql(
                ServiceError("User not authenticated.")
            )

        db = info.context["db"]
        service = AuthService(db)

        try:
            return await service.verify_and_consume_backup_code(user, input.code)
        except ServiceError as e:
            raise map_service_exception_to_graphql(e) from None
