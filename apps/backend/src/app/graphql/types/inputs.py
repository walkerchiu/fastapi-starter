"""GraphQL input types."""

import strawberry


@strawberry.input
class CreateUserInput:
    """Input for creating a user."""

    email: str
    name: str


@strawberry.input
class UpdateUserInput:
    """Input for updating a user."""

    email: str | None = None
    name: str | None = None
    is_active: bool | None = None
