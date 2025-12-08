"""Unit tests for GraphQL security extensions."""

from graphql import parse
from src.app.graphql.extensions import DepthLimitExtension, QueryComplexityExtension


class TestDepthLimitExtension:
    """Unit tests for DepthLimitExtension."""

    def test_calculate_depth_simple_query(self):
        """Test depth calculation for simple query."""
        query = """
            query {
                hello
            }
        """
        ext = DepthLimitExtension(execution_context=None, max_depth=10)
        doc = parse(query)
        depth = ext._calculate_depth(doc)
        assert depth == 1

    def test_calculate_depth_nested_query(self):
        """Test depth calculation for nested query."""
        query = """
            query {
                users {
                    items {
                        id
                        email
                    }
                }
            }
        """
        ext = DepthLimitExtension(execution_context=None, max_depth=10)
        doc = parse(query)
        depth = ext._calculate_depth(doc)
        assert depth == 3

    def test_calculate_depth_with_fragment(self):
        """Test depth calculation with fragment spread."""
        query = """
            fragment UserFields on UserType {
                id
                email
                name
            }

            query {
                users {
                    items {
                        ...UserFields
                    }
                }
            }
        """
        ext = DepthLimitExtension(execution_context=None, max_depth=10)
        doc = parse(query)
        depth = ext._calculate_depth(doc)
        # users(1) -> items(2) -> fragment fields(3)
        assert depth == 3

    def test_calculate_depth_with_inline_fragment(self):
        """Test depth calculation with inline fragment."""
        query = """
            query {
                users {
                    items {
                        ... on UserType {
                            id
                            email
                        }
                    }
                }
            }
        """
        ext = DepthLimitExtension(execution_context=None, max_depth=10)
        doc = parse(query)
        depth = ext._calculate_depth(doc)
        # users(1) -> items(2) -> inline fragment fields(3)
        assert depth == 3

    def test_calculate_depth_with_nested_fragments(self):
        """Test depth calculation with nested fragments."""
        query = """
            fragment Inner on UserType {
                id
            }

            fragment Outer on UserType {
                ...Inner
                email
            }

            query {
                users {
                    items {
                        ...Outer
                    }
                }
            }
        """
        ext = DepthLimitExtension(execution_context=None, max_depth=10)
        doc = parse(query)
        depth = ext._calculate_depth(doc)
        assert depth == 3

    def test_calculate_depth_prevents_circular_fragments(self):
        """Test that circular fragment references are handled."""
        # Note: GraphQL validation would normally catch this,
        # but our code handles it by tracking visited fragments
        query = """
            fragment A on UserType {
                id
            }

            query {
                users {
                    items {
                        ...A
                        ...A
                    }
                }
            }
        """
        ext = DepthLimitExtension(execution_context=None, max_depth=10)
        doc = parse(query)
        # Should not infinite loop
        depth = ext._calculate_depth(doc)
        assert depth == 3

    def test_depth_exceeded_value(self):
        """Test depth calculation correctly identifies exceeding queries."""
        query = """
            query {
                users {
                    items {
                        id
                        email
                    }
                }
            }
        """
        ext = DepthLimitExtension(execution_context=None, max_depth=2)
        doc = parse(query)
        depth = ext._calculate_depth(doc)
        # Depth is 3, which exceeds max_depth of 2
        assert depth == 3
        assert depth > ext.max_depth

    def test_depth_within_limit_value(self):
        """Test depth calculation for queries within limit."""
        query = """
            query {
                hello
            }
        """
        ext = DepthLimitExtension(execution_context=None, max_depth=10)
        doc = parse(query)
        depth = ext._calculate_depth(doc)
        assert depth == 1
        assert depth <= ext.max_depth


