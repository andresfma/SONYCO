from typing import List, Optional
from sqlmodel import Session, select
from sqlalchemy.orm import selectinload
from sqlalchemy import or_, func, asc, desc
from fastapi import HTTPException, status
from datetime import datetime, timedelta, timezone

from app.models.venta import Venta
from app.models.cliente import Cliente
from app.models.detalle_venta import DetalleVenta
from app.models.inventario import Inventario
from app.models.producto import Producto
from app.models.movimiento_inventario import MovimientoInventario, TipoMovimientoEnum
from app.models.usuario import Usuario
from app.schemas.venta import (
    VentaUpdate, 
    VentaRequest, 
    VentaTotalResponse,
    VentaDetailRead,
    VentaListRead,
    VentaUpdateRead
)
from app.schemas.detalle_venta import DetalleVentaCreate, DetalleVentaUpdate, DetalleVentaRead
from app.schemas.shared import PagedResponse
from app.models.movimiento_inventario import MovimientoInventario

from decimal import Decimal

 
def create_venta(
    db: Session, 
    venta_data: VentaRequest, 
    usuario_id: int
) -> VentaDetailRead: 
    """
    Crea una venta básica con cliente y usuario.
    El total se inicializa en 0 y se agregan los detalles después.
    """
    
    # Validar que el cliente exista
    cliente = db.exec(
        select(Cliente).where(Cliente.id == venta_data.cliente_id)
    ).first()
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    
    # Crear venta vacía
    venta = Venta(
        cliente_id=venta_data.cliente_id,
        usuario_id=usuario_id,
        fecha=datetime.now(timezone.utc),
        total=Decimal(0)
    )

    db.add(venta)
    db.commit()
    db.refresh(venta)
    
    # Volver a consultar con relaciones cargadas
    venta_full = db.exec(
        select(Venta)
        .options(
            selectinload(Venta.cliente),
            selectinload(Venta.usuario),
            selectinload(Venta.detalle_ventas)
                .selectinload(DetalleVenta.producto)
        )
        .where(Venta.id == venta.id)
    ).first()

    return venta_full


def get_venta_by_id(db: Session, venta_id: int) -> VentaDetailRead:
    """Obtiene una venta por su ID con detalles y productos."""
    venta = db.exec(
        select(Venta)
        .options(
            selectinload(Venta.detalle_ventas)
            .selectinload(DetalleVenta.producto),
            selectinload(Venta.cliente),
            selectinload(Venta.usuario)
        )
        .where(Venta.id == venta_id)
    ).first()

    if not venta:
        raise HTTPException(status_code=404, detail="Venta no encontrada")
    return venta


def get_ventas(
    db: Session,
    search: Optional[str] = None,
    page: int = 1,
    page_size: int = 10,
    estado: Optional[bool] = None,
    sort_by: Optional[str] = None,
    sort_order: Optional[str] = "asc"
) -> PagedResponse[VentaListRead]:
    """
    Obtiene ventas con filtros, búsqueda, paginación y ordenamiento dinámico.
    Filtros disponibles:
      - search: busca en nombre de cliente o vendedor.
      - estado: filtra por estado de la venta.
    Soporta ordenamiento por:
      - Campos propios de Venta.
      - cliente_nombre (Cliente.nombre).
      - usuario_nombre (Usuario.nombre).
    """

    # Construir filtros comunes
    filters = []

    if search:
        search_term = f"%{search}%"
        filters.append(
            or_(
                Cliente.nombre.ilike(search_term),
                Usuario.nombre.ilike(search_term)
            )
        )

    if estado is not None:
        filters.append(Venta.estado == estado)

    # Consulta para contar total
    count_stmt = (
        select(func.count(Venta.id))
        .join(Venta.cliente)
        .join(Venta.usuario)
    )
    if filters:
        count_stmt = count_stmt.where(*filters)

    total = db.exec(count_stmt).one()

    # Calcular páginas
    total_pages = (total + page_size - 1) // page_size if total > 0 else 1
    offset = (page - 1) * page_size

    # Consulta para obtener listado
    statement = (
        select(Venta)
        .options(
            selectinload(Venta.cliente),
            selectinload(Venta.usuario)
        )
        .join(Venta.cliente)
        .join(Venta.usuario)
    )

    if filters:
        statement = statement.where(*filters)

    # Ordenamiento dinámico
    col = None
    if sort_by:
        if hasattr(Venta, sort_by):
            col = getattr(Venta, sort_by)
        elif sort_by == "cliente_nombre":
            col = Cliente.nombre
        elif sort_by == "usuario_nombre":
            col = Usuario.nombre

    if col is not None:
        statement = statement.order_by(
            asc(col) if sort_order == "asc" else desc(col)
        )
    else:
        statement = statement.order_by(desc(Venta.fecha))

    # Paginación
    statement = statement.offset(offset).limit(page_size)

    ventas = db.exec(statement).all()

    return PagedResponse(
        total=total,
        page_size=page_size,
        current_page=page,
        total_pages=total_pages,
        items=ventas
    )


def update_venta(db: Session, venta_id: int, venta_data: VentaUpdate) -> VentaUpdateRead:
    """Actualiza una venta existente."""
    venta = db.exec(
        select(Venta).where(Venta.id == venta_id)
        .options(selectinload(Venta.cliente))
        ).first()
    if not venta:
        raise HTTPException(status_code=404, detail="Venta no encontrada")

    if venta_data.cliente_id is not None:
        cliente = db.exec(
            select(Cliente).where(Cliente.id == venta_data.cliente_id)
        ).first()
        if not cliente:
            raise HTTPException(status_code=404, detail="Cliente no encontrado")
        venta.cliente_id = cliente.id
    if venta_data.estado is not None:
        venta.estado = venta_data.estado

    db.add(venta)
    db.commit()
    db.refresh(venta)
    return venta


def delete_venta(db: Session, venta_id: int, current_user: Usuario) -> bool:
    """
    Elimina una venta y todos sus detalles,
    devolviendo el stock al inventario.
    """
    # Cargar venta con detalles y productos
    venta = db.exec(
        select(Venta)
        .options(
            selectinload(Venta.detalle_ventas)
        )
        .where(Venta.id == venta_id)
    ).first()

    if not venta:
        raise HTTPException(status_code=404, detail="Venta no encontrada")
    
    if venta.detalle_ventas:
        raise HTTPException(status_code=400, detail="No se puede eliminar, tiene relaciones activas")

    # Eliminar la venta
    db.delete(venta)
    db.commit()
    
    return True


def get_venta_by_cliente_id(db: Session, cliente_id: int) -> List[Venta]:
    """Obtiene todas las ventas de un cliente específico."""
    ventas = db.exec(
        select(Venta).where(Venta.cliente_id == cliente_id)
        .options(
            selectinload(Venta.cliente),
            selectinload(Venta.usuario)
        )
    ).all()
    if not ventas:
        raise HTTPException(status_code=404, detail="No se encontraron ventas para este cliente")
    return ventas


def get_numero_ventas_ultimos_30_dias(db: Session) -> VentaTotalResponse:
    """
    Devuelve el número de ventas en los últimos 30 días.
    """
    fecha_limite = datetime.now(timezone.utc) - timedelta(days=30)

    total = db.exec(
        select(func.count(Venta.id))
        .where(Venta.fecha >= fecha_limite)
    ).one_or_none()

    cantidad = total if total and total is not None else 0

    return VentaTotalResponse(total=cantidad)


def change_estado_venta(db: Session, venta_id: int) -> VentaDetailRead:
    """Desactiva un venta en la base de datos."""
    venta = db.get(Venta, venta_id)
    
    if not venta:
        raise HTTPException(status_code=404, detail="Venta no encontrado")

    # Alternar el estado del usuario
    venta.estado = not venta.estado

    db.commit()
    db.refresh(venta)

    return venta

# CRUD para DetalleVenta

def add_detalle_venta(db: Session, venta_id: int, detalle_data: DetalleVentaCreate, current_user: Usuario) -> Venta:
    """Agrega un nuevo detalle a una venta, actualiza inventario, total y registra el movimiento."""

    # 1. Obtener inventario del producto
    inventario = db.exec(
        select(Inventario)
        .where(Inventario.producto_id == detalle_data.producto_id)
        .options(selectinload(Inventario.producto))
    ).first()
    
    venta = db.exec(
        select(Venta)
        .where(Venta.id == venta_id)
    ).first()
    
    if not venta.estado:
        raise HTTPException(status_code=400, detail="Venta inactiva")

    producto_nombre = inventario.producto.nombre if inventario and inventario.producto else f"ID {detalle_data.producto_id}"
    
    if not inventario:
        raise HTTPException(status_code=404, detail=f"Inventario no encontrado para producto={producto_nombre}")
    
    if not inventario.estado or not inventario.producto.estado:
        raise HTTPException(status_code=400, detail=f"Producto: {producto_nombre} inactivo")

    # 2. Validar stock
    if inventario.cantidad < detalle_data.cantidad:
        raise HTTPException(
            status_code=400,
            detail=f"Stock insuficiente para producto={producto_nombre}. Disponible: {inventario.cantidad}, requerido: {detalle_data.cantidad}"
        )

    # Si no se especifica precio unitario, usar el del producto
    if detalle_data.precio_unitario is None:
        precio = inventario.producto.precio_unitario
    else:
        precio = detalle_data.precio_unitario
    
    # 3. Crear nuevo detalle
    nuevo_detalle = DetalleVenta( 
        venta_id=venta_id,
        producto_id=detalle_data.producto_id,
        cantidad=detalle_data.cantidad,
        precio_unitario=precio
    )

    # 4. Actualizar inventario
    inventario.cantidad -= detalle_data.cantidad

    # 5. Actualizar total de la venta
    venta = db.exec(select(Venta).where(Venta.id == venta_id)).first()
    if not venta:
        raise HTTPException(status_code=404, detail="Venta no encontrada")

    venta.total = (venta.total or Decimal(0)) + Decimal(precio * detalle_data.cantidad)

    # 6. Registrar movimiento de inventario
    movimiento = MovimientoInventario(
        producto_id=detalle_data.producto_id,
        tipo=TipoMovimientoEnum.VENTA,
        cantidad=detalle_data.cantidad,
        cantidad_inventario=inventario.cantidad,
        fecha=datetime.now(timezone.utc),
        usuario_id=current_user.id,
        venta_id=venta_id 
    )

    # 7. Guardar cambios
    db.add(nuevo_detalle)
    db.add(inventario)
    db.add(venta)
    db.add(movimiento)
    db.commit()

    # 8. Recargar la venta con todos los datos
    venta = db.exec(
        select(Venta)
        .options(
            selectinload(Venta.detalle_ventas).selectinload(DetalleVenta.producto),
            selectinload(Venta.cliente),
            selectinload(Venta.usuario)
        )
        .where(Venta.id == venta_id)
    ).first()

    return venta


