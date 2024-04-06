from fastapi import APIRouter
from fastapi.responses import HTMLResponse

router = APIRouter()


# Define a route that returns an HTML response using HTMLResponse
# https://fastapi.tiangolo.com/advanced/custom-response/#html-response.
@router.get("/items/", response_class=HTMLResponse)
async def read_items():
    # Return an HTML response
    return """
    <html>
        <head>
            <title>Some HTML in here</title>
        </head>
        <body>
            <h1>Look ma! HTML!</h1>
        </body>
    </html>
    """
