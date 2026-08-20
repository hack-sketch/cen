from typing import Optional
from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class ComplaintCreate(BaseModel):
    title: str
    description: str
    category: str = "General"
    target_coordinator_id: Optional[str] = None
    is_private: bool = False
    is_anonymous: bool = False
    filed_by_name: Optional[str] = None

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
    )


class ComplaintResolvePayload(BaseModel):
    status: Optional[str] = "resolved"
    resolution_notes: Optional[str] = None
    notes: Optional[str] = None

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
    )


class ComplaintResponse(BaseModel):
    id: str
    title: str
    description: str
    category: str
    filed_by_user_id: str
    filed_by_user_name: str
    target_coordinator_id: Optional[str] = None
    is_private: bool
    is_anonymous: bool = False
    status: str
    resolution_notes: Optional[str] = None
    society_id: str
    created_at: str

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )
