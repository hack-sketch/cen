from typing import Optional, List, Union
from pydantic import BaseModel, ConfigDict, Field, field_validator
from pydantic.alias_generators import to_camel


class ItemRejectPayload(BaseModel):
    rejection_reason: str = Field(..., min_length=1, description="Mandatory reason explaining why the listing is being rejected")

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
    )


class SkillCreate(BaseModel):
    title: str
    category: str
    credits: int = Field(..., gt=0)
    description: str
    tags: Optional[List[str]] = Field(default_factory=list)

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
    )


class SkillUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    credits: Optional[int] = Field(None, gt=0)
    description: Optional[str] = None
    tags: Optional[List[str]] = None

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
    )


class SkillResponse(BaseModel):
    id: str
    title: str
    category: str
    provider_id: str
    provider_name: str
    credits: int
    description: str
    status: str
    rejection_reason: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    society_id: str

    @field_validator("tags", mode="before")
    @classmethod
    def parse_tags(cls, v: Union[str, List[str], None]) -> List[str]:
        if isinstance(v, str):
            return [t.strip() for t in v.split(",") if t.strip()]
        if isinstance(v, list):
            return v
        return []

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )


class ResourceCreate(BaseModel):
    name: str
    category: str
    credits: int = Field(..., gt=0)
    description: str

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
    )


class ResourceUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    credits: Optional[int] = Field(None, gt=0)
    description: Optional[str] = None

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
    )


class ResourceResponse(BaseModel):
    id: str
    name: str
    category: str
    owner_id: str
    owner_name: str
    available: bool
    credits: int
    status: str
    rejection_reason: Optional[str] = None
    description: str
    society_id: str

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )



class ExchangeBookingResponse(BaseModel):
    id: str
    item_type: str
    item_id: str
    item_title: str
    owner_id: str
    owner_name: str
    buyer_id: str
    buyer_name: str
    credits: int
    status: str
    created_at: str
    society_id: str

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )
