from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

from pydantic import BaseModel

router = APIRouter()


# Creating an OAuth2PasswordBearer instance with a tokenUrl
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")


fake_users_db = {
    "johndoe": {
        "username": "johndoe",
        "full_name": "John Doe",
        "email": "johndoe@example.com",
        "hashed_password": "fakehashedsecret",
        "disabled": False,
    },
    "alice": {
        "username": "alice",
        "full_name": "Alice Wonderson",
        "email": "alice@example.com",
        "hashed_password": "fakehashedsecret2",
        "disabled": True,
    },
}


def fake_hash_password(password: str):
    return "fakehashed" + password


class User(BaseModel):
    username: str
    email: str | None = None
    full_name: str | None = None
    disabled: bool | None = None


class UserInDB(User):
    hashed_password: str


# Defining a route for the root endpoint "/token"
# https://fastapi.tiangolo.com/tutorial/security/simple-oauth2/
@router.post("/token")
async def token(form_data: Annotated[OAuth2PasswordRequestForm, Depends()]):
    # Retrieve user information from fake database based on the provided username
    user_dict = fake_users_db.get(form_data.username)
    if not user_dict:
        raise HTTPException(status_code=400, detail="Incorrect username or password")

    # Create a UserInDB instance from the retrieved user information
    user = UserInDB(**user_dict)

    # Hash the provided password for comparison
    hashed_password = fake_hash_password(form_data.password)

    # Check if the hashed password matches the stored hashed password
    if not hashed_password == user.hashed_password:
        raise HTTPException(status_code=400, detail="Incorrect username or password")

    # Return an access token if the authentication is successful
    return {"access_token": user.username, "token_type": "bearer"}
