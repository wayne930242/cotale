"""
User database model
"""

from typing import Optional, List, TYPE_CHECKING
from datetime import datetime
from sqlalchemy import Integer, String, DateTime, Boolean
from sqlalchemy.orm import DeclarativeBase, relationship, Mapped, mapped_column
from sqlalchemy.sql import func

if TYPE_CHECKING:
    from app.models.document import Document, DocumentCollaborator, DocumentHistory


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    username: Mapped[str] = mapped_column(
        String, unique=True, index=True, nullable=False
    )
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), onupdate=func.now()
    )

    # Relationships
    documents: Mapped[List["Document"]] = relationship(
        "Document", back_populates="owner"
    )
    collaborations: Mapped[List["DocumentCollaborator"]] = relationship(
        "DocumentCollaborator", back_populates="user"
    )
    document_history: Mapped[List["DocumentHistory"]] = relationship(
        "DocumentHistory", back_populates="user"
    )

    def __repr__(self) -> str:
        return f"<User(id={self.id}, username='{self.username}', email='{self.email}')>"
