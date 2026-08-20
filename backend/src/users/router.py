from typing import List, Optional
from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.orm import Session


from src.database import get_db
from src.dependencies import get_current_user_from_token, require_roles
from src.users import service as user_service
from src.users.models import User
from src.users.schemas import (
    IdProofUploadPayload,
    OnboardingSurveyPayload,
    PromoteCoordinatorPayload,
    UserResponse,
    UserUpdate,
)

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user_from_token)):
    return current_user


@router.get("/coordinators", response_model=List[UserResponse])
def get_coordinators(
    society_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token),
):
    return user_service.list_coordinators_by_society(db, society_id)


@router.post("/me/id-proof", response_model=UserResponse)
def upload_id_proof(
    payload: IdProofUploadPayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token),
):
    return user_service.upload_id_proof(db, current_user.id, payload.id_proof_url)


@router.patch("/me", response_model=UserResponse)
def update_my_profile(
    update_in: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token),
):
    return user_service.update_user_profile(db, current_user.id, update_in)


@router.post("/me/survey", response_model=UserResponse)
def update_onboarding_survey(
    payload: OnboardingSurveyPayload,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token),
):
    res = user_service.update_onboarding_survey(
        db,
        current_user.id,
        payload.interests,
        payload.offered_skills_text or "",
        payload.volunteer_interest or "",
    )
    from src.ai.service import generate_and_save_onboarding_summary
    background_tasks.add_task(generate_and_save_onboarding_summary, current_user.id)
    return res


@router.get("/me/summary", response_model=dict)
def get_my_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token),
):
    from src.users.models import UserSummary
    summary = db.query(UserSummary).filter(UserSummary.user_id == current_user.id).first()
    if summary:
        return {"summary": summary.summary_text, "generatedAt": summary.generated_at}
    return {
        "summary": f"Welcome to the community, {current_user.name}! Complete your onboarding survey to receive personalized community updates and skill recommendations.",
        "generatedAt": None
    }



@router.post("/me/leave-society", response_model=UserResponse)
def leave_society(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token),
):
    return user_service.leave_society(db, current_user.id)


@router.get("", response_model=List[UserResponse])
def list_society_users(
    society_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token),
):
    if society_id:
        return user_service.list_users_by_society(db, society_id)
    return user_service.list_all_users(db)



@router.get("/{user_id}", response_model=UserResponse)
def get_user_by_id(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token),
):
    return user_service.get_user_by_id(db, user_id)


@router.post("/{user_id}/verify-id-proof", response_model=UserResponse)
@router.post("/{user_id}/verify-id", response_model=UserResponse)
def verify_id_proof(
    user_id: str,
    verified: bool = True,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["owner", "admin", "coordinator"])),
):
    target_user = user_service.get_user_by_id(db, user_id)
    if current_user.role != "owner" and target_user.society_id != current_user.society_id:
        raise ForbiddenException("Cannot verify residents belonging to another society.")
    if current_user.role == "coordinator" and not current_user.can_manage_onboarding:
        raise ForbiddenException("You do not have permission to manage resident onboarding or verifications.")
    return user_service.verify_user_id_proof(db, user_id, verified)



@router.post("/{user_id}/promote", response_model=UserResponse)
def promote_user(
    user_id: str,
    payload: Optional[PromoteCoordinatorPayload] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["owner", "admin"])),
):
    can_onboarding = payload.can_manage_onboarding if payload else True
    can_deactivate = payload.can_deactivate_residents if payload else False
    return user_service.promote_user_to_coordinator(
        db, user_id, can_manage_onboarding=can_onboarding, can_deactivate_residents=can_deactivate
    )


@router.patch("/{user_id}/coordinator-permissions", response_model=UserResponse)
def update_coordinator_permissions(
    user_id: str,
    payload: PromoteCoordinatorPayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["owner", "admin"])),
):
    return user_service.promote_user_to_coordinator(
        db, user_id, can_manage_onboarding=payload.can_manage_onboarding, can_deactivate_residents=payload.can_deactivate_residents
    )


@router.post("/{user_id}/demote", response_model=UserResponse)
def demote_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["owner", "admin"])),
):
    return user_service.demote_coordinator(db, user_id)


@router.post("/{user_id}/disable-household-access", response_model=UserResponse)
def disable_household_access(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["owner", "admin", "coordinator", "resident"])),
):
    return user_service.disable_household_access(db, user_id, current_user)


@router.post("/{user_id}/enable-household-access", response_model=UserResponse)
def enable_household_access(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["owner", "admin", "coordinator", "resident"])),
):
    return user_service.enable_household_access(db, user_id, current_user)


@router.post("/{user_id}/deactivate", response_model=UserResponse)
def deactivate_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["owner", "admin", "coordinator"])),
):
    return user_service.deactivate_user(db, user_id, current_user)


@router.post("/{user_id}/reactivate", response_model=UserResponse)
def reactivate_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["owner", "admin", "coordinator"])),
):
    return user_service.reactivate_user(db, user_id, current_user)
