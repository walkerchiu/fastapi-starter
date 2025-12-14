#!/usr/bin/env python
"""Script to seed RBAC data (permissions and roles)."""

import asyncio
import sys
from pathlib import Path

# Add the src directory to the path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import settings
from app.db.seeds import seed_all


async def main() -> None:
    """Run the seed script."""
    print("Starting RBAC seed...")
    print(f"Database URL: {settings.DATABASE_URL}")

    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async_session_maker = async_sessionmaker(
        engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )

    async with async_session_maker() as session:
        try:
            permissions_map, roles_map = await seed_all(session)

            print("\nPermissions seeded:")
            for code, perm in permissions_map.items():
                print(f"  - {code}: {perm.name}")

            print("\nRoles seeded:")
            for code, role in roles_map.items():
                perm_count = len(role.permissions) if role.permissions else 0
                print(f"  - {code}: {role.name} ({perm_count} permissions)")

            print("\nRBAC seed completed successfully!")

        except Exception as e:
            print(f"\nError during seed: {e}")
            await session.rollback()
            raise

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
