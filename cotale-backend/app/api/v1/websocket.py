"""
WebSocket API endpoints for real-time collaboration
"""

import json
from fastapi import (
    APIRouter,
    WebSocket,
    WebSocketDisconnect,
    Depends,
)
from sqlalchemy.orm import Session
from jose import JWTError, jwt

from app.api.deps import get_websocket_service, get_ai_service, get_db
from app.services.websocket_service import WebSocketService
from app.services.ai_service import AIService
from app.core.config import settings
from app.db.repositories.user_repository import UserRepository

router = APIRouter()


async def get_user_from_token(websocket: WebSocket, db: Session) -> tuple:
    """Get user from WebSocket token"""
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=4001, reason="Authentication token required")
        return None, None

    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        user_email = payload.get("sub")
        if not user_email:
            await websocket.close(code=4001, reason="Invalid token")
            return None, None

        user_repo = UserRepository(db)
        user = user_repo.get_by_email(user_email)
        if not user:
            await websocket.close(code=4001, reason="User not found")
            return None, None

        return user, str(user.id)
    except JWTError:
        await websocket.close(code=4001, reason="Invalid token")
        return None, None


@router.websocket("/ws/{document_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    document_id: str,
    websocket_service: WebSocketService = Depends(get_websocket_service),
    ai_service: AIService = Depends(get_ai_service),
    db: Session = Depends(get_db),
):
    """WebSocket endpoint for real-time collaboration"""
    # Authenticate user
    user, user_id = await get_user_from_token(websocket, db)
    if not user:
        return

    # Connect to document with permission check
    connected = await websocket_service.connect(websocket, document_id, user, db)
    if not connected:
        return

    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            message_type = message.get("type")

            if message_type == "yjs_update":
                await websocket_service.handle_yjs_update(
                    websocket, document_id, user_id, message, db
                )
            elif message_type == "cursor_update":
                await websocket_service.handle_cursor_update(
                    websocket, document_id, user_id, message
                )
            elif message_type == "content_change":
                content = message.get("content", "")
                await websocket_service.handle_content_change(
                    websocket, document_id, user_id, content, db
                )
            elif message_type == "ai_request":
                await ai_service.handle_ai_request(
                    websocket, document_id, user_id, message, websocket_service
                )
            elif message_type == "ping":
                # Handle ping for connection keep-alive
                await websocket.send_text(json.dumps({"type": "pong"}))
            else:
                await websocket.send_text(
                    json.dumps(
                        {
                            "type": "error",
                            "message": f"Unknown message type: {message_type}",
                        }
                    )
                )

    except WebSocketDisconnect:
        websocket_service.disconnect(websocket, document_id, user_id)
    except json.JSONDecodeError:
        await websocket.send_text(
            json.dumps({"type": "error", "message": "Invalid JSON format"})
        )
    except Exception as e:
        await websocket.send_text(
            json.dumps({"type": "error", "message": f"Server error: {str(e)}"})
        )
        websocket_service.disconnect(websocket, document_id, user_id)


@router.get("/documents/{document_id}/users")
async def get_document_users(
    document_id: str,
    websocket_service: WebSocketService = Depends(get_websocket_service),
):
    """Get active users in a document"""
    return {
        "document_id": document_id,
        "users": websocket_service.get_document_users(document_id),
        "connection_count": websocket_service.get_document_connections_count(
            document_id
        ),
    }
