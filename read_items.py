from typing import Annotated

from fastapi import FastAPI, Query

app = FastAPI()

# A fake database of items
fake_items_db = [{"item_name": "Foo"}, {"item_name": "Bar"}, {"item_name": "Baz"}]


# Define a route to read items with optional query parameters for pagination
# https://fastapi.tiangolo.com/tutorial/query-params-str-validations/#add-regular-expressions.
# https://fastapi.tiangolo.com/tutorial/path-params-numeric-validations/.
@app.get("/items/")
async def read_items(
    skip: int = Query(0, title="Skip", description="Number of items to skip", ge=0),
    limit: int = Query(
        10, title="Limit", description="Maximum number of items to return", ge=1, le=100
    ),
    q: Annotated[
        str | None,
        Query(
            ...,
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
    results = fake_items_db[skip : skip + limit]

    if q:
        results.update({"q": q})
    if hidden_query:
        results.update({"hidden_query": hidden_query})

    return results
