from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class NoticeCreate(BaseModel):
    society_id: str
    title: str
    content: str
    category: str = "General"

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
    )


class NoticeResponse(BaseModel):
    id: str
    society_id: str
    posted_by_id: str
    posted_by_name: str
    title: str
    content: str
    category: str
    date: str

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )
