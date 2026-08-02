from typing import List, Optional
from sqlalchemy.orm import Session
from src.exceptions import NotFoundException
from src.users.models import User
from src.users.schemas import UserUpdate


def get_user_by_id(db: Session, user_id: str) -> Optional[User]:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise NotFoundException(f"User with ID '{user_id}' not found")
    return user


def list_coordinators_by_society(db: Session, society_id: str) -> List[User]:
    return (
        db.query(User)
        .filter(User.society_id == society_id, User.is_coordinator == True)
        .all()
    )


def promote_user_to_coordinator(db: Session, user_id: str) -> User:
    user = get_user_by_id(db, user_id)
    user.is_coordinator = True
    if user.role == "resident":
        user.role = "coordinator"
    db.commit()
    db.refresh(user)
    return user


def update_user_profile(db: Session, user_id: str, update_in: UserUpdate) -> User:
    user = get_user_by_id(db, user_id)
    if update_in.name is not None:
        user.name = update_in.name
    if update_in.avatar_color is not None:
        user.avatar_color = update_in.avatar_color
    if update_in.has_completed_survey is not None:
        user.has_completed_survey = update_in.has_completed_survey
    db.commit()
    db.refresh(user)
    return user


def demote_coordinator(db: Session, user_id: str) -> User:
    user = get_user_by_id(db, user_id)
    user.is_coordinator = False
    user.role = "resident"
    db.commit()
    db.refresh(user)
    return user


def update_onboarding_survey(db: Session, user_id: str, interests: List[str], offered_skills: str, volunteer_interest: str) -> User:
    user = get_user_by_id(db, user_id)
    user.interests = ",".join(interests) if interests else ""
    user.offered_skills_text = offered_skills
    user.volunteer_interest = volunteer_interest
    user.has_completed_survey = True
    db.commit()
    db.refresh(user)
    return user


def list_users_by_society(db: Session, society_id: str) -> List[User]:
    return db.query(User).filter(User.society_id == society_id).all()


def upload_id_proof(db: Session, user_id: str, id_proof_url: str) -> User:
    user = get_user_by_id(db, user_id)
    user.id_proof_url = id_proof_url
    user.id_proof_uploaded = True
    user.id_proof_verified = False
    db.commit()
    db.refresh(user)
    return user


def verify_user_id_proof(db: Session, user_id: str, verified: bool) -> User:
    user = get_user_by_id(db, user_id)
    user.id_proof_verified = verified
    if verified:
        user.id_proof_uploaded = True
    db.commit()
    db.refresh(user)
    return user
