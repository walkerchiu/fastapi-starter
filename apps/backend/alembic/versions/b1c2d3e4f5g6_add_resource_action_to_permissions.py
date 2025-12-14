"""add resource and action to permissions

Revision ID: b1c2d3e4f5g6
Revises: a0b1c2d3e4f5
Create Date: 2025-12-31 20:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "b1c2d3e4f5g6"
down_revision: str | Sequence[str] | None = "7d8e9f0a1b2c"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add resource and action columns
    op.add_column(
        "permissions",
        sa.Column("resource", sa.String(length=100), nullable=False, server_default=""),
    )
    op.add_column(
        "permissions",
        sa.Column("action", sa.String(length=100), nullable=False, server_default=""),
    )

    # Update existing records: parse resource and action from code
    # code format is "resource:action"
    connection = op.get_bind()
    connection.execute(
        sa.text(
            """
            UPDATE permissions
            SET resource = SUBSTR(code, 1, INSTR(code, ':') - 1),
                action = SUBSTR(code, INSTR(code, ':') + 1)
            WHERE code LIKE '%:%'
            """
        )
    )

    # Remove server default after migration (skip for SQLite as it doesn't support ALTER COLUMN)
    if connection.dialect.name != "sqlite":
        op.alter_column("permissions", "resource", server_default=None)
        op.alter_column("permissions", "action", server_default=None)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("permissions", "action")
    op.drop_column("permissions", "resource")
