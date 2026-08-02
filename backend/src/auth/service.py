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
    return user
