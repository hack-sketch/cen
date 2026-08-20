import uuid
from datetime import date
from sqlalchemy import Column, String, Integer, Boolean
from src.database import Base


def generate_sk_id():
    return f"sk-{uuid.uuid4().hex[:8]}"


def generate_r_id():
    return f"r-{uuid.uuid4().hex[:8]}"


def generate_eb_id():
    return f"eb-{uuid.uuid4().hex[:8]}"


class Skill(Base):
    __tablename__ = "skills"

    id = Column(String, primary_key=True, default=generate_sk_id, index=True)
    title = Column(String, nullable=False)
    category = Column(String, nullable=False)
    provider_id = Column(String, nullable=False, index=True)
    provider_name = Column(String, nullable=False)
    credits = Column(Integer, nullable=False, default=1)
    description = Column(String, nullable=False)
    status = Column(String, nullable=False, default="pending")  # pending | approved | rejected
    rejection_reason = Column(String, nullable=True)
    tags = Column(String, nullable=True)  # Comma-separated
    society_id = Column(String, nullable=False, index=True)


class Resource(Base):
    __tablename__ = "resources"

    id = Column(String, primary_key=True, default=generate_r_id, index=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    owner_id = Column(String, nullable=False, index=True)
    owner_name = Column(String, nullable=False)
    available = Column(Boolean, nullable=False, default=True)
    credits = Column(Integer, nullable=False, default=1)
    status = Column(String, nullable=False, default="pending")  # pending | approved | rejected
    rejection_reason = Column(String, nullable=True)
    description = Column(String, nullable=False)
    society_id = Column(String, nullable=False, index=True)



class ExchangeBooking(Base):
    __tablename__ = "exchange_bookings"

    id = Column(String, primary_key=True, default=generate_eb_id, index=True)
    item_type = Column(String, nullable=False)  # skill | resource
    item_id = Column(String, nullable=False, index=True)
    item_title = Column(String, nullable=False)
    owner_id = Column(String, nullable=False, index=True)
    owner_name = Column(String, nullable=False)
    buyer_id = Column(String, nullable=False, index=True)
    buyer_name = Column(String, nullable=False)
    credits = Column(Integer, nullable=False)
    status = Column(String, nullable=False, default="pending_owner_approval")  # pending_owner_approval | approved | declined
    created_at = Column(String, nullable=False, default=lambda: date.today().isoformat())
    society_id = Column(String, nullable=False, index=True)
