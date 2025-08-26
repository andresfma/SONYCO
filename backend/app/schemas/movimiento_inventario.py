from typing import Optional, Literal, List
from datetime import datetime
from pydantic import BaseModel, field_serializer
from app.models.movimiento_inventario import TipoMovimientoEnum
from app.schemas.producto import ProductoSimpleRead
from app.schemas.usuario import UsuarioReadSimple
from app.core.config import COL_TZ

class MovimientoInventarioBase(BaseModel):
    tipo: TipoMovimientoEnum
    producto_id: int
    cantidad: int
    cantidad_inventario: Optional[int] = None

class MovimientoInventarioCreate(BaseModel):
    tipo: Optional[TipoMovimientoEnum] = None
    producto_id: int
    cantidad: int
    cantidad_inventario: Optional[int] = None


class MovimientoInventarioRead(MovimientoInventarioBase):
    id: int
    venta_id: Optional[int] = None
    usuario_id: int
    fecha: datetime

    class Config:
        from_attributes = True
    
    @field_serializer("fecha")
    def serialize_fecha(self, fecha: datetime, _info):
        return fecha.astimezone(COL_TZ).isoformat()

class MovimientoInventarioDetailRead(BaseModel):
    id: int
    tipo: TipoMovimientoEnum
    cantidad: int
    venta_id: Optional[int] = None
    producto: ProductoSimpleRead
    usuario: UsuarioReadSimple
    cantidad_inventario: Optional[int] = None
    fecha: datetime
    

    class Config:
        from_attributes = True
        
    @field_serializer("fecha")
    def serialize_fecha(self, fecha: datetime, _info):
        return fecha.astimezone(COL_TZ).isoformat()

class MovimientoInventarioUpdate(BaseModel):
    producto_id: Optional[int] = None
    tipo: Optional[TipoMovimientoEnum] = None
    cantidad: Optional[int] = None
    usuario_id: Optional[int] = None
