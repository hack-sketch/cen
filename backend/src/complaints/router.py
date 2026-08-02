from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from src.complaints import service as comp_service
from src.complaints.schemas import ComplaintCreate, ComplaintResolvePayload, ComplaintResponse
from src.database import get_db
from src.dependencies import get_current_user_from_token, require_roles
from src.users.models import User

router = APIRouter(prefix="/complaints", tags=["Complaints & Governance"])


@router.get("", response_model=List[ComplaintResponse])
def list_complaints(
    society_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token),
):
    return comp_service.list_complaints(db, current_user, society_id)


@router.post("", response_model=ComplaintResponse, status_code=status.HTTP_201_CREATED)
def file_complaint(
    comp_in: ComplaintCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token),
):
    return comp_service.file_complaint(db, current_user, comp_in)


@router.post("/{complaint_id}/resolve", response_model=ComplaintResponse)
def resolve_complaint(
    complaint_id: str,
    resolve_in: ComplaintResolvePayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["owner", "admin", "coordinator"])),
):
    return comp_service.resolve_complaint(db, current_user, complaint_id, resolve_in)
