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
            deprecated=True,
        ),
    ] = None,
    hidden_query: Annotated[
        str | None,
        Query(
            min_length=3,
            max_length=50,
            regex="^fixedquery$",
            title="Query parameter(Hidden)",
            description="The query string for searching items. Must be between 3 and 50 characters long and match the pattern 'fixedquery'.",
            alias="item-query-hidden",
            include_in_schema=False,
        ),
    ] = None,
):
    # Initialize results with a list of items
    results = {"items": [{"item_id": "Foo"}, {"item_id": "Bar"}]}

    if q:
        results.update({"q": q})
    if hidden_query:
        results.update({"hidden_query": hidden_query})

    # Return the results dictionary
    return results
