from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from src.database import get_db
from src.dependencies import get_current_user_from_token, require_roles
from src.disputes import service as dispute_service
from src.disputes.schemas import DisputeCreate, DisputeNotePayload, DisputeResponse, DisputeStatusPayload
from src.users.models import User

router = APIRouter(prefix="/disputes", tags=["Disputes"])


@router.get("", response_model=List[DisputeResponse])
def list_disputes(
    society_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token),
):
    return dispute_service.list_disputes(db, current_user, society_id)


@router.post("", response_model=DisputeResponse, status_code=status.HTTP_201_CREATED)
def file_dispute(
    disp_in: DisputeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token),
):
    return dispute_service.file_dispute(db, current_user, disp_in)


@router.put("/{dispute_id}/note", response_model=DisputeResponse)
@router.post("/{dispute_id}/note", response_model=DisputeResponse)
def update_dispute_note(
    dispute_id: str,
    payload: DisputeNotePayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token),
):
    return dispute_service.update_dispute_note(db, current_user, dispute_id, payload)



@router.put("/{dispute_id}/status", response_model=DisputeResponse)
def update_dispute_status(
    dispute_id: str,
    payload: DisputeStatusPayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["owner", "admin", "coordinator"])),
):
    return dispute_service.update_dispute_status(db, current_user, dispute_id, payload)


@router.delete("/{dispute_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_dispute(
    dispute_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token),
):
    dispute_service.delete_dispute(db, current_user, dispute_id)
