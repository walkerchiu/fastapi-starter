from fastapi import FastAPI

from pydantic import BaseModel


# Define a Pydantic model representing an item
class Item(BaseModel):
    name: str
    description: str | None = None
    price: float
    tax: float | None = None


app = FastAPI()


# Define a route to update an item with data from the request body and a query parameter
# https://fastapi.tiangolo.com/tutorial/body/#request-body-path-query-parameters
@app.put("/items/{item_id}")
async def update_item(item_id: int, item: Item, q: str | None = None):
    # Create a dictionary with the updated item details
    result = {"item_id": item_id, **item.dict()}
    # If a query parameter q is provided, add it to the dictionary
    if q:
        result.update({"q": q})
    # Return the result dictionary
    return result
