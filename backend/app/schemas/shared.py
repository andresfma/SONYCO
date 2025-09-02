from typing import Generic, TypeVar, List, Optional
from pydantic import BaseModel, ConfigDict

T = TypeVar("T")

class PagedResponse(BaseModel, Generic[T]):
    total: int
    page_size: int
    current_page: int
    total_pages: int
    items: List[T]

    model_config = ConfigDict(from_attributes=True)

class ErrorResponse(BaseModel):
    detail: str
