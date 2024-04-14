from fastapi import APIRouter
from fastapi.responses import StreamingResponse


router = APIRouter(prefix="/streaming-response")


async def fake_video_streamer():
    for i in range(10):
        yield b"some fake video bytes"


# Define a route that streams a fake video.
# Takes an async generator or a normal generator/iterator and streams the response body.
# https://fastapi.tiangolo.com/advanced/custom-response/#streamingresponse.
@router.get("/")
async def streaming():
    return StreamingResponse(fake_video_streamer())


# Define a route that streams a large video file.
# If you have a file-like object (e.g. the object returned by open()),
# you can create a generator function to iterate over that file-like object.
# https://fastapi.tiangolo.com/advanced/custom-response/#streamingresponse.
@router.get("/large-video")
async def streaming_large_video():
    some_file_path = "large-video-file.mp4"

    # Define a generator function to iterate over the file-like object.
    def iterfile():
        # Open the file-like object in binary read mode.
        with open(some_file_path, mode="rb") as file_like:
            # Yield chunks of the file as they are read.
            yield from file_like  #

    return StreamingResponse(iterfile(), media_type="video/mp4")


# That way, you don't have to read it all first in memory,
# and you can pass that generator function to the StreamingResponse, and return it.

# Notice that here as we are using standard open() that doesn't support async and await,
# we declare the path operation with normal def.
