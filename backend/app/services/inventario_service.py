from sqlmodel import Session, select
from sqlalchemy import func, literal, or_, asc, desc
from typing import List, Optional
from sqlalchemy.orm import selectinload

from app.models.inventario import Inventario
from app.models.movimiento_inventario import MovimientoInventario, TipoMovimientoEnum
from app.models.producto import Producto
from app.models.usuario import Usuario
from app.models.categoria import Categoria
from app.schemas.movimiento_inventario import (
    MovimientoInventarioCreate, 
    MovimientoInventarioDetailRead
)
from app.schemas.shared import PagedResponse
from app.core.config import settings
from app.schemas.inventario import InventarioCantidadCreate, InventarioReadDetail, InventarioRead, InventarioCantidadUpdate

from datetime import datetime, timezone
from fastapi import HTTPException



def get_inventarios(
    db: Session,
    page: int = 1,
    page_size: int = 10,
    search: Optional[str] = None,
    estado: Optional[bool] = None,
    sort_by: Optional[str] = None,
    sort_order: Optional[str] = "asc"
) -> PagedResponse[InventarioRead]:
    """Obtiene inventarios con productos asociados, con búsqueda, filtros, paginación y ordenamiento dinámico."""

    filters = []
    if search:
        filters.append(
            or_(
                Producto.nombre.ilike(f"%{search}%"),
                Producto.codigo.ilike(f"%{search}%")
            )
        )

    if estado is not None:
        filters.append(Inventario.estado == estado)

    # --- Conteo total ---
    count_stmt = select(func.count(Inventario.id)).join(Inventario.producto)
    if filters:
        count_stmt = count_stmt.where(*filters)

    total = db.exec(count_stmt).one()
    total_pages = (total + page_size - 1) // page_size if total > 0 else 1
    offset = (page - 1) * page_size

    # --- Listado ---
    statement = select(Inventario).join(Inventario.producto).options(
        selectinload(Inventario.producto)
    )
    if filters:
        statement = statement.where(*filters)

    # Ordenamiento dinámico
    col = None
    if sort_by:
        # Verificamos si el campo existe en Inventario o Producto
        if hasattr(Inventario, sort_by):
            col = getattr(Inventario, sort_by)
        elif hasattr(Producto, sort_by):
            col = getattr(Producto, sort_by)

    if col is not None:
        statement = statement.order_by(
            asc(col) if sort_order == "asc" else desc(col)
        )
    else:
        # Orden por defecto: nombre del producto
        statement = statement.order_by(asc(Producto.nombre))

    # Paginación
    statement = statement.offset(offset).limit(page_size)

    items = db.exec(statement).all()

    return PagedResponse(
        total=total,
        page_size=page_size,
        current_page=page,
        total_pages=total_pages,
        items=items
    )


def get_inventario_by_product_id(db: Session, producto_id: int) -> InventarioReadDetail:
    """Obtener inventario por ID de producto."""
    statement = (
        select(Inventario)
        .where(Inventario.producto_id == producto_id)
        .options(selectinload(Inventario.producto)
                 .selectinload(Producto.categoria)
                 )
    )
    return db.exec(statement).first()


def register_inventario(db: Session, data: InventarioCantidadCreate) -> InventarioReadDetail:
    """Registrar un nuevo inventario."""
    producto_id = data.producto_id
    
    inventario_existente = get_inventario_by_product_id(db, producto_id)
    if inventario_existente:
        raise HTTPException(status_code=400, detail="El producto ya se encuentra en el inventario.")
    
    producto = db.get(Producto, producto_id)
    
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    if not producto.estado:
        raise HTTPException(status_code=400, detail="El producto se encuentra inactivo")
    
    nuevo = Inventario(producto_id=producto_id, cantidad=data.cantidad, cantidad_minima=data.cantidad_minima)
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo


def register_entrada(
    db: Session,
    data: MovimientoInventarioCreate,
    current_user: Usuario
):
    """Registrar una entrada de inventario."""
    producto_id = data.producto_id
    cantidad = data.cantidad

    inventario = get_inventario_by_product_id(db, producto_id)
    if not inventario:
        raise HTTPException(status_code=404, detail="Producto no encontrado en inventario")
    
    if not inventario.estado:
        raise HTTPException(status_code=400, detail="El producto está inactivo")

    inventario.cantidad += cantidad

    movimiento = MovimientoInventario(
        tipo=TipoMovimientoEnum.ENTRADA,
        cantidad=cantidad,
        cantidad_inventario=inventario.cantidad,
        producto_id=producto_id,
        usuario_id=current_user.id, 
        fecha=datetime.now(timezone.utc)
    )

    db.add(movimiento)
    db.commit()
    db.refresh(inventario)
    db.refresh(movimiento)
    
    return movimiento


