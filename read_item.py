from fastapi import FastAPI

app = FastAPI()


# A fake database of items
fake_items_db = [{"item_name": "Foo"}, {"item_name": "Bar"}, {"item_name": "Baz"}]


# Define a route to read items with optional query parameters for pagination
# https://fastapi.tiangolo.com/tutorial/query-params/
@app.get("/items/")
async def read_item(skip: int = 0, limit: int = 10):
    # Return a slice of the fake database based on the skip and limit parameters
    return fake_items_db[skip : skip + limit]
