"""
CoTale Backend Application
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.v1 import auth

# from app.api.v1 import documents  # websocket temporarily disabled
# from app.api.v1 import websocket

# Create FastAPI application
app = FastAPI(
    title="CoTale API",
    version="1.0.0",
    description="Collaborative TRPG script editor with AI assistant",
    debug=settings.DEBUG,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["authentication"])
# app.include_router(documents.router, prefix="/api/v1/documents", tags=["documents"])
# app.include_router(websocket.router, prefix="/api/v1", tags=["websocket"])  # Temporarily disabled due to Pydantic error


@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "CoTale API is running"}


@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "cotale-api"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
    )
