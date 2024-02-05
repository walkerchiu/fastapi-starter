from fastapi import FastAPI

app = FastAPI()


# Define a route to read an item with required and optional query parameters for pagination
# https://fastapi.tiangolo.com/tutorial/query-params/#required-query-parameters
@app.get("/items/{item_id}")
async def read_user_item(
    item_id: str, needy: str, skip: int = 0, limit: int | None = None
):
    # Create a dictionary representing the item with its details
    item = {"item_id": item_id, "needy": needy, "skip": skip, "limit": limit}
    # Return the item dictionary
    return item