def register_salida(
    db: Session,
    data: MovimientoInventarioCreate,
    current_user: Usuario
):
    """Registrar una salida de inventario."""
    producto_id = data.producto_id
    cantidad = data.cantidad

    inventario = get_inventario_by_product_id(db, producto_id)
    if not inventario:
        raise HTTPException(status_code=404, detail="Producto no encontrado en inventario")
    
    if not inventario.estado:
        raise HTTPException(status_code=400, detail="El producto está inactivo")

    if inventario.cantidad < cantidad:
        raise HTTPException(status_code=400, detail="Stock insuficiente")
    

    inventario.cantidad -= cantidad

    movimiento = MovimientoInventario(
        producto_id=producto_id,
        tipo=TipoMovimientoEnum.SALIDA,
        cantidad=cantidad,
        cantidad_inventario=inventario.cantidad,
        usuario_id=current_user.id, 
        fecha=datetime.now(timezone.utc)
    )

    db.add(movimiento)
    db.commit()
    db.refresh(inventario)
    db.refresh(movimiento)
    return movimiento


def get_historial_movimientos_by_producto(
    db: Session,
    producto_id: int,
    page: int = 1,
    page_size: int = 10,
    tipo: Optional[TipoMovimientoEnum] = None
) -> PagedResponse[MovimientoInventarioDetailRead]:
    """Obtener historial paginado de movimientos de inventario por producto con filtro opcional por tipo."""

    offset = (page - 1) * page_size

    # Base query
    statement = select(MovimientoInventario).where(
        MovimientoInventario.producto_id == producto_id
    )

    # Filtro por tipo de movimiento
    if tipo:
        statement = statement.where(MovimientoInventario.tipo == tipo)

    # Total de movimientos filtrados
    total = db.exec(
        statement.with_only_columns(func.count()).order_by(None)
    ).one()

    total_pages = (total + page_size - 1) // page_size if total > 0 else 1

    movimientos = db.exec(
        statement
        .options(
            selectinload(MovimientoInventario.usuario),
            selectinload(MovimientoInventario.producto)
        )
        .order_by(MovimientoInventario.fecha.desc())
        .offset(offset)
        .limit(page_size)
    ).all()

    items = [
        MovimientoInventarioDetailRead(
            id=m.id,
            tipo=m.tipo,
            cantidad=m.cantidad,
            venta_id=m.venta_id,
            producto=m.producto,
            usuario=m.usuario,
            cantidad_inventario=m.cantidad_inventario,
            fecha=m.fecha
        )
        for m in movimientos
    ]

    return PagedResponse(
        total=total,
        page_size=page_size,
        current_page=page,
        total_pages=total_pages,
        items=items
    )


def get_historial_movimientos_by_usuario(
    db: Session,
    usuario_id: int,
    page: int = 1,
    page_size: int = 10,
    tipo: Optional[TipoMovimientoEnum] = None
) -> PagedResponse[MovimientoInventarioDetailRead]:
    """Obtener historial paginado de movimientos de un usuario con filtro opcional por tipo."""
    offset = (page - 1) * page_size

    # Base query
    statement = select(MovimientoInventario).where(
        MovimientoInventario.usuario_id == usuario_id
    )

    # Filtro por tipo de movimiento
    if tipo:
        statement = statement.where(MovimientoInventario.tipo == tipo)

    # Total de registros filtrados
    total = db.exec(
        statement.with_only_columns(func.count()).order_by(None)
    ).one()

    # Movimientos filtrados y paginados
    movimientos = db.exec(
        statement
        .options(
            selectinload(MovimientoInventario.usuario),
            selectinload(MovimientoInventario.producto)
        )
        .order_by(MovimientoInventario.fecha.desc())
        .offset(offset)
        .limit(page_size)
    ).all()

    items = [
        MovimientoInventarioDetailRead(
            id=m.id,
            tipo=m.tipo,
            cantidad=m.cantidad,
            venta_id=m.venta_id,
            producto=m.producto,
            usuario=m.usuario,
            cantidad_inventario=m.cantidad_inventario,
            fecha=m.fecha
        )
        for m in movimientos
    ]

    total_pages = (total + page_size - 1) // page_size if total > 0 else 1

    return PagedResponse(
        total=total,
        page_size=page_size,
        current_page=page,
        total_pages=total_pages,
        items=items
    )


