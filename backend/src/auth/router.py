from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from src.auth import service as auth_service
from src.auth.security import create_access_token
from src.database import get_db
from src.dependencies import get_current_user_from_token
from src.users.models import User
from src.users.schemas import TokenResponse, UserCreate, UserLogin, UserResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def signup(user_in: UserCreate, db: Session = Depends(get_db)):
    user = auth_service.create_user(db, user_in)
    access_token = create_access_token(subject=user.id)
    return TokenResponse(access_token=access_token, user=user)


@router.post("/login", response_model=TokenResponse)
def login(login_in: UserLogin, db: Session = Depends(get_db)):
    user = auth_service.authenticate_user(db, login_in)
    access_token = create_access_token(subject=user.id)
    return TokenResponse(access_token=access_token, user=user)


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user_from_token)):
    return current_user
