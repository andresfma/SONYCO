from sqlmodel import SQLModel, Session, create_engine
from app.core.config import settings

# Crear el motor
engine = create_engine(settings.DATABASE_URL, echo=True)


# Crear para obtener la sesión de la base de datos
def get_session():
    with Session(engine) as session:
        yield session

