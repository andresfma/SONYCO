from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, field_serializer, ConfigDict

from app.schemas.detalle_venta import DetalleVentaRead, DetalleVentaCreate
from app.schemas.usuario import UsuarioReadSimple
from app.schemas.cliente import ClienteReadSimple
from app.core.config import COL_TZ

class VentaRequest(BaseModel):
    cliente_id: int

class VentaTotalResponse(BaseModel): 
    total: int

class VentaListRead(BaseModel):
    id: int
    cliente: ClienteReadSimple
    usuario: UsuarioReadSimple
    fecha: datetime
    total: Optional[Decimal]
    estado: bool
    
    model_config = ConfigDict(from_attributes=True)
    

    @field_serializer("fecha")
    def serialize_fecha(self, fecha: datetime, _info):
        return fecha.astimezone(COL_TZ).isoformat()

class VentaDetailRead(VentaListRead):
    detalle_ventas: List[DetalleVentaRead]

class VentaUpdateRead(BaseModel):
    id: int
    cliente: Optional[ClienteReadSimple]
    estado: bool

    model_config = ConfigDict(from_attributes=True)


class VentaUpdate(BaseModel):
    cliente_id: Optional[int] = None
    estado: Optional[bool] = None
