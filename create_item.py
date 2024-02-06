from fastapi import FastAPI

from pydantic import BaseModel


# Define a Pydantic model representing an item
class Item(BaseModel):
    name: str
    description: str | None = None
    price: float
    tax: float | None = None


app = FastAPI()


# Define a route to create an item with data from the request body
# https://fastapi.tiangolo.com/tutorial/body/
@app.post("/items/")
async def create_item(item: Item):
    # Return the item received in the request
    return item
