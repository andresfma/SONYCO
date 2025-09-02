from fastapi import HTTPException, status
from sqlmodel import Session, select
from sqlalchemy.orm import selectinload
from typing import Optional
from sqlalchemy import func, or_, asc, desc, exists
from typing import List, Optional
from app.models.producto import Producto
from app.models.categoria import Categoria
from app.models.inventario import Inventario
from app.schemas.producto import (
    ProductoCreate, 
    ProductoUpdate, 
    ProductoTotalResponse, 
    ProductoDetailRead,
    ProductoRead,
    ProductoSimpleRead,
    ProductoInfinito
)
from app.services.inventario_service import get_inventario_by_product_id
from app.schemas.shared import PagedResponse


def get_productos(
    db: Session,
    search: Optional[str] = None,
    categoria: Optional[str] = None,
    page: int = 1,
    page_size: int = 10,
    estado: Optional[bool] = None,
    sort_by: Optional[str] = None,
    sort_order: Optional[str] = "asc"
) -> PagedResponse[ProductoRead]:
    """
    Obtiene productos con filtros, paginación y ordenamiento.
    Filtros disponibles:
      - search: busca en nombre y código.
      - categoria: filtra por categoria.
      - estado: filtra por estado activo/inactivo.
    Soporta ordenamiento dinámico mediante sort_by y sort_order.
    """

    # Construir filtros comunes para ambas consultas     
    filters = []

    if search:
        filters.append(
            or_(
                Producto.nombre.ilike(f"%{search}%"),
                Producto.codigo.ilike(f"%{search}%")
            )
        )

    if estado is not None:
        filters.append(Producto.estado == estado)

    # Consulta para contar total
    count_stmt = select(func.count(Producto.id))
    if categoria:
        count_stmt = count_stmt.join(Producto.categoria).where(Categoria.nombre.ilike(f"%{categoria}%"))
    if filters:
        count_stmt = count_stmt.where(*filters)
    total = db.exec(count_stmt).one()

    # Calcular páginas
    total_pages = (total + page_size - 1) // page_size if total > 0 else 1
    offset = (page - 1) * page_size

    # Consulta para obtener items con joins y relaciones
    statement = select(Producto).options(selectinload(Producto.categoria))

    if categoria:
        statement = statement.join(Producto.categoria).where(Categoria.nombre.ilike(f"%{categoria}%"))
    if filters:
        statement = statement.where(*filters)

    # Orden
    if sort_by:
        col = None

        if hasattr(Producto, sort_by):
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

    productos = db.exec(statement).all()

    return PagedResponse(
        total=total,
        page_size=page_size,
        current_page=page,
        total_pages=total_pages,
        items=productos
    )


def get_numero_total_productos(db: Session) -> ProductoTotalResponse:
    """
    Devuelve el número total de productos registrados.
    """
    total = db.exec(
        select(func.count(Producto.id))
    ).one_or_none()

    cantidad = total if total and total is not None else 0

    return ProductoTotalResponse(total=cantidad)


def get_producto_by_code(db: Session, code: str) -> Optional[ProductoDetailRead]:
    """Obtiene un producto por su código."""
    return db.exec(
        select(Producto)
        .where(Producto.codigo == code)
        .options(selectinload(Producto.categoria))
        ).first()


def get_producto_by_id(db: Session, producto_id: int) -> Optional[ProductoDetailRead]:
    """Obtiene un producto por su ID con la relación categoria precargada."""
    statement = (
        select(Producto)
        .options(selectinload(Producto.categoria))
        .where(Producto.id == producto_id)
    )
    return db.exec(statement).first() 

 
def create_producto(db: Session, producto_create: ProductoCreate) -> ProductoDetailRead:
    """Crea un nuevo producto, validando que no exista por código."""
    
    # Verificar si ya existe un producto con el mismo código
    existente = get_producto_by_code(db, producto_create.codigo)
    if existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"El producto con código '{producto_create.codigo}' ya existe."
        )
    
    producto = Producto.model_validate(producto_create)
    db.add(producto)
    db.commit()
    db.refresh(producto)
    
    # Volver a consultar el producto con la relación categoria precargada
    producto_con_categoria = db.exec(
        select(Producto)
        .options(selectinload(Producto.categoria))
        .where(Producto.id == producto.id)
    ).one()

    return producto_con_categoria


