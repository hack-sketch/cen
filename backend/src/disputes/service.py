from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import or_

from src.disputes.models import Dispute
from src.disputes.schemas import DisputeCreate, DisputeNotePayload, DisputeStatusPayload
from src.exceptions import APIException, ForbiddenException, NotFoundException
from src.users.models import User


def file_dispute(db: Session, user: User, disp_in: DisputeCreate) -> Dispute:
    if not user.society_id:
        raise APIException(status_code=400, detail="User must belong to a society to file a dispute.", code="NO_SOCIETY")

    # Check if user is either buyer or seller
    if user.id != disp_in.buyer_id and user.id != disp_in.owner_id and user.role not in ["admin", "coordinator", "owner"]:
        raise ForbiddenException("You can only file a dispute for a transaction you were involved in.")

    # Check existing dispute for this booking
    existing = db.query(Dispute).filter(Dispute.booking_id == disp_in.booking_id).first()
    if existing:
        return existing

    disp = Dispute(
        booking_id=disp_in.booking_id,
        item_title=disp_in.item_title.strip(),
        item_type=disp_in.item_type,
        buyer_id=disp_in.buyer_id,
        buyer_name=disp_in.buyer_name,
        owner_id=disp_in.owner_id,
        owner_name=disp_in.owner_name,
        filed_by_user_id=user.id,
        filed_by_user_name=user.name,
        reason=disp_in.reason.strip(),
        status="open",
        society_id=user.society_id,
    )
    db.add(disp)
    db.commit()
    db.refresh(disp)
    return disp


def list_disputes(db: Session, user: User, society_id: str) -> List[Dispute]:
    if user.role in ["owner", "admin", "coordinator"]:
        return db.query(Dispute).filter(Dispute.society_id == society_id).all()
    
    return db.query(Dispute).filter(
        Dispute.society_id == society_id,
        or_(Dispute.buyer_id == user.id, Dispute.owner_id == user.id)
    ).all()


def update_dispute_note(db: Session, user: User, dispute_id: str, payload: DisputeNotePayload) -> Dispute:
    disp = db.query(Dispute).filter(Dispute.id == dispute_id).first()
    if not disp:
        raise NotFoundException(f"Dispute '{dispute_id}' not found")

    # Determine role in dispute
    note_text = payload.note.strip()
    if user.role in ["owner", "admin", "coordinator"]:
        disp.coordinator_note = note_text
    elif user.id == disp.buyer_id:
        disp.buyer_note = note_text
    elif user.id == disp.owner_id:
        disp.owner_note = note_text
    else:
        raise ForbiddenException("You are not a participant in this dispute.")

    db.commit()
    db.refresh(disp)
    return disp


def update_dispute_status(db: Session, user: User, dispute_id: str, payload: DisputeStatusPayload) -> Dispute:
    if user.role not in ["owner", "admin", "coordinator"]:
        raise ForbiddenException("Only coordinators can update dispute status.")

    disp = db.query(Dispute).filter(Dispute.id == dispute_id).first()
    if not disp:
        raise NotFoundException(f"Dispute '{dispute_id}' not found")

    disp.status = payload.status
    if payload.resolution_notes:
        disp.resolution_notes = payload.resolution_notes.strip()

    db.commit()
    db.refresh(disp)
    return disp


def delete_dispute(db: Session, user: User, dispute_id: str) -> bool:
    disp = db.query(Dispute).filter(Dispute.id == dispute_id).first()
    if not disp:
        raise NotFoundException(f"Dispute '{dispute_id}' not found")

    if user.id != disp.buyer_id and user.id != disp.owner_id and user.role not in ["owner", "admin", "coordinator"]:
        raise ForbiddenException("Only dispute participants or coordinators can remove this dispute.")

    db.delete(disp)
    db.commit()
    return True