def get_movimientos_inventario(
    db: Session,
    page: int = 1,
    page_size: int = 50,
    tipo: Optional[TipoMovimientoEnum] = None,
    search: Optional[str] = None,
    sort_by: Optional[str] = None,
    sort_order: Optional[str] = "asc"
) -> PagedResponse[MovimientoInventarioDetailRead]:
    """Obtener movimientos de inventario con búsqueda, filtros, paginación y orden dinámico."""

    filters = []
    joins = []

    # --- Filtro por tipo de movimiento ---
    if tipo:
        filters.append(MovimientoInventario.tipo == tipo)

    # --- Filtro de búsqueda ---
    if search:
        filters.append(
            or_(
                Usuario.nombre.ilike(f"%{search}%"),     
                Producto.nombre.ilike(f"%{search}%"),     
                Producto.codigo.ilike(f"%{search}%")
            )
        )
        joins.extend([MovimientoInventario.usuario, MovimientoInventario.producto])

    # --- Query base ---
    base_query = select(MovimientoInventario)

    # Aplicar joins si se necesitan para búsqueda u ordenamiento
    if joins:
        for rel in joins:
            base_query = base_query.join(rel)

    if filters:
        base_query = base_query.where(*filters)

    # --- Conteo total separado ---
    count_stmt = base_query.with_only_columns(func.count(MovimientoInventario.id)).order_by(None)
    total = db.exec(count_stmt).one()
    total_pages = (total + page_size - 1) // page_size if total > 0 else 1
    offset = (page - 1) * page_size

    # --- Query para items ---
    stmt_items = select(MovimientoInventario).options(
        selectinload(MovimientoInventario.usuario),
        selectinload(MovimientoInventario.producto)
    )

    if joins:
        for rel in joins:
            stmt_items = stmt_items.join(rel)

    if filters:
        stmt_items = stmt_items.where(*filters)

    # --- Ordenamiento dinámico ---
    col = None
    if sort_by:
        if hasattr(MovimientoInventario, sort_by):
            col = getattr(MovimientoInventario, sort_by)
        elif sort_by == "usuario_nombre":
            stmt_items = stmt_items.join(MovimientoInventario.usuario)
            col = Usuario.nombre
        elif sort_by == "producto_nombre":
            stmt_items = stmt_items.join(MovimientoInventario.producto)
            col = Producto.nombre

    if col is not None:
        stmt_items = stmt_items.order_by(
            asc(col) if sort_order == "asc" else desc(col)
        )
    else:
        # Orden por defecto: fecha desc
        stmt_items = stmt_items.order_by(desc(MovimientoInventario.fecha))

    # Paginación
    stmt_items = stmt_items.offset(offset).limit(page_size)

    movimientos = db.exec(stmt_items).all()

    # --- Mapeo a esquema ---
    items = [
        MovimientoInventarioDetailRead(
            id=m.id,
            tipo=m.tipo,
            cantidad=m.cantidad,
            venta_id=m.venta_id,
            producto=m.producto,
            usuario=m.usuario,
            cantidad_inventario=m.cantidad_inventario,
            fecha=m.fecha
        )
        for m in movimientos
    ]

    return PagedResponse(
        total=total,
        page_size=page_size,
        current_page=page,
        total_pages=total_pages,
        items=items
    )


