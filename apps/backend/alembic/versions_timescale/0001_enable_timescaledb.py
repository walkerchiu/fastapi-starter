"""Enable TimescaleDB extension.

Revision ID: 0001_timescaledb
Revises:
Create Date: 2024-01-01 00:00:00.000000

This migration only runs when DATABASE_ENGINE=timescaledb.
It creates the TimescaleDB extension which enables time-series features
such as hypertables, compression, and retention policies.

Usage:
    DATABASE_ENGINE=timescaledb pnpm db:upgrade
"""

import os

from alembic import op

# revision identifiers, used by Alembic.
revision = "0001_timescaledb"
down_revision = None
branch_labels = ("timescale",)
depends_on = None


def upgrade() -> None:
    """Enable TimescaleDB extension."""
    engine = os.environ.get("DATABASE_ENGINE", "postgres")

    if engine != "timescaledb":
        print("Skipping TimescaleDB extension (DATABASE_ENGINE != timescaledb)")
        return

    print("Enabling TimescaleDB extension...")
    op.execute("CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE")
    print("TimescaleDB extension enabled successfully")


def downgrade() -> None:
    """Remove TimescaleDB extension (manual intervention required)."""
    engine = os.environ.get("DATABASE_ENGINE", "postgres")

    if engine != "timescaledb":
        return

    # For safety, we don't automatically drop the extension
    # as it would destroy all hypertables and associated data
    print("TimescaleDB extension removal skipped (manual intervention required)")
    print(
        "To remove manually: DROP EXTENSION timescaledb CASCADE; "
        "(WARNING: destroys all hypertables)"
    )
