"""
AI service for content generation and suggestions
"""

import json
from fastapi import WebSocket

from app.core.config import settings


class AIService:
    def __init__(self):
        pass

    async def handle_ai_request(
        self,
        websocket: WebSocket,
        document_id: str,
        user_id: str,
        message: dict,
        websocket_service,
    ):
        """Handle AI requests for content suggestions"""
        try:
            prompt = message.get("prompt", "")

            if settings.has_openai_key:
                # TODO: Actual OpenAI API call
                # Real OpenAI API integration can be added here
                ai_response_content = await self._generate_ai_response(prompt)
            else:
                # Simulate AI response
                ai_response_content = self._generate_mock_response(prompt)

            ai_response = {
                "type": "ai_response",
                "request_id": message.get("request_id"),
                "content": ai_response_content,
                "suggested_position": message.get("cursor_position", 0),
                "user_id": user_id,
            }

            # Send to requesting user
            await websocket.send_text(json.dumps(ai_response))

            # Also broadcast to other users (let them see AI suggestions)
            await websocket_service.broadcast_to_document(
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

    async def _generate_ai_response(self, prompt: str) -> str:
        """Generate AI response using OpenAI API"""
        # TODO: Implement actual OpenAI API call
        # This is a placeholder for future implementation
        return self._generate_mock_response(prompt)

    def _generate_mock_response(self, prompt: str) -> str:
        """Generate a mock AI response for development"""
        return (
            f"AI Suggestion: Based on your prompt '{prompt}', "
            "I recommend adding more character interactions and "
            "plot twists to your script."
        )
