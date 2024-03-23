from fastapi import FastAPI

from examples.routers import (
    create_index_weights,
    create_multiple_images,
    create_offer,
    get_model,
    read_file,
)
from examples.routers.auth import router as auth_router
from examples.routers.header import router as header_router
from examples.routers.item import router as item_router
from examples.routers.user_item import router as user_item_router

app = FastAPI()


app.include_router(create_index_weights.router)
app.include_router(create_multiple_images.router)
app.include_router(create_offer.router)
app.include_router(get_model.router)
app.include_router(read_file.router)
app.include_router(auth_router)
app.include_router(header_router)
app.include_router(item_router)
app.include_router(user_item_router)


# Define a route for the root URL ("/") using the GET method
# https://fastapi.tiangolo.com/tutorial/first-steps/
@app.get("/")
async def root():
    # Return a dictionary with a message key containing "Hello World"
    return {"message": "Hello World"}
