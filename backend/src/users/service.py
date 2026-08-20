from typing import List, Optional
from sqlalchemy.orm import Session
from src.exceptions import APIException, ForbiddenException, NotFoundException
from src.societies.models import Household
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


def promote_user_to_coordinator(
    db: Session,
    user_id: str,
    can_manage_onboarding: bool = True,
    can_deactivate_residents: bool = False,
) -> User:
    try:
        user = get_user_by_id(db, user_id)
        user.is_coordinator = True
        if user.role == "resident":
            user.role = "coordinator"
        user.can_manage_onboarding = can_manage_onboarding
        user.can_deactivate_residents = can_deactivate_residents
        db.commit()
        db.refresh(user)
        return user
    except Exception as e:
        db.rollback()
        raise e


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
    try:
        user = get_user_by_id(db, user_id)
        user.is_coordinator = False
        user.role = "resident"
        user.can_manage_onboarding = True
        user.can_deactivate_residents = False
        db.commit()
        db.refresh(user)
        return user
    except Exception as e:
        db.rollback()
        raise e


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


def list_all_users(db: Session) -> List[User]:
    return db.query(User).order_by(User.joined_date.desc()).all()



def upload_id_proof(db: Session, user_id: str, id_proof_url: str) -> User:
    if id_proof_url and len(id_proof_url) > 1_500_000:
        raise BadRequestException("ID proof document size must be less than 1 MB.")
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
    else:
        user.id_proof_uploaded = False
    db.commit()
    db.refresh(user)
    return user



def leave_society(db: Session, user_id: str) -> User:
    try:
        user = get_user_by_id(db, user_id)
        if not user.society_id:
            raise APIException(
                status_code=400,
                detail="User is not currently attached to any society.",
                code="NOT_IN_SOCIETY",
            )

        from src.societies.models import Household, Society, JoinRequest

        # 1. Unclaim and free occupied slots in user's household
        if user.household_id:
            hh = db.query(Household).filter(Household.id == user.household_id).first()
            if hh:
                hh.occupants_count = max(0, (hh.occupants_count or 1) - 1)
                if hh.claimed_by_user_id == user.id:
                    hh.claimed = False
                    hh.claimed_by_user_id = None

        # Also check all households where claimed_by_user_id == user.id
        claimed_hhs = db.query(Household).filter(Household.claimed_by_user_id == user.id).all()
        for ch in claimed_hhs:
            ch.claimed = False
            ch.claimed_by_user_id = None
            ch.occupants_count = max(0, (ch.occupants_count or 1) - 1)

        # 2. Update society coordinator count if user was a coordinator
        if user.society_id and user.is_coordinator:
            soc = db.query(Society).filter(Society.id == user.society_id).first()
            if soc:
                soc.coordinator_count = max(0, (soc.coordinator_count or 1) - 1)

        # 3. Clean up any active join requests for this user
        db.query(JoinRequest).filter(JoinRequest.user_id == user.id).delete()

        # 4. Nullify user bindings and reset role/privileges cleanly
        user.society_id = None
        user.household_id = None
        user.is_coordinator = False
        user.is_primary_resident = False
        user.can_manage_onboarding = True
        user.can_deactivate_residents = False
        user.id_proof_uploaded = False
        user.id_proof_verified = False
        user.id_proof_url = None
        if user.role in ["coordinator", "admin"]:
            user.role = "resident"

        db.commit()
        db.refresh(user)
        return user
    except Exception as e:
        db.rollback()
        raise e



def disable_household_access(db: Session, target_user_id: str, acting_user: User) -> User:
    try:
        target = get_user_by_id(db, target_user_id)
        if target.id == acting_user.id:
            raise ForbiddenException("You cannot disable your own household access.")
        
        # Enforce Primary Resident or Admin permission
        is_admin_or_owner = acting_user.role in ["owner", "admin"]
        is_household_primary = acting_user.is_primary_resident and target.household_id == acting_user.household_id

        if not (is_admin_or_owner or is_household_primary):
            raise ForbiddenException("Only the Primary Resident Lead of this household can manage secondary member access.")

        if target.is_primary_resident:
            raise ForbiddenException("Primary Resident Lead access cannot be disabled.")

        target.is_household_enabled = False
        db.commit()
        db.refresh(target)
        return target
    except Exception as e:
        db.rollback()
        raise e


def enable_household_access(db: Session, target_user_id: str, acting_user: User) -> User:
    try:
        target = get_user_by_id(db, target_user_id)
        is_admin_or_owner = acting_user.role in ["owner", "admin"]
        is_household_primary = acting_user.is_primary_resident and target.household_id == acting_user.household_id

        if not (is_admin_or_owner or is_household_primary):
            raise ForbiddenException("Only the Primary Resident Lead of this household can manage secondary member access.")

        target.is_household_enabled = True
        db.commit()
        db.refresh(target)
        return target
    except Exception as e:
        db.rollback()
        raise e


def deactivate_user(db: Session, target_user_id: str, acting_user: User) -> User:
    try:
        target = get_user_by_id(db, target_user_id)
        if target.id == acting_user.id:
            raise ForbiddenException("Self-deactivation is prohibited.")
        if target.role in ["owner", "admin"] and acting_user.role != "owner":
            raise ForbiddenException("Administrative accounts cannot be deactivated by non-owner roles.")
        
        if acting_user.role == "coordinator":
            if not acting_user.can_deactivate_residents:
                raise ForbiddenException("Coordinator does not have authorization to deactivate residents.")
            if target.is_coordinator or target.role != "resident":
                raise ForbiddenException("Coordinators can only deactivate regular resident accounts.")

        if acting_user.role not in ["owner", "admin", "coordinator"]:
            raise ForbiddenException("System deactivation is reserved for society administration.")

        target.is_active = False
        db.commit()
        db.refresh(target)
        return target
    except Exception as e:
        db.rollback()
        raise e


def reactivate_user(db: Session, target_user_id: str, acting_user: User) -> User:
    try:
        target = get_user_by_id(db, target_user_id)
        if acting_user.role == "coordinator" and not acting_user.can_deactivate_residents:
            raise ForbiddenException("Coordinator does not have authorization to reactivate residents.")

        if acting_user.role not in ["owner", "admin", "coordinator"]:
            raise ForbiddenException("System reactivation is reserved for society administration.")

        target.is_active = True
        db.commit()
        db.refresh(target)
        return target
    except Exception as e:
        db.rollback()
        raise e