def update_detalle_venta(db: Session, detalle_id: int, detalle_data: DetalleVentaUpdate, current_user: Usuario) -> Venta:
    """Actualiza un detalle de venta, ajusta inventario, total y registra movimientos."""

    # 1. Obtener el detalle existente
    detalle = db.exec(
        select(DetalleVenta)
        .where(DetalleVenta.id == detalle_id)
        .options(selectinload(DetalleVenta.producto), selectinload(DetalleVenta.venta))
    ).first()

    if not detalle:
        raise HTTPException(status_code=404, detail="Detalle de venta no encontrado")

    venta = detalle.venta
    if not venta:
        raise HTTPException(status_code=404, detail="Venta asociada no encontrada")
    
    if not venta.estado:
        raise HTTPException(satatus_code=400, detail="Venta inactiva")
    
    producto = detalle.producto
    if not producto.estado:
        raise HTTPException(status_code=400, detail=f"Producto: {producto.nombre} inactivo")

    inventario = db.exec(
        select(Inventario).where(Inventario.producto_id == detalle.producto_id)
    ).first()

    if not inventario:
        raise HTTPException(status_code=404, detail="Inventario no encontrado para producto actual")

    cantidad_original = detalle.cantidad
    nueva_cantidad = detalle_data.cantidad if detalle_data.cantidad is not None else cantidad_original

    # 2. Si cambia de producto
    if detalle_data.producto_id and detalle_data.producto_id != detalle.producto_id:
        # Devolver stock original y registrar movimiento
        inventario.cantidad += cantidad_original
        db.add(inventario)
        db.add(MovimientoInventario(
            producto_id=detalle.producto_id,
            tipo=TipoMovimientoEnum.ANULACIÓN_VENTA,
            cantidad=cantidad_original,
            cantidad_inventario=inventario.cantidad,
            fecha=datetime.now(timezone.utc),
            usuario_id=current_user.id,
            venta_id=venta.id
        ))

        # Restar stock del nuevo producto y registrar movimiento
        nuevo_inventario = db.exec(
            select(Inventario).where(Inventario.producto_id == detalle_data.producto_id)
        ).first()
        if not nuevo_inventario:
            raise HTTPException(status_code=404, detail="Inventario no encontrado para nuevo producto")

        if nuevo_inventario.cantidad < nueva_cantidad:
            raise HTTPException(status_code=400, detail="Stock insuficiente para el nuevo producto")

        nuevo_inventario.cantidad -= nueva_cantidad
        db.add(nuevo_inventario)
        db.add(MovimientoInventario(
            producto_id=detalle_data.producto_id,
            tipo=TipoMovimientoEnum.VENTA,
            cantidad=nueva_cantidad,
            cantidad_inventario=nuevo_inventario.cantidad,
            fecha=datetime.now(timezone.utc),
            usuario_id=current_user.id,
            venta_id=venta.id
        ))

        detalle.producto_id = detalle_data.producto_id

    else:
        # 3. Si es el mismo producto y cambia cantidad
        diferencia_cantidad = nueva_cantidad - cantidad_original
        if diferencia_cantidad > 0:
            if inventario.cantidad < diferencia_cantidad:
                raise HTTPException(status_code=400, detail="Stock insuficiente para incrementar cantidad")
            inventario.cantidad -= diferencia_cantidad
            db.add(MovimientoInventario(
                producto_id=detalle.producto_id,
                tipo=TipoMovimientoEnum.VENTA,
                cantidad=diferencia_cantidad,
                cantidad_inventario=inventario.cantidad,
                fecha=datetime.now(timezone.utc),
                usuario_id=current_user.id,
                venta_id=venta.id
            ))
        elif diferencia_cantidad < 0:
            inventario.cantidad += abs(diferencia_cantidad)
            db.add(MovimientoInventario(
                producto_id=detalle.producto_id,
                tipo=TipoMovimientoEnum.ANULACIÓN_VENTA,
                cantidad=abs(diferencia_cantidad),
                cantidad_inventario=inventario.cantidad,
                fecha=datetime.now(timezone.utc),
                usuario_id=current_user.id,
                venta_id=venta.id
            ))
        db.add(inventario)

    # 4. Actualizar campos del detalle
    if detalle_data.cantidad is not None:
        detalle.cantidad = nueva_cantidad
    if detalle_data.precio_unitario is not None:
        detalle.precio_unitario = detalle_data.precio_unitario

    # 5. Recalcular total
    venta.total = sum(
        d.precio_unitario * d.cantidad for d in venta.detalle_ventas
    )

    db.add(detalle)
    db.add(venta)
    db.commit()

    # 6. Recargar venta completa para respuesta
    venta = db.exec(
        select(Venta)
        .options(
            selectinload(Venta.detalle_ventas).selectinload(DetalleVenta.producto),
            selectinload(Venta.cliente),
            selectinload(Venta.usuario)
        )
        .where(Venta.id == venta.id)
    ).first()

    return venta


