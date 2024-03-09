from fastapi import APIRouter

from examples.routers.header.read_user_agent import router as read_user_agent


router = APIRouter(prefix="/header", tags=["Header"])

router.include_router(read_user_agent)
