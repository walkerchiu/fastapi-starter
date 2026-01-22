from fastapi import FastAPI
from src.app.core.config import settings

app = FastAPI(
    title=settings.app_name,
    description=settings.app_description,
    version=settings.app_version,
)


@app.get("/")
async def root() -> dict[str, str]:
    """Health check endpoint."""
    return {"message": "Hello World"}
