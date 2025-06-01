"""
Authentication service for business logic
"""

from typing import Optional
from datetime import timedelta
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.db.repositories.user_repository import UserRepository
from app.schemas.user import UserCreate, UserLogin, Token
from app.models.user import User
from app.core.security import verify_password, create_access_token
from app.core.config import settings


class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.user_repo = UserRepository(db)

    def register_user(self, user_data: UserCreate) -> User:
        """Register a new user"""
        # Check if user already exists
        if self.user_repo.get_by_email(user_data.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )

        if self.user_repo.get_by_username(user_data.username):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Username already taken"
            )

        # Create new user
        try:
            return self.user_repo.create(user_data)
        except Exception as _e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User registration failed",
            )

    def authenticate_user(self, email: str, password: str) -> Optional[User]:
        """Authenticate user with email and password"""
        user = self.user_repo.get_by_email(email)
        if not user:
            return None
        if not verify_password(password, str(user.hashed_password)):
            return None
        return user

    def login_user(self, user_credentials: UserLogin) -> Token:
        """Login user and return access token"""
        user = self.authenticate_user(user_credentials.email, user_credentials.password)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )

        return Token(access_token=access_token, token_type="bearer")
