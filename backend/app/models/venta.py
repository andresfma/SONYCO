from typing import Optional, List, TYPE_CHECKING
from datetime import datetime, timezone
from decimal import Decimal
from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from app.models.detalle_venta import DetalleVenta
    from app.models.cliente import Cliente
    from app.models.usuario import Usuario

class Venta(SQLModel, table=True):
    __tablename__ = "venta"

    id: Optional[int] = Field(default=None, primary_key=True)
    cliente_id: int = Field(foreign_key="cliente.id")
    usuario_id: int = Field(foreign_key="usuario.id")
    fecha: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    total: Optional[Decimal] = None
    estado: bool = Field(default=True, index=True)

    detalle_ventas: List["DetalleVenta"] = Relationship( 
        back_populates="venta",
        sa_relationship_kwargs={
            "cascade": "all, delete-orphan"
        }
    )
    cliente: Optional["Cliente"] = Relationship(back_populates="ventas")
    usuario: Optional["Usuario"] = Relationship(back_populates="ventas") 
 