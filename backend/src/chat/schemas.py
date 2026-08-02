from datetime import datetime
from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class ChatMessageCreate(BaseModel):
    receiver_id: str
    content: str

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
    )


class ChatMessageResponse(BaseModel):
    id: str
    sender_id: str
    receiver_id: str
    sender_name: str
    content: str
    timestamp: datetime

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )
