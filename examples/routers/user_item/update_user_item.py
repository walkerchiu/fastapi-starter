from typing import Annotated

from fastapi import APIRouter, Body, Path

from pydantic import BaseModel, Field


# Define a Pydantic model representing an item
class Item(BaseModel):
    name: str
    description: str | None = Field(
        default=None, title="The description of the item", max_length=300
    )
    price: float = Field(gt=0, description="The price must be greater than zero")
    tax: float | None = None

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "name": "Foo",
                    "description": "A very nice Item",
                    "price": 35.4,
                    "tax": 3.2,
                }
            ]
        }
    }


# Define a Pydantic model representing an user
class User(BaseModel):
    username: str
    full_name: str | None = None

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "username": "john_doe",
                    "full_name": "John Doe",
                }
            ]
        }
    }


router = APIRouter()


# Define a route to update an item with data from the request body and a query parameter
# Using Path for item_id validation, Body for importance, and request body for item and user
# https://fastapi.tiangolo.com/tutorial/body/#request-body-path-query-parameters
# https://fastapi.tiangolo.com/tutorial/body-multiple-params/#mix-path-query-and-body-parameters
# https://fastapi.tiangolo.com/tutorial/body-multiple-params/#singular-values-in-body
@router.put("/{item_id}")
async def update_user_item(
    item_id: Annotated[int, Path(title="The ID of the item to update", ge=0, le=1000)],
    item: Item,
    user: User,
    importance: Annotated[
        int, Body(..., gt=0, description="The importance level of the update")
    ],
):
    # Create a dictionary with the updated item details
    results = {"item_id": item_id, "item": item, "user": user, "importance": importance}
    return results
