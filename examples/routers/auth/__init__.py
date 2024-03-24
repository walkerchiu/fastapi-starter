from fastapi import APIRouter

from examples.routers.auth.basic import router as basic
from examples.routers.auth.token import router as token


router = APIRouter(prefix="/auth", tags=["Auth"])

router.include_router(basic)
router.include_router(token)
