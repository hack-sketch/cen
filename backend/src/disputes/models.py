import uuid
from datetime import date
from sqlalchemy import Column, String
from src.database import Base


def generate_dispute_id():
    return f"disp-{uuid.uuid4().hex[:8]}"


class Dispute(Base):
    __tablename__ = "disputes"

    id = Column(String, primary_key=True, default=generate_dispute_id, index=True)
    booking_id = Column(String, nullable=False, index=True)
    item_title = Column(String, nullable=False)
    item_type = Column(String, nullable=False)  # skill | resource
    buyer_id = Column(String, nullable=False, index=True)
    buyer_name = Column(String, nullable=False)
    owner_id = Column(String, nullable=False, index=True)  # seller
    owner_name = Column(String, nullable=False)
    filed_by_user_id = Column(String, nullable=False, index=True)
    filed_by_user_name = Column(String, nullable=False)
    reason = Column(String, nullable=False)
    status = Column(String, nullable=False, default="open")  # open | under_review | resolved
    buyer_note = Column(String, nullable=True)
    owner_note = Column(String, nullable=True)
    coordinator_note = Column(String, nullable=True)
    resolution_notes = Column(String, nullable=True)
    society_id = Column(String, nullable=False, index=True)
    created_at = Column(String, nullable=False, default=lambda: date.today().isoformat())
