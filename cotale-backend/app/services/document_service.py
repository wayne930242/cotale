"""
Document service for business logic
"""

from typing import Optional, List
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.db.repositories.document_repository import (
    DocumentRepository,
    DocumentHistoryRepository,
)
from app.schemas.document import (
    DocumentCreate,
    DocumentUpdate,
)
from app.models.document import Document, DocumentCollaborator
from app.models.user import User


class DocumentService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.document_repo = DocumentRepository(db)
        self.history_repo = DocumentHistoryRepository(db)

    def create_document(self, document_data: DocumentCreate, owner: User) -> Document:
        """Create a new document"""
        document = self.document_repo.create(document_data, int(owner.id))

        # Create history entry
        self.history_repo.create_history_entry(
            document_id=str(document.id),
            user_id=int(owner.id),
            operation_type="create",
            content_snapshot=str(document.content) if document.content else None,
            extra_metadata=f'{{"title": "{document.title}"}}',
        )

        return document

    def get_document(
        self, document_id: str, user: Optional[User] = None
    ) -> Optional[Document]:
        """Get document by ID with permission check"""
        document = self.document_repo.get_by_id(document_id)

        if not document:
            return None

        # Check permissions if user is provided
        if user:
            permission = self.document_repo.check_user_permission(
                document_id, int(user.id)
            )
            if not permission:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="No permission to access this document",
                )

        return document

    def update_document(
        self, document_id: str, document_data: DocumentUpdate, user: User
    ) -> Document:
        """Update document"""
        # Check permissions
        permission = self.document_repo.check_user_permission(document_id, int(user.id))
        if permission not in ["edit", "admin"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No permission to edit this document",
            )

        document = self.document_repo.get_by_id(document_id)
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Document not found"
            )

        # Update document
        updated_document = self.document_repo.update(document, document_data)

        # Create history entry
        self.history_repo.create_history_entry(
            document_id=document_id,
            user_id=int(user.id),
            operation_type="edit",
            extra_metadata=f'{{"updated_fields": {list(document_data.model_dump(exclude_unset=True).keys())}}}',
        )

        return updated_document

    def update_document_content(
        self,
        document_id: str,
        content: str,
        user: User,
        yjs_update: Optional[str] = None,
    ) -> Optional[Document]:
        """Update document content (for real-time collaboration)"""
        # Check permissions
        permission = self.document_repo.check_user_permission(document_id, int(user.id))
        if permission not in ["edit", "admin"]:
            return None

        # Update content
        document = self.document_repo.update_content(document_id, content)

        if document and yjs_update:
            # Create history entry for Y.js update
            self.history_repo.create_history_entry(
                document_id=document_id,
                user_id=int(user.id),
                operation_type="yjs_update",
                yjs_update=yjs_update,
            )

        return document

    def delete_document(self, document_id: str, user: User) -> bool:
        """Delete document"""
        # Check if user is owner
        permission = self.document_repo.check_user_permission(document_id, int(user.id))
        if permission != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only document owner can delete the document",
            )

        document = self.document_repo.get_by_id(document_id)
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Document not found"
            )

        # Create history entry before deletion
        self.history_repo.create_history_entry(
            document_id=document_id,
            user_id=int(user.id),
            operation_type="delete",
            content_snapshot=str(document.content) if document.content else "",
        )

        self.document_repo.delete(document)
        return True

    def get_user_documents(self, user: User) -> List[Document]:
        """Get all documents owned by user"""
        return self.document_repo.get_user_documents(int(user.id))

    def get_user_collaborations(self, user: User) -> List[Document]:
        """Get all documents user collaborates on"""
        return self.document_repo.get_user_collaborations(int(user.id))

    def add_collaborator(
        self, document_id: str, user_id: int, permission: str, requesting_user: User
    ) -> DocumentCollaborator:
        """Add collaborator to document"""
        # Check if requesting user has admin permission
        user_permission = self.document_repo.check_user_permission(
            document_id, int(requesting_user.id)
        )
        if user_permission != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only document owner can add collaborators",
            )

        return self.document_repo.add_collaborator(document_id, user_id, permission)

    def remove_collaborator(
        self, document_id: str, user_id: int, requesting_user: User
    ) -> bool:
        """Remove collaborator from document"""
        # Check if requesting user has admin permission
        user_permission = self.document_repo.check_user_permission(
            document_id, int(requesting_user.id)
        )
        if user_permission != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only document owner can remove collaborators",
            )

        return self.document_repo.remove_collaborator(document_id, user_id)

    def check_user_permission(self, document_id: str, user: User) -> Optional[str]:
        """Check user permission for document"""
        return self.document_repo.check_user_permission(document_id, int(user.id))
