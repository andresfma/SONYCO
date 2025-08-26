from typing import Optional
from pydantic import BaseModel
from app.schemas.categoria import CategoriaSimpleRead
from app.models.producto import UnidadMedida

class ProductoBase(BaseModel):
    codigo: str
    nombre: str
    descripcion: Optional[str] = None
    precio_unitario: float
    unidad_medida: UnidadMedida
    categoria_id: int
    estado: Optional[bool] = True

class ProductoCreate(ProductoBase):
    pass

class ProductoRead(BaseModel):
    id: int
    codigo: str
    nombre: str
    categoria: CategoriaSimpleRead
    precio_unitario: float
    estado: bool
    
    class Config:
        from_attributes = True

class ProductoDetailRead(ProductoBase):
    categoria: CategoriaSimpleRead
    id: int

    class Config:
        from_attributes = True

class ProductoSimpleRead(BaseModel):
    id: int
    codigo: str
    nombre: str

    class Config:
        from_attributes = True
        

class ProductoInfinito(BaseModel):
    id: int
    nombre: str

    class Config:
        from_attributes = True        

class ProductoTotalResponse(BaseModel):
    total: int

class ProductoUpdate(BaseModel):
    codigo: Optional[str] = None
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    precio_unitario: Optional[float] = None
    unidad_medida: Optional[UnidadMedida] = None
    categoria_id: Optional[int] = None
    estado: Optional[bool] = None