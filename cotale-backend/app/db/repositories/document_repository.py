"""
Document repository for data access operations
"""

import uuid
from typing import Optional, List
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_

from app.models.document import Document, DocumentCollaborator, DocumentHistory
from app.schemas.document import DocumentCreate, DocumentUpdate


class DocumentRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, document_id: str) -> Optional[Document]:
        """Get document by ID"""
        return (
            self.db.query(Document)
            .options(
                joinedload(Document.owner),
                joinedload(Document.collaborators).joinedload(
                    DocumentCollaborator.user
                ),
            )
            .filter(Document.id == document_id)
            .first()
        )

    def get_user_documents(self, user_id: int) -> List[Document]:
        """Get all documents owned by user"""
        return (
            self.db.query(Document)
            .filter(Document.owner_id == user_id)
            .order_by(Document.updated_at.desc())
            .all()
        )

    def get_user_collaborations(self, user_id: int) -> List[Document]:
        """Get all documents user collaborates on"""
        return (
            self.db.query(Document)
            .join(DocumentCollaborator)
            .filter(DocumentCollaborator.user_id == user_id)
            .order_by(Document.updated_at.desc())
            .all()
        )

    def create(self, document_data: DocumentCreate, owner_id: int) -> Document:
        """Create a new document"""
        document_id = document_data.id or str(uuid.uuid4())

        db_document = Document(
            id=document_id,
            title=document_data.title,
            content=document_data.content or "",
            owner_id=owner_id,
            is_public=document_data.is_public or False,
        )
        self.db.add(db_document)
        self.db.commit()
        self.db.refresh(db_document)
        return db_document

    def update(self, document: Document, document_data: DocumentUpdate) -> Document:
        """Update document"""
        update_data = document_data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            if hasattr(document, key):
                setattr(document, key, value)

        self.db.commit()
        self.db.refresh(document)
        return document

    def update_content(self, document_id: str, content: str) -> Optional[Document]:
        """Update document content"""
        document = self.get_by_id(document_id)
        if document:
            # Use setattr to avoid type issues
            setattr(document, "content", content)
            self.db.commit()
            self.db.refresh(document)
        return document

    def delete(self, document: Document) -> None:
        """Delete document"""
        self.db.delete(document)
        self.db.commit()

    def check_user_permission(self, document_id: str, user_id: int) -> Optional[str]:
        """Check user permission for document"""
        # Check if user is owner
        document = self.db.query(Document).filter(Document.id == document_id).first()
        if document and document.owner_id == user_id:
            return "admin"

        # Check if user is collaborator
        collaborator = (
            self.db.query(DocumentCollaborator)
            .filter(
                and_(
                    DocumentCollaborator.document_id == document_id,
                    DocumentCollaborator.user_id == user_id,
                )
            )
            .first()
        )

        if collaborator:
            return str(collaborator.permission)

        # Check if document is public
        if document and bool(document.is_public):
            return "read"

        return None

    def add_collaborator(
        self, document_id: str, user_id: int, permission: str = "edit"
    ) -> DocumentCollaborator:
        """Add collaborator to document"""
        collaborator = DocumentCollaborator(
            document_id=document_id, user_id=user_id, permission=permission
        )
        self.db.add(collaborator)
        self.db.commit()
        self.db.refresh(collaborator)
        return collaborator

    def remove_collaborator(self, document_id: str, user_id: int) -> bool:
        """Remove collaborator from document"""
        collaborator = (
            self.db.query(DocumentCollaborator)
            .filter(
                and_(
                    DocumentCollaborator.document_id == document_id,
                    DocumentCollaborator.user_id == user_id,
                )
            )
            .first()
        )

        if collaborator:
            self.db.delete(collaborator)
            self.db.commit()
            return True
        return False


class DocumentHistoryRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_history_entry(
        self,
        document_id: str,
        user_id: int,
        operation_type: str,
        content_snapshot: Optional[str] = None,
        yjs_update: Optional[str] = None,
        extra_metadata: Optional[str] = None,
    ) -> DocumentHistory:
        """Create a history entry"""
        history_entry = DocumentHistory(
            document_id=document_id,
            user_id=user_id,
            operation_type=operation_type,
            content_snapshot=content_snapshot,
            yjs_update=yjs_update,
            extra_metadata=extra_metadata,
        )
        self.db.add(history_entry)
        self.db.commit()
        self.db.refresh(history_entry)
        return history_entry

    def get_document_history(
        self, document_id: str, limit: int = 50
    ) -> List[DocumentHistory]:
        """Get document history"""
        return (
            self.db.query(DocumentHistory)
            .options(joinedload(DocumentHistory.user))
            .filter(DocumentHistory.document_id == document_id)
            .order_by(DocumentHistory.created_at.desc())
            .limit(limit)
            .all()
        )
