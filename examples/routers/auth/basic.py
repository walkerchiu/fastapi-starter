from typing import Annotated

from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordBearer

router = APIRouter()


# Creating an OAuth2PasswordBearer instance with a tokenUrl
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


# Defining a route for the root endpoint "/"
# https://fastapi.tiangolo.com/tutorial/security/first-steps/
@router.get("/")
# Async function that requires a token argument with the OAuth2PasswordBearer dependency
async def hello_auth(token: Annotated[str, Depends(oauth2_scheme)]):
    # Returning a dictionary with the token
    return {"token": token}
