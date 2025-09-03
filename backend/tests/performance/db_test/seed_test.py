from sqlmodel import Session, select
from faker import Faker
from random import choice, uniform
from app.core.security import get_password_hash
from datetime import timezone
from decimal import Decimal
from random import sample

# Importar modelos para que SQLModel registre las relaciones
from app.models.cliente import Cliente, TipoPersona
from app.models.venta import Venta
from app.models.detalle_venta import DetalleVenta
from app.models.movimiento_inventario import MovimientoInventario, TipoMovimientoEnum
from app.models.producto import Producto, UnidadMedida
from app.models.rol import Rol
from app.models.usuario import Usuario
from app.models.inventario import Inventario
from app.models.categoria import Categoria

# Importar engine de test
from .session_test import engine_test

# Inicializar Faker
fake = Faker()
Faker.seed(13)  # Semilla fija para reproducibilidad

NUM_CATEGORIAS = 50
NUM_PRODUCTOS = 200
NUM_USUARIOS = 100
NUM_CLIENTES = 200
NUM_MOVIMIENTOS = 400
NUM_VENTAS = 300

def seed_roles():
    with Session(engine_test) as session:

        roles = {"admin": None, "no-admin": None}
        for rol_nombre in roles.keys():
            rol = session.exec(select(Rol).where(Rol.nombre == rol_nombre)).first()
            if not rol:
                rol = Rol(nombre=rol_nombre)
                session.add(rol)
                session.commit()
                session.refresh(rol)
                print(f"Rol '{rol_nombre}' creado.")
            else:
                print(f"Rol '{rol_nombre}' ya existe.")
            roles[rol_nombre] = rol
        

def seed_usuarios(num_usuarios: int = NUM_USUARIOS):
    with Session(engine_test) as session:

        # ---------------------------
        # Crear usuario admin
        # ---------------------------
        
        admin_email = "admin@admin.com"
        existing_user = session.exec(select(Usuario).where(Usuario.email == admin_email)).first()
        if not existing_user:
            admin_user = Usuario(
                nombre="admin",
                email=admin_email,
                contrasena=get_password_hash("admin"),  
                rol_id=1,  # rol admin
            )
            session.add(admin_user)
            session.commit()
            print("Usuario 'admin' creado.")
        else:
            print("Usuario 'admin' ya existe.")
        

        # ---------------------------
        # Crear usuarios normales
        # ---------------------------
        
        usuarios = []
        password = "password123"  # contraseña común para simplificar
        hashed = get_password_hash(password)

        for i in range(num_usuarios):
            usuario = Usuario(
                nombre=f"User{i}",
                email=f"user{i}@test.com",
                contrasena=hashed,
                rol_id=2,  # rol normal
                estado=True
            )
            usuarios.append(usuario)

        session.add_all(usuarios)
        session.commit()
        print(f"{num_usuarios} usuarios creados con contraseña 'password123'.")


def seed_clientes(num_clientes: int = NUM_CLIENTES):
    with Session(engine_test) as session:
        clientes = []
        for _ in range(num_clientes):
            tipo_persona = choice([TipoPersona.natural, TipoPersona.juridica])

            # Generar identificación distinta según tipo
            if tipo_persona == TipoPersona.natural:
                identificacion = str(fake.unique.random_number(digits=8, fix_len=True))
            else:  # jurídica
                identificacion = f"J-{fake.unique.random_number(digits=8, fix_len=True)}-{fake.random_int(min=1, max=9)}"

            cliente = Cliente(
                nombre=fake.name() if tipo_persona == TipoPersona.natural else fake.company(),
                email=fake.unique.email(),
                telefono=fake.phone_number(),
                direccion=fake.address(),
                tipo_persona=tipo_persona,
                identificacion=identificacion,
                estado=True
            )
            clientes.append(cliente)

        session.add_all(clientes)
        session.commit()
        print(f"{num_clientes} clientes creados en la base de prueba.")


def seed_categorias(num_categorias: int = NUM_CATEGORIAS):
    with Session(engine_test) as session:
        categorias = []
        for _ in range(num_categorias):
            nombre = fake.unique.word().capitalize()
            descripcion = fake.sentence(nb_words=6)
            categoria = Categoria(
                nombre=nombre,
                descripcion=descripcion,
                estado=True
            )
            categorias.append(categoria)
        session.add_all(categorias)
        session.commit()
        print(f"{num_categorias} categorías creadas.")


