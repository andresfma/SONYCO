from sqlmodel import Session, select
from app.db.session import engine
from app.core.security import get_password_hash

from app.models.cliente import Cliente, TipoPersona
from app.models.venta import Venta
from app.models.detalle_venta import DetalleVenta
from app.models.movimiento_inventario import MovimientoInventario
from app.models.producto import Producto, UnidadMedida
from app.models.rol import Rol
from app.models.usuario import Usuario
from app.models.inventario import Inventario
from app.models.categoria import Categoria

def seed():
    with Session(engine) as session:
        # ---------------------------
        # Crear roles
        # ---------------------------
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
                rol_id=roles["admin"].id
            )
            session.add(admin_user)
            session.commit()
            print("Usuario 'admin' creado.")
        else:
            print("Usuario 'admin' ya existe.")

        # ---------------------------
        # Crear usuario no-admin
        # ---------------------------
        noadmin_email = "user@user.com"
        existing_noadmin = session.exec(select(Usuario).where(Usuario.email == noadmin_email)).first()
        if not existing_noadmin:
            user = Usuario(
                nombre="usuario",
                email=noadmin_email,
                contrasena=get_password_hash("usuario"),
                rol_id=roles["no-admin"].id
            )
            session.add(user)
            session.commit()
            print("Usuario 'no-admin' creado.")
        else:
            print("Usuario 'no-admin' ya existe.")

        # ---------------------------
        # Crear categorías
        # ---------------------------
        categorias_info = [
            {"nombre": "Calzado", "descripcion": "Zapatos, botas y calzado industrial o de seguridad."},
            {"nombre": "Protección", "descripcion": "Elementos de seguridad personal y protección industrial."},
            {"nombre": "Ferretería", "descripcion": "Herramientas, tornillería y artículos para construcción o reparación."},
            {"nombre": "Ropa", "descripcion": "Prendas de vestir para trabajo y uso industrial."}
        ]
        categorias = {}

        for cat_info in categorias_info:
            cat = session.exec(select(Categoria).where(Categoria.nombre == cat_info["nombre"])).first()
            if not cat:
                cat = Categoria(**cat_info)
                session.add(cat)
                session.commit()
                session.refresh(cat)
                print(f"Categoría '{cat_info['nombre']}' creada.")
            else:
                print(f"Categoría '{cat_info['nombre']}' ya existe.")
            categorias[cat_info["nombre"]] = cat.id

        # ---------------------------
        # Crear productos
        # ---------------------------
        productos = [
            {"codigo": "P001", "nombre": "Botas", "descripcion": "Botas de seguridad", "precio_unitario": 250000.0, "unidad_medida": UnidadMedida.UNIDAD, "categoria_id": categorias["Calzado"]},
            {"codigo": "P002", "nombre": "Guantes", "descripcion": "Guantes industriales", "precio_unitario": 50000.0, "unidad_medida": UnidadMedida.PAQUETE, "categoria_id": categorias["Protección"]},
            {"codigo": "P003", "nombre": "Tornillos", "descripcion": "Tornillos varios", "precio_unitario": 5000.0, "unidad_medida": UnidadMedida.PAQUETE, "categoria_id": categorias["Ferretería"]},
            {"codigo": "P004", "nombre": "Pantalón", "descripcion": "Pantalón de trabajo", "precio_unitario": 120000.0, "unidad_medida": UnidadMedida.UNIDAD, "categoria_id": categorias["Ropa"]},
            {"codigo": "P005", "nombre": "Casco", "descripcion": "Casco de seguridad", "precio_unitario": 80000.0, "unidad_medida": UnidadMedida.UNIDAD, "categoria_id": categorias["Protección"]},
            {"codigo": "P006", "nombre": "Chaleco Reflectante", "descripcion": "Chaleco de alta visibilidad", "precio_unitario": 40.0, "unidad_medida": UnidadMedida.UNIDAD, "categoria_id": categorias["Ropa"]},
            {"codigo": "P007", "nombre": "Llave Inglesa", "descripcion": "Llave ajustable", "precio_unitario": 35000.0, "unidad_medida": UnidadMedida.UNIDAD, "categoria_id": categorias["Ferretería"]},
            {"codigo": "P008", "nombre": "Martillo", "descripcion": "Martillo de acero", "precio_unitario": 25000.0, "unidad_medida": UnidadMedida.UNIDAD, "categoria_id": categorias["Ferretería"]},
            {"codigo": "P009", "nombre": "Gafas", "descripcion": "Gafas de protección", "precio_unitario": 15000.0, "unidad_medida": UnidadMedida.UNIDAD, "categoria_id": categorias["Protección"]},
            {"codigo": "P010", "nombre": "Mascarilla", "descripcion": "Mascarilla filtrante", "precio_unitario": 5000.0, "unidad_medida": UnidadMedida.UNIDAD, "categoria_id": categorias["Protección"]},
            {"codigo": "P011", "nombre": "Camisa", "descripcion": "Camisa de trabajo", "precio_unitario": 90000.0, "unidad_medida": UnidadMedida.UNIDAD, "categoria_id": categorias["Ropa"]},
            {"codigo": "P012", "nombre": "Zapatos Industriales", "descripcion": "Zapatos con punta de acero", "precio_unitario": 200000.0, "unidad_medida": UnidadMedida.UNIDAD, "categoria_id": categorias["Calzado"]},
            {"codigo": "P013", "nombre": "Sandalias", "descripcion": "Sandalias de descanso", "precio_unitario": 60000.0, "unidad_medida": UnidadMedida.UNIDAD, "categoria_id": categorias["Calzado"]},
            {"codigo": "P014", "nombre": "Taladro", "descripcion": "Taladro eléctrico", "precio_unitario": 500000.0, "unidad_medida": UnidadMedida.UNIDAD, "categoria_id": categorias["Ferretería"]},
            {"codigo": "P015", "nombre": "Brocas", "descripcion": "Set de brocas", "precio_unitario": 45000.0, "unidad_medida": UnidadMedida.PAQUETE, "categoria_id": categorias["Ferretería"]},
            {"codigo": "P016", "nombre": "Pintura", "descripcion": "Pintura industrial", "precio_unitario": 100000.0, "unidad_medida": UnidadMedida.LITRO, "categoria_id": categorias["Ferretería"]},
            {"codigo": "P017", "nombre": "Impermeable", "descripcion": "Chaqueta impermeable", "precio_unitario": 150000.0, "unidad_medida": UnidadMedida.UNIDAD, "categoria_id": categorias["Ropa"]},
            {"codigo": "P018", "nombre": "Calcetines", "descripcion": "Calcetines térmicos", "precio_unitario": 20000.0, "unidad_medida": UnidadMedida.PAQUETE, "categoria_id": categorias["Ropa"]},
            {"codigo": "P019", "nombre": "Cinturón", "descripcion": "Cinturón de cuero", "precio_unitario": 55000.0, "unidad_medida": UnidadMedida.UNIDAD, "categoria_id": categorias["Ropa"]},
            {"codigo": "P020", "nombre": "Botín", "descripcion": "Botín de seguridad", "precio_unitario": 220000.0, "unidad_medida": UnidadMedida.UNIDAD, "categoria_id": categorias["Calzado"]}
        ]

        for prod in productos:
            existente = session.exec(select(Producto).where(Producto.codigo == prod["codigo"])).first()
            if not existente:
                nuevo_producto = Producto(**prod)
                session.add(nuevo_producto)
                print(f"Producto '{prod['nombre']}' creado.")
        session.commit()

        # ---------------------------
        # Crear clientes
        # ---------------------------
        clientes = [
            {"nombre": "Juan Pérez", "email": "juan@example.com", "telefono": "123456789", "direccion": "Av. Principal 123", "tipo_persona": TipoPersona.natural, "identificacion": "12345678"},
            {"nombre": "Ferretería El Tornillo", "email": "contacto@eltornillo.com", "telefono": "987654321", "direccion": "Calle Falsa 456", "tipo_persona": TipoPersona.juridica, "identificacion": "J-98765432-1"},
            {"nombre": "María Gómez", "email": "maria@example.com", "telefono": "111222333", "direccion": "Calle Luna 45", "tipo_persona": TipoPersona.natural, "identificacion": "87654321"},
            {"nombre": "Construcciones López", "email": "ventas@clopez.com", "telefono": "222333444", "direccion": "Av. del Trabajo 789", "tipo_persona": TipoPersona.juridica, "identificacion": "J-12345678-9"},
            {"nombre": "Pedro Castillo", "email": "pedro@example.com", "telefono": "333444555", "direccion": "Jr. Flores 12", "tipo_persona": TipoPersona.natural, "identificacion": "23456789"},
            {"nombre": "Suministros Industriales SA", "email": "info@suminsa.com", "telefono": "444555666", "direccion": "Av. Industrial 555", "tipo_persona": TipoPersona.juridica, "identificacion": "J-23456789-0"},
            {"nombre": "Carla Herrera", "email": "carla@example.com", "telefono": "555666777", "direccion": "Calle Sol 88", "tipo_persona": TipoPersona.natural, "identificacion": "34567890"},
            {"nombre": "Repuestos y Más", "email": "ventas@repuestosymas.com", "telefono": "666777888", "direccion": "Av. Repuestos 777", "tipo_persona": TipoPersona.juridica, "identificacion": "J-34567890-1"},
            {"nombre": "Luis Torres", "email": "luis@example.com", "telefono": "777888999", "direccion": "Calle Real 55", "tipo_persona": TipoPersona.natural, "identificacion": "45678901"},
            {"nombre": "Comercial San Juan", "email": "csanjuan@example.com", "telefono": "888999000", "direccion": "Av. Comercio 100", "tipo_persona": TipoPersona.juridica, "identificacion": "J-45678901-2"}
        ]

        for cli in clientes:
            existente = session.exec(select(Cliente).where(Cliente.identificacion == cli["identificacion"])).first()
            if not existente:
                nuevo_cliente = Cliente(**cli)
                session.add(nuevo_cliente)
                print(f"Cliente '{cli['nombre']}' creado.")
        session.commit()

        # ---------------------------
        # Crear inventario para cada producto
        # ---------------------------
        todos_productos = session.exec(select(Producto)).all()
        for i, producto in enumerate(todos_productos):
            cantidad = 3 if i < 10 else 40
            cantidad_minima = 2 if cantidad <= 5 else 5
            existente_inv = session.exec(select(Inventario).where(Inventario.producto_id == producto.id)).first()
            if not existente_inv:
                inventario = Inventario(
                    producto_id=producto.id,
                    cantidad=cantidad,
                    cantidad_minima=cantidad_minima
                )
                session.add(inventario)
                print(f"Inventario creado para '{producto.nombre}' con cantidad {cantidad} y mínima {cantidad_minima}.")
        session.commit()

if __name__ == "__main__":
    seed()
