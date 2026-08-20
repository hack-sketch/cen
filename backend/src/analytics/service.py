from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import func

from src.analytics.schemas import (
    OwnerAnalyticsResponse,
    OwnerUserDirectoryItem,
    SocietyPerformanceResponse,
)
from src.complaints.models import Complaint
from src.events.models import EventItem
from src.marketplace.models import Resource, Skill
from src.societies.models import Household, Society, SocietyApplication
from src.users.models import User
from src.wallet.models import Transaction


def get_owner_user_directory(db: Session) -> List[OwnerUserDirectoryItem]:
    users = db.query(User).order_by(User.joined_date.desc()).all()
    societies = {s.id: s.name for s in db.query(Society).all()}
    households = {h.id: h.unit_number for h in db.query(Household).all()}

    result = []
    for u in users:
        result.append(
            OwnerUserDirectoryItem(
                id=u.id,
                name=u.name,
                email=u.email,
                role=u.role,
                society_id=u.society_id,
                society_name=societies.get(u.society_id) if u.society_id else "Unassigned",
                household_id=u.household_id,
                household_unit=households.get(u.household_id) if u.household_id else "Unassigned",
                credit_balance=u.credit_balance or 0,
                joined_date=u.joined_date,
                is_active=u.is_active if u.is_active is not None else True,
                is_coordinator=bool(u.is_coordinator),
                id_proof_uploaded=bool(u.id_proof_uploaded),
                id_proof_verified=bool(u.id_proof_verified),
                id_proof_url=u.id_proof_url,
            )
        )
    return result


def get_owner_analytics(db: Session) -> OwnerAnalyticsResponse:
    total_soc = db.query(Society).count()
    active_soc = db.query(Society).filter(Society.status == "active").count()
    pending_apps = db.query(SocietyApplication).filter(SocietyApplication.status == "pending").count()
    total_res = db.query(User).count()
    total_tx = db.query(Transaction).count()
    circulating = db.query(func.sum(User.credit_balance)).scalar() or 0

    skills = db.query(Skill).count()
    resources = db.query(Resource).count()
    events = db.query(EventItem).count()
    complaints = db.query(Complaint).count()

    user_directory = get_owner_user_directory(db)

    return OwnerAnalyticsResponse(
        total_societies=total_soc,
        active_societies=active_soc,
        pending_applications=pending_apps,
        total_residents=total_res,
        total_transactions=total_tx,
        total_credits_circulating=int(circulating),
        total_skills=skills,
        total_resources=resources,
        total_events=events,
        total_complaints=complaints,
        users=user_directory,
    )



def get_society_performance(db: Session, society_id: str) -> SocietyPerformanceResponse:
    soc = db.query(Society).filter(Society.id == society_id).first()
    soc_name = soc.name if soc else "Society"

    coords = db.query(User).filter(User.society_id == society_id, User.is_coordinator == True).count()
    residents = db.query(User).filter(User.society_id == society_id, User.role == "resident").count()
    skills = db.query(Skill).filter(Skill.society_id == society_id, Skill.status == "approved").count()
    resources = db.query(Resource).filter(Resource.society_id == society_id, Resource.status == "approved").count()
    events = db.query(EventItem).filter(EventItem.society_id == society_id).count()

    total_comp = db.query(Complaint).filter(Complaint.society_id == society_id).count()
    resolved_comp = db.query(Complaint).filter(Complaint.society_id == society_id, Complaint.status == "resolved").count()

    pct = (resolved_comp / total_comp * 100.0) if total_comp > 0 else 100.0

    # Calculate real dynamic performance score (0 - 100)
    score = 45
    if coords >= 2:
        score += 25  # Operational requirement bonus
    else:
        score += coords * 10

    score += min(15, (skills + resources) * 2)   # Marketplace listings bonus
    score += min(15, int(pct * 0.15))            # Complaint resolution efficiency

    dynamic_score = max(0, min(100, score))
    if soc:
        soc.performance_score = dynamic_score
        db.commit()

    return SocietyPerformanceResponse(
        society_id=society_id,
        society_name=soc_name,
        performance_score=dynamic_score,
        coordinator_count=coords,
        total_residents=residents,
        active_skills=skills,
        active_resources=resources,
        total_events=events,
        resolved_complaints_pct=round(pct, 1),
    )
