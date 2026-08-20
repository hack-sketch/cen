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

    # Resolve real buyer/owner IDs if placeholders were passed
    buyer_id = disp_in.buyer_id
    owner_id = disp_in.owner_id

    if buyer_id in ["u-counterparty", "counterparty"] and disp_in.buyer_name:
        matched_buyer = db.query(User).filter(User.society_id == user.society_id, User.name == disp_in.buyer_name).first()
        if matched_buyer:
            buyer_id = matched_buyer.id

    if owner_id in ["u-counterparty", "counterparty"] and disp_in.owner_name:
        matched_owner = db.query(User).filter(User.society_id == user.society_id, User.name == disp_in.owner_name).first()
        if matched_owner:
            owner_id = matched_owner.id

    # Check if user is either buyer or seller
    if user.id != buyer_id and user.id != owner_id and user.role not in ["admin", "coordinator", "owner"] and not user.is_coordinator:
        raise ForbiddenException("You can only file a dispute for a transaction you were involved in.")

    # Check existing dispute for this booking
    existing = db.query(Dispute).filter(Dispute.booking_id == disp_in.booking_id).first()
    if existing:
        return existing

    disp = Dispute(
        booking_id=disp_in.booking_id,
        item_title=disp_in.item_title.strip(),
        item_type=disp_in.item_type,
        buyer_id=buyer_id,
        buyer_name=disp_in.buyer_name,
        owner_id=owner_id,
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
    # Return society disputes so both filer, counterparty, and coordinators can interact
    return db.query(Dispute).filter(Dispute.society_id == society_id).all()


def update_dispute_note(db: Session, user: User, dispute_id: str, payload: DisputeNotePayload) -> Dispute:
    disp = db.query(Dispute).filter(Dispute.id == dispute_id).first()
    if not disp:
        raise NotFoundException(f"Dispute '{dispute_id}' not found")

    note_text = payload.note.strip()
    
    # Check by user ID
    if user.id == disp.buyer_id:
        disp.buyer_note = note_text
    elif user.id == disp.owner_id:
        disp.owner_note = note_text
    # Check by user Name
    elif user.name.lower() == disp.buyer_name.lower():
        disp.buyer_id = user.id
        disp.buyer_note = note_text
    elif user.name.lower() == disp.owner_name.lower():
        disp.owner_id = user.id
        disp.owner_note = note_text
    # If coordinator or admin or owner
    elif user.role in ["owner", "admin", "coordinator"] or user.is_coordinator:
        disp.coordinator_note = note_text
    # If placeholder counterparty was used when filed
    elif user.society_id == disp.society_id and user.id != disp.filed_by_user_id and (disp.buyer_id in ["u-counterparty", "counterparty"] or disp.owner_id in ["u-counterparty", "counterparty"]):
        if disp.filed_by_user_id == disp.buyer_id:
            disp.owner_id = user.id
            disp.owner_name = user.name
            disp.owner_note = note_text
        else:
            disp.buyer_id = user.id
            disp.buyer_name = user.name
            disp.buyer_note = note_text
    else:
        raise ForbiddenException("You are not an authorized participant or coordinator for this dispute.")

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
