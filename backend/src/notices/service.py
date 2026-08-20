from typing import List
from sqlalchemy.orm import Session
from datetime import datetime

from src.notices.models import Notice
from src.notices.schemas import NoticeCreate
from src.users.models import User
from src.exceptions import APIException, ForbiddenException, NotFoundException


def list_society_notices(db: Session, society_id: str) -> List[Notice]:
    return (
        db.query(Notice)
        .filter(Notice.society_id == society_id)
        .order_by(Notice.date.desc(), Notice.id.desc())
        .all()
    )


def create_notice(db: Session, user: User, payload: NoticeCreate) -> Notice:
    is_coord_or_admin = user.role in ["owner", "admin"] or user.is_coordinator
    if not is_coord_or_admin:
        if has_posted_today(db, user.id):
            raise APIException(
                status_code=400,
                detail="You have already broadcasted a notice today. Roster constraints allow one resident post per 24-hour cycle.",
                code="DAILY_LIMIT_EXCEEDED",
            )

    n = Notice(
        society_id=payload.society_id,
        posted_by_id=user.id,
        posted_by_name=user.name,
        title=payload.title,
        content=payload.content,
        category=payload.category,
    )
    db.add(n)
    db.commit()
    db.refresh(n)
    return n


def delete_notice(db: Session, notice_id: str, current_user: User) -> bool:
    n = db.query(Notice).filter(Notice.id == notice_id).first()
    if not n:
        raise NotFoundException(f"Notice with ID '{notice_id}' not found")

    is_coord_or_admin = current_user.role in ["owner", "admin"] or current_user.is_coordinator
    if not is_coord_or_admin and n.posted_by_id != current_user.id:
        raise ForbiddenException("You can only delete your own notices or require coordinator permissions.")

    db.delete(n)
    db.commit()
    return True


def has_posted_today(db: Session, user_id: str) -> bool:
    today_str = datetime.utcnow().strftime("%Y-%m-%d")
    n = db.query(Notice).filter(Notice.posted_by_id == user_id, Notice.date == today_str).first()
    return n is not None
