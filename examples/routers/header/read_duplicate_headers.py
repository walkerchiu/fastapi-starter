from typing import Annotated

from fastapi import APIRouter, Header

router = APIRouter()


# Define a route to handle GET requests to the "/duplicate-headers/" endpoint.
# The route takes an optional query parameter 'x_token' of type 'list[str]' with a default value of None.
# The 'x_token' parameter is annotated with Annotated to indicate that it is a Header parameter.
# https://fastapi.tiangolo.com/tutorial/header-params/#duplicate-headers
@router.get("/duplicate-headers/")
async def read_duplicate_headers(x_token: Annotated[list[str] | None, Header()] = None):
    # Return a dictionary containing the 'x_token' parameter value passed in the request.
    return {"X-Token values": x_token}
