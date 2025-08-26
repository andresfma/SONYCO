from typing import Optional, Literal, TYPE_CHECKING
from datetime import datetime, timezone
from sqlmodel import SQLModel, Field, Relationship
from enum import Enum
from sqlalchemy import Enum as SAEnum
from sqlalchemy import Column

if TYPE_CHECKING:
    from app.models.usuario import Usuario
    from app.models.producto import Producto
    
class TipoMovimientoEnum(str, Enum):
    ENTRADA = "ENTRADA"
    SALIDA = "SALIDA"
    VENTA = "VENTA"
    ANULACIÓN_VENTA = "ANULACIÓN_VENTA"
    ENTRADA_EDICIÓN = "ENTRADA_EDICIÓN"
    SALIDA_EDICIÓN = "SALIDA_EDICIÓN"

class MovimientoInventario(SQLModel, table=True):
    __tablename__ = "movimiento_inventario"

    id: Optional[int] = Field(default=None, primary_key=True)
    producto_id: int = Field(foreign_key="producto.id")
    tipo: TipoMovimientoEnum = Field(
        sa_column=Column(
            SAEnum(TipoMovimientoEnum, name="tipo_movimiento_enum", native_enum=False),
            nullable=False,
            index=True
        )
    )
    cantidad: int
    cantidad_inventario: Optional[int] = None
    fecha: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    usuario_id: int = Field(foreign_key="usuario.id")
    venta_id: Optional[int] = Field(default=None, foreign_key="venta.id")
    
    producto: Optional["Producto"] = Relationship(back_populates="movimientos")
    usuario: Optional["Usuario"] = Relationship(back_populates="movimientos")
    
    
    
    
