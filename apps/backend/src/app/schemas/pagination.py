"""Pagination schemas and utilities."""

from enum import Enum
from typing import Annotated, Generic, TypeVar

from fastapi import Query
from pydantic import BaseModel


T = TypeVar("T")


class SortOrder(str, Enum):
    """Sort order enum."""

    ASC = "asc"
    DESC = "desc"


class PaginationParams:
    """Query parameters for pagination."""

    def __init__(
        self,
        page: Annotated[int, Query(ge=1, description="Page number (starts from 1)")] = 1,
        limit: Annotated[
            int, Query(ge=1, le=100, description="Number of items to return")
        ] = 20,
        sort_by: Annotated[str, Query(description="Field to sort by")] = "created_at",
        sort_order: Annotated[SortOrder, Query(description="Sort order")] = SortOrder.DESC,
    ):
        self.page = page
        self.limit = limit
        self.sort_by = sort_by
        self.sort_order = sort_order

    @property
    def offset(self) -> int:
        """Calculate offset from page and limit."""
        return (self.page - 1) * self.limit


class PaginationMeta(BaseModel):
    """Pagination metadata."""

    page: int
    limit: int
    total_items: int
    total_pages: int
    has_next_page: bool
    has_prev_page: bool


class PaginatedResponse(BaseModel, Generic[T]):
    """Generic paginated response."""

    success: bool = True
    data: list[T]
    meta: PaginationMeta


def create_paginated_response(
    items: list,
    total: int,
    page: int,
    limit: int,
) -> dict:
    """Create a paginated response dictionary."""
    total_pages = ((total + limit - 1) // limit) if limit > 0 else 1
    return {
        "success": True,
        "data": items,
        "meta": {
            "page": page,
            "limit": limit,
            "total_items": total,
            "total_pages": total_pages,
            "has_next_page": page < total_pages,
            "has_prev_page": page > 1,
        },
    }
