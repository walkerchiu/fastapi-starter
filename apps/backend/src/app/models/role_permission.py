"""Role-Permission association table."""

from sqlalchemy import Column, ForeignKey, Integer, Table
from src.app.db.base import Base

# Association table for Role <-> Permission many-to-many relationship
role_permissions = Table(
    "role_permissions",
    Base.metadata,
    Column(
        "role_id", Integer, ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True
    ),
    Column(
        "permission_id",
        Integer,
        ForeignKey("permissions.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)
