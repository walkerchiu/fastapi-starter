from fastapi import APIRouter
from fastapi.responses import PlainTextResponse

router = APIRouter()


# Define a route that returns a plain text response
# https://fastapi.tiangolo.com/advanced/custom-response/#plaintextresponse.
@router.get("/plaintext", response_class=PlainTextResponse)
async def main():
    return "Hello World"
