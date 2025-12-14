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
    is_active: bool | None = strawberry.field(name="isActive", default=None)


@strawberry.input
class CreatePermissionInput:
    """Input for creating a permission."""

    code: str
    name: str
    description: str | None = None


@strawberry.input
class UpdatePermissionInput:
    """Input for updating a permission."""

    code: str | None = None
    name: str | None = None
    description: str | None = None


@strawberry.input
class CreateRoleInput:
    """Input for creating a role."""

    code: str
    name: str
    description: str | None = None
    is_system: bool = strawberry.field(name="isSystem", default=False)
    permission_ids: list[strawberry.ID] | None = strawberry.field(
        name="permissionIds", default=None
    )


@strawberry.input
class UpdateRoleInput:
    """Input for updating a role."""

    code: str | None = None
    name: str | None = None
    description: str | None = None
    permission_ids: list[strawberry.ID] | None = strawberry.field(
        name="permissionIds", default=None
    )


@strawberry.input
class AssignRolesInput:
    """Input for bulk role assignment/removal."""

    role_ids: list[strawberry.ID] = strawberry.field(name="roleIds")


@strawberry.input
class AssignPermissionsInput:
    """Input for bulk permission assignment to a role."""

    permission_ids: list[strawberry.ID] = strawberry.field(name="permissionIds")
