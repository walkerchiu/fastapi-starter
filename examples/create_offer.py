from fastapi import Body, FastAPI

from pydantic import BaseModel, HttpUrl

app = FastAPI()


# Define a Pydantic model for Image with a URL and a name
class Image(BaseModel):
    url: HttpUrl
    name: str


# Define a Pydantic model for Item with a name, description, price, tax, tags, and images
class Item(BaseModel):
    name: str
    description: str | None = None  # The description can be None
    price: float
    tax: float | None = None  # The tax can be None
    tags: set[str] = set()  # Tags are a set of strings
    images: list[Image] | None = (
        None  # Images is a list of Image objects, which can be None
    )


# Define a Pydantic model for Offer with a name, description, price, and items
class Offer(BaseModel):
    name: str
    description: str | None = None  # The description can be None
    price: float
    items: list[Item]  # Items is a list of Item objects


# Create a route to handle POST requests to create offers
# https://fastapi.tiangolo.com/tutorial/body-nested-models/#deeply-nested-models
# https://fastapi.tiangolo.com/tutorial/schema-extra-example/#body-with-examples
# https://fastapi.tiangolo.com/tutorial/schema-extra-example/#using-the-openapi_examples-parameter
@app.post("/offers/")
async def create_offer(
    offer: Offer = Body(
        ...,
        openapi_examples={
            "normal": {
                "summary": "A normal example offer",
                "description": "A normal example offer",
                "value": {
                    "name": "Normal Offer",
                    "description": "This is a normal offer",
                    "price": 50.0,
                    "items": [
                        {
                            "name": "Normal Item",
                            "description": "This is a normal item",
                            "price": 25.0,
                            "tags": ["normal", "tag"],
                            "images": [
                                {
                                    "url": "https://example.com/normal.jpg",
                                    "name": "Normal Image",
                                }
                            ],
                        }
                    ],
                },
            },
            "converted": {
                "summary": "A converted example offer",
                "description": "A converted example offer",
                "value": {
                    "name": "Converted Offer",
                    "description": "This is a converted offer",
                    "price": "75.0",
                    "items": [
                        {
                            "name": "Converted Item",
                            "description": "This is a converted item",
                            "price": "37.5",
                            "tags": ["converted", "tag"],
                            "images": [
                                {
                                    "url": "https://example.com/converted.jpg",
                                    "name": "Converted Image",
                                }
                            ],
                        }
                    ],
                },
            },
            "invalid": {
                "summary": "An invalid example offer",
                "description": "An invalid example offer",
                "value": {
                    "name": "Invalid Offer",
                    "description": "This is an invalid offer",
                    "price": "invalid",
                    "items": [
                        {
                            "name": "Invalid Item",
                            "description": "This is an invalid item",
                            "price": "invalid",
                            "tags": ["invalid", "tag"],
                            "images": [
                                {
                                    "url": "https://example.com/invalid.jpg",
                                    "name": "Invalid Image",
                                }
                            ],
                        }
                    ],
                },
            },
        },
    )
):
    return offer
