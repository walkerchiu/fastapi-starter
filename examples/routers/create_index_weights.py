from fastapi import APIRouter

router = APIRouter()


# Create a route to handle POST requests to create index weights
# https://fastapi.tiangolo.com/tutorial/body-nested-models/#bodies-of-arbitrary-dicts
@router.post("/index-weights/")
async def create_index_weights(weights: dict[int, float]):
    return weights
