from fastapi import FastAPI

app = FastAPI()


# Define a route to read items with an optional query parameter
@app.get("/items/")
async def read_items(q: str | None = None):
    """
    The query parameter q is of type Union[str, None] (or str | None in Python 3.10),
    which means it can be a string or None. The default value is None, indicating it's not required.

    FastAPI recognizes that q is not required because of its default value.

    Using Union[str, None] allows your editor to provide better support and error detection.
    """

    # Initialize results with a list of items
    results = {"items": [{"item_id": "Foo"}, {"item_id": "Bar"}]}
    # If a query parameter q is provided, add it to the results dictionary
    if q:
        results.update({"q": q})
    # Return the results dictionary
    return results
