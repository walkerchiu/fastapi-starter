from fastapi import APIRouter

from examples.routers.response.additional_status_codes import router as upsert_item
from examples.routers.response.custom_response import router as get_legacy_data
from examples.routers.response.html_response import router as html_response
from examples.routers.response.jsonable_encoder import router as update_item
from examples.routers.response.orjson import router as orjson


router = APIRouter(prefix="/response", tags=["Response"])

router.include_router(get_legacy_data)
router.include_router(html_response)
router.include_router(orjson)
router.include_router(update_item)
router.include_router(upsert_item)
