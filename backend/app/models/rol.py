from typing import Optional
from sqlalchemy import Column, String
from sqlmodel import SQLModel, Field

class Rol(SQLModel, table=True):
    __tablename__ = "rol"

    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(sa_column=Column(String(50), unique=True)) 
