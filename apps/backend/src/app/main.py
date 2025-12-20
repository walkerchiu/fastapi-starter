from fastapi import FastAPI

app = FastAPI(
    title="FastAPI Backend",
    description="FastAPI backend application",
    version="0.0.0",
)


@app.get("/")
async def root() -> dict[str, str]:
    """Health check endpoint."""
    return {"message": "Hello World"}
