"""
WebSocket service for real-time collaboration
"""

import json
from typing import Dict, List, Optional
from fastapi import WebSocket
from sqlalchemy.orm import Session

from app.models.user import User
from app.services.document_service import DocumentService


class WebSocketService:
    def __init__(self) -> None:
        self.active_connections: Dict[str, List[Dict]] = (
            {}
        )  # document_id -> list of connection info
        self.document_users: Dict[str, Dict[str, Dict]] = (
            {}
        )  # document_id -> user_id -> user info

    async def connect(
        self,
        websocket: WebSocket,
        document_id: str,
        user: User,
        db: Session,
    ) -> bool:
        """Connect a user to a document with permission check"""
        # Check document permissions
        document_service = DocumentService(db)
        permission = document_service.check_user_permission(document_id, user)

        if not permission:
            await websocket.close(
                code=4003, reason="No permission to access this document"
            )
            return False

        # Check if document exists
        document = document_service.get_document(document_id, user)
        if not document:
            await websocket.close(code=4004, reason="Document not found")
            return False

        await websocket.accept()

        # Initialize document connections if not exists
        if document_id not in self.active_connections:
            self.active_connections[document_id] = []
            self.document_users[document_id] = {}

        # Add connection info
        connection_info = {
            "websocket": websocket,
            "user_id": str(user.id),
            "user_name": user.username,
            "permission": permission,
        }
        self.active_connections[document_id].append(connection_info)

        # Add user info
        self.document_users[document_id][str(user.id)] = {
            "user_name": user.username,
            "permission": permission,
            "email": user.email,
        }

        # Broadcast user joined
        await self.broadcast_to_document(
            document_id,
            {
                "type": "user_joined",
                "user_id": str(user.id),
                "user_name": user.username,
                "permission": permission,
                "users": self.document_users[document_id],
            },
            exclude_user_id=str(user.id),
        )

        # Send current document state to new user
        await websocket.send_text(
            json.dumps(
                {
                    "type": "document_state",
                    "document_id": document_id,
                    "title": str(document.title),
                    "content": str(document.content),
                    "users": self.document_users[document_id],
                    "your_permission": permission,
                }
            )
        )

        return True

    def disconnect(self, websocket: WebSocket, document_id: str, user_id: str) -> None:
        """Disconnect a user from a document"""
        if document_id in self.active_connections:
            # Remove connection
            self.active_connections[document_id] = [
                conn
                for conn in self.active_connections[document_id]
                if conn["websocket"] != websocket
            ]

            # Remove user
            if user_id in self.document_users.get(document_id, {}):
                user_name = self.document_users[document_id][user_id]["user_name"]
                del self.document_users[document_id][user_id]

                # Broadcast user left
                if self.active_connections[document_id]:
                    import asyncio

                    asyncio.create_task(
                        self.broadcast_to_document(
                            document_id,
                            {
                                "type": "user_left",
                                "user_id": user_id,
                                "user_name": user_name,
                                "users": self.document_users[document_id],
                            },
                        )
                    )

            # Clean up empty document
            if not self.active_connections[document_id]:
                del self.active_connections[document_id]
                if document_id in self.document_users:
                    del self.document_users[document_id]

    async def broadcast_to_document(
        self,
        document_id: str,
        message: dict,
        exclude_user_id: Optional[str] = None,
    ):
        """Broadcast a message to all users in a document"""
        if document_id in self.active_connections:
            disconnected = []
            for connection_info in self.active_connections[document_id]:
                if connection_info["user_id"] != exclude_user_id:
                    try:
                        await connection_info["websocket"].send_text(
                            json.dumps(message)
                        )
                    except Exception:
                        disconnected.append(connection_info)

            # Remove disconnected connections
            for conn_info in disconnected:
                self.active_connections[document_id].remove(conn_info)
                user_id = conn_info["user_id"]
                if user_id in self.document_users.get(document_id, {}):
                    del self.document_users[document_id][user_id]

    async def handle_yjs_update(
        self,
        websocket: WebSocket,
        document_id: str,
        user_id: str,
        message: dict,
        db: Session,
    ):
        """Handle Y.js document updates with permission check"""
        # Check if user has edit permission
        user_permission = None
        for conn_info in self.active_connections.get(document_id, []):
            if conn_info["websocket"] == websocket and conn_info["user_id"] == user_id:
                user_permission = conn_info["permission"]
                break

        if user_permission not in ["edit", "admin"]:
            await websocket.send_text(
                json.dumps(
                    {"type": "error", "message": "No permission to edit this document"}
                )
            )
            return

        # Save Y.js update to database if needed
        if "update" in message:
            document_service = DocumentService(db)
            # Get user object
            from app.db.repositories.user_repository import UserRepository

            user_repo = UserRepository(db)
            user = user_repo.get_by_id(int(user_id))

            if user:
                document_service.update_document_content(
                    document_id=document_id,
                    content=message.get("content", ""),
                    user=user,
                    yjs_update=message.get("update"),
                )

        # Broadcast to other users
        await self.broadcast_to_document(document_id, message, exclude_user_id=user_id)

    async def handle_cursor_update(
        self,
        websocket: WebSocket,
        document_id: str,
        user_id: str,
        message: dict,
    ):
        """Handle cursor position updates"""
        # Add user info to message
        if (
            document_id in self.document_users
            and user_id in self.document_users[document_id]
        ):
            user_info = self.document_users[document_id][user_id]
            message.update(
                {
                    "user_id": user_id,
                    "user_name": user_info["user_name"],
                    "type": "cursor_update",
                }
            )

            await self.broadcast_to_document(
                document_id, message, exclude_user_id=user_id
            )

    async def handle_content_change(
        self,
        websocket: WebSocket,
        document_id: str,
        user_id: str,
        content: str,
        db: Session,
    ):
        """Handle direct content changes"""
        # Check permission
        user_permission = None
        for conn_info in self.active_connections.get(document_id, []):
            if conn_info["websocket"] == websocket and conn_info["user_id"] == user_id:
                user_permission = conn_info["permission"]
                break

        if user_permission not in ["edit", "admin"]:
            await websocket.send_text(
                json.dumps(
                    {"type": "error", "message": "No permission to edit this document"}
                )
            )
            return

        # Update document in database
        document_service = DocumentService(db)
        from app.db.repositories.user_repository import UserRepository

        user_repo = UserRepository(db)
        user = user_repo.get_by_id(int(user_id))

        if user:
            updated_document = document_service.update_document_content(
                document_id=document_id, content=content, user=user
            )

            if updated_document:
                # Broadcast content change to other users
                await self.broadcast_to_document(
                    document_id,
                    {
                        "type": "content_changed",
                        "content": content,
                        "user_id": user_id,
                        "user_name": user.username,
                    },
                    exclude_user_id=user_id,
                )

    def get_document_users(self, document_id: str) -> Dict[str, Dict]:
        """Get all users in a document"""
        return self.document_users.get(document_id, {})

    def get_document_connections_count(self, document_id: str) -> int:
        """Get number of active connections for a document"""
        return len(self.active_connections.get(document_id, []))
