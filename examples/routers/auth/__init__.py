from fastapi import APIRouter

from examples.routers.auth.basic import router as basic


router = APIRouter(prefix="/auth", tags=["Auth"])

router.include_router(basic)
