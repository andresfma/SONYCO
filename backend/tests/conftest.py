import pytest
from sqlmodel import SQLModel, create_engine, Session

from app.models.cliente import Cliente, TipoPersona
from app.models.producto import Producto, UnidadMedida
from app.models.rol import Rol
from app.models.usuario import Usuario
from app.models.inventario import Inventario
from app.models.movimiento_inventario import MovimientoInventario, TipoMovimientoEnum
from app.models.venta import Venta
from app.models.detalle_venta import DetalleVenta
from app.models.categoria import Categoria
from app.core.security import get_password_hash

from datetime import datetime, timezone
from decimal import Decimal


# Fixture de motor de base de datos (SQLite en memoria)
@pytest.fixture(scope="session")
def engine():
    engine = create_engine("sqlite:///:memory:", echo=False)
    SQLModel.metadata.create_all(engine)
    return engine


# Fixture de sesión (se renueva en cada test)
@pytest.fixture
def session(engine):
    # Limpia todas las tablas antes de cada test
    SQLModel.metadata.drop_all(engine)
    SQLModel.metadata.create_all(engine)

    with Session(engine) as session:
        yield session
        session.close()


# -------------------------------
# Fixtures entidades
# -------------------------------


# -------------------------------
# Clientes
# -------------------------------

@pytest.fixture
def cliente_fixture(session: Session) -> Cliente:
    """Crea un cliente de prueba genérico"""
    cliente = Cliente(
        nombre="Juan Pérez",
        email="juan@example.com",
        telefono="123456789",
        direccion="Calle Falsa 123",
        tipo_persona=TipoPersona.natural,
        identificacion="1234567890",
        estado=True,
    )
    session.add(cliente)
    session.commit()
    session.refresh(cliente)
    return cliente


@pytest.fixture
def clientes_fixture(session: Session) -> list[Cliente]:
    """Crea múltiples clientes para pruebas de paginación y búsqueda"""
    clientes = [
        Cliente(
            nombre="Juan Pérez",
            email="juan@example.com",
            telefono="123456789",
            direccion="Calle Falsa 123",
            tipo_persona=TipoPersona.natural,
            identificacion="1234567890",
            estado=True,
        ),
        Cliente(
            nombre="Empresa XYZ",
            email="contacto@xyz.com",
            telefono="987654321",
            direccion="Av. Central 456",
            tipo_persona=TipoPersona.juridica,
            identificacion="J12345678",
            estado=True,
        ),
    ]
    session.add_all(clientes)
    session.commit()
    return clientes


# -------------------------------
# Categorías
# -------------------------------

@pytest.fixture
def categoria_fixture(session: Session) -> Categoria:
    """Crea una categoría inicial para los tests."""
    cat = Categoria(nombre="Herramientas", descripcion="Para el hogar")
    session.add(cat)
    session.commit()
    session.refresh(cat)
    return cat


@pytest.fixture
def categorias_fixture(session: Session):
    categorias = [
        Categoria(nombre="Herramientas", descripcion="Cat 1"),
        Categoria(nombre="Materiales", descripcion="Cat 2"),
        Categoria(nombre="EPP", descripcion="Cat 3"),
    ]
    session.add_all(categorias)
    session.commit()
    return categorias


# -------------------------------
# Productos
# -------------------------------

@pytest.fixture
def producto_fixture(session, categoria_fixture):
    producto = Producto(
        codigo="P001",
        nombre="Martillo",
        descripcion="Martillo de prueba",
        precio_unitario=10,
        unidad_medida=UnidadMedida.UNIDAD, 
        categoria_id=categoria_fixture.id,
        estado=True,
    )
    session.add(producto)
    session.commit()
    session.refresh(producto)
    return producto


# -------------------------------
# Inventarios
# -------------------------------

@pytest.fixture
def inventario_fixture(session, producto_fixture):
    inventario = Inventario(
        producto_id=producto_fixture.id,
        cantidad=100,
        cantidad_minima=10,
        estado=True,
    )
    session.add(inventario)
    session.commit()
    session.refresh(inventario)
    return inventario


# -------------------------------
# Rol
# -------------------------------

@pytest.fixture
def rol_fixture(session):
    rol = Rol(
        nombre="Admin"
    )
    session.add(rol)
    session.commit()
    session.refresh(rol)
    return rol


# -------------------------------
# Usuarios
# -------------------------------

@pytest.fixture
def usuario_fixture(session, rol_fixture):
    usuario = Usuario(
        nombre="Usuario Test",
        email="usuario@test.com",
        contrasena=get_password_hash("1234"),
        rol_id=rol_fixture.id,
        estado=True,
    )
    session.add(usuario)
    session.commit()
    session.refresh(usuario)
    return usuario


# -------------------------------
# Ventas
# -------------------------------

@pytest.fixture
def venta_fixture(session, cliente_fixture, usuario_fixture):
    venta = Venta(
        cliente_id=cliente_fixture.id,
        usuario_id=usuario_fixture.id,
        fecha=datetime.now(timezone.utc),
        total=0.0,
        estado=True,
    )
    session.add(venta)
    session.commit()
    session.refresh(venta)
    return venta


# -------------------------------
# Detalle de Ventas
# -------------------------------

@pytest.fixture
def detalle_venta_fixture(session, venta_fixture, producto_fixture):
    detalle = DetalleVenta(
        venta_id=venta_fixture.id,
        producto_id=producto_fixture.id,
        cantidad=5,
        precio_unitario=Decimal(str(producto_fixture.precio_unitario)),
    )
    session.add(detalle)
    session.commit()
    session.refresh(detalle)
    return detalle


# -------------------------------
# Movimientos
# -------------------------------

@pytest.fixture
def movimiento_fixture(session, producto_fixture, usuario_fixture):
    movimiento = MovimientoInventario(
        producto_id=producto_fixture.id,
        tipo=TipoMovimientoEnum.ENTRADA,
        cantidad=10,
        cantidad_inventario=10,
        fecha=datetime.now(timezone.utc),
        usuario_id=usuario_fixture.id,
        venta_id=None,
    )
    session.add(movimiento)
    session.commit()
    session.refresh(movimiento)
    return movimiento