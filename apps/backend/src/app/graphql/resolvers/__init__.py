"""GraphQL resolvers."""

from src.app.graphql.resolvers.auth import AuthMutation, AuthQuery
from src.app.graphql.resolvers.files import FileMutation, FileQuery
from src.app.graphql.resolvers.health import HealthQuery
from src.app.graphql.resolvers.permissions import PermissionMutation, PermissionQuery
from src.app.graphql.resolvers.roles import RoleMutation, RoleQuery
from src.app.graphql.resolvers.users import UserMutation, UserQuery

__all__ = [
    "AuthMutation",
    "AuthQuery",
    "FileMutation",
    "FileQuery",
    "HealthQuery",
    "PermissionMutation",
    "PermissionQuery",
    "RoleMutation",
    "RoleQuery",
    "UserMutation",
    "UserQuery",
]
