from fastapi import FastAPI

from pydantic import BaseModel


# Define a Pydantic model representing an item
class Item(BaseModel):
    name: str
    description: str | None = None
    price: float
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


app = FastAPI()


# Define a route to create an item with data from the request body
# https://fastapi.tiangolo.com/tutorial/body/
@app.post("/items/")
async def create_item(item: Item):
    # Convert the Pydantic model to a dictionary
    item_dict = item.dict()
    # If tax is provided, calculate price with tax and add it to the dictionary
    if item.tax:
        price_with_tax = item.price + item.tax
        item_dict.update({"price_with_tax": price_with_tax})
    # Return the item dictionary
    return item_dict
