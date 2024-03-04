from fastapi import APIRouter

from pydantic import BaseModel, HttpUrl

router = APIRouter()


# Define a Pydantic model for Image with a URL and a name
class Image(BaseModel):
    url: HttpUrl
    name: str


# Create a route to handle POST requests to create multiple images
# https://fastapi.tiangolo.com/tutorial/body-nested-models/#bodies-of-pure-lists
@router.post("/images/multiple/")
async def create_multiple_images(images: list[Image]):
    return images