def update_producto(db: Session, producto_id: int, producto_update: ProductoUpdate) -> Optional[Producto]:
    """Actualiza un producto existente."""
    producto = db.get(Producto, producto_id)
    if not producto:
        return None
    
    if producto_update.codigo and producto_update.codigo != producto.codigo:
        # Verificar si ya existe otro producto con el mismo código
        existente = get_producto_by_code(db, producto_update.codigo)
        if existente:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"El producto con código '{producto_update.codigo}' ya existe."
            )

    update_data = producto_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(producto, key, value)

    db.add(producto)
    db.commit()
    db.refresh(producto)
    return producto


def delete_producto(db: Session, producto_id: int) -> bool:
    """Elimina un producto por su ID."""
    producto = db.exec(
        select(Producto)
        .where(Producto.id == producto_id)
        .options(
            selectinload(Producto.inventario),
            selectinload(Producto.detalles_venta),
            selectinload(Producto.movimientos)
            )
        ).first()
    
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    # Relaciones que bloquean el borrado
    if producto.inventario or producto.detalles_venta or producto.movimientos:
        raise HTTPException(status_code=400, detail="No se puede eliminar, tiene relaciones activas")

    # Eliminar el producto
    db.delete(producto)
    db.commit()

    return True


def change_estado_producto(db: Session, producto_id: int) -> ProductoDetailRead:
    """Desactiva un producto en la base de datos."""
    producto = db.get(Producto, producto_id)
    
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    # Alternar el estado del usuario
    producto.estado = not producto.estado
    
    # Sincronizar inventario si existe
    inventario = get_inventario_by_product_id(db, producto.id)
    if inventario:
        inventario.estado = producto.estado

    db.commit()
    db.refresh(producto)
    
    return ProductoDetailRead.model_validate(producto)


def get_productos_infinito_inventario(
    db: Session,
    skip: int = 0,
    limit: int = 50,
    search: Optional[str] = None
) -> List[ProductoInfinito]:
    """
    Obtiene productos activos para infinite scroll que no están en inventarios.
    Devuelve solo id y nombre, donde nombre = "[codigo]: [nombre]".
    """
    # Subquery: inventario con el mismo producto
    subq = select(1).where(Producto.id == Inventario.producto_id)

    statement = select(Producto)

    # filtro por nombre o código
    if search:
        statement = statement.where(
            or_(
                Producto.nombre.ilike(f"%{search}%"),
                Producto.codigo.ilike(f"%{search}%")
            )
        )

    # Solo entidades activas y sin inventario asociado
    statement = statement.where(
        Producto.estado == True,
        ~exists(subq)
    )

    # Orden alfabético por nombre
    statement = statement.order_by(Producto.nombre).offset(skip).limit(limit)

    rows = db.exec(statement).all()

    return [
        ProductoInfinito(
            id=row.id,
            nombre=f"{row.codigo}: {row.nombre}"
        )
        for row in rows
    ]
    

def get_productos_infinito_movimiento(
    db: Session,
    skip: int = 0,
    limit: int = 50,
    search: Optional[str] = None
) -> List[ProductoInfinito]:
    """
    Obtiene productos activos para infinite scroll.
    Devuelve solo id y nombre, donde nombre = "[codigo]: [nombre]".
    """

    statement = select(Producto)

    # filtro por nombre o código
    if search:
        statement = statement.where(
            or_(
                Producto.nombre.ilike(f"%{search}%"),
                Producto.codigo.ilike(f"%{search}%")
            )
        )

    # Solo entidades activas
    statement = statement.where(Producto.estado == True)

    # Orden alfabético por nombre
    statement = statement.order_by(Producto.nombre).offset(skip).limit(limit)

    rows = db.exec(statement).all()

    return [
        ProductoInfinito(
            id=row.id,
            nombre=f"{row.codigo}: {row.nombre}"
        )
        for row in rows
    ]
