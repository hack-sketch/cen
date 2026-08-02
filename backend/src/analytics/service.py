from sqlalchemy.orm import Session
from sqlalchemy import func

from src.analytics.schemas import OwnerAnalyticsResponse, SocietyPerformanceResponse
from src.complaints.models import Complaint
from src.events.models import EventItem
from src.marketplace.models import Resource, Skill
from src.societies.models import Society, SocietyApplication
from src.users.models import User
from src.wallet.models import Transaction


def get_owner_analytics(db: Session) -> OwnerAnalyticsResponse:
    total_soc = db.query(Society).count()
    active_soc = db.query(Society).filter(Society.status == "active").count()
    pending_apps = db.query(SocietyApplication).filter(SocietyApplication.status == "pending").count()
    total_res = db.query(User).filter(User.role == "resident").count()
    total_tx = db.query(Transaction).count()
    circulating = db.query(func.sum(User.credit_balance)).scalar() or 0

    return OwnerAnalyticsResponse(
        total_societies=total_soc,
        active_societies=active_soc,
        pending_applications=pending_apps,
        total_residents=total_res,
        total_transactions=total_tx,
        total_credits_circulating=int(circulating),
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
    score = soc.performance_score if soc and soc.performance_score else 95

    return SocietyPerformanceResponse(
        society_id=society_id,
        society_name=soc_name,
        performance_score=score,
        coordinator_count=coords,
        total_residents=residents,
        active_skills=skills,
        active_resources=resources,
        total_events=events,
        resolved_complaints_pct=round(pct, 1),
    )
