from fastapi import APIRouter

from examples.routers.response.additional_status_codes import router as upsert_item
from examples.routers.response.jsonable_encoder import router as update_item


router = APIRouter(prefix="/response", tags=["Response"])

router.include_router(update_item)
router.include_router(upsert_item)
