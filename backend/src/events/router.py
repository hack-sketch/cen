from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from src.database import get_db
from src.dependencies import get_current_user_from_token, require_roles
from src.events import service as ev_service
from src.events.schemas import (
    EventCreate,
    EventResponse,
    VolunteerInviteCreate,
    VolunteerRequestResponse,
    VolunteerWithdrawPayload,
)
from src.users.models import User

router = APIRouter(prefix="/events", tags=["Events & Volunteering"])


@router.get("", response_model=List[EventResponse])
def list_events(
    society_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token),
):
    return ev_service.list_events(db, society_id)


@router.post("", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
def create_event(
    event_in: EventCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["owner", "admin", "coordinator"])),
):
    return ev_service.create_event(db, current_user, event_in)


@router.get("/{event_id}/volunteer-requests", response_model=List[VolunteerRequestResponse])
def list_volunteer_requests(
    event_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["owner", "admin", "coordinator"])),
):
    return ev_service.list_volunteer_requests_for_event(db, event_id)


@router.post("/{event_id}/volunteer", response_model=VolunteerRequestResponse, status_code=status.HTTP_201_CREATED)
def request_to_volunteer(
    event_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token),
):
    return ev_service.request_to_volunteer(db, current_user, event_id)


@router.post("/{event_id}/invite", response_model=VolunteerRequestResponse, status_code=status.HTTP_201_CREATED)
def invite_volunteer(
    event_id: str,
    invite_in: VolunteerInviteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["owner", "admin", "coordinator"])),
):
    return ev_service.invite_volunteer(db, current_user, event_id, invite_in.resident_id)


@router.post("/volunteer-requests/{request_id}/approve", response_model=VolunteerRequestResponse)
def approve_volunteer(
    request_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["owner", "admin", "coordinator"])),
):
    return ev_service.approve_volunteer_request(db, current_user, request_id)


@router.post("/volunteer-requests/{request_id}/reject", response_model=VolunteerRequestResponse)
def reject_volunteer(
    request_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["owner", "admin", "coordinator"])),
):
    return ev_service.reject_volunteer_request(db, current_user, request_id)


@router.post("/volunteer-requests/{request_id}/withdraw", response_model=VolunteerRequestResponse)
def withdraw_volunteer(
    request_id: str,
    payload: VolunteerWithdrawPayload = VolunteerWithdrawPayload(),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token),
):
    return ev_service.withdraw_volunteer(db, current_user, request_id, payload.leave_reason)