def get_inventarios_stock_bajo(
    db: Session,
    search: Optional[str] = None,
    page: int = 1,
    page_size: int = 10,
    sort_by: Optional[str] = None,
    sort_order: Optional[str] = "asc"
) -> PagedResponse[InventarioReadDetail]:
    """Retorna inventarios con stock por debajo del mínimo, con paginación y búsqueda."""

    # Filtros comunes
    filters = [
        Inventario.cantidad < func.coalesce(
            Inventario.cantidad_minima, literal(settings.STOCK_MINIMO)
        )
    ]

    if search:
        filters.append(
            or_(
                Producto.nombre.ilike(f"%{search}%"),
                Producto.codigo.ilike(f"%{search}%")
            )
        )

    # --- Consulta para contar total ---
    count_stmt = select(func.count(Inventario.id)).join(Inventario.producto)
    if filters:
        count_stmt = count_stmt.where(*filters)

    total = db.exec(count_stmt).one()

    # Calcular total_pages y offset
    total_pages = (total + page_size - 1) // page_size if total > 0 else 1
    offset = (page - 1) * page_size

    # --- Consulta para obtener datos con joins y relaciones ---
    statement = (
        select(Inventario)
        .join(Inventario.producto)
        .options(selectinload(Inventario.producto).selectinload(Producto.categoria))
    )

    if filters:
        statement = statement.where(*filters)

    # Ordenar
    if sort_by:
        col = None

        if hasattr(Inventario, sort_by):
            col = getattr(Inventario, sort_by)
        elif hasattr(Producto, sort_by):
            col = getattr(Producto, sort_by)
        elif sort_by == "categoria_nombre":
            statement = statement.join(Producto.categoria)
            col = Categoria.nombre

        if col is not None:
            statement = statement.order_by(
                asc(col) if sort_order == "asc" else desc(col)
            )

    # Paginación
    statement = statement.offset(offset).limit(page_size)

    items = db.exec(statement).all()

    return PagedResponse(
        total=total,
        page_size=page_size,
        current_page=page,
        total_pages=total_pages,
        items=items
    )


def update_inventario(
    db: Session, 
    inventario_id: int, 
    data: InventarioCantidadUpdate,
    current_user: Usuario
) -> InventarioRead:
    """Actualizar un inventario existente y registrar movimiento si cambia la cantidad."""
    inventario = db.exec(
        select(Inventario)
        .where(Inventario.id == inventario_id)
        .options(selectinload(Inventario.producto))
    ).first()
    if not inventario:
        raise HTTPException(status_code=404, detail="Inventario no encontrado")

    if not inventario.estado and data.estado == False:
        raise HTTPException(status_code=400, detail="El inventario del producto está inactivo")
    
    # Guardar valores previos para comparar
    cantidad_anterior = inventario.cantidad
    
    # Cambiar estado
    if data.estado is not None:
        inventario.estado = data.estado

    # Validar y actualizar cantidad mínima
    if data.cantidad_minima is not None:
        if data.cantidad_minima < 0:
            raise HTTPException(status_code=400, detail="La cantidad mínima no puede ser negativa")
        inventario.cantidad_minima = data.cantidad_minima

    # Validar y actualizar cantidad (con registro de movimiento si cambia)
    if data.cantidad is not None:
        if data.cantidad < 0:
            raise HTTPException(status_code=400, detail="La cantidad no puede ser negativa")

        if data.cantidad != cantidad_anterior:
            diferencia = data.cantidad - cantidad_anterior
            tipo_movimiento = (
                TipoMovimientoEnum.ENTRADA_EDICIÓN if diferencia > 0 else TipoMovimientoEnum.SALIDA_EDICIÓN
            )

            movimiento = MovimientoInventario(
                tipo=tipo_movimiento,
                cantidad=abs(diferencia),
                cantidad_inventario=data.cantidad,
                producto_id=inventario.producto_id,
                usuario_id=current_user.id,
                fecha=datetime.now(timezone.utc)
            )
            db.add(movimiento)

        inventario.cantidad = data.cantidad

    db.add(inventario)
    db.commit()
    db.refresh(inventario)

    return inventario


def change_estado_inventario(db: Session, inventario_id: int) -> InventarioReadDetail:
    """Desactiva un inventario en la base de datos."""
    inventario = db.get(Inventario, inventario_id)
    
    if not inventario:
        raise HTTPException(status_code=404, detail="Inventario no encontrado")

    # Alternar el estado del usuario
    inventario.estado = not inventario.estado
    
    # Sincronizar producto si existe
    producto = inventario.producto
    if producto:
        producto.estado = inventario.estado

    db.commit()
    db.refresh(inventario)
    return inventario


def get_inventario_by_id(db: Session, inventario_id: int) -> Optional[InventarioRead]:
    """Obtiene un inventario por su ID."""
    statement = (
        select(Inventario)
        .options(selectinload(Inventario.producto))
        .where(Inventario.id == inventario_id)
    )
    return db.exec(statement).first()


def get_movimiento_by_id(db: Session, movimiento_inventario_id: int) -> Optional[MovimientoInventarioDetailRead]:
    """Obtiene un movimiento por su ID."""
    statement = (
        select(MovimientoInventario)
        .options(selectinload(MovimientoInventario.producto),
                 selectinload(MovimientoInventario.usuario)
                 )
        .where(MovimientoInventario.id == movimiento_inventario_id)
    )
    return db.exec(statement).first()