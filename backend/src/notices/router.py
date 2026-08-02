from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from src.database import get_db
from src.dependencies import get_current_user_from_token, require_roles
from src.notices import service as notice_service
from src.notices.schemas import NoticeCreate, NoticeResponse
from src.users.models import User

router = APIRouter(prefix="/notices", tags=["Society Notices & Announcements"])


@router.get("", response_model=List[NoticeResponse])
def list_society_notices(
    societyId: str = Query(None),
    society_id: str = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token),
):
    target_id = societyId or society_id or current_user.society_id
    if not target_id:
        return []
    return notice_service.list_society_notices(db, target_id)


@router.post("", response_model=NoticeResponse)
def create_notice(
    payload: NoticeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["owner", "admin", "coordinator"])),
):
    return notice_service.create_notice(db, current_user, payload)


@router.delete("/{id}")
def delete_notice(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["owner", "admin", "coordinator"])),
):
    success = notice_service.delete_notice(db, id)
    return {"success": success}
