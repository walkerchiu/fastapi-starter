from fastapi import FastAPI
from fastapi.middleware.trustedhost import TrustedHostMiddleware

app = FastAPI()

# Add middleware to restrict requests to specific hosts
# https://fastapi.tiangolo.com/advanced/middleware/#trustedhostmiddleware
app.add_middleware(
    TrustedHostMiddleware, allowed_hosts=["example.com", "*.example.com"]
)


@app.get("/")
async def main():
    """
    Endpoint to return a simple message.

    Returns:
    - dict: A dictionary containing a message.
    """
    return {"message": "Hello World"}
