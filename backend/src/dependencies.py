from typing import List, Optional
from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
import jwt
from sqlalchemy.orm import Session

from src.config import settings
from src.database import get_db
from src.exceptions import ForbiddenException, UnauthorizedException

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login", auto_error=False)


def get_current_user_from_token(
    token: Optional[str] = Depends(oauth2_scheme), db: Session = Depends(get_db)
):
    if not token:
        raise UnauthorizedException("Authentication token required")

    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if not user_id:
            raise UnauthorizedException("Invalid token payload")
    except (jwt.PyJWTError, ValueError):
        raise UnauthorizedException("Could not validate credentials")

    # Import User model inside function to avoid circular imports during foundation setup
    from src.users.models import User

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise UnauthorizedException("User not found")
    return user


def require_roles(allowed_roles: List[str]):
    def role_checker(current_user=Depends(get_current_user_from_token)):
        if current_user.role not in allowed_roles:
            raise ForbiddenException(
                f"Role '{current_user.role}' is not authorized to perform this action. Required: {allowed_roles}"
            )
        return current_user

    return role_checker
