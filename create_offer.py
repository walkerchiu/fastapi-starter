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
@app.post("/offers/")
async def create_offer(
    offer: Offer = Body(
        ...,
        examples={
            "example1": {
                "summary": "An example offer",
                "description": "A detailed description of an example offer",
                "value": {
                    "name": "Offer 1",
                    "description": "Description of Offer 1",
                    "price": 100.0,
                    "items": [
                        {
                            "name": "Item 1",
                            "description": "Description of Item 1",
                            "price": 50.0,
                            "tags": ["tag1", "tag2"],
                            "images": [
                                {
                                    "url": "https://example.com/image1.jpg",
                                    "name": "Image 1",
                                }
                            ],
                        }
                    ],
                },
            }
        },
    )
):
    return offer
