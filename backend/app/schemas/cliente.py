from typing import Optional
from pydantic import BaseModel, EmailStr
from app.models.cliente import TipoPersona

class ClienteBase(BaseModel):
    nombre: str
    email: EmailStr
    telefono: Optional[str] = None
    direccion: Optional[str] = None 
    tipo_persona: TipoPersona
    identificacion: str
    estado: Optional[bool] = True

class ClienteCreate(ClienteBase):
    pass

class ClienteRead(ClienteBase):
    id: int

    class Config:
        from_attributes = True

class ClienteReadSimple(BaseModel):
    id: int
    nombre: str

    class Config:
        from_attributes = True
        
class ClienteVentasResponse(BaseModel):
    total: int

class ClienteUpdate(BaseModel):
    nombre: Optional[str] = None
    email: Optional[EmailStr] = None
    telefono: Optional[str] = None
    direccion: Optional[str] = None
    tipo_persona: Optional[TipoPersona] = None
    identificacion: Optional[str] = None
    estado: Optional[bool] = None