from fastapi import FastAPI

from examples.routers import (
    create_index_weights,
    create_item,
    create_multiple_images,
    create_offer,
    get_model,
    read_file,
    read_item,
    read_items,
    read_user_item,
    update_item,
)

app = FastAPI()


app.include_router(create_index_weights.router)
app.include_router(create_item.router)
app.include_router(create_multiple_images.router)
app.include_router(create_offer.router)
app.include_router(get_model.router)
app.include_router(read_file.router)
app.include_router(read_item.router)
app.include_router(read_items.router)
app.include_router(read_user_item.router)
app.include_router(update_item.router)


# Define a route for the root URL ("/") using the GET method
# https://fastapi.tiangolo.com/tutorial/first-steps/
@app.get("/")
async def root():
    # Return a dictionary with a message key containing "Hello World"
    return {"message": "Hello World"}
