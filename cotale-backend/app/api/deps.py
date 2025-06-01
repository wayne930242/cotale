"""
API dependencies for dependency injection
"""

from sqlalchemy.orm import Session
from fastapi import Depends

from app.db.database import get_db
from app.services.auth_service import AuthService
from app.services.websocket_service import WebSocketService
from app.services.ai_service import AIService


def get_auth_service(db: Session = Depends(get_db)) -> AuthService:
    """Get authentication service"""
    return AuthService(db)


def get_websocket_service() -> WebSocketService:
    """Get WebSocket service (singleton)"""
    if not hasattr(get_websocket_service, "_instance"):
        get_websocket_service._instance = WebSocketService()
    return get_websocket_service._instance


def get_ai_service() -> AIService:
    """Get AI service"""
    return AIService()
