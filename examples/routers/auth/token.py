from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
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


# Function to hash a password (simulated for demonstration purposes)
def fake_hash_password(password: str):
    return "fakehashed" + password


# Pydantic model for a user
class User(BaseModel):
    username: str
    email: str | None = None
    full_name: str | None = None
    disabled: bool | None = None


# Pydantic model for a user in the fake database
class UserInDB(User):
    hashed_password: str


# Function to get a user from the fake database
def get_user(db, username: str):
    if username in db:
        user_dict = db[username]
        return UserInDB(**user_dict)


# Function to decode a token (simulated for demonstration purposes)
def fake_decode_token(token):
    # This doesn't provide any security at all
    # Check the next version
    user = get_user(fake_users_db, token)
    return user


# Dependency to get the current user from the token
async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]):
    user = fake_decode_token(token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


# Dependency to get the current active user
async def get_current_active_user(
    current_user: Annotated[User, Depends(get_current_user)]
):
    if current_user.disabled:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


# Route to authenticate and get a token
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


# Simulated function to decode a token
def fake_decode_token(token):
    return User(
        username=token + "fakedecoded", email="john@example.com", full_name="John Doe"
    )


# Route to get the current user based on the token
# https://fastapi.tiangolo.com/tutorial/security/simple-oauth2/#see-it-in-action
@router.get("/users/me")
async def read_users_me(
    current_user: Annotated[User, Depends(get_current_active_user)]
):
    return current_user
