import time

from fastapi import FastAPI, Request

app = FastAPI()


# Before and after the response
# https://fastapi.tiangolo.com/tutorial/middleware/
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    """
    Middleware to add an "X-Process-Time" header to the response, indicating the time taken to process the request.

    Args:
    - request (Request): The incoming request.
    - call_next (function): The function to call to continue processing the request.

    Returns:
    - Response: The response with the "X-Process-Time" header added.
    """
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response
