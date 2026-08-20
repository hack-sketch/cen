from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel


class SocietyBase(BaseModel):
    name: str
    type: str = "Residential Apartment"
    address: str
    latitude: float = 12.97
    longitude: float = 77.59

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )


class SocietyResponse(SocietyBase):
    id: str
    admin_id: str
    capacity: int
    members_per_household: int = 4
    initial_credits: int
    household_range_start: int
    household_range_end: int
    coordinator_count: int
    status: str
    performance_score: int
    key: str
    is_operational: bool = True

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )


class SocietyConfigUpdate(BaseModel):
    capacity: Optional[int] = None
    members_per_household: Optional[int] = None
    initial_credits: Optional[int] = None

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
    )


class SocietyApplicationCreate(BaseModel):
    society_name: str
    type: str = "Residential Apartment"
    address: str
    applicant_name: str
    applicant_contact: str
    reason: str
    resident_count: int = 100
    members_per_household: int = 4
    initial_credits: int = 10

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
    )


class SocietyApplicationResponse(SocietyApplicationCreate):
    id: str
    status: str
    submitted_at: str
    rejection_reason: Optional[str] = None

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )


class SocietyApprovePayload(BaseModel):
    capacity: int = 200
    members_per_household: Optional[int] = None
    initial_credits: int = 10

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
    )


class SocietyRejectPayload(BaseModel):
    rejection_reason: Optional[str] = Field(None, description="Explanation remarks from platform owner")

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
    )



class HouseholdCreate(BaseModel):
    society_id: str
    unit_number: str
    max_members: Optional[int] = None

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
    )


class HouseholdBulkGenerate(BaseModel):
    society_id: str
    blocks: List[str] = Field(default_factory=list)
    start_unit: int = 101
    end_unit: int = 105
    format_pattern: str = "{Block}-{Unit}"
    max_members: Optional[int] = None

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
    )


class HouseholdResponse(BaseModel):
    id: str
    society_id: str
    unit_number: str
    claimed: bool
    claimed_by_user_id: Optional[str] = None
    max_members: int = 4
    occupants_count: int = 0

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )


class JoinRequestCreate(BaseModel):
    society_id: str
    household_id: str
    unit_number: str
    id_proof_url: str = "mock://id-proof.pdf"

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
    )


class JoinRequestResponse(JoinRequestCreate):
    id: str
    user_id: str
    user_name: str
    user_email: Optional[str] = None
    status: str
    submitted_at: str
    approver_type: str = "admin"
    target_approver_id: Optional[str] = None

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )
