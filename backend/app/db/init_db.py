from sqlmodel import SQLModel, create_engine
from app.db.session import engine
from app.core.config import settings


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
    if settings.ENTORNO == "test":
        SQLModel.metadata.drop_all(engine)   # elimina todas las tablas
        SQLModel.metadata.create_all(engine) # las inicializa de nuevo
    elif settings.ENTORNO in ["dev", "prod"]:
        #SQLModel.metadata.drop_all(engine)   # elimina todas las tablas
        SQLModel.metadata.create_all(engine) # crea las tablas si no existen

if __name__ == "__main__":
    init_db()
    print(f"Base de datos {settings.ENTORNO} inicializada correctamente.")
