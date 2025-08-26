from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import Column, String
from sqlmodel import SQLModel, Field, Relationship
from enum import Enum
from sqlalchemy import Enum as SAEnum


if TYPE_CHECKING:
    from app.models.inventario import Inventario
    from app.models.detalle_venta import DetalleVenta
    from app.models.movimiento_inventario import MovimientoInventario
    from app.models.categoria import Categoria
    

class UnidadMedida(str, Enum):
    UNIDAD = "Unidad"
    KILOGRAMO = "Kilogramo"
    LITRO = "Litro"
    CAJA = "Caja"
    METRO = "Metro"
    PAQUETE = "Paquete"
    SERVICIO = "Servicio"

class Producto(SQLModel, table=True):
    __tablename__ = "producto"

    id: Optional[int] = Field(default=None, primary_key=True)
    codigo: str = Field(sa_column=Column(String(100), unique=True))
    nombre: str = Field(sa_column=Column(String(100), index=True))
    descripcion: Optional[str] = None
    precio_unitario: float
    unidad_medida: UnidadMedida = Field(
        sa_column=Column(
            SAEnum(UnidadMedida, name="unidad_medida_enum", native_enum=False),
            nullable=False
            )
    )
    categoria_id: int = Field(foreign_key="categoria.id", index=True)
    estado: bool = Field(default=True, index=True)

    inventario: Optional["Inventario"] = Relationship(back_populates="producto")
    detalles_venta: List["DetalleVenta"] = Relationship(back_populates="producto")
    movimientos: List["MovimientoInventario"] = Relationship(back_populates="producto")
    categoria: Optional["Categoria"] = Relationship(back_populates="productos")

