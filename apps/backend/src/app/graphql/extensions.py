"""GraphQL security extensions for depth and complexity limiting."""

from graphql import (
    DocumentNode,
    FieldNode,
    FragmentDefinitionNode,
    FragmentSpreadNode,
    InlineFragmentNode,
    OperationDefinitionNode,
)
from src.app.core.config import settings
from src.app.graphql.errors import QueryComplexityError, QueryDepthError
from strawberry.extensions import SchemaExtension


class DepthLimitExtension(SchemaExtension):
    """Extension to limit query depth and prevent deeply nested attacks."""

    def __init__(
        self,
        *,
        execution_context=None,
        max_depth: int | None = None,
    ):
        super().__init__(execution_context=execution_context)
        self.max_depth = max_depth or settings.graphql_max_depth

    def on_operation(self):
        """Check query depth before execution."""
        execution_context = self.execution_context

        if execution_context.graphql_document is not None:
            depth = self._calculate_depth(execution_context.graphql_document)

            if depth > self.max_depth:
                raise QueryDepthError(depth, self.max_depth)

        yield

    def _calculate_depth(self, document: DocumentNode) -> int:
        """Calculate the maximum depth of a GraphQL document."""
        fragments: dict[str, FragmentDefinitionNode] = {}
        max_depth = 0

        # First pass: collect all fragment definitions
        for definition in document.definitions:
            if isinstance(definition, FragmentDefinitionNode):
                fragments[definition.name.value] = definition

        # Second pass: calculate depth for each operation
        for definition in document.definitions:
            if isinstance(definition, OperationDefinitionNode):
                depth = self._get_selection_set_depth(
                    definition.selection_set.selections,
                    fragments,
                    depth_so_far=0,
                    visited_fragments=set(),
                )
                max_depth = max(max_depth, depth)

        return max_depth

    def _get_selection_set_depth(
        self,
        selections,
        fragments: dict[str, FragmentDefinitionNode],
        depth_so_far: int,
        visited_fragments: set[str],
    ) -> int:
        """Recursively calculate the depth of a selection set."""
        max_depth = depth_so_far

        for selection in selections:
            if isinstance(selection, FieldNode):
                if selection.selection_set:
                    child_depth = self._get_selection_set_depth(
                        selection.selection_set.selections,
                        fragments,
                        depth_so_far + 1,
                        visited_fragments,
                    )
                    max_depth = max(max_depth, child_depth)
                else:
                    max_depth = max(max_depth, depth_so_far + 1)

            elif isinstance(selection, InlineFragmentNode):
                if selection.selection_set:
                    child_depth = self._get_selection_set_depth(
                        selection.selection_set.selections,
                        fragments,
                        depth_so_far,
                        visited_fragments,
                    )
                    max_depth = max(max_depth, child_depth)

            elif isinstance(selection, FragmentSpreadNode):
                fragment_name = selection.name.value
                if (
                    fragment_name not in visited_fragments
                    and fragment_name in fragments
                ):
                    visited_fragments.add(fragment_name)
                    fragment = fragments[fragment_name]
                    if fragment.selection_set:
                        child_depth = self._get_selection_set_depth(
                            fragment.selection_set.selections,
                            fragments,
                            depth_so_far,
                            visited_fragments,
                        )
                        max_depth = max(max_depth, child_depth)

        return max_depth


class QueryComplexityExtension(SchemaExtension):
    """Extension to limit query complexity based on field count."""

    def __init__(
        self,
        *,
        execution_context=None,
        max_complexity: int | None = None,
    ):
        super().__init__(execution_context=execution_context)
        self.max_complexity = max_complexity or settings.graphql_max_complexity

    def on_operation(self):
        """Check query complexity before execution."""
        execution_context = self.execution_context

        if execution_context.graphql_document is not None:
            complexity = self._calculate_complexity(execution_context.graphql_document)

            if complexity > self.max_complexity:
                raise QueryComplexityError(complexity, self.max_complexity)

        yield

    def _calculate_complexity(self, document: DocumentNode) -> int:
        """Calculate the complexity of a GraphQL document."""
        fragments: dict[str, FragmentDefinitionNode] = {}
        total_complexity = 0

        # First pass: collect all fragment definitions
        for definition in document.definitions:
            if isinstance(definition, FragmentDefinitionNode):
                fragments[definition.name.value] = definition

        # Second pass: calculate complexity for each operation
        for definition in document.definitions:
            if isinstance(definition, OperationDefinitionNode):
                complexity = self._get_selection_set_complexity(
                    definition.selection_set.selections,
                    fragments,
                    visited_fragments=set(),
                )
                total_complexity += complexity

        return total_complexity

    def _get_selection_set_complexity(
        self,
        selections,
        fragments: dict[str, FragmentDefinitionNode],
        visited_fragments: set[str],
        multiplier: int = 1,
    ) -> int:
        """Recursively calculate the complexity of a selection set."""
        complexity = 0

        for selection in selections:
            if isinstance(selection, FieldNode):
                # Each field adds 1 to complexity
                complexity += multiplier

                if selection.selection_set:
                    # Check for list fields that multiply complexity
                    field_multiplier = 1
                    # You could add custom logic here to increase multiplier
                    # for fields known to return lists

                    complexity += self._get_selection_set_complexity(
                        selection.selection_set.selections,
                        fragments,
                        visited_fragments,
                        multiplier * field_multiplier,
                    )

            elif isinstance(selection, InlineFragmentNode):
                if selection.selection_set:
                    complexity += self._get_selection_set_complexity(
                        selection.selection_set.selections,
                        fragments,
                        visited_fragments,
                        multiplier,
                    )

            elif isinstance(selection, FragmentSpreadNode):
                fragment_name = selection.name.value
                if (
                    fragment_name not in visited_fragments
                    and fragment_name in fragments
                ):
                    visited_fragments.add(fragment_name)
                    fragment = fragments[fragment_name]
                    if fragment.selection_set:
                        complexity += self._get_selection_set_complexity(
                            fragment.selection_set.selections,
                            fragments,
                            visited_fragments,
                            multiplier,
                        )

        return complexity
