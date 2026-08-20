from typing import List, Optional
from sqlalchemy import or_
from sqlalchemy.orm import Session

from src.exceptions import APIException, ForbiddenException, NotFoundException
from src.marketplace.models import Resource, Skill, ExchangeBooking
from src.marketplace.schemas import (
    ItemRejectPayload,
    ResourceCreate,
    ResourceUpdate,
    SkillCreate,
    SkillUpdate,
)
from src.users.models import User
from src.wallet import service as wallet_service
from src.wallet.schemas import CreditTransferRequest


def list_skills(db: Session, society_id: str, current_user: User = None) -> List[Skill]:
    if current_user:
        return (
            db.query(Skill)
            .filter(
                Skill.society_id == society_id,
                or_(Skill.status == "approved", Skill.provider_id == current_user.id),
            )
            .all()
        )
    return db.query(Skill).filter(Skill.society_id == society_id, Skill.status == "approved").all()


def list_approved_skills(db: Session, society_id: str) -> List[Skill]:
    return list_skills(db, society_id)


def list_pending_skills(db: Session, society_id: str) -> List[Skill]:
    return db.query(Skill).filter(Skill.society_id == society_id, Skill.status == "pending").all()


def create_skill(db: Session, user: User, skill_in: SkillCreate) -> Skill:
    if not user.society_id:
        raise APIException(status_code=400, detail="You must belong to a society to list a skill.", code="NO_SOCIETY")

    tags_str = ",".join(skill_in.tags) if skill_in.tags and isinstance(skill_in.tags, list) else (skill_in.tags or "")
    skill = Skill(
        title=skill_in.title.strip(),
        category=skill_in.category,
        provider_id=user.id,
        provider_name=user.name,
        credits=skill_in.credits,
        description=skill_in.description.strip(),
        status="pending",
        tags=tags_str,
        society_id=user.society_id,
    )
    db.add(skill)
    db.commit()
    db.refresh(skill)
    return skill


def approve_skill(db: Session, coordinator: User, skill_id: str) -> Skill:
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise NotFoundException(f"Skill with ID '{skill_id}' not found")

    # No-Self-Approval Guard
    if skill.provider_id == coordinator.id:
        raise ForbiddenException("Coordinators cannot approve their own skill listings. Another coordinator must review it.")

    skill.status = "approved"
    skill.rejection_reason = None
    db.commit()
    db.refresh(skill)
    return skill


def reject_skill(db: Session, coordinator: User, skill_id: str, payload: ItemRejectPayload) -> Skill:
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise NotFoundException(f"Skill with ID '{skill_id}' not found")

    if skill.provider_id == coordinator.id:
        raise ForbiddenException("Coordinators cannot reject their own skill listings. Another coordinator must review it.")

    if not payload or not payload.rejection_reason or not payload.rejection_reason.strip():
        raise APIException(status_code=400, detail="A rejection reason is required when declining a listing.", code="REJECTION_REASON_REQUIRED")

    skill.status = "rejected"
    skill.rejection_reason = payload.rejection_reason.strip()
    db.commit()
    db.refresh(skill)
    return skill


def update_skill(db: Session, user: User, skill_id: str, skill_in: SkillUpdate) -> Skill:
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise NotFoundException(f"Skill with ID '{skill_id}' not found")

    if skill.provider_id != user.id and user.role not in ["owner", "admin"]:
        raise ForbiddenException("Only the skill provider or society admin can edit this listing.")

    if skill_in.title is not None:
        skill.title = skill_in.title.strip()
    if skill_in.category is not None:
        skill.category = skill_in.category
    if skill_in.credits is not None:
        skill.credits = skill_in.credits
    if skill_in.description is not None:
        skill.description = skill_in.description.strip()
    if skill_in.tags is not None:
        tags_str = ",".join(skill_in.tags) if isinstance(skill_in.tags, list) else (skill_in.tags or "")
        skill.tags = tags_str

    # Edit-on-relist workflow: Automatically reset status back to pending and clear rejection remarks
    skill.status = "pending"
    skill.rejection_reason = None
    db.commit()
    db.refresh(skill)
    return skill



def book_skill(db: Session, borrower: User, skill_id: str) -> ExchangeBooking:
    return create_booking_request(db, borrower, "skill", skill_id)


# Resources
def list_resources(db: Session, society_id: str, current_user: User = None) -> List[Resource]:
    if current_user:
        return (
            db.query(Resource)
            .filter(
                Resource.society_id == society_id,
                or_(Resource.status == "approved", Resource.owner_id == current_user.id),
            )
            .all()
        )
    return db.query(Resource).filter(Resource.society_id == society_id, Resource.status == "approved").all()


def list_approved_resources(db: Session, society_id: str) -> List[Resource]:
    return list_resources(db, society_id)


def list_pending_resources(db: Session, society_id: str) -> List[Resource]:
    return db.query(Resource).filter(Resource.society_id == society_id, Resource.status == "pending").all()


def create_resource(db: Session, user: User, res_in: ResourceCreate) -> Resource:
    if not user.society_id:
        raise APIException(status_code=400, detail="You must belong to a society to list a resource.", code="NO_SOCIETY")

    resource = Resource(
        name=res_in.name.strip(),
        category=res_in.category,
        owner_id=user.id,
        owner_name=user.name,
        available=True,
        credits=res_in.credits,
        status="pending",
        description=res_in.description.strip(),
        society_id=user.society_id,
    )
    db.add(resource)
    db.commit()
    db.refresh(resource)
    return resource


def approve_resource(db: Session, coordinator: User, resource_id: str) -> Resource:
    res = db.query(Resource).filter(Resource.id == resource_id).first()
    if not res:
        raise NotFoundException(f"Resource with ID '{resource_id}' not found")

    if res.owner_id == coordinator.id:
        raise ForbiddenException("Coordinators cannot approve their own resource listings. Another coordinator must review it.")

    res.status = "approved"
    res.available = True
    res.rejection_reason = None
    db.commit()
    db.refresh(res)
    return res


def reject_resource(db: Session, coordinator: User, resource_id: str, payload: ItemRejectPayload) -> Resource:
    res = db.query(Resource).filter(Resource.id == resource_id).first()
    if not res:
        raise NotFoundException(f"Resource with ID '{resource_id}' not found")

    if res.owner_id == coordinator.id:
        raise ForbiddenException("Coordinators cannot reject their own resource listings. Another coordinator must review it.")

    if not payload or not payload.rejection_reason or not payload.rejection_reason.strip():
        raise APIException(status_code=400, detail="A rejection reason is required when declining a listing.", code="REJECTION_REASON_REQUIRED")

    res.status = "rejected"
    res.rejection_reason = payload.rejection_reason.strip()
    db.commit()
    db.refresh(res)
    return res


def update_resource(db: Session, user: User, resource_id: str, res_in: ResourceUpdate) -> Resource:
    res = db.query(Resource).filter(Resource.id == resource_id).first()
    if not res:
        raise NotFoundException(f"Resource with ID '{resource_id}' not found")

    if res.owner_id != user.id and user.role not in ["owner", "admin"]:
        raise ForbiddenException("Only the resource owner or society admin can edit this listing.")

    if res_in.name is not None:
        res.name = res_in.name.strip()
    if res_in.category is not None:
        res.category = res_in.category
    if res_in.credits is not None:
        res.credits = res_in.credits
    if res_in.description is not None:
        res.description = res_in.description.strip()

    # Edit-on-relist workflow: Automatically reset status back to pending and clear rejection remarks
    res.status = "pending"
    res.available = True
    res.rejection_reason = None
    db.commit()
    db.refresh(res)
    return res



def book_resource(db: Session, borrower: User, resource_id: str) -> ExchangeBooking:
    return create_booking_request(db, borrower, "resource", resource_id)


def create_booking_request(db: Session, buyer: User, item_type: str, item_id: str) -> ExchangeBooking:
    if item_type == "skill":
        item = db.query(Skill).filter(Skill.id == item_id).first()
        if not item:
            raise NotFoundException(f"Skill with ID '{item_id}' not found")
        if item.status != "approved":
            raise APIException(status_code=400, detail="Skill is not active for booking.", code="NOT_APPROVED")
        owner_id = item.provider_id
        owner_name = item.provider_name
        title = item.title
        credits = item.credits
    elif item_type == "resource":
        item = db.query(Resource).filter(Resource.id == item_id).first()
        if not item:
            raise NotFoundException(f"Resource with ID '{item_id}' not found")
        if item.status != "approved":
            raise APIException(status_code=400, detail="Resource is not active for booking.", code="NOT_APPROVED")
        if not item.available:
            raise APIException(status_code=400, detail="Resource is currently unavailable.", code="UNAVAILABLE")
        owner_id = item.owner_id
        owner_name = item.owner_name
        title = item.name
        credits = item.credits
    else:
        raise APIException(status_code=400, detail="Invalid item type.", code="INVALID_TYPE")

    if buyer.id == owner_id:
        raise ForbiddenException("You cannot request or book your own listing.")

    if buyer.credit_balance < credits:
        raise APIException(status_code=400, detail=f"Insufficient balance. You need at least {credits} credits to request this item.", code="INSUFFICIENT_FUNDS")

    existing = (
        db.query(ExchangeBooking)
        .filter(
            ExchangeBooking.item_id == item_id,
            ExchangeBooking.buyer_id == buyer.id,
            ExchangeBooking.status == "pending_owner_approval",
        )
        .first()
    )
    if existing:
        return existing

    booking = ExchangeBooking(
        item_type=item_type,
        item_id=item_id,
        item_title=title,
        owner_id=owner_id,
        owner_name=owner_name,
        buyer_id=buyer.id,
        buyer_name=buyer.name,
        credits=credits,
        status="pending_owner_approval",
        society_id=buyer.society_id or item.society_id,
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking


def list_bookings_for_user(db: Session, user_id: str) -> List[ExchangeBooking]:
    return (
        db.query(ExchangeBooking)
        .filter((ExchangeBooking.owner_id == user_id) | (ExchangeBooking.buyer_id == user_id))
        .order_by(ExchangeBooking.id.desc())
        .all()
    )


def approve_booking_request(db: Session, owner: User, booking_id: str) -> ExchangeBooking:
    booking = db.query(ExchangeBooking).filter(ExchangeBooking.id == booking_id).first()
    if not booking:
        raise NotFoundException(f"Booking request with ID '{booking_id}' not found")
    if booking.owner_id != owner.id:
        raise ForbiddenException("Only the owner of this listing can approve the request.")
    if booking.status != "pending_owner_approval":
        raise APIException(status_code=400, detail=f"Booking is already {booking.status}.", code="ALREADY_PROCESSED")

    # Atomic Check: Ensure item is still available for booking
    if booking.item_type == "skill":
        skill = db.query(Skill).filter(Skill.id == booking.item_id).first()
        if not skill or skill.status != "approved":
            raise APIException(status_code=400, detail="Skill listing is no longer active.", code="UNAVAILABLE")
        skill.status = "fulfilled"
    elif booking.item_type == "resource":
        res = db.query(Resource).filter(Resource.id == booking.item_id).first()
        if not res or not res.available:
            raise APIException(status_code=400, detail="Resource item is no longer available.", code="UNAVAILABLE")
        res.available = False
        res.status = "borrowed"

    # Perform Credit Transfer ONLY now upon Owner Approval!
    transfer_req = CreditTransferRequest(
        to_user_id=owner.id,
        amount=booking.credits,
        description=f"Approved exchange: {booking.item_title}",
    )
    wallet_service.transfer_credits(db, booking.buyer_id, transfer_req)

    booking.status = "approved"

    # ATOMIC AUTO-DECLINE: Decline all other pending requests for this exact same item
    db.query(ExchangeBooking).filter(
        ExchangeBooking.item_id == booking.item_id,
        ExchangeBooking.id != booking_id,
        ExchangeBooking.status == "pending_owner_approval",
    ).update({"status": "declined"})

    db.commit()
    db.refresh(booking)
    return booking


def decline_booking_request(db: Session, owner: User, booking_id: str) -> ExchangeBooking:
    booking = db.query(ExchangeBooking).filter(ExchangeBooking.id == booking_id).first()
    if not booking:
        raise NotFoundException(f"Booking request with ID '{booking_id}' not found")
    if booking.owner_id != owner.id and booking.buyer_id != owner.id:
        raise ForbiddenException("Unauthorized to decline this booking request.")

    booking.status = "declined"
    db.commit()
    db.refresh(booking)
    return booking


def cancel_booking_request(db: Session, buyer: User, booking_id: str) -> ExchangeBooking:
    booking = db.query(ExchangeBooking).filter(ExchangeBooking.id == booking_id).first()
    if not booking:
        raise NotFoundException(f"Booking request with ID '{booking_id}' not found")
    if booking.buyer_id != buyer.id:
        raise ForbiddenException("Only the resident who placed this request can cancel it.")
    if booking.status != "pending_owner_approval":
        raise APIException(status_code=400, detail="Cannot cancel request after the owner has approved or declined it.", code="ALREADY_PROCESSED")

    booking.status = "cancelled"
    db.commit()
    db.refresh(booking)
    return booking


def delete_skill(db: Session, user: User, skill_id: str) -> bool:
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise NotFoundException(f"Skill with ID '{skill_id}' not found")
    if skill.provider_id != user.id and user.role not in ["owner", "admin"]:
        raise ForbiddenException("Only the skill owner or society admin can remove this listing.")

    # Skill owner can delete listing anytime. Cancel pending and approved bookings.
    db.query(ExchangeBooking).filter(
        ExchangeBooking.item_id == skill_id,
        ExchangeBooking.status.in_(["pending_owner_approval", "approved"]),
    ).update({"status": "cancelled"}, synchronize_session=False)

    skill.status = "deleted"
    db.commit()
    return True


def delete_resource(db: Session, user: User, resource_id: str) -> bool:
    res = db.query(Resource).filter(Resource.id == resource_id).first()
    if not res:
        raise NotFoundException(f"Resource with ID '{resource_id}' not found")
    if res.owner_id != user.id and user.role not in ["owner", "admin"]:
        raise ForbiddenException("Only the resource owner or society admin can remove this listing.")

    active_booking = db.query(ExchangeBooking).filter(
        ExchangeBooking.item_id == resource_id,
        ExchangeBooking.status == "approved",
    ).first()
    if active_booking or res.status == "borrowed":
        raise ForbiddenException("Cannot delete resource listing while it is currently borrowed. Mark it as returned first.")

    # Cancel pending requests
    db.query(ExchangeBooking).filter(
        ExchangeBooking.item_id == resource_id,
        ExchangeBooking.status == "pending_owner_approval",
    ).update({"status": "cancelled"}, synchronize_session=False)

    res.status = "deleted"
    res.available = False
    db.commit()
    return True


def toggle_resource_availability(db: Session, user: User, resource_id: str, available: bool) -> Resource:
    res = db.query(Resource).filter(Resource.id == resource_id).first()
    if not res:
        raise NotFoundException(f"Resource with ID '{resource_id}' not found")
    if res.owner_id != user.id and user.role not in ["owner", "admin"]:
        raise ForbiddenException("Only the owner or society admin can toggle resource availability.")
    res.available = available
    if available:
        res.status = "approved"
        db.query(ExchangeBooking).filter(
            ExchangeBooking.item_id == resource_id,
            ExchangeBooking.status == "approved",
        ).update({"status": "completed"})
    db.commit()
    db.refresh(res)
    return res


def relist_resource(db: Session, user: User, resource_id: str) -> Resource:
    res = db.query(Resource).filter(Resource.id == resource_id).first()
    if not res:
        raise NotFoundException(f"Resource with ID '{resource_id}' not found")
    if res.owner_id != user.id and user.role not in ["owner", "admin"]:
        raise ForbiddenException("Only the resource owner or society admin can relist this resource.")

    active_booking = db.query(ExchangeBooking).filter(
        ExchangeBooking.item_id == resource_id,
        ExchangeBooking.status == "approved",
    ).first()
    if active_booking or res.status == "borrowed":
        raise ForbiddenException("Cannot relist item while it is currently borrowed. Mark it as returned first.")

    res.status = "pending"
    res.available = True
    res.rejection_reason = None
    db.commit()
    db.refresh(res)
    return res


def relist_skill(db: Session, user: User, skill_id: str) -> Skill:
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise NotFoundException(f"Skill with ID '{skill_id}' not found")
    if skill.provider_id != user.id and user.role not in ["owner", "admin"]:
        raise ForbiddenException("Only the skill owner or society admin can relist this skill.")

    skill.status = "pending"
    skill.rejection_reason = None
    db.commit()
    db.refresh(skill)
    return skill



def return_resource(db: Session, user: User, resource_id: str) -> Resource:
    res = db.query(Resource).filter(Resource.id == resource_id).first()
    if not res:
        raise NotFoundException(f"Resource with ID '{resource_id}' not found")
    if res.owner_id != user.id and user.role not in ["owner", "admin"]:
        raise ForbiddenException("Only the resource owner or society admin can mark this resource as returned.")

    db.query(ExchangeBooking).filter(
        ExchangeBooking.item_id == resource_id,
        ExchangeBooking.status == "approved",
    ).update({"status": "completed"})

    res.available = True
    res.status = "returned"
    db.commit()
    db.refresh(res)
    return res

