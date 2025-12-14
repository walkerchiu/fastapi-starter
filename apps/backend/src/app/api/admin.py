"""Admin API endpoints."""

from datetime import UTC, datetime, timedelta
from typing import Annotated

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from src.app.core.config import settings
from src.app.core.deps import require_permissions
from src.app.db import get_db
from src.app.models import File, User

# Type alias for dependency injection
DbSession = Annotated[AsyncSession, Depends(get_db)]

router = APIRouter(prefix="/admin", tags=["Admin"])


class UserStats(BaseModel):
    """User statistics."""

    total: int = Field(description="總用戶數")
    active: int = Field(description="活躍用戶數")
    new_today: int = Field(description="今日新增用戶")
    new_this_week: int = Field(description="本週新增用戶")


class FileStats(BaseModel):
    """File statistics."""

    total: int = Field(description="總檔案數")
    total_size: int = Field(description="總儲存空間（bytes）")
    uploads_today: int = Field(default=0, description="今日上傳數量")


class SystemStats(BaseModel):
    """System statistics."""

    status: str = Field(description="系統健康狀態")
    uptime: int | None = Field(default=None, description="運行時間（秒）")
    version: str = Field(description="系統版本")


class AdminStatsResponse(BaseModel):
    """Admin statistics response."""

    users: UserStats
    files: FileStats
    system: SystemStats


@router.get(
    "/stats",
    response_model=AdminStatsResponse,
    summary="取得系統統計資料",
    description="取得管理後台首頁的統計資料。需要 admin:access 權限。",
    dependencies=[Depends(require_permissions(["admin:access"]))],
)
async def get_admin_stats(
    db: DbSession,
) -> AdminStatsResponse:
    """Get admin dashboard statistics."""
    now = datetime.now(UTC)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = today_start - timedelta(days=today_start.weekday())

    # User statistics
    total_users = await db.scalar(
        select(func.count()).select_from(User).where(User.deleted_at.is_(None))
    )
    active_users = await db.scalar(
        select(func.count())
        .select_from(User)
        .where(User.deleted_at.is_(None), User.is_active.is_(True))
    )
    new_today = await db.scalar(
        select(func.count())
        .select_from(User)
        .where(User.deleted_at.is_(None), User.created_at >= today_start)
    )
    new_this_week = await db.scalar(
        select(func.count())
        .select_from(User)
        .where(User.deleted_at.is_(None), User.created_at >= week_start)
    )

    # File statistics
    total_files = await db.scalar(
        select(func.count()).select_from(File).where(File.deleted_at.is_(None))
    )
    total_size = (
        await db.scalar(
            select(func.sum(File.size)).where(File.deleted_at.is_(None))
        )
        or 0
    )
    uploads_today = await db.scalar(
        select(func.count())
        .select_from(File)
        .where(File.deleted_at.is_(None), File.created_at >= today_start)
    )

    return AdminStatsResponse(
        users=UserStats(
            total=total_users or 0,
            active=active_users or 0,
            new_today=new_today or 0,
            new_this_week=new_this_week or 0,
        ),
        files=FileStats(
            total=total_files or 0,
            total_size=total_size,
            uploads_today=uploads_today or 0,
        ),
        system=SystemStats(
            status="healthy",
            version=settings.app_version,
        ),
    )
