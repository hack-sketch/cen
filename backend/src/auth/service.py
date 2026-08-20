from sqlalchemy.orm import Session
from src.auth.security import get_password_hash, verify_password
from src.exceptions import APIException, UnauthorizedException
from src.users.models import User
from src.users.schemas import UserCreate, UserLogin


def create_user(db: Session, user_in: UserCreate, role: str = "resident") -> User:
    existing = db.query(User).filter(User.email == user_in.email.lower()).first()
    if existing:
        raise APIException(
            status_code=400,
            detail="A user with this email address already exists.",
            code="EMAIL_EXISTS",
        )

    db_user = User(
        name=user_in.name.strip(),
        email=user_in.email.lower().strip(),
        hashed_password=get_password_hash(user_in.password),
        role=role,
        credit_balance=0,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def authenticate_user(db: Session, login_in: UserLogin) -> User:
    user = db.query(User).filter(User.email == login_in.email.lower().strip()).first()
    if not user:
        raise UnauthorizedException("Invalid email or password")
    if not verify_password(login_in.password, user.hashed_password):
        raise UnauthorizedException("Invalid email or password")
    if not user.is_active:
        raise APIException(
            status_code=403,
            detail="Your account has been deactivated by society administration. Please contact your administrator.",
            code="ACCOUNT_DEACTIVATED",
        )
    if not user.is_household_enabled:
        raise APIException(
            status_code=403,
            detail="Your household access has been suspended by your Primary Resident Lead. Please contact your household lead.",
            code="HOUSEHOLD_ACCESS_DISABLED",
        )
    return user


def request_password_reset(db: Session, email: str) -> dict:
    clean_email = email.lower().strip()
    user = db.query(User).filter(User.email == clean_email).first()
    # Log reset trigger for security audit
    if user:
        print(f"[Auth Security Audit] Password reset triggered for user ID: {user.id}, email: {user.email}")
    else:
        print(f"[Auth Security Audit] Password reset triggered for non-existent email: {clean_email}")

    return {
        "message": "If an account exists with this email address, password reset instructions have been dispatched.",
        "email": clean_email,
        "status": "success",
    }


def reset_password(db: Session, email: str, new_password: str) -> dict:
    clean_email = email.lower().strip()
    user = db.query(User).filter(User.email == clean_email).first()
    if not user:
        raise APIException(
            status_code=404,
            detail="No registered user account found with this email address.",
            code="USER_NOT_FOUND",
        )

    user.hashed_password = get_password_hash(new_password)
    db.commit()
    db.refresh(user)

    print(f"[Auth Security Audit] Password successfully reset for user ID: {user.id}, email: {user.email}")
    return {
        "message": "Password updated successfully. You can now log in with your new password.",
        "email": clean_email,
        "status": "success",
    }


