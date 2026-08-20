from typing import Optional, List, Union
from pydantic import BaseModel, ConfigDict, Field, field_validator
from pydantic.alias_generators import to_camel


class EventCreate(BaseModel):
    title: str
    description: str
    date: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    volunteers_needed: int = Field(..., gt=0)
    color: Optional[str] = "#dce8fb"
    text_color: Optional[str] = "#1e3a6e"

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
    )


class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    date: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    volunteers_needed: Optional[int] = None
    status: Optional[str] = None
    color: Optional[str] = None
    text_color: Optional[str] = None

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
    )



class EventResponse(BaseModel):
    id: str
    title: str
    description: str
    date: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    created_by_coordinator_id: str
    volunteers_needed: int
    volunteers: List[str] = Field(default_factory=list)
    status: str
    society_id: str
    color: Optional[str] = "#dce8fb"
    text_color: Optional[str] = "#1e3a6e"

    @field_validator("volunteers", mode="before")
    @classmethod
    def parse_volunteers(cls, v: Union[str, List[str], None]) -> List[str]:
        if isinstance(v, str):
            return [u.strip() for u in v.split(",") if u.strip()]
        if isinstance(v, list):
            return v
        return []

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )



class VolunteerInviteCreate(BaseModel):
    resident_id: str

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
    )


class VolunteerWithdrawPayload(BaseModel):
    leave_reason: Optional[str] = None

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
    )


class VolunteerRejectPayload(BaseModel):
    rejection_reason: Optional[str] = None

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
    )


class VolunteerRequestResponse(BaseModel):
    id: str
    event_id: str
    event_title: str
    resident_id: str
    resident_name: str
    type: str
    status: str
    leave_reason: Optional[str] = None
    rejection_reason: Optional[str] = None

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )

