from fastapi import APIRouter
from fastapi.responses import HTMLResponse

router = APIRouter()


# Define a route that returns an HTML response using HTMLResponse
# This approach directly returns an HTML string.
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


# Define another route that returns an HTML response using HTMLResponse
# This approach explicitly creates an HTMLResponse object and returns it.
# https://fastapi.tiangolo.com/advanced/custom-response/#return-a-response.
@router.get("/items2/")
async def read_items2():
    # Create an HTML content string
    html_content = """
    <html>
        <head>
            <title>Some HTML in here</title>
        </head>
        <body>
            <h1>Look ma! HTML!</h1>
        </body>
    </html>
    """
    # Return an HTML response object with the specified content and status code
    return HTMLResponse(content=html_content, status_code=200)
