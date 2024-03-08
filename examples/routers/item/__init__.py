from fastapi import APIRouter

from examples.routers.item.create_item import router as create_item
from examples.routers.item.list_item import router as list_item
from examples.routers.item.read_item import router as read_item


router = APIRouter(prefix="/item", tags=["Item"])

router.include_router(create_item)
router.include_router(list_item)
router.include_router(read_item)
