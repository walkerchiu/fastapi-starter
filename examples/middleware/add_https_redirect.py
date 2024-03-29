from fastapi import FastAPI
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware

app = FastAPI()

# Add middleware to redirect HTTP requests to HTTPS
# https://fastapi.tiangolo.com/advanced/middleware/#httpsredirectmiddleware
app.add_middleware(HTTPSRedirectMiddleware)


@app.get("/")
async def main():
    """
    Endpoint to return a simple message.

    Returns:
    - dict: A dictionary containing a message.
    """
    return {"message": "Hello World"}
