import uuid
from datetime import date
from sqlalchemy import Column, String, Integer, ForeignKey
from src.database import Base


def generate_t_id():
    return f"t-{uuid.uuid4().hex[:8]}"


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String, primary_key=True, default=generate_t_id, index=True)
    user_id = Column(String, nullable=False, index=True)
    type = Column(String, nullable=False)  # earned | spent
    amount = Column(Integer, nullable=False)
    description = Column(String, nullable=False)
    date = Column(String, nullable=False, default=lambda: date.today().isoformat())
