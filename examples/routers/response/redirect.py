from fastapi import APIRouter
from fastapi.responses import RedirectResponse

# Returns an HTTP redirect. Uses a 307 status code (Temporary Redirect) by default.

router = APIRouter(prefix="/redirect-response")


# Define a route that redirects to the Typer documentation.
# https://fastapi.tiangolo.com/advanced/custom-response/#redirectresponse.
@router.get("/typer", response_class=RedirectResponse)
async def redirect_typer():
    return RedirectResponse("https://typer.tiangolo.com")


# Define a route that redirects to the FastAPI documentation.
# https://fastapi.tiangolo.com/advanced/custom-response/#redirectresponse.
@router.get("/fastapi", response_class=RedirectResponse)
async def redirect_fastapi():
    return "https://fastapi.tiangolo.com"


# Define a route that redirects to the Pydantic documentation using a 302 status code (Found).
# https://fastapi.tiangolo.com/advanced/custom-response/#redirectresponse.
@router.get("/pydantic", response_class=RedirectResponse, status_code=302)
async def redirect_pydantic():
    return "https://docs.pydantic.dev/"
