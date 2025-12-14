#!/usr/bin/env python
"""Script to show database table status."""

import asyncio
import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import inspect, text
from sqlalchemy.ext.asyncio import create_async_engine

# Load environment variables
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)


EXPECTED_TABLES = [
    "users",
    "files",
    "permissions",
    "roles",
    "user_roles",
    "role_permissions",
    "password_reset_tokens",
]


def get_database_url() -> str:
    """Get database URL from environment variables."""
    db_type = os.getenv("DATABASE_TYPE", "sqlite")

    if db_type == "sqlite":
        db_name = os.getenv("DATABASE_NAME", "./data/app.db")
        return f"sqlite+aiosqlite:///{db_name}"
    else:
        host = os.getenv("DATABASE_HOST", "localhost")
        port = os.getenv("DATABASE_PORT", "5432")
        user = os.getenv("DATABASE_USERNAME", "postgres")
        password = os.getenv("DATABASE_PASSWORD", "postgres")
        db_name = os.getenv("DATABASE_NAME", "app")
        return f"postgresql+asyncpg://{user}:{password}@{host}:{port}/{db_name}"


async def main() -> None:
    """Show database status."""
    print("Database Status:")
    print("================")

    engine = create_async_engine(get_database_url(), echo=False)

    async with engine.connect() as conn:
        # Get existing tables
        def get_tables(connection):
            inspector = inspect(connection)
            return inspector.get_table_names()

        existing_tables = await conn.run_sync(get_tables)

        # Show table status
        for table in EXPECTED_TABLES:
            status = "EXISTS" if table in existing_tables else "NOT EXISTS"
            print(f"  {table:<25} {status}")

        # Get migration version
        print()
        try:
            result = await conn.execute(
                text("SELECT version_num FROM alembic_version LIMIT 1")
            )
            row = result.fetchone()
            if row:
                print(f"Migration version: {row[0]}")
            else:
                print("Migration version: (none)")
        except Exception:
            print("Migration version: (not initialized)")

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
