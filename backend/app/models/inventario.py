from typing import Optional, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship
from app.core.config import settings

if TYPE_CHECKING:
    from app.models.producto import Producto

class Inventario(SQLModel, table=True):
    __tablename__ = "inventario"

    id: Optional[int] = Field(default=None, primary_key=True)
    producto_id: int = Field(foreign_key="producto.id")
    cantidad: int
    cantidad_minima: Optional[int] = Field(default=settings.STOCK_MINIMO)
    estado: bool = Field(default=True, index=True)

    producto: Optional["Producto"] = Relationship(back_populates="inventario")
    
    