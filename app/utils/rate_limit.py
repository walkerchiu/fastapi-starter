from math import ceil

from fastapi import Request, Response

from app.common.exception import errors


# Function to handle rate limiting for HTTP requests
async def http_limit_callback(request: Request, response: Response, expire: int):
    """
    HTTP callback function to handle rate limiting.

    Args:
        request (Request): The incoming request object.
        response (Response): The outgoing response object.
        expire (int): The expiration time in milliseconds.

    Raises:
        errors.HTTPError: Too Many Requests error with Retry-After header.
    """
    expires = ceil(expire / 1000)
    raise errors.HTTPError(
        code=429, message="Too Many Requests", headers={"Retry-After": str(expires)}
    )
