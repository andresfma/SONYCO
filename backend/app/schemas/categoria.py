from typing import Optional
from pydantic import BaseModel

class CategoriaBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    estado: Optional[bool] = True

class CategoriaCreate(CategoriaBase):
    pass

class CategoriaDetailRead(CategoriaBase):
    id: int
    
    class Config:
        from_attributes = True
        
class CategoriaSimpleRead(BaseModel):
    id: int
    nombre: str

    class Config:
        from_attributes = True

class CategoriaUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    estado: Optional[bool] = None
