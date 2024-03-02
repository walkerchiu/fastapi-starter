from fastapi import FastAPI

app = FastAPI()


# Create a route to handle POST requests to create index weights
# https://fastapi.tiangolo.com/tutorial/body-nested-models/#bodies-of-arbitrary-dicts
@app.post("/index-weights/")
async def create_index_weights(weights: dict[int, float]):
    return weights
