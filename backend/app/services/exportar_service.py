import io
from typing import List
from openpyxl import Workbook
from sqlmodel import Session, select
from sqlalchemy.orm import selectinload

from app.models.producto import Producto
from app.models.usuario import Usuario
from app.models.venta import Venta
from app.models.cliente import Cliente
from app.models.categoria import Categoria
from app.models.inventario import Inventario
from app.models.usuario import Usuario
from app.models.movimiento_inventario import MovimientoInventario
from app.models.detalle_venta import DetalleVenta

from datetime import timedelta


def _crear_excel(headers: List[str], rows: List[list]) -> io.BytesIO:
    """Crea un archivo Excel con los datos proporcionados."""
    output = io.BytesIO()
    wb = Workbook()
    ws = wb.active

    ws.append(headers)
    for row in rows:
        ws.append(row)

    wb.save(output)
    output.seek(0)
    return output


def exportar_inventario(db: Session):
    """Exporta el inventario a un archivo Excel."""
    headers = [
        "ID", 
        "Código_producto", 
        "Producto", 
        "Unidad_medida", 
        "Cantidad", 
        "Cantidad_minima", 
        "Precio", 
        "Categoria",
        "Estado"
        ]
    rows = []

    inventarios = db.exec(
        select(Inventario)
        .options(
            selectinload(Inventario.producto)
            .selectinload(Producto.categoria)
            )
        ).all()
    for inventario in inventarios:
        rows.append(
            [
                inventario.id,
                inventario.producto.codigo, 
                inventario.producto.nombre,
                inventario.producto.unidad_medida.value, 
                inventario.cantidad,
                inventario.cantidad_minima,
                inventario.producto.precio_unitario,
                inventario.producto.categoria.nombre,
                inventario.estado
                ]
            )

    return _crear_excel(headers, rows)


def exportar_ventas(db: Session):
    """Exporta las ventas a un archivo Excel."""
    headers = ["ID", "Identificación_cliente", "Cliente", "Vendedor", "Fecha", "Total", "Estado"]
    rows = []

    ventas = db.exec(
        select(Venta)
        .options(
            selectinload(Venta.cliente),
            selectinload(Venta.usuario)
            )
        ).all()
    
    for venta in ventas:
        # Restar 5 horas para convertir UTC a hora de Colombia
        fecha_colombia = venta.fecha - timedelta(hours=5)
        
        rows.append(
            [
                venta.id,
                venta.cliente.identificacion, 
                venta.cliente.nombre, 
                venta.usuario.nombre, 
                fecha_colombia.strftime("%Y-%m-%d %H:%M:%S"), 
                round(venta.total, 2),
                venta.estado
            ]
        )

    return _crear_excel(headers, rows)


def exportar_ventas_por_cliente(db: Session, cliente_id: int):
    """Exporta las ventas de un cliente específico a un archivo Excel."""
    headers = ["ID", "Identificación_cliente", "Cliente", "Estado_cliente","Vendedor", "Fecha", "Total", "Estado_venta"]
    rows = []

    ventas = db.exec(
        select(Venta)
        .where(Venta.cliente_id == cliente_id)
        .options(
            selectinload(Venta.usuario),
            selectinload(Venta.cliente)
            )
        ).all()

    for venta in ventas:
        rows.append(
            [
                venta.id, 
                venta.cliente.identificacion,
                venta.cliente.nombre,
                venta.cliente.estado,
                venta.usuario.nombre, 
                venta.fecha.strftime("%Y-%m-%d %H:%M:%S"), 
                round(venta.total, 2),
                venta.estado
                ]
            )

    return _crear_excel(headers, rows)


def exportar_clientes(db: Session):
    """Exporta los clientes a un archivo Excel."""
    headers = ["ID", "Identificación", "Nombre", "Tipo", "Email", "Teléfono", "Estado"]
    rows = []

    clientes = db.exec(select(Cliente)).all()
    for cliente in clientes:
        rows.append(
            [
                cliente.id,
                cliente.identificacion,
                cliente.nombre, 
                cliente.tipo_persona.value, 
                cliente.email, 
                cliente.telefono,
                cliente.estado
                ]
            )

    return _crear_excel(headers, rows)


def exportar_categorias(db: Session):
    """Exporta las categorias a un archivo Excel."""
    headers = ["ID", "Nombre", "Descripción", "Estado"]
    rows = []

    categorias = db.exec(select(Categoria)).all()
    for categoria in categorias:
        rows.append(
            [
                categoria.id,
                categoria.nombre, 
                categoria.descripcion,
                categoria.estado
                ]
            )

    return _crear_excel(headers, rows)


def exportar_productos(db: Session):
    """Exporta los productos a un archivo Excel."""
    headers = ["ID", "Código", "Nombre", "Unidad_medida", "Descripción", "Precio Unitario", "Categoria", "Estado"]
    rows = []

    productos = db.exec(
        select(Producto)
        .options(
            selectinload(Producto.categoria)
            )
        ).all()
    for producto in productos:
        rows.append(
            [
                producto.id, 
                producto.codigo, 
                producto.nombre, 
                producto.unidad_medida.value,
                producto.descripcion, 
                producto.precio_unitario, 
                producto.categoria.nombre,
                producto.estado
                ]
            )

    return _crear_excel(headers, rows)


def exportar_usuarios(db: Session):
    """Exporta los usuarios a un archivo Excel."""
    headers = ["ID", "Nombre", "Email", "Rol", "Estado"]
    rows = []

    usuarios = db.exec(select(Usuario)).all()
    for usuario in usuarios:
        rol_str = "Admin" if usuario.rol_id == 1 else "No-admin"
        rows.append(
            [
                usuario.id,
                usuario.nombre, 
                usuario.email, 
                rol_str,
                usuario.estado
                ]
            )

    return _crear_excel(headers, rows)


def exportar_movimientos_por_producto(db: Session, producto_id: int):
    """Exporta los movimientos de un producto específico a un archivo Excel."""
    headers = ["ID", "Código_producto", "Producto", "Unidad_medida", "Estado_producto", "Tipo Movimiento", "Cantidad", "Inventario_resultante", "Empleado", "Venta_id", "Fecha"]
    rows = []
    movimientos = db.exec(
        select(MovimientoInventario)
        .where(MovimientoInventario.producto_id == producto_id)
        .options(selectinload(MovimientoInventario.producto),
                 selectinload(MovimientoInventario.usuario)
                 )
        ).all()

    for movimiento in movimientos:
        # Restar 5 horas para convertir UTC a hora de Colombia
        fecha_colombia = movimiento.fecha - timedelta(hours=5)
        venta_id = movimiento.venta_id if movimiento.venta_id else "N/A"
        rows.append(
            [
                movimiento.id, 
                movimiento.producto.codigo,
                movimiento.producto.nombre, 
                movimiento.producto.unidad_medida.value,
                movimiento.producto.estado,
                movimiento.tipo.value,
                movimiento.cantidad,
                movimiento.cantidad_inventario,
                movimiento.usuario.nombre,
                venta_id, 
                fecha_colombia.strftime("%Y-%m-%d %H:%M:%S")
                ]
            )
    
    return _crear_excel(headers, rows)


def exportar_movimientos_por_usuario(db: Session, usuario_id: int):
    """Exporta los movimientos de un usuario específico a un archivo Excel."""
    headers = ["ID", "Código_producto", "Producto", "Unidad_medida", "Estado_producto", "Tipo Movimiento", "Cantidad", "Inventario_resultante", "Empleado", "Venta_id", "Fecha"]
    rows = []
    movimientos = db.exec(
        select(MovimientoInventario)
        .where(MovimientoInventario.usuario_id == usuario_id)
        .options(selectinload(MovimientoInventario.producto),
                 selectinload(MovimientoInventario.usuario)
                 )
        ).all()

    for movimiento in movimientos:
        # Restar 5 horas para convertir UTC a hora de Colombia
        fecha_colombia = movimiento.fecha - timedelta(hours=5)
        venta_id = movimiento.venta_id if movimiento.venta_id else "N/A"
        rows.append(
            [
                movimiento.id, 
                movimiento.producto.codigo,
                movimiento.producto.nombre, 
                movimiento.producto.unidad_medida.value,
                movimiento.producto.estado,
                movimiento.tipo.value,
                movimiento.cantidad,
                movimiento.cantidad_inventario,
                movimiento.usuario.nombre,
                venta_id, 
                fecha_colombia.strftime("%Y-%m-%d %H:%M:%S")
                ]
            )
    
    return _crear_excel(headers, rows)


def exportar_detalle_venta_por_venta_id(db: Session, venta_id: int):
    """Exporta el detalle de una venta específica a un archivo Excel."""
    headers = ["ID", "Código_producto", "Producto", "Unidad_medida", "Estado_producto", "Cantidad", "Precio Unitario", "Subtotal"]
    rows = []

    detalles = db.exec(
        select(DetalleVenta)
        .where(DetalleVenta.venta_id == venta_id)
        .options(selectinload(DetalleVenta.producto)
                 )
        ).all()
    if detalles:
        for detalle in detalles:
            subtotal = detalle.cantidad * detalle.precio_unitario
            rows.append(
                [
                    detalle.id,
                    detalle.producto.codigo, 
                    detalle.producto.nombre, 
                    detalle.producto.unidad_medida.value,
                    detalle.producto.estado,
                    detalle.cantidad, 
                    detalle.precio_unitario, 
                    round(subtotal, 2)
                    ]
                )

    return _crear_excel(headers, rows)


def exportar_movimientos_inventario(db: Session):
    """Exporta todos los movimientos de inventario a un archivo Excel."""
    headers = ["ID", "Código_producto", "Producto", "Unidad_medida", "Estado_producto", "Tipo Movimiento", "Vendedor", "Venta_id", "Cantidad", "Inventario_resultante", "Fecha"]
    rows = []

    movimientos = db.exec(
        select(MovimientoInventario)
        .options(
            selectinload(MovimientoInventario.producto),
            selectinload(MovimientoInventario.usuario)
            )
        ).all()

    for movimiento in movimientos:
        # Restar 5 horas para convertir UTC a hora de Colombia
        fecha_colombia = movimiento.fecha - timedelta(hours=5)
        
        venta_id = movimiento.venta_id if movimiento.venta_id else "N/A"
        rows.append(
            [
                movimiento.id,
                movimiento.producto.codigo, 
                movimiento.producto.nombre, 
                movimiento.producto.unidad_medida.value,
                movimiento.producto.estado,
                movimiento.tipo.value,
                movimiento.usuario.nombre,
                venta_id, 
                movimiento.cantidad,
                movimiento.cantidad_inventario,
                fecha_colombia.strftime("%Y-%m-%d %H:%M:%S")
                ]
            )

    return _crear_excel(headers, rows)
 