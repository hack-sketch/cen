from typing import List, Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from src.database import get_db
from src.dependencies import get_current_user_from_token, require_roles
from src.societies import service as soc_service
from src.societies.schemas import (
    HouseholdBulkGenerate,
    HouseholdCreate,
    HouseholdResponse,
    JoinRequestCreate,
    JoinRequestResponse,
    SocietyApplicationCreate,
    SocietyApplicationResponse,
    SocietyApprovePayload,
    SocietyConfigUpdate,
    SocietyResponse,
)
from src.users.models import User

router = APIRouter(tags=["Societies & Onboarding"])


@router.get("/societies", response_model=List[SocietyResponse])
def get_societies(
    name: Optional[str] = None,
    query: Optional[str] = None,
    db: Session = Depends(get_db),
):
    search_term = name or query
    societies = soc_service.list_societies(db, name=search_term)
    res = []
    for s in societies:
        item = SocietyResponse.model_validate(s)
        item.is_operational = soc_service.is_society_operational(s, db)
        res.append(item)
    return res


@router.get("/societies/applications", response_model=List[SocietyApplicationResponse])
def list_applications(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["owner"])),
):
    return soc_service.list_society_applications(db)


@router.get("/societies/applications/me", response_model=SocietyApplicationResponse)
def get_my_application(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token),
):
    from src.societies.models import SocietyApplication
    app = (
        db.query(SocietyApplication)
        .filter(SocietyApplication.applicant_contact.ilike(current_user.email))
        .order_by(SocietyApplication.id.desc())
        .first()
    )
    if not app:
        from src.exceptions import NotFoundException
        raise NotFoundException("No active society application found for this account")
    return app


@router.post(
    "/societies/applications",
    response_model=SocietyApplicationResponse,
    status_code=status.HTTP_201_CREATED,
)
def submit_application(
    app_in: SocietyApplicationCreate, db: Session = Depends(get_db)
):
    return soc_service.submit_society_application(db, app_in)


@router.delete("/societies/applications/{application_id}")
def delete_application(
    application_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token),
):
    success = soc_service.delete_society_application(db, application_id)
    return {"success": success}


@router.post("/societies/applications/{application_id}/approve", response_model=SocietyResponse)
def approve_application(
    application_id: str,
    payload: SocietyApprovePayload = SocietyApprovePayload(),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["owner"])),
):
    soc = soc_service.approve_society_application(
        db, application_id, capacity=payload.capacity, initial_credits=payload.initial_credits, members_per_household=payload.members_per_household
    )
    res = SocietyResponse.model_validate(soc)
    res.is_operational = soc_service.is_society_operational(soc, db)
    return res


@router.post("/societies/applications/{application_id}/reject", response_model=SocietyApplicationResponse)
def reject_application(
    application_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["owner"])),
):
    return soc_service.reject_society_application(db, application_id)


@router.patch("/societies/{society_id}/config", response_model=SocietyResponse)
def update_config(
    society_id: str,
    config_in: SocietyConfigUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["owner"])),
):
    soc = soc_service.update_society_config(db, society_id, config_in)
    res = SocietyResponse.model_validate(soc)
    res.is_operational = soc_service.is_society_operational(soc, db)
    return res


@router.post("/societies/{society_id}/suspend", response_model=SocietyResponse)
def suspend(
    society_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["owner"])),
):
    soc = soc_service.suspend_society(db, society_id)
    res = SocietyResponse.model_validate(soc)
    res.is_operational = soc_service.is_society_operational(soc, db)
    return res


@router.get("/societies/{society_id}", response_model=SocietyResponse)
def get_society(society_id: str, db: Session = Depends(get_db)):
    soc = soc_service.get_society_by_id(db, society_id)
    res = SocietyResponse.model_validate(soc)
    res.is_operational = soc_service.is_society_operational(soc, db)
    return res


# Household routes
@router.get("/households", response_model=List[HouseholdResponse])
@router.get("/societies/{society_id}/households", response_model=List[HouseholdResponse])
def get_households(society_id: str = None, societyId: str = None, db: Session = Depends(get_db)):
    target_id = society_id or societyId
    if not target_id:
        return []
    return soc_service.list_households_by_society(db, target_id)


@router.post("/households", response_model=HouseholdResponse, status_code=status.HTTP_201_CREATED)
def register_household(
    h_in: HouseholdCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["owner", "admin", "coordinator"])),
):
    return soc_service.register_household(db, h_in)


@router.post("/households/bulk", response_model=List[HouseholdResponse], status_code=status.HTTP_201_CREATED)
def bulk_generate_households(
    bulk_in: HouseholdBulkGenerate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["owner", "admin", "coordinator"])),
):
    return soc_service.bulk_generate_households(db, bulk_in)


@router.put("/households/{household_id}", response_model=HouseholdResponse)
def update_household(
    household_id: str,
    unit_number: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["owner", "admin", "coordinator"])),
):
    return soc_service.update_household(db, household_id, unit_number)


@router.delete("/households/{household_id}")
def delete_household(
    household_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["owner", "admin", "coordinator"])),
):
    success = soc_service.delete_household(db, household_id)
    return {"success": success}


@router.delete("/households/society/{society_id}")
def delete_all_households(
    society_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["owner", "admin", "coordinator"])),
):
    success = soc_service.delete_all_households(db, society_id)
    return {"success": success}


# Join Requests
@router.get("/societies/join-requests/me", response_model=JoinRequestResponse)
def get_my_join_request(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token),
):
    jr = soc_service.get_join_request_by_user(db, current_user.id)
    if not jr:
        from src.exceptions import NotFoundException
        raise NotFoundException("No active join request found for this user")
    return jr


@router.get("/societies/{society_id}/join-requests", response_model=List[JoinRequestResponse])
def list_join_requests(
    society_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token),
):
    return soc_service.list_join_requests_by_society(db, society_id, current_user=current_user)


@router.post("/societies/join-requests", response_model=JoinRequestResponse, status_code=status.HTTP_201_CREATED)
def submit_join_request(
    req_in: JoinRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token),
):
    return soc_service.submit_join_request(db, current_user, req_in)


@router.post("/societies/join-requests/{request_id}/approve", response_model=JoinRequestResponse)
def approve_join_request(
    request_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token),
):
    return soc_service.approve_join_request(db, request_id, current_user=current_user)


@router.post("/societies/join-requests/{request_id}/reject", response_model=JoinRequestResponse)
def reject_join_request(
    request_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token),
):
    return soc_service.reject_join_request(db, request_id, current_user=current_user)



@router.delete("/societies/join-requests/{request_id}")
def delete_join_request(
    request_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token),
):
    success = soc_service.delete_join_request(db, request_id)
    return {"success": success}
