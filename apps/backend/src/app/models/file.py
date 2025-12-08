"""File model."""

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import JSON, BigInteger, DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.app.db.base import Base

if TYPE_CHECKING:
    from src.app.models.user import User


class File(Base):
    """File database model for tracking uploaded files."""

    __tablename__ = "files"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    key: Mapped[str] = mapped_column(String(500), unique=True, index=True)
    filename: Mapped[str] = mapped_column(String(255))
    content_type: Mapped[str] = mapped_column(String(100), nullable=False, default="")
    size: Mapped[int] = mapped_column(BigInteger)
    bucket: Mapped[str] = mapped_column(String(100))
    file_metadata: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
    deleted_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="files")
