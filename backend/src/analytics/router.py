from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.analytics import service as analytics_service
from src.analytics.schemas import (
    OwnerAnalyticsResponse,
    OwnerUserDirectoryItem,
    SocietyPerformanceResponse,
)
from src.database import get_db
from src.dependencies import require_roles
from src.users.models import User

router = APIRouter(prefix="/analytics", tags=["Analytics & Governance Metrics"])


@router.get("/owner", response_model=OwnerAnalyticsResponse)
def get_owner_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["owner"])),
):
    return analytics_service.get_owner_analytics(db)


@router.get("/owner/users", response_model=List[OwnerUserDirectoryItem])
def get_owner_user_directory(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["owner"])),
):
    return analytics_service.get_owner_user_directory(db)


@router.get("/society/{society_id}", response_model=SocietyPerformanceResponse)
def get_society_performance(
    society_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["owner", "admin", "coordinator"])),
):
    return analytics_service.get_society_performance(db, society_id)

