from fastapi import APIRouter

from app.api.v1.hello.say_hello import router as say_hello


router = APIRouter(tags=["Hello"])

router.include_router(say_hello, prefix="/hello")
