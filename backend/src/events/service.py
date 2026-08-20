from typing import List, Optional
from sqlalchemy.orm import Session

from src.events.models import EventItem, VolunteerRequest
from src.events.schemas import EventCreate, EventUpdate
from src.exceptions import APIException, ForbiddenException, NotFoundException
from src.societies import service as soc_service
from src.users.models import User


def get_event_by_id(db: Session, event_id: str) -> EventItem:
    event = db.query(EventItem).filter(EventItem.id == event_id).first()
    if not event:
        raise NotFoundException(f"Event with ID '{event_id}' not found")
    return event


def update_event(db: Session, current_user: User, event_id: str, event_update: EventUpdate) -> EventItem:
    event = get_event_by_id(db, event_id)
    if current_user.role != "owner" and event.society_id != current_user.society_id:
        raise ForbiddenException("Cannot modify an event belonging to another society.")

    if event_update.title is not None:
        event.title = event_update.title.strip()
    if event_update.description is not None:
        event.description = event_update.description.strip()
    if event_update.date is not None:
        event.date = event_update.date
    if event_update.start_time is not None:
        event.start_time = event_update.start_time
    if event_update.end_time is not None:
        event.end_time = event_update.end_time
    if event_update.volunteers_needed is not None:
        event.volunteers_needed = event_update.volunteers_needed
    if event_update.status is not None:
        event.status = event_update.status
    if event_update.color is not None:
        event.color = event_update.color
    if event_update.text_color is not None:
        event.text_color = event_update.text_color

    db.commit()
    db.refresh(event)
    return event


def complete_event(db: Session, current_user: User, event_id: str) -> EventItem:
    event = get_event_by_id(db, event_id)
    if current_user.role != "owner" and event.society_id != current_user.society_id:
        raise ForbiddenException("Cannot complete an event belonging to another society.")
    event.status = "completed"
    db.commit()
    db.refresh(event)
    return event


def delete_event(db: Session, current_user: User, event_id: str) -> bool:
    event = get_event_by_id(db, event_id)
    if current_user.role != "owner" and event.society_id != current_user.society_id:
        raise ForbiddenException("Cannot delete an event belonging to another society.")
    
    # Delete associated volunteer requests
    db.query(VolunteerRequest).filter(VolunteerRequest.event_id == event_id).delete()
    db.delete(event)
    db.commit()
    return True



def list_events(db: Session, society_id: str) -> List[EventItem]:
    return db.query(EventItem).filter(EventItem.society_id == society_id).all()


