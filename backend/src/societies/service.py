import uuid
from datetime import date
from typing import List, Optional
from sqlalchemy.orm import Session

from src.exceptions import APIException, NotFoundException
from src.societies.models import Household, JoinRequest, Society, SocietyApplication
from src.societies.schemas import (
    HouseholdBulkGenerate,
    HouseholdCreate,
    JoinRequestCreate,
    SocietyApplicationCreate,
    SocietyConfigUpdate,
)
from src.users.models import User


def is_society_operational(society: Society, db: Optional[Session] = None) -> bool:
    """A society is operational only if it has at least 2 active coordinators."""
    if (society.coordinator_count or 0) >= 2:
        return True

    if db:
        actual_coords = (
            db.query(User)
            .filter(
                User.society_id == society.id,
                (User.is_coordinator == True) | (User.role == "coordinator"),
                User.is_active != False,
            )
            .count()
        )
        if actual_coords >= 2:
            society.coordinator_count = max(society.coordinator_count or 0, actual_coords)
            try:
                db.commit()
            except Exception:
                db.rollback()
            return True

    return False


def list_societies(db: Session, name: Optional[str] = None) -> List[Society]:
    q = db.query(Society)
    if name and name.strip():
        search_pattern = f"%{name.strip()}%"
        q = q.filter(
            (Society.name.ilike(search_pattern)) | (Society.address.ilike(search_pattern))
        )
    return q.all()


def get_society_by_id(db: Session, society_id: str) -> Optional[Society]:
    soc = db.query(Society).filter(Society.id == society_id).first()
    if not soc:
        raise NotFoundException(f"Society with ID '{society_id}' not found")
    return soc


def submit_society_application(
    db: Session, app_in: SocietyApplicationCreate
) -> SocietyApplication:
    contact_email = app_in.applicant_contact.strip().lower()
    existing = (
        db.query(SocietyApplication)
        .filter(
            SocietyApplication.applicant_contact.ilike(contact_email),
            SocietyApplication.status == "pending",
        )
        .first()
    )
    if existing:
        raise APIException(
            status_code=400,
            detail="You already have a pending society application under owner review.",
            code="APPLICATION_EXISTS",
        )

    # Purge any previous rejected application records for this applicant email
    db.query(SocietyApplication).filter(
        SocietyApplication.applicant_contact.ilike(contact_email),
        SocietyApplication.status == "rejected",
    ).delete()

    app = SocietyApplication(
        society_name=app_in.society_name.strip(),
        type=app_in.type,
        address=app_in.address.strip(),
        applicant_name=app_in.applicant_name.strip(),
        applicant_contact=contact_email,
        reason=app_in.reason.strip(),
        resident_count=app_in.resident_count,
        members_per_household=app_in.members_per_household,
        initial_credits=app_in.initial_credits,
        status="pending",
    )
    db.add(app)
    db.commit()
    db.refresh(app)
    return app



def list_society_applications(db: Session) -> List[SocietyApplication]:
    return db.query(SocietyApplication).all()


def delete_society_application(db: Session, application_id: str) -> bool:
    app = (
        db.query(SocietyApplication)
        .filter(SocietyApplication.id == application_id)
        .first()
    )
    if app:
        db.delete(app)
        db.commit()
        return True
    return False


def approve_society_application(
    db: Session, application_id: str, capacity: int = 200, initial_credits: int = 10, members_per_household: Optional[int] = None
) -> Society:
    app = (
        db.query(SocietyApplication)
        .filter(SocietyApplication.id == application_id)
        .first()
    )
    if not app:
        raise NotFoundException(f"Application with ID '{application_id}' not found")

    app.status = "approved"

    # Find or prepare applicant user
    applicant_user = (
        db.query(User)
        .filter(User.email == app.applicant_contact.lower().strip())
        .first()
    )
    admin_id = applicant_user.id if applicant_user else f"u-{uuid.uuid4().hex[:8]}"

    key_code = f"{app.society_name.upper().replace(' ', '')[:4]}-{uuid.uuid4().hex[:4].upper()}"

    final_mph = members_per_household or app.members_per_household or 4

    new_soc = Society(
        name=app.society_name,
        type=app.type,
        address=app.address,
        admin_id=admin_id,
        capacity=capacity,
        members_per_household=final_mph,
        initial_credits=initial_credits,
        household_range_start=1,
        household_range_end=capacity,
        coordinator_count=0,
        status="active",
        performance_score=100,
        key=key_code,
    )
    db.add(new_soc)
    db.flush()

    if applicant_user:
        applicant_user.role = "admin"
        applicant_user.society_id = new_soc.id

    # Automatically generate initial households for onboarding
    try:
        bulk_generate_households(
            db,
            HouseholdBulkGenerate(
                society_id=new_soc.id,
                start_unit=1,
                end_unit=min(capacity, 50),
                max_members=final_mph,
            ),
        )
    except Exception as e:
        print("Notice: bulk household generation during approval:", e)

    db.commit()
    db.refresh(new_soc)
    return new_soc


def reject_society_application(
    db: Session, application_id: str, rejection_reason: Optional[str] = None
) -> SocietyApplication:
    app = (
        db.query(SocietyApplication)
        .filter(SocietyApplication.id == application_id)
        .first()
    )
    if not app:
        raise NotFoundException(f"Application with ID '{application_id}' not found")
    app.status = "rejected"
    app.rejection_reason = rejection_reason or "Application did not meet community network eligibility requirements."
    db.commit()
    db.refresh(app)
    return app



def update_society_config(
    db: Session, society_id: str, config_in: SocietyConfigUpdate
) -> Society:
    soc = get_society_by_id(db, society_id)
    if config_in.capacity is not None:
        soc.capacity = config_in.capacity
    if config_in.members_per_household is not None:
        soc.members_per_household = config_in.members_per_household
    if config_in.initial_credits is not None:
        soc.initial_credits = config_in.initial_credits
    db.commit()
    db.refresh(soc)
    return soc


def suspend_society(db: Session, society_id: str, reason: str = "Suspended by platform authority.") -> Society:
    soc = get_society_by_id(db, society_id)
    soc.status = "suspended"
    soc.suspension_reason = reason.strip() if reason and reason.strip() else "Suspended by platform authority."
    db.commit()
    db.refresh(soc)
    return soc


def revoke_society_suspension(db: Session, society_id: str) -> Society:
    soc = get_society_by_id(db, society_id)
    soc.status = "active"
    soc.suspension_reason = None
    soc.suspension_appeal = None
    soc.suspension_appeal_date = None
    db.commit()
    db.refresh(soc)
    return soc


def appeal_society_suspension(db: Session, society_id: str, appeal_reason: str) -> Society:
    soc = get_society_by_id(db, society_id)
    soc.suspension_appeal = appeal_reason.strip()
    soc.suspension_appeal_date = date.today().isoformat()
    db.commit()
    db.refresh(soc)
    return soc



def list_households_by_society(db: Session, society_id: str) -> List[Household]:
    return db.query(Household).filter(Household.society_id == society_id).all()


def register_household(db: Session, h_in: HouseholdCreate) -> Household:
    soc = get_society_by_id(db, h_in.society_id)
    current_count = db.query(Household).filter(Household.society_id == h_in.society_id).count()
    if current_count + 1 > soc.capacity:
        raise APIException(
            status_code=400,
            detail=f"Cannot add household. Maximum capacity of {soc.capacity} units reached.",
            code="CAPACITY_EXCEEDED",
        )

    duplicate = (
        db.query(Household)
        .filter(
            Household.society_id == h_in.society_id,
            Household.unit_number.ilike(h_in.unit_number.strip()),
        )
        .first()
    )
    if duplicate:
        raise APIException(
            status_code=400,
            detail=f"Unit '{h_in.unit_number}' already exists in this society.",
            code="DUPLICATE_UNIT",
        )

    max_m = h_in.max_members or soc.members_per_household or 4
    h = Household(society_id=h_in.society_id, unit_number=h_in.unit_number.strip(), max_members=max_m, occupants_count=0)
    db.add(h)
    db.commit()
    db.refresh(h)
    return h


def bulk_generate_households(
    db: Session, bulk_in: HouseholdBulkGenerate
) -> List[Household]:
    soc = get_society_by_id(db, bulk_in.society_id)
    current_count = db.query(Household).filter(Household.society_id == bulk_in.society_id).count()

    range_size = bulk_in.end_unit - bulk_in.start_unit + 1
    blocks = bulk_in.blocks if bulk_in.blocks else [""]
    total_new = range_size * len(blocks)

    if current_count + total_new > soc.capacity:
        raise APIException(
            status_code=400,
            detail=f"Adding {total_new} units exceeds society capacity of {soc.capacity} (current: {current_count}).",
            code="CAPACITY_EXCEEDED",
        )

    max_m = bulk_in.max_members or soc.members_per_household or 4
    generated: List[Household] = []
    for b in blocks:
        for u_num in range(bulk_in.start_unit, bulk_in.end_unit + 1):
            pattern = bulk_in.format_pattern
            if b:
                unit_str = pattern.replace("{Block}", b).replace("{Unit}", str(u_num))
            else:
                unit_str = (
                    pattern.replace("{Block}-", "").replace("{Block}", "").replace("{Unit}", str(u_num))
                )

            # Check duplicate
            existing = (
                db.query(Household)
                .filter(
                    Household.society_id == bulk_in.society_id,
                    Household.unit_number.ilike(unit_str),
                )
                .first()
            )
            if not existing:
                hh = Household(society_id=bulk_in.society_id, unit_number=unit_str, max_members=max_m, occupants_count=0)
                db.add(hh)
                generated.append(hh)

    db.commit()
    return generated


def submit_join_request(db: Session, user: User, req_in: JoinRequestCreate) -> JoinRequest:
    if req_in.id_proof_url and len(req_in.id_proof_url) > 1_500_000:
        raise APIException(status_code=400, detail="ID proof document size must be less than 1 MB.", code="FILE_TOO_LARGE")

    household = db.query(Household).filter(Household.id == req_in.household_id).first()
    
    approver_type = "admin"
    target_approver_id = None

    if household:
        # Check if household is claimed / occupied by a primary resident
        is_occupied = household.claimed or bool(household.claimed_by_user_id) or household.occupants_count > 0
        if is_occupied:
            if household.occupants_count >= household.max_members:
                raise APIException(
                    status_code=400,
                    detail=f"Household unit '{req_in.unit_number}' has reached its maximum member capacity of {household.max_members} occupants.",
                    code="HOUSEHOLD_FULL",
                )
            approver_type = "primary_resident"
            target_approver_id = household.claimed_by_user_id

    jr = JoinRequest(
        user_id=user.id,
        user_name=user.name,
        user_email=user.email,
        society_id=req_in.society_id,
        household_id=req_in.household_id,
        unit_number=req_in.unit_number,
        id_proof_url=req_in.id_proof_url,
        status="pending",
        approver_type=approver_type,
        target_approver_id=target_approver_id,
    )
    db.add(jr)
    db.commit()
    db.refresh(jr)
    return jr


def list_join_requests_by_society(
    db: Session, society_id: str, current_user: Optional[User] = None
) -> List[JoinRequest]:
    if current_user:
        is_admin_or_coord = current_user.role in ["owner", "admin"] or current_user.is_coordinator
        if is_admin_or_coord:
            reqs = db.query(JoinRequest).filter(JoinRequest.society_id == society_id).all()
        elif current_user.is_primary_resident and current_user.household_id:
            # Primary resident lead only views requests for their unit
            reqs = db.query(JoinRequest).filter(
                JoinRequest.society_id == society_id,
                (JoinRequest.household_id == current_user.household_id) | (JoinRequest.target_approver_id == current_user.id),
            ).all()
        else:
            # Regular / Secondary residents are not authorized to view society or household join requests
            return []
    else:
        reqs = db.query(JoinRequest).filter(JoinRequest.society_id == society_id).all()

    for r in reqs:
        if not r.user_email:
            u = db.query(User).filter(User.id == r.user_id).first()
            if u:
                r.user_email = u.email
    return reqs


def approve_join_request(db: Session, request_id: str, current_user: Optional[User] = None) -> JoinRequest:
    jr = db.query(JoinRequest).filter(JoinRequest.id == request_id).first()
    if not jr:
        raise NotFoundException(f"Join request with ID '{request_id}' not found")

    if current_user:
        # Hierarchical Permission check: Admin/Owner/Coordinator or Primary Resident Lead of the unit
        is_admin_or_coord = current_user.role in ["owner", "admin"] or current_user.is_coordinator
        is_target_primary = (
            (current_user.id == jr.target_approver_id) or 
            (current_user.is_primary_resident and current_user.household_id == jr.household_id)
        )
        if not (is_admin_or_coord or is_target_primary):
            raise APIException(
                status_code=403,
                detail="Access Denied: Only primary household leads, society coordinators, or administrators are authorized to approve membership join requests.",
                code="FORBIDDEN_APPROVAL",
            )

    jr.status = "approved"

    user = db.query(User).filter(User.id == jr.user_id).first()
    soc = db.query(Society).filter(Society.id == jr.society_id).first()
    initial_credits = soc.initial_credits if soc else 10

    household = db.query(Household).filter(Household.id == jr.household_id).first()

    if household and household.occupants_count >= household.max_members:
        raise APIException(
            status_code=400,
            detail=f"Cannot approve: household unit '{jr.unit_number}' has reached its maximum capacity of {household.max_members} members.",
            code="HOUSEHOLD_FULL",
        )

    is_first_occupant = False
    if household:
        if not household.claimed and not household.claimed_by_user_id and household.occupants_count == 0:
            is_first_occupant = True
            household.claimed = True
            household.claimed_by_user_id = jr.user_id
        
        household.occupants_count = (household.occupants_count or 0) + 1

    if user:
        user.society_id = jr.society_id
        user.household_id = jr.household_id
        user.is_primary_resident = is_first_occupant
        user.credit_balance = (user.credit_balance or 0) + initial_credits
    else:
        # Create user record if applicant user ID did not previously exist
        from src.auth.service import get_password_hash
        user = User(
            id=jr.user_id,
            name=jr.user_name,
            email=f"{jr.user_name.lower().replace(' ', '')}@cen.app",
            hashed_password=get_password_hash("password123"),
            role="resident",
            society_id=jr.society_id,
            household_id=jr.household_id,
            is_primary_resident=is_first_occupant,
            credit_balance=initial_credits,
            has_completed_survey=True,
            is_active=True,
        )
        db.add(user)

    try:
        from src.wallet.models import Transaction
        t = Transaction(
            user_id=user.id,
            type="earned",
            amount=initial_credits,
            description=f"Initial Welcome Credits upon joining {soc.name if soc else 'Society'}",
            date=date.today().isoformat(),
        )
        db.add(t)
    except Exception:
        pass

    db.commit()
    db.refresh(jr)
    return jr


def reject_join_request(db: Session, request_id: str, current_user: Optional[User] = None) -> JoinRequest:
    jr = db.query(JoinRequest).filter(JoinRequest.id == request_id).first()
    if not jr:
        raise NotFoundException(f"Join request with ID '{request_id}' not found")

    if current_user:
        # Hierarchical Permission check: Admin/Owner/Coordinator or Primary Resident Lead of the unit
        is_admin_or_coord = current_user.role in ["owner", "admin"] or current_user.is_coordinator
        is_target_primary = (
            (current_user.id == jr.target_approver_id) or 
            (current_user.is_primary_resident and current_user.household_id == jr.household_id)
        )
        if not (is_admin_or_coord or is_target_primary):
            raise APIException(
                status_code=403,
                detail="Access Denied: Only primary household leads, society coordinators, or administrators are authorized to reject membership join requests.",
                code="FORBIDDEN_APPROVAL",
            )

    jr.status = "rejected"
    db.commit()
    db.refresh(jr)
    return jr



def update_household(db: Session, household_id: str, unit_number: str) -> Household:
    h = db.query(Household).filter(Household.id == household_id).first()
    if not h:
        raise NotFoundException(f"Household with ID '{household_id}' not found")
    h.unit_number = unit_number.strip()
    db.commit()
    db.refresh(h)
    return h


def delete_household(db: Session, household_id: str) -> bool:
    h = db.query(Household).filter(Household.id == household_id).first()
    if h:
        if h.claimed or h.claimed_by_user_id:
            raise ForbiddenException("Occupied household unit cannot be deleted while assigned to a resident.")
        db.delete(h)
        db.commit()
        return True
    return False


def delete_all_households(db: Session, society_id: str) -> bool:
    households = db.query(Household).filter(Household.society_id == society_id).all()
    deleted_any = False
    for h in households:
        if h.claimed or h.claimed_by_user_id:
            continue  # Protect occupied household cards from bulk deletion
        db.delete(h)
        deleted_any = True
    db.commit()
    return deleted_any


def get_join_request_by_user(db: Session, user_id: str) -> Optional[JoinRequest]:
    jr = db.query(JoinRequest).filter(JoinRequest.user_id == user_id).order_by(JoinRequest.id.desc()).first()
    if jr and not jr.user_email:
        u = db.query(User).filter(User.id == jr.user_id).first()
        if u:
            jr.user_email = u.email
    return jr


def delete_join_request(db: Session, request_id: str) -> bool:
    jr = db.query(JoinRequest).filter(JoinRequest.id == request_id).first()
    if jr:
        db.delete(jr)
        db.commit()
        return True
    return False
