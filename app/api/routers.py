from fastapi import APIRouter

from app.api.v1.hello import router as hello_router
from app.core.conf import settings

v1 = APIRouter(prefix=settings.APP_API_V1_STR)

v1.include_router(hello_router)
