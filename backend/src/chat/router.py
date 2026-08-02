from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from src.chat import service as chat_service
from src.chat.schemas import ChatMessageCreate, ChatMessageResponse
from src.database import get_db
from src.dependencies import get_current_user_from_token
from src.users.models import User

router = APIRouter(prefix="/chat", tags=["Direct Messaging & Chat"])


@router.get("/messages", response_model=List[ChatMessageResponse])
def get_chat_history(
    other_user_id: str = Query(..., alias="otherUserId"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token),
):
    return chat_service.get_chat_history(db, current_user.id, other_user_id)


@router.post("/messages", response_model=ChatMessageResponse)
def send_chat_message(
    payload: ChatMessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token),
):
    return chat_service.send_chat_message(db, current_user, payload)
