from sqlmodel import SQLModel, Session, create_engine
from dotenv import load_dotenv
import os

# Cargar variables de entorno desde el archivo .env.test
load_dotenv(dotenv_path=".env.test")

DATABASE_URL = os.getenv("DATABASE_URL")

# Crear el motor de la base de datos
engine_test  = create_engine(DATABASE_URL, echo=True) # echo=True para ver las consultas SQL en la consola


# Crear para obtener la sesión de la base de datos
def get_session_test():
    with Session(engine_test) as session:
        yield session
