from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi_pagination import add_pagination

from app.api.routers import v1
from app.common.exception.handler import register_exception
from app.core.conf import settings
from app.utils.serializers import MsgSpecJSONResponse


@asynccontextmanager
async def register_init(app: FastAPI):
    """
    Context manager to initialize and close resources.

    Args:
    - app (FastAPI): The FastAPI application instance.

    Yields:
    - None
    """
    # Init
    yield


def register_app():
    """
    Register the FastAPI application.

    Returns:
    - FastAPI: The configured FastAPI application.
    """
    # FastAPI
    app = FastAPI(
        title=settings.APP_TITLE,
        version=settings.APP_VERSION,
        description=settings.APP_DESCRIPTION,
        contact={
            "name": settings.APP_AUTHOR_NAME,
            "email": settings.APP_AUTHOR_EMAIL,
        },
        docs_url=settings.APP_DOCS_URL,
        redoc_url=settings.APP_REDOCS_URL,
        openapi_url=settings.APP_OPENAPI_URL,
        default_response_class=MsgSpecJSONResponse,
        lifespan=register_init,
    )

    # Middleware
    register_middleware(app)

    # Router
    register_router(app)

    # Pagination
    register_page(app)

    # Exception
    register_exception(app)

    return app


def register_middleware(app: FastAPI):
    """
    Register middleware for the FastAPI application.

    Args:
    - app (FastAPI): The FastAPI application instance.
    """
    # Gzip: Always at the top
    if settings.MIDDLEWARE_GZIP:
        from fastapi.middleware.gzip import GZipMiddleware

        app.add_middleware(GZipMiddleware)

    # Access Log
    if settings.MIDDLEWARE_ACCESS:
        from app.middleware.access_middleware import AccessMiddleware

        app.add_middleware(AccessMiddleware)

    # CORS: Always at the end
    if settings.MIDDLEWARE_CORS:
        from fastapi.middleware.cors import CORSMiddleware

        app.add_middleware(
            CORSMiddleware,
            allow_origins=settings.MIDDLEWARE_CORS_LIST,
            allow_credentials=True,
            allow_methods=["GET", "POST"],
            allow_headers=["*"],
        )


def register_router(app: FastAPI):
    """
    Register routers for the FastAPI application.

    Args:
    - app (FastAPI): The FastAPI application instance.
    """
    app.include_router(v1)


def register_page(app: FastAPI):
    """
    Register pagination for the FastAPI application.

    Args:
    - app (FastAPI): The FastAPI application instance.
    """
    add_pagination(app)
