"""
Document Pydantic schemas for API serialization
"""

from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class DocumentBase(BaseModel):
    title: str
    content: Optional[str] = ""
    is_public: Optional[bool] = False


class DocumentCreate(DocumentBase):
    id: Optional[str] = None  # if not provided, will be generated automatically


class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    is_public: Optional[bool] = None


class DocumentCollaboratorBase(BaseModel):
    user_id: int
    permission: str = "edit"


class DocumentCollaborator(DocumentCollaboratorBase):
    id: int
    document_id: str
    joined_at: datetime
    user: Optional["User"] = None  # Forward reference

    class Config:
        from_attributes = True


class DocumentHistoryBase(BaseModel):
    operation_type: str
    content_snapshot: Optional[str] = None
    yjs_update: Optional[str] = None
    metadata: Optional[str] = None


class DocumentHistory(DocumentHistoryBase):
    id: int
    document_id: str
    user_id: int
    created_at: datetime
    user: Optional["User"] = None  # Forward reference

    class Config:
        from_attributes = True


class Document(DocumentBase):
    id: str
    owner_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    owner: Optional["User"] = None  # Forward reference
    collaborators: Optional[List[DocumentCollaborator]] = []
    history: Optional[List[DocumentHistory]] = []

    class Config:
        from_attributes = True


class DocumentSummary(BaseModel):
    """Simplified document information for list display"""

    id: str
    title: str
    owner_id: int
    is_public: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    collaborator_count: Optional[int] = 0

    class Config:
        from_attributes = True


# Forward reference resolution
from app.schemas.user import User

DocumentCollaborator.model_rebuild()
DocumentHistory.model_rebuild()
Document.model_rebuild()
