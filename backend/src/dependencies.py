from typing import List, Optional
from fastapi import Depends, Request
from fastapi.security import OAuth2PasswordBearer
import jwt
from sqlalchemy.orm import Session

from src.config import settings
from src.database import get_db
from src.exceptions import ForbiddenException, UnauthorizedException, APIException

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login", auto_error=False)


def get_current_user_from_token(
    request: Request,
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
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
    if not user.is_active:
        raise ForbiddenException("Your account has been deactivated by society administration.")
    if not user.is_household_enabled:
        raise ForbiddenException("Your household access has been suspended by your Primary Resident Lead.")

    # Strict Community Suspension Lockdown Guard
    if user.society_id and user.role != "owner":
        from src.societies.models import Society

        soc = db.query(Society).filter(Society.id == user.society_id).first()
        if soc and soc.status in ["suspended", "inactive"]:
            path = request.url.path if request else ""
            allowed_prefixes = [
                "/api/v1/users/me",
                "/api/v1/users/me/leave-society",
                f"/api/v1/societies/{user.society_id}",
            ]
            is_allowed = any(
                path.rstrip("/") == p.rstrip("/")
                or path.startswith(f"/api/v1/societies/{user.society_id}")
                or path == "/api/v1/users/me/leave-society"
                for p in allowed_prefixes
            )
            if not is_allowed:
                reason_text = soc.suspension_reason or "Under administrative investigation by platform authorities."
                raise APIException(
                    status_code=403,
                    detail=f"Community network '{soc.name}' is currently suspended by platform authorities. Reason: {reason_text}",
                    code="SOCIETY_SUSPENDED",
                )

    return user



def require_roles(allowed_roles: List[str]):
    def role_checker(current_user=Depends(get_current_user_from_token)):
        if "coordinator" in allowed_roles and current_user.is_coordinator:
            return current_user
        if current_user.role not in allowed_roles:
            raise ForbiddenException(
                f"Role '{current_user.role}' is not authorized to perform this action. Required: {allowed_roles}"
            )
        return current_user

    return role_checker
