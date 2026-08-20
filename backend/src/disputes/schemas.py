from typing import Optional
from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class DisputeCreate(BaseModel):
    booking_id: str
    item_title: str
    item_type: str
    buyer_id: str
    buyer_name: str
    owner_id: str
    owner_name: str
    reason: str

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
    )


class DisputeNotePayload(BaseModel):
    note: str

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
    )


class DisputeStatusPayload(BaseModel):
    status: str
    resolution_notes: Optional[str] = None

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
    )


class DisputeResponse(BaseModel):
    id: str
    booking_id: str
    item_title: str
    item_type: str
    buyer_id: str
    buyer_name: str
    owner_id: str
    owner_name: str
    filed_by_user_id: str
    filed_by_user_name: str
    reason: str
    status: str
    buyer_note: Optional[str] = None
    owner_note: Optional[str] = None
    coordinator_note: Optional[str] = None
    resolution_notes: Optional[str] = None
    society_id: str
    created_at: str

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )
