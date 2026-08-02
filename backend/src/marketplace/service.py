from typing import List
from sqlalchemy.orm import Session

from src.exceptions import APIException, ForbiddenException, NotFoundException
from src.marketplace.models import Resource, Skill
from src.marketplace.schemas import ResourceCreate, SkillCreate
from src.users.models import User
from src.wallet import service as wallet_service
from src.wallet.schemas import CreditTransferRequest


def list_approved_skills(db: Session, society_id: str) -> List[Skill]:
    return db.query(Skill).filter(Skill.society_id == society_id, Skill.status == "approved").all()


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
    db.commit()
    db.refresh(skill)
    return skill


def reject_skill(db: Session, coordinator: User, skill_id: str) -> Skill:
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise NotFoundException(f"Skill with ID '{skill_id}' not found")

    if skill.provider_id == coordinator.id:
        raise ForbiddenException("Coordinators cannot reject their own skill listings. Another coordinator must review it.")

    skill.status = "rejected"
    db.commit()
    db.refresh(skill)
    return skill


def book_skill(db: Session, borrower: User, skill_id: str) -> Skill:
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise NotFoundException(f"Skill with ID '{skill_id}' not found")
    if skill.status != "approved":
        raise APIException(status_code=400, detail="Skill is not active for booking.", code="NOT_APPROVED")

    # Credit Transfer Direction: Borrower (booker) pays Provider (owner)
    transfer_req = CreditTransferRequest(
        to_user_id=skill.provider_id,
        amount=skill.credits,
        description=f"Booked skill: {skill.title}",
    )
    wallet_service.transfer_credits(db, borrower.id, transfer_req)
    return skill


# Resources
def list_approved_resources(db: Session, society_id: str) -> List[Resource]:
    return db.query(Resource).filter(Resource.society_id == society_id, Resource.status == "approved").all()


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

    # No-Self-Approval Guard
    if res.owner_id == coordinator.id:
        raise ForbiddenException("Coordinators cannot approve their own resource listings. Another coordinator must review it.")

    res.status = "approved"
    db.commit()
    db.refresh(res)
    return res


def reject_resource(db: Session, coordinator: User, resource_id: str) -> Resource:
    res = db.query(Resource).filter(Resource.id == resource_id).first()
    if not res:
        raise NotFoundException(f"Resource with ID '{resource_id}' not found")

    if res.owner_id == coordinator.id:
        raise ForbiddenException("Coordinators cannot reject their own resource listings. Another coordinator must review it.")

    res.status = "rejected"
    db.commit()
    db.refresh(res)
    return res


def book_resource(db: Session, borrower: User, resource_id: str) -> Resource:
    res = db.query(Resource).filter(Resource.id == resource_id).first()
    if not res:
        raise NotFoundException(f"Resource with ID '{resource_id}' not found")
    if res.status != "approved":
        raise APIException(status_code=400, detail="Resource is not active for booking.", code="NOT_APPROVED")
    if not res.available:
        raise APIException(status_code=400, detail="Resource is currently unavailable.", code="UNAVAILABLE")

    # Credit Transfer Direction: Borrower (booker) pays Owner
    transfer_req = CreditTransferRequest(
        to_user_id=res.owner_id,
        amount=res.credits,
        description=f"Borrowed resource: {res.name}",
    )
    wallet_service.transfer_credits(db, borrower.id, transfer_req)

    res.available = False
    db.commit()
    db.refresh(res)
    return res


def toggle_resource_availability(db: Session, user: User, resource_id: str, available: bool) -> Resource:
    res = db.query(Resource).filter(Resource.id == resource_id).first()
    if not res:
        raise NotFoundException(f"Resource with ID '{resource_id}' not found")
    if res.owner_id != user.id and user.role not in ["owner", "admin"]:
        raise ForbiddenException("Only the owner or society admin can toggle resource availability.")
    res.available = available
    db.commit()
    db.refresh(res)
    return res
