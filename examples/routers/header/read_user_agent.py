from typing import Annotated

from fastapi import APIRouter, Header

router = APIRouter()


# Define a route to handle GET requests to the root endpoint ("/").
# The route takes an optional query parameter 'user_agent' of type 'str' with a default value of None.
# The 'user_agent' parameter is annotated with Annotated to indicate that it is a Header parameter.
# https://fastapi.tiangolo.com/tutorial/header-params/#header-parameters
@router.get("/user_agent")
async def read_user_agent(user_agent: Annotated[str | None, Header()] = None):
    # Return a dictionary containing the User-Agent header value passed in the request.
    return {"User-Agent": user_agent}
