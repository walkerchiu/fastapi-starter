"""FastAPI application entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.app.api import auth_router, users_router
from src.app.core.config import settings
from src.app.graphql import get_context, schema
from src.app.middleware import (
    RateLimitConfig,
    RateLimitMiddleware,
    ResponseWrapperMiddleware,
)
from strawberry.fastapi import GraphQLRouter

app = FastAPI(
    title=settings.app_name,
    description=settings.app_description,
    version=settings.app_version,
)

# Add rate limiting middleware (must be added before CORS)
if settings.rate_limit_enabled:
    app.add_middleware(
        RateLimitMiddleware,
        default_limit=RateLimitConfig(
            requests=settings.rate_limit_requests,
            window=settings.rate_limit_window,
        ),
        route_limits={
            "/api/v1/auth": RateLimitConfig(
                requests=settings.rate_limit_auth_requests,
                window=settings.rate_limit_auth_window,
            ),
            "/graphql": RateLimitConfig(
                requests=settings.rate_limit_graphql_requests,
                window=settings.rate_limit_graphql_window,
            ),
        },
        exclude_paths=["/", "/health", "/docs", "/openapi.json", "/redoc"],
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=settings.cors_allow_credentials,
    allow_methods=settings.cors_allow_methods,
    allow_headers=settings.cors_allow_headers,
)

# Add response wrapper middleware for consistent API response format
# (wraps successful responses with { success: true, data: ... })
app.add_middleware(ResponseWrapperMiddleware)

# REST API routes
app.include_router(auth_router, prefix="/api/v1")
app.include_router(users_router, prefix="/api/v1")

# GraphQL route
graphql_router = GraphQLRouter(schema, context_getter=get_context)
app.include_router(graphql_router, prefix="/graphql")


@app.get("/")
async def root() -> dict[str, str]:
    """Health check endpoint."""
    return {"message": "Hello World"}
