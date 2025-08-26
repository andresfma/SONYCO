from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import Column, String
from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from app.models.venta import Venta
    from app.models.movimiento_inventario import MovimientoInventario


class Usuario(SQLModel, table=True):
    __tablename__ = "usuario"

    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(sa_column=Column(String(100), index=True)) 
    email: str = Field(sa_column=Column(String(100), unique=True))
    contrasena: str = Field(sa_column=Column(String(255)))
    rol_id: Optional[int] = Field(default=2, foreign_key="rol.id")
    estado: bool = Field(default=True, index=True)

    ventas: List["Venta"] = Relationship(back_populates="usuario")
    movimientos: List["MovimientoInventario"] = Relationship(back_populates="usuario")


