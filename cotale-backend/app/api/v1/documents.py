"""
Document API endpoints
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.core.security import get_current_active_user
from app.models.user import User
from app.services.document_service import DocumentService
from app.schemas.document import (
    Document,
    DocumentCreate,
    DocumentUpdate,
    DocumentSummary,
    DocumentCollaborator,
)

router = APIRouter()


@router.post("/", response_model=Document)
async def create_document(
    document_data: DocumentCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Create a new document"""
    document_service = DocumentService(db)
    return document_service.create_document(document_data, current_user)


@router.get("/", response_model=List[DocumentSummary])
async def get_user_documents(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Get all documents owned by current user"""
    document_service = DocumentService(db)
    documents = document_service.get_user_documents(current_user)

    # Convert to summary format
    summaries = []
    for doc in documents:
        summary = DocumentSummary(
            id=str(doc.id),
            title=str(doc.title),
            owner_id=int(doc.owner_id),
            is_public=bool(doc.is_public),
            created_at=doc.created_at,
            updated_at=doc.updated_at,
            collaborator_count=len(doc.collaborators) if doc.collaborators else 0,
        )
        summaries.append(summary)

    return summaries


@router.get("/collaborations", response_model=List[DocumentSummary])
async def get_user_collaborations(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Get all documents user collaborates on"""
    document_service = DocumentService(db)
    documents = document_service.get_user_collaborations(current_user)

    # Convert to summary format
    summaries = []
    for doc in documents:
        summary = DocumentSummary(
            id=str(doc.id),
            title=str(doc.title),
            owner_id=int(doc.owner_id),
            is_public=bool(doc.is_public),
            created_at=doc.created_at,
            updated_at=doc.updated_at,
            collaborator_count=len(doc.collaborators) if doc.collaborators else 0,
        )
        summaries.append(summary)

    return summaries


@router.get("/{document_id}", response_model=Document)
async def get_document(
    document_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Get a specific document"""
    document_service = DocumentService(db)
    document = document_service.get_document(document_id, current_user)

    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Document not found"
        )

    return document


@router.put("/{document_id}", response_model=Document)
async def update_document(
    document_id: str,
    document_data: DocumentUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Update a document"""
    document_service = DocumentService(db)
    return document_service.update_document(document_id, document_data, current_user)


@router.delete("/{document_id}")
async def delete_document(
    document_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Delete a document"""
    document_service = DocumentService(db)
    success = document_service.delete_document(document_id, current_user)

    if success:
        return {"message": "Document deleted successfully"}
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete document",
        )


@router.post("/{document_id}/collaborators")
async def add_collaborator(
    document_id: str,
    user_id: int,
    permission: str = "edit",
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Add a collaborator to document"""
    document_service = DocumentService(db)
    collaborator = document_service.add_collaborator(
        document_id, user_id, permission, current_user
    )
    return {"message": "Collaborator added successfully", "collaborator": collaborator}


@router.delete("/{document_id}/collaborators/{user_id}")
async def remove_collaborator(
    document_id: str,
    user_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Remove a collaborator from document"""
    document_service = DocumentService(db)
    success = document_service.remove_collaborator(document_id, user_id, current_user)

    if success:
        return {"message": "Collaborator removed successfully"}
    else:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Collaborator not found"
        )


@router.get("/{document_id}/permission")
async def check_document_permission(
    document_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Check user's permission for a document"""
    document_service = DocumentService(db)
    permission = document_service.check_user_permission(document_id, current_user)

    return {
        "document_id": document_id,
        "user_id": current_user.id,
        "permission": permission,
    }
