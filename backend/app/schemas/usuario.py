from typing import Optional
from pydantic import BaseModel, EmailStr

class UsuarioBase(BaseModel): 
    nombre: str
    email: EmailStr
    rol_id: Optional[int] = 2
    estado: Optional[bool] = True

class UsuarioCreate(UsuarioBase):
    contrasena: str

class UsuarioRead(UsuarioBase):
    id: int

    class Config:
        from_attributes = True

class UsuarioReadSimple(BaseModel):
    id: int
    nombre: str

    class Config:
        from_attributes = True

class UsuarioUpdate(BaseModel):
    nombre: Optional[str] = None
    email: Optional[EmailStr] = None
    contrasena: Optional[str] = None
    rol_id: Optional[int] = None
    estado: Optional[bool] = None
