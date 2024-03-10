from fastapi import APIRouter

from examples.routers.header.read_strange_header import router as read_strange_header
from examples.routers.header.read_user_agent import router as read_user_agent


router = APIRouter(prefix="/header", tags=["Header"])

router.include_router(read_strange_header)
router.include_router(read_user_agent)