def seed_productos(num_productos: int = NUM_PRODUCTOS):
    with Session(engine_test) as session:
        categorias = session.exec(select(Categoria)).all()
        if not categorias:
            raise ValueError("No hay categorías. Primero crea categorías en la DB de prueba.")

        productos = []
        for _ in range(num_productos):
            producto = Producto(
                codigo=fake.unique.bothify(text="P###"),
                nombre=fake.word().capitalize(),
                descripcion=fake.sentence(nb_words=6),
                precio_unitario=round(uniform(1000, 500000), 2),
                unidad_medida=choice(list(UnidadMedida)),
                categoria_id=choice(categorias).id,
                estado=True
            )
            productos.append(producto)
        session.add_all(productos)
        session.commit()
        print(f"{num_productos} productos creados en la base de prueba.")


def seed_inventario():
    with Session(engine_test) as session:
        productos = session.exec(select(Producto)).all()
        if not productos:
            raise ValueError("No hay productos. Primero ejecuta la semilla de productos.")

        inventarios = []
        for producto in productos:
            inventario = Inventario(
                producto_id=producto.id,
                cantidad=fake.random_int(min=5, max=500),       # stock aleatorio entre 5 y 500
                cantidad_minima=fake.random_int(min=1, max=20), # stock mínimo aleatorio
                estado=True
            )
            inventarios.append(inventario)

        session.add_all(inventarios)
        session.commit()
        print(f"Inventario creado para {len(productos)} productos.")


def seed_movimientos_inventario(num_movimientos: int = NUM_MOVIMIENTOS):
    with Session(engine_test) as session:
        productos = session.exec(select(Producto)).all()
        usuarios = session.exec(select(Usuario)).all()

        if not productos or not usuarios:
            raise ValueError("Deben existir productos y usuarios creados antes de generar movimientos de inventario.")

        movimientos = []
        for _ in range(num_movimientos):
            producto = choice(productos)
            usuario = choice(usuarios)

            tipo = choice(
                [
                    TipoMovimientoEnum.ENTRADA, 
                    TipoMovimientoEnum.SALIDA, 
                    TipoMovimientoEnum.ENTRADA_EDICIÓN, 
                    TipoMovimientoEnum.SALIDA_EDICIÓN,
                ]
            )
            cantidad = fake.random_int(min=1, max=50)

            movimiento = MovimientoInventario(
                producto_id=producto.id,
                tipo=tipo,
                cantidad=cantidad,
                cantidad_inventario=fake.random_int(min=0, max=500),  # stock 'estimado'
                fecha=fake.date_time_this_year(tzinfo=timezone.utc),
                usuario_id=usuario.id,
                venta_id=None  # no aplica aquí
            )
            movimientos.append(movimiento)

        session.add_all(movimientos)
        session.commit()
        print(f"{num_movimientos} movimientos de inventario creados.")


def seed_ventas(num_ventas: int = NUM_VENTAS):
    with Session(engine_test) as session:
        clientes = session.exec(select(Cliente)).all()
        usuarios = session.exec(select(Usuario)).all()

        if not clientes or not usuarios:
            raise ValueError("Debes tener clientes y usuarios creados antes de generar ventas.")

        ventas = []
        for _ in range(num_ventas):
            cliente = choice(clientes)
            usuario = choice(usuarios)

            venta = Venta(
                cliente_id=cliente.id,
                usuario_id=usuario.id,
                fecha=fake.date_time_this_year(tzinfo=timezone.utc),
                total=Decimal(str(fake.random_int(min=1000, max=5000000))) + Decimal("0.99"),
                estado=True
            )
            ventas.append(venta)

        session.add_all(ventas)
        session.commit()
        print(f"{num_ventas} ventas creadas en la base de prueba.")


def seed_detalles_venta():
    with Session(engine_test) as session:
        ventas = session.exec(select(Venta)).all()
        productos = session.exec(select(Producto)).all()

        if not ventas or not productos:
            raise ValueError("Debes tener ventas y productos creados antes de generar detalles de venta.")

        for venta in ventas:
            num_detalles = fake.random_int(min=1, max=10)
            productos_seleccionados = sample(productos, num_detalles)

            total = Decimal("0.00")
            for producto in productos_seleccionados:
                cantidad = fake.random_int(min=1, max=10)
                detalle = DetalleVenta(
                    venta_id=venta.id,
                    producto_id=producto.id,
                    cantidad=cantidad,
                    precio_unitario=Decimal(str(producto.precio_unitario))
                )
                session.add(detalle)
                total += Decimal(str(producto.precio_unitario)) * cantidad

            # actualizar total de la venta
            venta.total = total

        session.commit()
        print(f"Detalles de venta creados para {len(ventas)} ventas.")

if __name__ == "__main__":
    seed_roles()
    seed_usuarios()
    seed_clientes()
    seed_categorias()
    seed_productos()
    seed_inventario()
    seed_movimientos_inventario()
    seed_ventas()
    seed_detalles_venta()

