"""User-Role association table."""

from sqlalchemy import Column, ForeignKey, Integer, Table
from src.app.db.base import Base

# Association table for User <-> Role many-to-many relationship
user_roles = Table(
    "user_roles",
    Base.metadata,
    Column(
        "user_id", Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    ),
    Column(
        "role_id", Integer, ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True
    ),
)
