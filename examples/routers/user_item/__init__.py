from fastapi import APIRouter

from examples.routers.user_item.read_user_item import router as read_user_item
from examples.routers.user_item.update_user_item import router as update_user_item


router = APIRouter(prefix="/user-item")

router.include_router(read_user_item)
router.include_router(update_user_item)
