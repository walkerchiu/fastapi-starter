from fastapi import FastAPI, Path

app = FastAPI()

# A fake database of items
fake_items_db = [{"item_name": "Foo"}, {"item_name": "Bar"}, {"item_name": "Baz"}]


# Define a route to read a single item
@app.get("/item/{item_id}")
async def read_item(
    item_id: int = Path(
        ...,
        title="Item ID",
        description="The ID of the item to retrieve",
        ge=0,  # greater than or equal to 0
        lt=3,  # less than 3 (since we have 3 items in fake_items_db)
    )
):
    # Return the item with the specified item_id if it exists, otherwise return a message
    if 0 <= item_id < len(fake_items_db):
        return fake_items_db[item_id]
    else:
        return {"message": "Item not found"}
