from typing import Optional, List, TYPE_CHECKING

from sqlalchemy import Column, String
from sqlalchemy import Enum as SAEnum
from sqlmodel import Field, SQLModel, Relationship
from enum import Enum

if TYPE_CHECKING:
    from app.models.venta import Venta

class TipoPersona(str, Enum):
    natural = "natural"
    juridica = "juridica"

class Cliente(SQLModel, table=True):
    __tablename__ = "cliente"

    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(sa_column=Column(String(100), index=True))
    email: Optional[str] = Field(default=None, sa_column=Column(String(100), unique=True))
    telefono: Optional[str] = Field(default=None, sa_column=Column(String(20)))
    direccion: Optional[str] = Field(default=None, sa_column=Column(String(255)))
    tipo_persona: TipoPersona = Field(sa_column=Column(SAEnum(TipoPersona), nullable=False, index=True))
    identificacion: str = Field(sa_column=Column(String(30), unique=True))
    estado: bool = Field(default=True, index=True)

    ventas: List["Venta"] = Relationship(back_populates="cliente")


 


