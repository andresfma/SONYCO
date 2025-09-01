from typing import Generic, TypeVar, List, Optional
from pydantic import BaseModel, ConfigDict
from pydantic.generics import GenericModel

T = TypeVar("T")

class PagedResponse(GenericModel, Generic[T]):
    total: int
    page_size: int
    current_page: int
    total_pages: int
    items: List[T]

    model_config = ConfigDict(from_attributes=True)

class ErrorResponse(BaseModel):
    detail: str