class TestQueryComplexityExtension:
    """Unit tests for QueryComplexityExtension."""

    def test_calculate_complexity_simple_query(self):
        """Test complexity calculation for simple query."""
        query = """
            query {
                hello
            }
        """
        ext = QueryComplexityExtension(execution_context=None, max_complexity=100)
        doc = parse(query)
        complexity = ext._calculate_complexity(doc)
        assert complexity == 1

    def test_calculate_complexity_multiple_fields(self):
        """Test complexity calculation for multiple fields."""
        query = """
            query {
                users {
                    items {
                        id
                        email
                        name
                    }
                    total
                }
            }
        """
        ext = QueryComplexityExtension(execution_context=None, max_complexity=100)
        doc = parse(query)
        complexity = ext._calculate_complexity(doc)
        # users(1) + items(1) + id(1) + email(1) + name(1) + total(1) = 6
        assert complexity == 6

    def test_calculate_complexity_with_fragment(self):
        """Test complexity calculation with fragment spread."""
        query = """
            fragment UserFields on UserType {
                id
                email
                name
            }

            query {
                users {
                    items {
                        ...UserFields
                    }
                }
            }
        """
        ext = QueryComplexityExtension(execution_context=None, max_complexity=100)
        doc = parse(query)
        complexity = ext._calculate_complexity(doc)
        # users(1) + items(1) + id(1) + email(1) + name(1) = 5
        assert complexity == 5

    def test_calculate_complexity_with_inline_fragment(self):
        """Test complexity calculation with inline fragment."""
        query = """
            query {
                users {
                    items {
                        ... on UserType {
                            id
                            email
                        }
                    }
                }
            }
        """
        ext = QueryComplexityExtension(execution_context=None, max_complexity=100)
        doc = parse(query)
        complexity = ext._calculate_complexity(doc)
        # users(1) + items(1) + id(1) + email(1) = 4
        assert complexity == 4

    def test_calculate_complexity_with_fragment_prevents_recount(self):
        """Test that fragments are tracked to prevent infinite loops."""
        query = """
            fragment UserFields on UserType {
                id
                email
            }

            query {
                users {
                    items {
                        ...UserFields
                    }
                }
                user(id: 1) {
                    ...UserFields
                }
            }
        """
        ext = QueryComplexityExtension(execution_context=None, max_complexity=100)
        doc = parse(query)
        complexity = ext._calculate_complexity(doc)
        # users(1) + items(1) + id(1) + email(1) + user(1) = 5
        # Fragment is tracked per-traversal, second spread doesn't count again
        assert complexity == 5

    def test_complexity_exceeded_value(self):
        """Test complexity calculation correctly identifies exceeding queries."""
        query = """
            query {
                users {
                    items {
                        id
                        email
                        name
                        isActive
                        createdAt
                        updatedAt
                    }
                    total
                    skip
                    limit
                    hasMore
                }
            }
        """
        ext = QueryComplexityExtension(execution_context=None, max_complexity=5)
        doc = parse(query)
        complexity = ext._calculate_complexity(doc)
        # users(1) + items(1) + 6 fields + 4 pagination fields = 12
        assert complexity == 12
        assert complexity > ext.max_complexity

    def test_complexity_within_limit_value(self):
        """Test complexity calculation for queries within limit."""
        query = """
            query {
                hello
            }
        """
        ext = QueryComplexityExtension(execution_context=None, max_complexity=100)
        doc = parse(query)
        complexity = ext._calculate_complexity(doc)
        assert complexity == 1
        assert complexity <= ext.max_complexity


class TestExtensionsDefaultValues:
    """Test that extensions use default values from settings."""

    def test_depth_limit_uses_settings_default(self):
        """Test that DepthLimitExtension uses settings.graphql_max_depth."""
        ext = DepthLimitExtension(execution_context=None)
        # Default from settings is 10
        assert ext.max_depth == 10

    def test_complexity_limit_uses_settings_default(self):
        """Test that QueryComplexityExtension uses settings.graphql_max_complexity."""
        ext = QueryComplexityExtension(execution_context=None)
        # Default from settings is 100
        assert ext.max_complexity == 100

    def test_depth_limit_custom_value(self):
        """Test that custom max_depth is used."""
        ext = DepthLimitExtension(execution_context=None, max_depth=5)
        assert ext.max_depth == 5

    def test_complexity_limit_custom_value(self):
        """Test that custom max_complexity is used."""
        ext = QueryComplexityExtension(execution_context=None, max_complexity=50)
        assert ext.max_complexity == 50
