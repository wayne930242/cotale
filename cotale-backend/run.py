#!/usr/bin/env python3
"""
CoTale Backend startup script
Usage: uv run python run.py
"""

if __name__ == "__main__":
    import uvicorn
    from config import settings

    print("🚀 Starting CoTale Backend...")
    print(f"📍 Host: {settings.HOST}")
    print(f"🔌 Port: {settings.PORT}")
    print(f"🐛 Debug: {settings.DEBUG}")
    print(f"🌐 CORS Origins: {settings.ALLOWED_ORIGINS}")

    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower(),
    )
