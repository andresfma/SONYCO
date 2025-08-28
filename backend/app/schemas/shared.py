from typing import Generic, TypeVar, List, Optional
from pydantic import BaseModel
from pydantic.generics import GenericModel

T = TypeVar("T")

class PagedResponse(GenericModel, Generic[T]):
    total: int
    page_size: int
    current_page: int
    total_pages: int
    items: List[T]

    class Config:
        from_attributes = True

class ErrorResponse(BaseModel):
    detail: str
