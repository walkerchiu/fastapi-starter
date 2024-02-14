from typing import Annotated

from fastapi import FastAPI, Query

app = FastAPI()


# Define a route to read items with an optional query parameter that is constrained by length and pattern
# https://fastapi.tiangolo.com/tutorial/query-params-str-validations/#add-regular-expressions.
@app.get("/items/")
async def read_items(
    q: Annotated[
        str | None,
        Query(
            min_length=3,
            max_length=50,
            regex="^fixedquery$",
            title="Query parameter",
            description="The query string for searching items. Must be between 3 and 50 characters long and match the pattern 'fixedquery'.",
            alias="item-query",
        ),
    ] = None,
):
    # Initialize results with a list of items
    results = {"items": [{"item_id": "Foo"}, {"item_id": "Bar"}]}
    # If a query parameter q is provided, add it to the results dictionary
    if q:
        results.update({"q": q})
    # Return the results dictionary
    return results
