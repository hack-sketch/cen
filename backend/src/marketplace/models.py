import uuid
from sqlalchemy import Column, String, Integer, Boolean
from src.database import Base


def generate_sk_id():
    return f"sk-{uuid.uuid4().hex[:8]}"


def generate_r_id():
    return f"r-{uuid.uuid4().hex[:8]}"


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
    description = Column(String, nullable=False)
    society_id = Column(String, nullable=False, index=True)
