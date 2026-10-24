from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.ai import service as ai_service
from src.ai.schemas import (
    AutoTagPayload,
    AutoTagResult,
    CategorizeComplaintPayload,
    CategorizeComplaintResult,
    ChatbotQueryPayload,
    ChatbotResponsePayload,
    MarketplaceMatchPayload,
    MatchItemResult,
    VolunteerSuggestionResult,
    SummarizeNoticePayload,
    SummarizeNoticeResult,
    CheckEventClashPayload,
    CheckEventClashResult,
    CoordinatorEventSuggestion,
    ResidentSuggestionsResult,
)

from src.database import get_db
from src.dependencies import get_current_user_from_token, require_roles
from src.users.models import User

router = APIRouter(prefix="/ai", tags=["AI & Smart Assistant"])


@router.post("/chatbot", response_model=ChatbotResponsePayload)
def chatbot_query(
    payload: ChatbotQueryPayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token),
):
    return ai_service.chatbot_query(db, current_user, payload.message, payload.history)



@router.post("/match-marketplace", response_model=List[MatchItemResult])
def match_marketplace(payload: MarketplaceMatchPayload, db: Session = Depends(get_db)):
    return ai_service.match_marketplace(db, payload.query, payload.society_id, payload.kind)


@router.post("/auto-tag", response_model=AutoTagResult)
def auto_tag(payload: AutoTagPayload):
    return ai_service.auto_tag(payload.text)


@router.post("/categorize-complaint", response_model=CategorizeComplaintResult)
def categorize_complaint(payload: CategorizeComplaintPayload):
    return ai_service.categorize_complaint(payload.text)


@router.get("/suggest-volunteers", response_model=List[VolunteerSuggestionResult])
def suggest_volunteers(
    event_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["owner", "admin", "coordinator"])),
):
    return ai_service.suggest_volunteers(db, event_id)


@router.post("/summarize-notice", response_model=SummarizeNoticeResult)
def summarize_notice(payload: SummarizeNoticePayload):
    return ai_service.summarize_notice(payload.content)


@router.post("/check-event-clash", response_model=CheckEventClashResult)
def check_event_clash(
    payload: CheckEventClashPayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["owner", "admin", "coordinator"])),
):
    return ai_service.check_event_clash(db, payload.title, payload.description, payload.start_time, payload.end_time, payload.society_id)


@router.get("/coordinator-event-suggestions", response_model=List[CoordinatorEventSuggestion])
def get_coordinator_event_suggestions(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["owner", "admin", "coordinator"])),
):
    if not current_user.society_id:
        return []
    return ai_service.get_coordinator_event_suggestions(db, current_user.society_id)


@router.get("/resident-suggestions", response_model=ResidentSuggestionsResult)
def get_resident_suggestions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token),
):
    if not current_user.society_id:
        return ResidentSuggestionsResult(skill_suggestions=[], volunteer_suggestions=[])
    return ai_service.get_resident_suggestions(db, current_user)


