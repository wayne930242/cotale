"""
API dependencies for dependency injection
"""

from typing import Optional
from sqlalchemy.orm import Session
from fastapi import Depends

from app.db.database import get_db
from app.services.auth_service import AuthService
from app.services.websocket_service import WebSocketService
from app.services.ai_service import AIService

# Global instance for WebSocket service
_websocket_service_instance: Optional[WebSocketService] = None


def get_auth_service(db: Session = Depends(get_db)) -> AuthService:
    """Get authentication service"""
    return AuthService(db)


def get_websocket_service() -> WebSocketService:
    """Get WebSocket service (singleton)"""
    global _websocket_service_instance
    if _websocket_service_instance is None:
        _websocket_service_instance = WebSocketService()
    return _websocket_service_instance


def get_ai_service() -> AIService:
    """Get AI service"""
    return AIService()
