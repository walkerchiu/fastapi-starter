from fastapi import APIRouter
from fastapi.responses import UJSONResponse

# An alternative JSON response using ujson.
# ujson is less careful than Python's built-in implementation in how it handles some edge-cases.
# It's possible that ORJSONResponse might be a faster alternative.

router = APIRouter()


# Define a route that returns a JSON response using UJSONResponse
# https://fastapi.tiangolo.com/advanced/custom-response/#ujsonresponse.
@router.get("/items-ujson/", response_class=UJSONResponse)
async def read_items():
    return [{"item_id": "Foo"}]
