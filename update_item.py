from fastapi import FastAPI

from pydantic import BaseModel


# Define a Pydantic model representing an item
class Item(BaseModel):
    name: str
    description: str | None = None
    price: float
    tax: float | None = None


app = FastAPI()


# Define a route to update an item with data from the request body
# https://fastapi.tiangolo.com/tutorial/body/#request-body-path-parameters
@app.put("/items/{item_id}")
async def update_item(item_id: int, item: Item):
    # Return a dictionary with the updated item details
    return {"item_id": item_id, **item.dict()}
