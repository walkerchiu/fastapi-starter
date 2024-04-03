from datetime import datetime
from typing import Union

from fastapi import APIRouter
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse

from pydantic import BaseModel

# JSONResponse itself is a sub-class of Response.

# You could also use from starlette.responses import JSONResponse.
# FastAPI provides the same starlette.responses as fastapi.responses just as a convenience for you, the developer.
# But most of the available responses come directly from Starlette.

router = APIRouter()


# Define the Item model with title, timestamp, and optional description
class Item(BaseModel):
    title: str
    timestamp: datetime
    description: Union[str, None] = None


# Define a route to update an item by ID
# https://fastapi.tiangolo.com/advanced/response-directly/#using-the-jsonable_encoder-in-a-response.
@router.put("/items/{id}")
def update_item(id: str, item: Item):
    # Convert the item to a JSON-compatible format
    json_compatible_item_data = jsonable_encoder(item)
    # Return a JSON response with the updated item data
    return JSONResponse(content=json_compatible_item_data)
