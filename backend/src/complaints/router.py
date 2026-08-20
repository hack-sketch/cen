from typing import List, Optional
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


@router.get("/private-coordinators", response_model=List[ComplaintResponse])
def list_private_against_coordinators(
    society_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["admin"])),
):
    return comp_service.list_private_against_coordinators(db, current_user, society_id)


@router.post("", response_model=ComplaintResponse, status_code=status.HTTP_201_CREATED)
def file_complaint(
    comp_in: ComplaintCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token),
):
    return comp_service.file_complaint(db, current_user, comp_in)


@router.post("/{complaint_id}/resolve", response_model=ComplaintResponse)
@router.put("/{complaint_id}/status", response_model=ComplaintResponse)
@router.post("/{complaint_id}/action", response_model=ComplaintResponse)
def resolve_complaint(
    complaint_id: str,
    new_status: Optional[str] = None,
    resolve_in: Optional[ComplaintResolvePayload] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["owner", "admin", "coordinator"])),
):
    st = new_status or (resolve_in.status if resolve_in else "resolved")
    st_clean = "under_review" if st in ["in-review", "under_review"] else st
    notes = resolve_in.resolution_notes or resolve_in.notes if resolve_in else None
    payload = ComplaintResolvePayload(status=st_clean, resolution_notes=notes)
    return comp_service.resolve_complaint(db, current_user, complaint_id, payload)


@router.delete("/{complaint_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_complaint(
    complaint_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token),
):
    comp_service.delete_complaint(db, current_user, complaint_id)
    return None
