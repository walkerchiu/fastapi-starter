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
