from typing import Optional, TYPE_CHECKING
from decimal import Decimal
from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from app.models.venta import Venta
    from app.models.producto import Producto

class DetalleVenta(SQLModel, table=True): 
    __tablename__ = "detalle_venta"

    id: Optional[int] = Field(default=None, primary_key=True)
    venta_id: int = Field(foreign_key="venta.id")
    producto_id: int = Field(foreign_key="producto.id")
    cantidad: int
    precio_unitario: Optional[Decimal] = None

    venta: Optional["Venta"] = Relationship(back_populates="detalle_ventas")
    producto: Optional["Producto"] = Relationship(back_populates="detalles_venta")
