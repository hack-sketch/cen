from typing import Optional, List
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from pydantic.alias_generators import to_camel


class UserBase(BaseModel):
    name: str
    email: EmailStr

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )


class UserCreate(UserBase):
    password: str = Field(..., min_length=6)


class UserLogin(BaseModel):
    email: EmailStr
    password: str

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
    )


class UserResponse(UserBase):
    id: str
    role: str
    society_id: Optional[str] = None
    household_id: Optional[str] = None
    credit_balance: int = 0
    joined_date: str
    id_proof_uploaded: bool = False
    id_proof_verified: bool = False
    id_proof_url: Optional[str] = None
    is_coordinator: bool = False
    avatar_color: Optional[str] = "#0ea5e9"
    has_completed_survey: bool = False
    is_active: bool = True
    is_household_enabled: bool = True
    is_primary_resident: bool = False
    can_manage_onboarding: bool = True
    can_deactivate_residents: bool = False

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )


class PromoteCoordinatorPayload(BaseModel):
    can_manage_onboarding: bool = True
    can_deactivate_residents: bool = False

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
    )


class IdProofUploadPayload(BaseModel):
    id_proof_url: str

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
    )


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
    )


class UserUpdate(BaseModel):
    name: Optional[str] = None
    avatar_color: Optional[str] = None
    has_completed_survey: Optional[bool] = None

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
    )


class OnboardingSurveyPayload(BaseModel):
    interests: List[str] = []
    offered_skills_text: Optional[str] = None
    volunteer_interest: Optional[str] = None

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
    )
