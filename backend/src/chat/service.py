from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_

from src.chat.models import ChatMessage
from src.chat.schemas import ChatMessageCreate
from src.users.models import User


def get_chat_history(db: Session, user_a: str, user_b: str) -> List[ChatMessage]:
    return (
        db.query(ChatMessage)
        .filter(
            or_(
                and_(ChatMessage.sender_id == user_a, ChatMessage.receiver_id == user_b),
                and_(ChatMessage.sender_id == user_b, ChatMessage.receiver_id == user_a),
            )
        )
        .order_by(ChatMessage.timestamp.asc())
        .all()
    )


def send_chat_message(db: Session, sender: User, payload: ChatMessageCreate) -> ChatMessage:
    msg = ChatMessage(
        sender_id=sender.id,
        receiver_id=payload.receiver_id,
        sender_name=sender.name,
        content=payload.content,
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg
