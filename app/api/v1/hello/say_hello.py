from fastapi import APIRouter

# Create a new APIRouter instance
router = APIRouter()


# Define a route for the root path "/"
@router.get("/")
# Define a function to handle GET requests to "/"
def say_hello() -> str:
    # Return a simple string response
    return "hello!"
