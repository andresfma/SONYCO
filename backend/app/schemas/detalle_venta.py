from typing import Optional
from decimal import Decimal
from pydantic import BaseModel

from app.schemas.producto import ProductoSimpleRead

class DetalleVentaBase(BaseModel):
    producto_id: int
    cantidad: int
    precio_unitario: Optional[Decimal] = None

class DetalleVentaCreate(DetalleVentaBase):
    pass

class DetalleVentaRead(BaseModel): 
    id: int
    cantidad: int
    precio_unitario: Optional[Decimal] = None
    venta_id: int
    producto: ProductoSimpleRead

    class Config:
        from_attributes = True

class DetalleVentaUpdate(BaseModel):
    producto_id: Optional[int] = None
    cantidad: Optional[int] = None
    precio_unitario: Optional[Decimal] = None
