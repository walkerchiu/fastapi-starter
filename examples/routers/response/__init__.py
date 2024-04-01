from fastapi import APIRouter

from examples.routers.response.additional_status_codes import router as upsert_item


router = APIRouter(prefix="/response", tags=["Response"])

router.include_router(upsert_item)
