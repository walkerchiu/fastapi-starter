from typing import Annotated

from fastapi import FastAPI, Query

app = FastAPI()


# Define a route to read items with an optional query parameter
# https://fastapi.tiangolo.com/tutorial/query-params-str-validations/#additional-validation
@app.get("/items/")
async def read_items(q: Annotated[str | None, Query(max_length=50)] = None):
    """
    The query parameter q is of type Annotated[str | None, Query(max_length=50)].
    Annotated is used to add metadata to the type hint. Here, it indicates that the query parameter
    should be of type str or None, with a maximum length of 50 characters.

    If the q parameter is provided and its length exceeds 50 characters, FastAPI will raise an error.

    The default value is None, making the parameter optional.

    Using Annotated provides additional type information and validation to the endpoint.
    """

    # Initialize results with a list of items
    results = {"items": [{"item_id": "Foo"}, {"item_id": "Bar"}]}
    # If a query parameter q is provided, add it to the results dictionary
    if q:
        results.update({"q": q})
    # Return the results dictionary
    return results