def delete_detalle_venta(db: Session, detalle_id: int, current_user: Usuario) -> Venta:
    """Elimina un detalle de venta, devuelve el stock, recalcula el total y registra el movimiento."""

    # 1. Obtener el detalle existente
    detalle = db.exec(
        select(DetalleVenta)
        .where(DetalleVenta.id == detalle_id)
        .options(selectinload(DetalleVenta.producto), selectinload(DetalleVenta.venta))
    ).first()

    if not detalle:
        raise HTTPException(status_code=404, detail="Detalle de venta no encontrado")

    venta = detalle.venta
    if not venta:
        raise HTTPException(status_code=404, detail="Venta asociada no encontrada")
    
    if not venta.estado:
        raise HTTPException(satatus_code=400, detail="Venta inactiva")

    # 2. Devolver stock del producto
    inventario = db.exec(
        select(Inventario).where(Inventario.producto_id == detalle.producto_id)
    ).first()
    if inventario:
        inventario.cantidad += detalle.cantidad
        db.add(inventario)

    # 3. Registrar movimiento de inventario (anulación de venta)
    movimiento = MovimientoInventario(
        producto_id=detalle.producto_id,
        tipo=TipoMovimientoEnum.ANULACIÓN_VENTA,
        cantidad=detalle.cantidad,
        cantidad_inventario=inventario.cantidad,
        fecha=datetime.now(timezone.utc),
        usuario_id=current_user.id,
        venta_id=venta.id
    )
    db.add(movimiento)

    # 4. Eliminar detalle de la venta
    db.delete(detalle)

    # 5. Recalcular total de la venta
    venta.total = sum(
        d.precio_unitario * d.cantidad
        for d in venta.detalle_ventas
        if d.id != detalle_id  # evitar usar el detalle eliminado
    )

    db.add(venta)
    db.commit()

    # 6. Recargar venta completa para respuesta
    venta = db.exec(
        select(Venta)
        .options(
            selectinload(Venta.detalle_ventas).selectinload(DetalleVenta.producto),
            selectinload(Venta.cliente),
            selectinload(Venta.usuario)
        )
        .where(Venta.id == venta.id)
    ).first()

    return venta


def get_detalles_venta_by_venta_id(
    venta_id: int,
    db: Session,
    search: Optional[str] = None,
    page: int = 1,
    page_size: int = 10,
    sort_by: Optional[str] = None,
    sort_order: Optional[str] = "asc"
) -> PagedResponse[DetalleVentaRead]:
    """
    Obtiene ventas con filtros, búsqueda, paginación y ordenamiento dinámico.
    Filtros disponibles:
      - search: busca en nombre o código de producto.
    Soporta ordenamiento por:
      - Campos propios de detalle_venta.
      - producto_nombre (Usuario.nombre).
    """

    # Construir filtros comunes
    filters = []
    
    filters.append(DetalleVenta.venta_id == venta_id)

    if search:
        search_term = f"%{search}%"
        filters.append(
            or_(
                Producto.nombre.ilike(search_term),
                Producto.codigo.ilike(search_term)
            )
        )

    # Consulta para contar total
    count_stmt = (
        select(func.count(DetalleVenta.id))
        .join(DetalleVenta.producto)
    )
    if filters:
        count_stmt = count_stmt.where(*filters)

    total = db.exec(count_stmt).one()

    # Calcular páginas
    total_pages = (total + page_size - 1) // page_size if total > 0 else 1
    offset = (page - 1) * page_size

    # Consulta para obtener listado
    statement = (
        select(DetalleVenta)
        .options(
            selectinload(DetalleVenta.producto)
        )
        .join(DetalleVenta.producto)
    )

    if filters:
        statement = statement.where(*filters)

    # Ordenamiento dinámico
    col = None
    if sort_by:
        if hasattr(DetalleVenta, sort_by):
            col = getattr(DetalleVenta, sort_by)
        elif sort_by == "producto_nombre":
            col = Producto.nombre

    if col is not None:
        statement = statement.order_by(
            asc(col) if sort_order == "asc" else desc(col)
        )
    else:
        statement = statement.order_by(desc(DetalleVenta.id))

    # Paginación
    statement = statement.offset(offset).limit(page_size)

    detalles_venta = db.exec(statement).all()

    return PagedResponse(
        total=total,
        page_size=page_size,
        current_page=page,
        total_pages=total_pages,
        items=detalles_venta
    )


def get_detalle_venta_by_id(db: Session, detalle_id: int) -> DetalleVentaRead:
    """Obtiene un detalle venta por su ID."""
    detalle_venta = db.exec(
        select(DetalleVenta)
        .options(
            selectinload(DetalleVenta.producto)
        )
        .where(DetalleVenta.id == detalle_id)
    ).first()

    if not detalle_venta:
        raise HTTPException(status_code=404, detail="Venta no encontrada")
    return detalle_venta