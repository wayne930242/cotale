"""
Authentication API endpoints
"""

from fastapi import APIRouter, Depends
from fastapi.security import HTTPBearer

from app.api.deps import get_auth_service
from app.services.auth_service import AuthService
from app.schemas.user import UserCreate, UserLogin, User as UserSchema, Token
from app.core.security import get_current_active_user
from app.models.user import User

router = APIRouter()
security = HTTPBearer()


@router.post("/register", response_model=UserSchema)
async def register(
    user_data: UserCreate, auth_service: AuthService = Depends(get_auth_service)
):
    """Register a new user"""
    return auth_service.register_user(user_data)


@router.post("/login", response_model=Token)
async def login(
    user_credentials: UserLogin, auth_service: AuthService = Depends(get_auth_service)
):
    """Login user and return access token"""
    return auth_service.login_user(user_credentials)


@router.get("/me", response_model=UserSchema)
async def get_current_user_info(current_user: User = Depends(get_current_active_user)):
    """Get current user information"""
    return current_user


@router.post("/logout")
async def logout():
    """Logout user (client should remove token)"""
    return {"message": "Successfully logged out"}
