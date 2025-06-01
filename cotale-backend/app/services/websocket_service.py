"""
WebSocket service for real-time collaboration
"""

import json
from typing import Dict, List, Optional
from fastapi import WebSocket


class WebSocketService:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}
        self.document_users: Dict[str, Dict[str, str]] = {}

    async def connect(
        self,
        websocket: WebSocket,
        document_id: str,
        user_id: str,
        user_name: str,
    ):
        """Connect a user to a document"""
        await websocket.accept()
        if document_id not in self.active_connections:
            self.active_connections[document_id] = []
            self.document_users[document_id] = {}

        self.active_connections[document_id].append(websocket)
        self.document_users[document_id][user_id] = user_name

        await self.broadcast_to_document(
            document_id,
            {
                "type": "user_joined",
                "user_id": user_id,
                "user_name": user_name,
                "users": self.document_users[document_id],
            },
            exclude_websocket=websocket,
        )

    def disconnect(self, websocket: WebSocket, document_id: str, user_id: str):
        """Disconnect a user from a document"""
        if document_id in self.active_connections:
            self.active_connections[document_id].remove(websocket)
            if user_id in self.document_users.get(document_id, {}):
                del self.document_users[document_id][user_id]

            if not self.active_connections[document_id]:
                del self.active_connections[document_id]
                if document_id in self.document_users:
                    del self.document_users[document_id]

    async def broadcast_to_document(
        self,
        document_id: str,
        message: dict,
        exclude_websocket: Optional[WebSocket] = None,
    ):
        """Broadcast a message to all users in a document"""
        if document_id in self.active_connections:
            disconnected = []
            for connection in self.active_connections[document_id]:
                if connection != exclude_websocket:
                    try:
                        await connection.send_text(json.dumps(message))
                    except Exception:
                        disconnected.append(connection)

            for conn in disconnected:
                self.active_connections[document_id].remove(conn)

    async def handle_yjs_update(
        self, websocket: WebSocket, document_id: str, message: dict
    ):
        """Handle Y.js document updates"""
        await self.broadcast_to_document(
            document_id, message, exclude_websocket=websocket
        )

    async def handle_cursor_update(
        self,
        websocket: WebSocket,
        document_id: str,
        user_id: str,
        user_name: str,
        message: dict,
    ):
        """Handle cursor position updates"""
        message["user_id"] = user_id
        message["user_name"] = user_name
        await self.broadcast_to_document(
            document_id, message, exclude_websocket=websocket
        )

    def get_document_users(self, document_id: str) -> Dict[str, str]:
        """Get all users in a document"""
        return self.document_users.get(document_id, {})
