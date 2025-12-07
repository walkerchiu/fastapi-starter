from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.app.api import users_router
from src.app.core.config import settings

app = FastAPI(
    title=settings.app_name,
    description=settings.app_description,
    version=settings.app_version,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=settings.cors_allow_credentials,
    allow_methods=settings.cors_allow_methods,
    allow_headers=settings.cors_allow_headers,
)

app.include_router(users_router, prefix="/api/v1")


@app.get("/")
async def root() -> dict[str, str]:
    """Health check endpoint."""
    return {"message": "Hello World"}
