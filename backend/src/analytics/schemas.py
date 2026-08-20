from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class OwnerUserDirectoryItem(BaseModel):
    id: str
    name: str
    email: str
    role: str
    society_id: Optional[str] = None
    society_name: Optional[str] = None
    household_id: Optional[str] = None
    household_unit: Optional[str] = None
    credit_balance: int = 0
    joined_date: str
    is_active: bool = True
    is_coordinator: bool = False
    id_proof_uploaded: bool = False
    id_proof_verified: bool = False
    id_proof_url: Optional[str] = None

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
    )


class OwnerAnalyticsResponse(BaseModel):
    total_societies: int
    active_societies: int
    pending_applications: int
    total_residents: int
    total_transactions: int
    total_credits_circulating: int
    total_skills: int = 0
    total_resources: int = 0
    total_events: int = 0
    total_complaints: int = 0
    users: Optional[List[OwnerUserDirectoryItem]] = None

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
    )



class SocietyPerformanceResponse(BaseModel):
    society_id: str
    society_name: str
    performance_score: int
    coordinator_count: int
    total_residents: int
    active_skills: int
    active_resources: int
    total_events: int
    resolved_complaints_pct: float

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
    )
