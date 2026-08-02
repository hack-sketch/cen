from typing import Optional
from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel


class WalletBalanceResponse(BaseModel):
    credit_balance: int

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
    )


class CreditTransferRequest(BaseModel):
    to_user_id: str
    amount: int = Field(..., gt=0)
    description: str

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
    )


class TransactionResponse(BaseModel):
    id: str
    user_id: str
    type: str
    amount: int
    description: str
    date: str

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )
