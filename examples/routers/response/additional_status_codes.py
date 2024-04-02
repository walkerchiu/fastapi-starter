from typing import Annotated

from fastapi import APIRouter, Body, status
from fastapi.responses import JSONResponse

# When you return a Response directly, like in the example above, it will be returned directly.
# It won't be serialized with a model, etc.
# Make sure it has the data you want it to have, and that the values are valid JSON (if you are using JSONResponse).

# You could also use from starlette.responses import JSONResponse.
# FastAPI provides the same starlette.responses as fastapi.responses just as a convenience for you, the developer.
# But most of the available responses come directly from Starlette. The same with status.

router = APIRouter()

# Create a sample data dictionary
items = {"foo": {"name": "Fighters", "size": 6}, "bar": {"name": "Tenders", "size": 3}}


# Define a route to handle PUT requests
# https://fastapi.tiangolo.com/advanced/additional-status-codes/.
@router.put("/items/{item_id}")
async def upsert_item(
    item_id: str,
    # Use Annotated to specify parameter types and extract from request body
    name: Annotated[str | None, Body()] = None,
    size: Annotated[int | None, Body()] = None,
):
    if item_id in items:
        # If the item already exists, update its data
        item = items[item_id]
        item["name"] = name
        item["size"] = size
        return item
    else:
        # If the item does not exist, create a new item
        item = {"name": name, "size": size}
        items[item_id] = item
        # Return the data of the newly created item and status code 201 Created
        return JSONResponse(status_code=status.HTTP_201_CREATED, content=item)
