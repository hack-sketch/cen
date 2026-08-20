from typing import List
from sqlalchemy.orm import Session

from src.complaints.models import Complaint
from src.complaints.schemas import ComplaintCreate, ComplaintResolvePayload
from src.exceptions import APIException, ForbiddenException, NotFoundException
from src.users.models import User


def file_complaint(db: Session, resident: User, comp_in: ComplaintCreate) -> Complaint:
    if not resident.society_id:
        raise APIException(status_code=400, detail="User must belong to a society to file a complaint.", code="NO_SOCIETY")

    # Force is_private = True if targeting a coordinator
    is_priv = comp_in.is_private or bool(comp_in.target_coordinator_id)
    is_anon = comp_in.is_anonymous or comp_in.filed_by_name == "Anonymous"
    filed_name = "Anonymous" if is_anon else (comp_in.filed_by_name or resident.name)

    comp = Complaint(
        title=comp_in.title.strip(),
        description=comp_in.description.strip(),
        category=comp_in.category,
        filed_by_user_id=resident.id,
        filed_by_user_name=filed_name,
        target_coordinator_id=comp_in.target_coordinator_id,
        is_private=is_priv,
        is_anonymous=is_anon,
        status="open",
        society_id=resident.society_id,
    )
    db.add(comp)
    db.commit()
    db.refresh(comp)
    return comp


def list_complaints(db: Session, user: User, society_id: str) -> List[Complaint]:
    all_complaints = (
        db.query(Complaint)
        .filter(Complaint.society_id == society_id)
        .order_by(Complaint.id.desc())
        .all()
    )

    filtered: List[Complaint] = []
    for c in all_complaints:
        # Filer resident can always see their own complaint
        if c.filed_by_user_id == user.id:
            filtered.append(c)
            continue

        if c.is_private:
            # Private complaint against a coordinator is visible to Society Admin ONLY
            if user.role == "admin" and user.society_id == society_id:
                filtered.append(c)
        else:
            # Public complaints are visible to all members belonging to the society
            if user.society_id == society_id:
                filtered.append(c)

    return filtered


def delete_complaint(db: Session, user: User, complaint_id: str) -> None:
    comp = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not comp:
        raise NotFoundException(f"Complaint with ID '{complaint_id}' not found")

    # Guard: Filer or Society Admin/Coordinator can delete
    if comp.filed_by_user_id != user.id and user.role not in ["admin", "coordinator", "owner"]:
        raise ForbiddenException("You can only delete your own complaints.")

    db.delete(comp)
    db.commit()


def resolve_complaint(
    db: Session, resolver: User, complaint_id: str, resolve_in: ComplaintResolvePayload
) -> Complaint:
    comp = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not comp:
        raise NotFoundException(f"Complaint with ID '{complaint_id}' not found")

    # Authorization guard: Private complaints can only be resolved by Society Admin
    if comp.is_private and resolver.role != "admin":
        raise ForbiddenException("Only the Society Admin can view and resolve private complaints against coordinators.")

    if resolve_in.status:
        comp.status = resolve_in.status
    else:
        comp.status = "resolved"

    notes = resolve_in.resolution_notes or resolve_in.notes
    if notes:
        comp.resolution_notes = notes.strip()

    db.commit()
    db.refresh(comp)
    return comp


def list_private_against_coordinators(db: Session, user: User, society_id: str) -> List[Complaint]:
    if user.role != "admin" or user.society_id != society_id:
        raise ForbiddenException("Only the Society Admin can view private complaints against coordinators.")
    return (
        db.query(Complaint)
        .filter(
            Complaint.society_id == society_id,
            Complaint.is_private == True,
            Complaint.target_coordinator_id.isnot(None),
        )
        .all()
    )
