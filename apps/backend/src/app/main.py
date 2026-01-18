"""FastAPI application entry point."""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError
from src.app.api import (
    admin_router,
    auth_router,
    files_router,
    health_router,
    permissions_router,
    roles_router,
    users_router,
)
from src.app.core.config import settings
from src.app.core.exception_handlers import (
    service_exception_handler,
    sqlalchemy_exception_handler,
)
from src.app.core.exceptions import APIException
from src.app.core.logging import get_logger, setup_logging
from src.app.graphql import (
    apollo_sandbox_handler,
    get_context,
    graphiql_handler,
    schema,
)
from src.app.middleware import (
    AccessLogMiddleware,
    RateLimitConfig,
    RateLimitMiddleware,
    RequestIDMiddleware,
)
from src.app.services.exceptions import ServiceError
from strawberry.fastapi import GraphQLRouter

# Setup structured logging
setup_logging()
logger = get_logger(__name__)

# OpenAPI Tags metadata
tags_metadata = [
    {
        "name": "health",
        "description": "Health check endpoints for monitoring and orchestration.",
    },
    {
        "name": "auth",
        "description": "Authentication operations: register, login, token refresh, and user info.",
    },
    {
        "name": "users",
        "description": "User management operations: CRUD for user resources.",
    },
    {
        "name": "permissions",
        "description": "Permission management operations: CRUD for permission resources.",
    },
    {
        "name": "roles",
        "description": "Role management operations: CRUD for role resources with permission assignment.",
    },
    {
        "name": "files",
        "description": "File storage operations: upload, download, list, and delete files.",
    },
    {
        "name": "Admin",
        "description": "Admin dashboard statistics and management.",
    },
]

app = FastAPI(
    title=settings.app_name,
    description=settings.app_description,
    version=settings.app_version,
    openapi_tags=tags_metadata,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    license_info={
        "name": "MIT",
        "url": "https://opensource.org/licenses/MIT",
    },
    swagger_ui_parameters={
        "persistAuthorization": True,
        "filter": True,
    },
)


@app.exception_handler(APIException)
async def api_exception_handler(request: Request, exc: APIException) -> JSONResponse:
    """Handle API exceptions with standardized error response format."""
    return JSONResponse(
        status_code=exc.status_code,
        content=exc.detail,
        headers=exc.headers,
    )


# Register service exception handlers for automatic conversion
app.add_exception_handler(ServiceError, service_exception_handler)
app.add_exception_handler(SQLAlchemyError, sqlalchemy_exception_handler)


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
        exclude_paths=["/", "/health", "/api/docs", "/api/openapi.json", "/api/redoc"],
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=settings.cors_allow_credentials,
    allow_methods=settings.cors_allow_methods,
    allow_headers=settings.cors_allow_headers,
)

# Add request ID middleware for request tracing
app.add_middleware(RequestIDMiddleware)

# Add access log middleware for HTTP request logging
if settings.access_log_enabled:
    app.add_middleware(
        AccessLogMiddleware,
        skip_paths=settings.access_log_skip_paths,
    )

# Health check routes (no prefix for /health, /health/live, /health/ready)
app.include_router(health_router)

# REST API routes
app.include_router(auth_router, prefix="/api/v1")
app.include_router(files_router, prefix="/api/v1")
app.include_router(permissions_router, prefix="/api/v1")
app.include_router(roles_router, prefix="/api/v1")
app.include_router(users_router, prefix="/api/v1")
app.include_router(admin_router, prefix="/api/v1")

# GraphQL IDE (development mode only, must be registered before GraphQL router)
if (
    settings.environment == "development" or settings.debug
) and settings.graphql_ide != "none":
    ide_handler = (
        apollo_sandbox_handler
        if settings.graphql_ide == "sandbox"
        else graphiql_handler
    )
    app.add_api_route(
        "/graphql",
        ide_handler,
        methods=["GET"],
        include_in_schema=False,
    )

# GraphQL route (disable built-in GraphiQL, use custom IDE)
graphql_router = GraphQLRouter(schema, context_getter=get_context, graphql_ide=None)
app.include_router(graphql_router, prefix="/graphql")

# Log startup
logger.info(
    "Application started",
    extra={
        "app_name": settings.app_name,
        "version": settings.app_version,
        "environment": settings.environment,
    },
)


@app.get("/")
async def root() -> dict[str, str]:
    """Root endpoint."""
    return {"message": "Hello World"}
