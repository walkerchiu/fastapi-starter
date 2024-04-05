from fastapi import APIRouter
from fastapi.responses import ORJSONResponse

# FastAPI will inspect every item inside and make sure it is serializable with JSON, using the same JSON Compatible Encoder explained in the tutorial.
# This is what allows you to return arbitrary objects, for example database models.
# But if you are certain that the content that you are returning is serializable with JSON,
# you can pass it directly to the response class and avoid the extra overhead that FastAPI would have by passing your return content through the jsonable_encoder before passing it to the response class.

# The ORJSONResponse is currently only available in FastAPI, not in Starlette.

router = APIRouter()


# Define a route that returns a JSON response using ORJSONResponse
# https://fastapi.tiangolo.com/advanced/custom-response/#use-orjsonresponse.
@router.get("/items/", response_class=ORJSONResponse)
async def read_items():
    # Return a JSON response with an item_id
    return ORJSONResponse([{"item_id": "Foo"}])
