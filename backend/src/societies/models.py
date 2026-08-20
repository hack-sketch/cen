import uuid
from datetime import date
from sqlalchemy import Column, String, Integer, Boolean, Date, Float, ForeignKey
from src.database import Base


def generate_soc_id():
    return f"soc-{uuid.uuid4().hex[:8]}"


def generate_app_id():
    return f"app-{uuid.uuid4().hex[:8]}"


def generate_hh_id():
    return f"h-{uuid.uuid4().hex[:8]}"


def generate_jr_id():
    return f"jr-{uuid.uuid4().hex[:8]}"


class Society(Base):
    __tablename__ = "societies"

    id = Column(String, primary_key=True, default=generate_soc_id, index=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False, default="Residential Apartment")
    address = Column(String, nullable=False)
    latitude = Column(Float, nullable=False, default=12.97)
    longitude = Column(Float, nullable=False, default=77.59)
    admin_id = Column(String, nullable=False, index=True)
    capacity = Column(Integer, nullable=False, default=100)
    members_per_household = Column(Integer, nullable=False, default=4)
    initial_credits = Column(Integer, nullable=False, default=10)
    household_range_start = Column(Integer, nullable=False, default=1)
    household_range_end = Column(Integer, nullable=False, default=100)
    coordinator_count = Column(Integer, nullable=False, default=0)
    status = Column(String, nullable=False, default="active")  # pending | active | suspended
    performance_score = Column(Integer, nullable=False, default=100)
    key = Column(String, nullable=False, unique=True, index=True)


class SocietyApplication(Base):
    __tablename__ = "society_applications"

    id = Column(String, primary_key=True, default=generate_app_id, index=True)
    society_name = Column(String, nullable=False)
    type = Column(String, nullable=False, default="Residential Apartment")
    address = Column(String, nullable=False)
    applicant_name = Column(String, nullable=False)
    applicant_contact = Column(String, nullable=False)
    reason = Column(String, nullable=False)
    status = Column(String, nullable=False, default="pending")  # pending | approved | rejected
    submitted_at = Column(String, nullable=False, default=lambda: date.today().isoformat())
    resident_count = Column(Integer, nullable=False, default=100)
    members_per_household = Column(Integer, nullable=False, default=4)
    initial_credits = Column(Integer, nullable=False, default=10)
    rejection_reason = Column(String, nullable=True)



class Household(Base):
    __tablename__ = "households"

    id = Column(String, primary_key=True, default=generate_hh_id, index=True)
    society_id = Column(String, nullable=False, index=True)
    unit_number = Column(String, nullable=False)
    claimed = Column(Boolean, nullable=False, default=False)
    claimed_by_user_id = Column(String, nullable=True, index=True)
    max_members = Column(Integer, nullable=False, default=4)
    occupants_count = Column(Integer, nullable=False, default=0)


class JoinRequest(Base):
    __tablename__ = "join_requests"

    id = Column(String, primary_key=True, default=generate_jr_id, index=True)
    user_id = Column(String, nullable=False, index=True)
    user_name = Column(String, nullable=False)
    user_email = Column(String, nullable=True)
    society_id = Column(String, nullable=False, index=True)
    household_id = Column(String, nullable=False, index=True)
    unit_number = Column(String, nullable=False)
    id_proof_url = Column(String, nullable=False, default="mock://id-proof.pdf")
    status = Column(String, nullable=False, default="pending")  # pending | approved | rejected
    submitted_at = Column(String, nullable=False, default=lambda: date.today().isoformat())
    approver_type = Column(String, nullable=False, default="admin")  # admin | primary_resident
    target_approver_id = Column(String, nullable=True)
