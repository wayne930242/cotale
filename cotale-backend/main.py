from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import json
from typing import Dict, List
import uuid
from config import settings

app = FastAPI(title="CoTale API", version="1.0.0", debug=settings.DEBUG)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}
        self.document_users: Dict[str, Dict[str, str]] = {}

    async def connect(
        self, websocket: WebSocket, document_id: str, user_id: str, user_name: str
    ):
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
        if document_id in self.active_connections:
            self.active_connections[document_id].remove(websocket)
            if user_id in self.document_users.get(document_id, {}):
                del self.document_users[document_id][user_id]

            if not self.active_connections[document_id]:
                del self.active_connections[document_id]
                if document_id in self.document_users:
                    del self.document_users[document_id]

    async def broadcast_to_document(
        self, document_id: str, message: dict, exclude_websocket: WebSocket = None
    ):
        if document_id in self.active_connections:
            disconnected = []
            for connection in self.active_connections[document_id]:
                if connection != exclude_websocket:
                    try:
                        await connection.send_text(json.dumps(message))
                    except:
                        disconnected.append(connection)

            for conn in disconnected:
                self.active_connections[document_id].remove(conn)


manager = ConnectionManager()


@app.get("/")
async def root():
    return {"message": "CoTale API is running"}


@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "cotale-api"}


@app.websocket("/ws/{document_id}")
async def websocket_endpoint(websocket: WebSocket, document_id: str):
    user_id = websocket.query_params.get("user_id", str(uuid.uuid4()))
    user_name = websocket.query_params.get("user_name", f"User_{user_id[:8]}")

    await manager.connect(websocket, document_id, user_id, user_name)

    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)

            if message.get("type") == "yjs_update":
                await manager.broadcast_to_document(
                    document_id, message, exclude_websocket=websocket
                )
            elif message.get("type") == "cursor_update":
                message["user_id"] = user_id
                message["user_name"] = user_name
                await manager.broadcast_to_document(
                    document_id, message, exclude_websocket=websocket
                )
            elif message.get("type") == "ai_request":
                await handle_ai_request(websocket, document_id, user_id, message)

    except WebSocketDisconnect:
        manager.disconnect(websocket, document_id, user_id)
        await manager.broadcast_to_document(
            document_id,
            {
                "type": "user_left",
                "user_id": user_id,
                "users": manager.document_users.get(document_id, {}),
            },
        )


async def handle_ai_request(
    websocket: WebSocket, document_id: str, user_id: str, message: dict
):
    """處理 AI 請求"""
    try:
        prompt = message.get("prompt", "")
        context = message.get("context", "")

        if settings.has_openai_key:
            # TODO: 實際的 OpenAI API 調用
            # 這裡可以添加真實的 OpenAI API 整合
            ai_response_content = f"AI 建議：根據您的提示「{prompt}」，我建議在劇本中加入更多角色互動和情節轉折。"
        else:
            # 模擬 AI 回應
            ai_response_content = f"AI 建議：根據您的提示「{prompt}」，我建議在劇本中加入更多角色互動和情節轉折。"

        ai_response = {
            "type": "ai_response",
            "request_id": message.get("request_id"),
            "content": ai_response_content,
            "suggested_position": message.get("cursor_position", 0),
            "user_id": user_id,
        }

        # 發送給請求的用戶
        await websocket.send_text(json.dumps(ai_response))

        # 也廣播給其他用戶（讓他們看到 AI 建議）
        await manager.broadcast_to_document(
            document_id,
            {**ai_response, "type": "ai_suggestion_broadcast"},
            exclude_websocket=websocket,
        )

    except Exception as e:
        error_response = {
            "type": "ai_error",
            "request_id": message.get("request_id"),
            "error": str(e),
            "user_id": user_id,
        }
        await websocket.send_text(json.dumps(error_response))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG
    )
