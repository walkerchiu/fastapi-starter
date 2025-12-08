"""create files table

Revision ID: 3a4b5c6d7e8f
Revises: 23cc29b4c5d6
Create Date: 2025-12-08 10:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "3a4b5c6d7e8f"
down_revision: str | Sequence[str] | None = "23cc29b4c5d6"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "files",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("key", sa.String(length=500), nullable=False),
        sa.Column("filename", sa.String(length=255), nullable=False),
        sa.Column(
            "content_type", sa.String(length=100), nullable=False, server_default=""
        ),
        sa.Column("size", sa.BigInteger(), nullable=False),
        sa.Column("bucket", sa.String(length=100), nullable=False),
        sa.Column("file_metadata", sa.Text(), nullable=True),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("(CURRENT_TIMESTAMP)"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("(CURRENT_TIMESTAMP)"),
            nullable=False,
        ),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_files_id"), "files", ["id"], unique=False)
    op.create_index(op.f("ix_files_key"), "files", ["key"], unique=True)
    op.create_index(op.f("ix_files_user_id"), "files", ["user_id"], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f("ix_files_user_id"), table_name="files")
    op.drop_index(op.f("ix_files_key"), table_name="files")
    op.drop_index(op.f("ix_files_id"), table_name="files")
    op.drop_table("files")
