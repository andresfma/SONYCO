from typing import Optional, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column, String

if TYPE_CHECKING:
    from app.models.producto import Producto


class Categoria(SQLModel, table=True):
    __tablename__ = "categoria"

    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(sa_column=Column(String(50), unique=True))
    descripcion: Optional[str] = None
    estado: bool = Field(default=True, index=True)


    productos: list["Producto"] = Relationship(back_populates="categoria")
    