import uuid
from datetime import date
from sqlalchemy import Column, String, Boolean, ForeignKey
from src.database import Base


def generate_comp_id():
    return f"comp-{uuid.uuid4().hex[:8]}"


class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(String, primary_key=True, default=generate_comp_id, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    category = Column(String, nullable=False, default="General")
    filed_by_user_id = Column(String, nullable=False, index=True)
    filed_by_user_name = Column(String, nullable=False)
    target_coordinator_id = Column(String, nullable=True, index=True)
    is_private = Column(Boolean, nullable=False, default=False)
    status = Column(String, nullable=False, default="open")  # open | under_review | resolved
    resolution_notes = Column(String, nullable=True)
    society_id = Column(String, nullable=False, index=True)
    created_at = Column(String, nullable=False, default=lambda: date.today().isoformat())
