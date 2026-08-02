from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class OwnerAnalyticsResponse(BaseModel):
    total_societies: int
    active_societies: int
    pending_applications: int
    total_residents: int
    total_transactions: int
    total_credits_circulating: int

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
