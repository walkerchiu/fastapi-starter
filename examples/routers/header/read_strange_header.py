from typing import Annotated

from fastapi import APIRouter, Header

router = APIRouter()


# Define a route to handle GET requests to the root endpoint ("/").
# The route takes an optional query parameter 'strange_header' of type 'str' with a default value of None.
# The 'strange_header' parameter is annotated with Annotated to indicate that it is a Header parameter.
# The 'convert_underscores' argument is set to False to prevent FastAPI from converting underscores to dashes in the header name.
# https://fastapi.tiangolo.com/tutorial/header-params/#automatic-conversion
@router.get("/strange")
async def read_strange_header(
    strange_header: Annotated[str | None, Header(convert_underscores=False)] = None
):
    # Return a dictionary containing the 'strange_header' parameter value passed in the request.
    return {"strange_header": strange_header}
