"""
WebSocket API endpoints for real-time collaboration
"""

import json
import uuid
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends

from app.api.deps import get_websocket_service, get_ai_service
from app.services.websocket_service import WebSocketService
from app.services.ai_service import AIService

router = APIRouter()


@router.websocket("/ws/{document_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    document_id: str,
    websocket_service: WebSocketService = Depends(get_websocket_service),
    ai_service: AIService = Depends(get_ai_service),
):
    """WebSocket endpoint for real-time collaboration"""
    user_id = websocket.query_params.get("user_id", str(uuid.uuid4()))
    user_name = websocket.query_params.get("user_name", f"User_{user_id[:8]}")

    await websocket_service.connect(websocket, document_id, user_id, user_name)

    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)

            if message.get("type") == "yjs_update":
                await websocket_service.handle_yjs_update(
                    websocket, document_id, message
                )
            elif message.get("type") == "cursor_update":
                await websocket_service.handle_cursor_update(
                    websocket, document_id, user_id, user_name, message
                )
            elif message.get("type") == "ai_request":
                await ai_service.handle_ai_request(
                    websocket, document_id, user_id, message, websocket_service
                )

    except WebSocketDisconnect:
        websocket_service.disconnect(websocket, document_id, user_id)
        await websocket_service.broadcast_to_document(
            document_id,
            {
                "type": "user_left",
                "user_id": user_id,
                "users": websocket_service.get_document_users(document_id),
            },
        )
