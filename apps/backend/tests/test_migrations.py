"""Tests for Alembic migrations."""

import pytest
from alembic import command
from alembic.config import Config
from alembic.script import ScriptDirectory
from sqlalchemy import create_engine, inspect


def get_alembic_config() -> Config:
    """Get Alembic configuration for testing."""
    config = Config("alembic.ini")
    return config


class TestMigrationHistory:
    """Tests for migration history integrity."""

    def test_migration_chain_is_linear(self):
        """Verify migration history has no branches (linear chain)."""
        config = get_alembic_config()
        script = ScriptDirectory.from_config(config)

        # Get all revisions
        revisions = list(script.walk_revisions())

        # Check for multiple heads (branches)
        heads = script.get_heads()
        assert len(heads) == 1, f"Migration history has branches: {heads}"

        # Verify chain continuity
        for revision in revisions:
            if revision.down_revision is not None:
                # Verify down_revision exists
                down_rev = script.get_revision(revision.down_revision)
                assert down_rev is not None, (
                    f"Broken chain: {revision.revision} references "
                    f"non-existent {revision.down_revision}"
                )

    def test_all_migrations_have_upgrade_and_downgrade(self):
        """Verify all migrations have both upgrade and downgrade functions."""
        config = get_alembic_config()
        script = ScriptDirectory.from_config(config)

        for revision in script.walk_revisions():
            module = revision.module

            assert hasattr(module, "upgrade"), (
                f"Migration {revision.revision} missing upgrade function"
            )
            assert hasattr(module, "downgrade"), (
                f"Migration {revision.revision} missing downgrade function"
            )
            assert callable(module.upgrade), (
                f"Migration {revision.revision} upgrade is not callable"
            )
            assert callable(module.downgrade), (
                f"Migration {revision.revision} downgrade is not callable"
            )


class TestMigrationExecution:
    """Tests for migration execution (upgrade/downgrade).

    Note: These tests use synchronous SQLite to avoid asyncio.run() conflicts
    with pytest-asyncio. The migrations work the same way regardless of sync/async.
    """

    @pytest.fixture
    def migration_db(self, tmp_path):
        """Create a temporary database for migration testing."""
        db_path = tmp_path / "test_migration.db"
        # Use sync SQLite for testing (migrations are executed sync anyway)
        database_url = f"sqlite:///{db_path}"
        async_database_url = f"sqlite+aiosqlite:///{db_path}"

        config = get_alembic_config()
        config.set_main_option("sqlalchemy.url", async_database_url)

        # Create sync engine for inspection
        engine = create_engine(database_url, echo=False)

        yield {"config": config, "engine": engine, "db_path": db_path}

        engine.dispose()

    def test_upgrade_to_head(self, migration_db):
        """Test upgrading to head revision."""
        config = migration_db["config"]

        # Run all migrations
        command.upgrade(config, "head")

        # Verify we're at head
        script = ScriptDirectory.from_config(config)
        heads = script.get_heads()
        assert len(heads) == 1

    def test_downgrade_to_base(self, migration_db):
        """Test downgrading to base (empty database)."""
        config = migration_db["config"]

        # First upgrade to head
        command.upgrade(config, "head")

        # Then downgrade to base
        command.downgrade(config, "base")

    def test_stepwise_upgrade_and_downgrade(self, migration_db):
        """Test upgrading and downgrading one revision at a time."""
        config = migration_db["config"]
        script = ScriptDirectory.from_config(config)
        revisions = list(script.walk_revisions())
        revisions.reverse()  # Start from base

        # Upgrade one by one
        for revision in revisions:
            command.upgrade(config, revision.revision)

        # Downgrade one by one
        for revision in reversed(revisions):
            if revision.down_revision is None:
                command.downgrade(config, "base")
            else:
                command.downgrade(config, revision.down_revision)

    def test_schema_after_upgrade(self, migration_db):
        """Verify schema structure after running all migrations."""
        config = migration_db["config"]
        engine = migration_db["engine"]

        # Run all migrations
        command.upgrade(config, "head")

        # Verify tables exist
        inspector = inspect(engine)
        tables = inspector.get_table_names()

        # Check expected tables exist
        assert "users" in tables, "users table not created"
        assert "files" in tables, "files table not created"
        assert "alembic_version" in tables, "alembic_version table not created"

    def test_users_table_schema(self, migration_db):
        """Verify users table has correct columns after migration."""
        config = migration_db["config"]
        engine = migration_db["engine"]

        command.upgrade(config, "head")

        inspector = inspect(engine)
        columns = {c["name"]: c for c in inspector.get_columns("users")}

        expected_columns = [
            "id",
            "email",
            "name",
            "hashed_password",
            "is_active",
            "created_at",
            "updated_at",
        ]

        for col_name in expected_columns:
            assert col_name in columns, f"Column {col_name} missing from users table"

    def test_files_table_schema(self, migration_db):
        """Verify files table has correct columns after migration."""
        config = migration_db["config"]
        engine = migration_db["engine"]

        command.upgrade(config, "head")

        inspector = inspect(engine)
        columns = {c["name"]: c for c in inspector.get_columns("files")}

        expected_columns = [
            "id",
            "key",
            "filename",
            "content_type",
            "size",
            "bucket",
            "user_id",
            "created_at",
            "updated_at",
        ]

        for col_name in expected_columns:
            assert col_name in columns, f"Column {col_name} missing from files table"

    def test_indexes_created(self, migration_db):
        """Verify indexes are created correctly."""
        config = migration_db["config"]
        engine = migration_db["engine"]

        command.upgrade(config, "head")

        inspector = inspect(engine)
        users_indexes = inspector.get_indexes("users")
        files_indexes = inspector.get_indexes("files")

        users_index_names = {idx["name"] for idx in users_indexes}
        files_index_names = {idx["name"] for idx in files_indexes}

        # Verify users indexes
        assert "ix_users_email" in users_index_names, "Missing email index on users"
        assert "ix_users_id" in users_index_names, "Missing id index on users"

        # Verify files indexes
        assert "ix_files_key" in files_index_names, "Missing key index on files"
        assert "ix_files_user_id" in files_index_names, "Missing user_id index on files"

    def test_foreign_key_constraint(self, migration_db):
        """Verify foreign key constraint on files.user_id."""
        config = migration_db["config"]
        engine = migration_db["engine"]

        command.upgrade(config, "head")

        inspector = inspect(engine)
        foreign_keys = inspector.get_foreign_keys("files")

        assert len(foreign_keys) > 0, "No foreign keys found on files table"

        user_fk = None
        for fk in foreign_keys:
            if "user_id" in fk["constrained_columns"]:
                user_fk = fk
                break

        assert user_fk is not None, "user_id foreign key not found"
        assert user_fk["referred_table"] == "users"
        assert "id" in user_fk["referred_columns"]

    def test_upgrade_idempotent(self, migration_db):
        """Test that running upgrade multiple times is safe."""
        config = migration_db["config"]

        # Run upgrade multiple times - should not fail
        command.upgrade(config, "head")
        command.upgrade(config, "head")
        command.upgrade(config, "head")
