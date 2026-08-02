from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from src.database import get_db
from src.dependencies import get_current_user_from_token, require_roles
from src.marketplace import service as mp_service
from src.marketplace.schemas import (
    ResourceCreate,
    ResourceResponse,
    SkillCreate,
    SkillResponse,
)
from src.users.models import User

router = APIRouter(prefix="/marketplace", tags=["Marketplace"])


# Skills
@router.get("/skills", response_model=List[SkillResponse])
def list_skills(
    society_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token),
):
    return mp_service.list_approved_skills(db, society_id)


@router.get("/skills/pending", response_model=List[SkillResponse])
def list_pending_skills(
    society_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["owner", "admin", "coordinator"])),
):
    return mp_service.list_pending_skills(db, society_id)


@router.post("/skills", response_model=SkillResponse, status_code=status.HTTP_201_CREATED)
def create_skill(
    skill_in: SkillCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token),
):
    return mp_service.create_skill(db, current_user, skill_in)


@router.post("/skills/{skill_id}/approve", response_model=SkillResponse)
def approve_skill(
    skill_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["owner", "admin", "coordinator"])),
):
    return mp_service.approve_skill(db, current_user, skill_id)


@router.post("/skills/{skill_id}/reject", response_model=SkillResponse)
def reject_skill(
    skill_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["owner", "admin", "coordinator"])),
):
    return mp_service.reject_skill(db, current_user, skill_id)


@router.post("/skills/{skill_id}/book", response_model=SkillResponse)
def book_skill(
    skill_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token),
):
    return mp_service.book_skill(db, current_user, skill_id)


# Resources
@router.get("/resources", response_model=List[ResourceResponse])
def list_resources(
    society_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token),
):
    return mp_service.list_approved_resources(db, society_id)


@router.get("/resources/pending", response_model=List[ResourceResponse])
def list_pending_resources(
    society_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["owner", "admin", "coordinator"])),
):
    return mp_service.list_pending_resources(db, society_id)


@router.post("/resources", response_model=ResourceResponse, status_code=status.HTTP_201_CREATED)
def create_resource(
    res_in: ResourceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token),
):
    return mp_service.create_resource(db, current_user, res_in)


@router.post("/resources/{resource_id}/approve", response_model=ResourceResponse)
def approve_resource(
    resource_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["owner", "admin", "coordinator"])),
):
    return mp_service.approve_resource(db, current_user, resource_id)


@router.post("/resources/{resource_id}/reject", response_model=ResourceResponse)
def reject_resource(
    resource_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["owner", "admin", "coordinator"])),
):
    return mp_service.reject_resource(db, current_user, resource_id)


@router.post("/resources/{resource_id}/book", response_model=ResourceResponse)
def book_resource(
    resource_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token),
):
    return mp_service.book_resource(db, current_user, resource_id)


@router.patch("/resources/{resource_id}/availability", response_model=ResourceResponse)
def toggle_resource_availability(
    resource_id: str,
    available: bool,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token),
):
    return mp_service.toggle_resource_availability(db, current_user, resource_id, available)
