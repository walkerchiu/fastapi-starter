from fastapi import FastAPI
from fastapi.middleware.gzip import GZipMiddleware

app = FastAPI()

# Add middleware to compress responses with GZip if response size is greater than 1000 bytes
# minimum_size - Do not GZip responses that are smaller than this minimum size in bytes. Defaults to 500.
# https://fastapi.tiangolo.com/advanced/middleware/#gzipmiddleware
app.add_middleware(GZipMiddleware, minimum_size=1000)


@app.get("/")
async def main():
    """
    Endpoint to return a string.

    Returns:
    - str: A string response.
    """
    return "somebigcontent"