def create_event(db: Session, coordinator: User, event_in: EventCreate) -> EventItem:
    if not coordinator.society_id:
        raise APIException(status_code=400, detail="Coordinator is not assigned to any society.", code="NO_SOCIETY")

    soc = soc_service.get_society_by_id(db, coordinator.society_id)
    if not soc_service.is_society_operational(soc, db):
        raise ForbiddenException("Society is not operational until at least 2 coordinators are registered.")

    start_time = event_in.start_time or (f"{event_in.date}T09:00:00Z" if event_in.date else None)
    end_time = event_in.end_time or (f"{event_in.date}T17:00:00Z" if event_in.date else None)
    event_date = event_in.date or (event_in.start_time[:10] if event_in.start_time else "")

    event = EventItem(
        title=event_in.title.strip(),
        description=event_in.description.strip(),
        date=event_date,
        start_time=start_time,
        end_time=end_time,
        created_by_coordinator_id=coordinator.id,
        volunteers_needed=event_in.volunteers_needed,
        volunteers="",
        status="upcoming",
        society_id=coordinator.society_id,
        color=event_in.color or "#dce8fb",
        text_color=event_in.text_color or "#1e3a6e",
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event



def list_volunteer_requests_for_event(db: Session, event_id: str) -> List[VolunteerRequest]:
    return db.query(VolunteerRequest).filter(VolunteerRequest.event_id == event_id).all()


def list_volunteer_requests_for_society(db: Session, society_id: str) -> List[VolunteerRequest]:
    events = db.query(EventItem).filter(EventItem.society_id == society_id).all()
    event_ids = [e.id for e in events]
    if not event_ids:
        return []
    return db.query(VolunteerRequest).filter(VolunteerRequest.event_id.in_(event_ids)).all()


def request_to_volunteer(db: Session, resident: User, event_id: str) -> VolunteerRequest:
    event = db.query(EventItem).filter(EventItem.id == event_id).first()
    if not event:
        raise NotFoundException(f"Event with ID '{event_id}' not found")

    existing = (
        db.query(VolunteerRequest)
        .filter(VolunteerRequest.event_id == event_id, VolunteerRequest.resident_id == resident.id)
        .first()
    )
    if existing:
        if existing.status in ["left", "rejected"]:
            existing.type = "self-requested"
            existing.status = "pending"
            existing.leave_reason = None
            existing.rejection_reason = None
            db.commit()
            db.refresh(existing)
        return existing

    vr = VolunteerRequest(
        event_id=event.id,
        event_title=event.title,
        resident_id=resident.id,
        resident_name=resident.name,
        type="self-requested",
        status="pending",
    )
    db.add(vr)
    db.commit()
    db.refresh(vr)
    return vr


def invite_volunteer(
    db: Session, coordinator: User, event_id: str, resident_id: str
) -> VolunteerRequest:
    event = db.query(EventItem).filter(EventItem.id == event_id).first()
    if not event:
        raise NotFoundException(f"Event with ID '{event_id}' not found")

    resident = db.query(User).filter(User.id == resident_id).first()
    if not resident:
        raise NotFoundException(f"Resident user with ID '{resident_id}' not found")

    existing = (
        db.query(VolunteerRequest)
        .filter(VolunteerRequest.event_id == event_id, VolunteerRequest.resident_id == resident_id)
        .first()
    )
    if existing:
        existing.type = "coordinator-invited"
        existing.status = "pending"
        existing.leave_reason = None
        existing.rejection_reason = None
        db.commit()
        db.refresh(existing)
        return existing

    vr = VolunteerRequest(
        event_id=event.id,
        event_title=event.title,
        resident_id=resident.id,
        resident_name=resident.name,
        type="coordinator-invited",
        status="pending",
    )
    db.add(vr)
    db.commit()
    db.refresh(vr)
    return vr


def approve_volunteer_request(db: Session, current_user: User, request_id: str) -> VolunteerRequest:
    vr = db.query(VolunteerRequest).filter(VolunteerRequest.id == request_id).first()
    if not vr:
        raise NotFoundException(f"Volunteer request with ID '{request_id}' not found")

    if current_user.role not in ["owner", "admin", "coordinator"] and vr.resident_id != current_user.id:
        raise ForbiddenException("You can only accept volunteer invitations addressed to you.")

    vr.status = "approved"

    # Append to event volunteers list
    event = db.query(EventItem).filter(EventItem.id == vr.event_id).first()
    if event:
        current_list = [u.strip() for u in event.volunteers.split(",") if u.strip()] if event.volunteers else []
        if vr.resident_id not in current_list:
            current_list.append(vr.resident_id)
            event.volunteers = ",".join(current_list)

    db.commit()
    db.refresh(vr)
    return vr


def reject_volunteer_request(
    db: Session, current_user: User, request_id: str, rejection_reason: Optional[str] = None
) -> VolunteerRequest:
    vr = db.query(VolunteerRequest).filter(VolunteerRequest.id == request_id).first()
    if not vr:
        raise NotFoundException(f"Volunteer request with ID '{request_id}' not found")

    if current_user.role not in ["owner", "admin", "coordinator"] and vr.resident_id != current_user.id:
        raise ForbiddenException("You can only decline volunteer invitations addressed to you.")

    vr.status = "rejected"
    if rejection_reason:
        vr.rejection_reason = rejection_reason.strip()
    db.commit()
    db.refresh(vr)
    return vr



def cancel_volunteer_invite(db: Session, coordinator: User, request_id: str) -> VolunteerRequest:
    vr = db.query(VolunteerRequest).filter(VolunteerRequest.id == request_id).first()
    if not vr:
        raise NotFoundException(f"Volunteer request with ID '{request_id}' not found")

    db.delete(vr)
    db.commit()
    return vr


def withdraw_volunteer(
    db: Session, resident: User, request_id: str, leave_reason: str = None
) -> VolunteerRequest:
    vr = db.query(VolunteerRequest).filter(VolunteerRequest.id == request_id).first()
    if not vr:
        raise NotFoundException(f"Volunteer request with ID '{request_id}' not found")

    vr.status = "left"
    if leave_reason:
        vr.leave_reason = leave_reason.strip()

    event = db.query(EventItem).filter(EventItem.id == vr.event_id).first()
    if event and event.volunteers:
        current_list = [u.strip() for u in event.volunteers.split(",") if u.strip()]
        if vr.resident_id in current_list:
            current_list.remove(vr.resident_id)
            event.volunteers = ",".join(current_list)
        elif resident.id in current_list:
            current_list.remove(resident.id)
            event.volunteers = ",".join(current_list)

    db.commit()
    db.refresh(vr)
    return vr


def leave_event(
    db: Session, resident: User, event_id: str, leave_reason: str = None
) -> EventItem:
    event = db.query(EventItem).filter(EventItem.id == event_id).first()
    if not event:
        raise NotFoundException(f"Event with ID '{event_id}' not found")

    if event.volunteers:
        current_list = [u.strip() for u in event.volunteers.split(",") if u.strip()]
        if resident.id in current_list:
            current_list.remove(resident.id)
            event.volunteers = ",".join(current_list)

    vr = (
        db.query(VolunteerRequest)
        .filter(VolunteerRequest.event_id == event_id, VolunteerRequest.resident_id == resident.id)
        .first()
    )
    if vr:
        vr.status = "left"
        if leave_reason:
            vr.leave_reason = leave_reason.strip()
    else:
        vr = VolunteerRequest(
            event_id=event.id,
            event_title=event.title,
            resident_id=resident.id,
            resident_name=resident.name,
            type="self-requested",
            status="left",
            leave_reason=leave_reason.strip() if leave_reason else None,
        )
        db.add(vr)

    db.commit()
    db.refresh(event)
    return event
