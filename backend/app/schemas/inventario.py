from typing import Optional
from pydantic import BaseModel

from app.schemas.producto import ProductoSimpleRead, ProductoRead

class InventarioBase(BaseModel):
    producto_id: int
    cantidad: int
    cantidad_minima: Optional[int] = None
    estado: bool

class InventarioReadDetail(InventarioBase):
    id: int
    producto: ProductoRead

    class Config:
        from_attributes = True

class InventarioRead(InventarioBase):
    id: int
    producto: ProductoSimpleRead

    class Config:
        from_attributes = True

class InventarioReadSimple(BaseModel):
    id: int
    cantidad: int
    
    class Config:
        from_attributes = True
    
class InventarioCantidadCreate(BaseModel):
    producto_id: int
    cantidad: int
    cantidad_minima: Optional[int] = None
    estado: Optional[bool] = None
    
    
class InventarioCantidadUpdate(BaseModel):
    producto_id: Optional[int] = None
    cantidad: Optional[int] = None
    cantidad_minima: Optional[int] = None
    estado: Optional[bool] = None

