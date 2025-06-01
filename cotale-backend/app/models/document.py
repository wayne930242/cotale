"""
Document and collaboration models
"""

from typing import Optional, List, TYPE_CHECKING
from datetime import datetime
from sqlalchemy import Integer, String, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.sql import func
from app.models.user import Base

if TYPE_CHECKING:
    from app.models.user import User


class Document(Base):
    __tablename__ = "documents"

    id: Mapped[str] = mapped_column(String, primary_key=True, index=True)  # custom ID
    title: Mapped[str] = mapped_column(
        String, nullable=False, default="Untitled Script"
    )
    content: Mapped[str] = mapped_column(Text, default="")
    owner_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=False
    )
    is_public: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), onupdate=func.now()
    )

    # Relationships
    owner: Mapped["User"] = relationship("User", back_populates="documents")
    collaborators: Mapped[List["DocumentCollaborator"]] = relationship(
        "DocumentCollaborator", back_populates="document"
    )
    history: Mapped[List["DocumentHistory"]] = relationship(
        "DocumentHistory",
        back_populates="document",
        order_by="DocumentHistory.created_at.desc()",
    )

    def __repr__(self) -> str:
        return f"<Document(id='{self.id}', title='{self.title}', owner_id={self.owner_id})>"


class DocumentCollaborator(Base):
    __tablename__ = "document_collaborators"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    document_id: Mapped[str] = mapped_column(
        String, ForeignKey("documents.id"), nullable=False
    )
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=False
    )
    permission: Mapped[str] = mapped_column(
        String, default="edit"
    )  # "read", "edit", "admin"
    joined_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Relationships
    document: Mapped["Document"] = relationship(
        "Document", back_populates="collaborators"
    )
    user: Mapped["User"] = relationship("User", back_populates="collaborations")

    def __repr__(self) -> str:
        return f"<DocumentCollaborator(document_id='{self.document_id}', user_id={self.user_id}, permission='{self.permission}')>"


class DocumentHistory(Base):
    __tablename__ = "document_history"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    document_id: Mapped[str] = mapped_column(
        String, ForeignKey("documents.id"), nullable=False
    )
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=False
    )
    operation_type: Mapped[str] = mapped_column(
        String, nullable=False
    )  # "create", "edit", "delete", "yjs_update"
    content_snapshot: Mapped[Optional[str]] = mapped_column(
        Text
    )  # optional content snapshot
    yjs_update: Mapped[Optional[str]] = mapped_column(Text)  # Y.js update data
    extra_metadata: Mapped[Optional[str]] = mapped_column(
        Text
    )  # JSON format extra metadata
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Relationships
    document: Mapped["Document"] = relationship("Document", back_populates="history")
    user: Mapped["User"] = relationship("User", back_populates="document_history")

    def __repr__(self) -> str:
        return f"<DocumentHistory(id={self.id}, document_id='{self.document_id}', operation='{self.operation_type}')>"
