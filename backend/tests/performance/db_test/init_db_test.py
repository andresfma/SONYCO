from sqlmodel import SQLModel, create_engine
from dotenv import load_dotenv
import os

# Cargar variables de entorno desde el archivo .env.test
load_dotenv(dotenv_path=".env.test")

# Obtener URL de base de datos
DATABASE_URL = os.getenv("DATABASE_URL")
 
# Crear el motor
engine = create_engine(DATABASE_URL, echo=True)

# Importar modelos para que SQLModel registre las relaciones
from app.models.cliente import Cliente
from app.models.producto import Producto
from app.models.rol import Rol
from app.models.usuario import Usuario
from app.models.inventario import Inventario
from app.models.movimiento_inventario import MovimientoInventario
from app.models.venta import Venta
from app.models.detalle_venta import DetalleVenta
from app.models.categoria import Categoria

# Crear tablas
def init_db():
    # SQLModel.metadata.drop_all(engine)   # elimina todas las tablas
    SQLModel.metadata.create_all(engine) # las recrea actualizadas

if __name__ == "__main__":
    init_db()
    print("Base de datos inicializada correctamente.")