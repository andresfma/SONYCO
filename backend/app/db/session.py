from sqlmodel import SQLModel, Session, create_engine
from dotenv import load_dotenv
import os

# Carga variables de entorno desde el archivo .env
load_dotenv() 

DATABASE_URL = os.getenv("DATABASE_URL")

# Crear el motor de la base de datos
engine  = create_engine(DATABASE_URL, echo=True) # echo=True para ver las consultas SQL en la consola


# Crear para obtener la sesión de la base de datos
def get_session():
    with Session(engine) as session:
        yield session

