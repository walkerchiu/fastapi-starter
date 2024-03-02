from fastapi import FastAPI

app = FastAPI()


# Define a route for the root URL ("/") using the GET method
# https://fastapi.tiangolo.com/tutorial/first-steps/
@app.get("/")
async def root():
    # Return a dictionary with a message key containing "Hello World"
    return {"message": "Hello World"}
