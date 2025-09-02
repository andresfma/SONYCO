from typing import Optional, List
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, asc, desc
from sqlmodel import select, col
from app.models.categoria import Categoria
from app.schemas.categoria import (
    CategoriaCreate,
    CategoriaUpdate,
    CategoriaDetailRead,
    CategoriaSimpleRead
)
from app.schemas.shared import PagedResponse 
from app.core.config import settings


def get_categoria_by_id(db: Session, categoria_id: int) -> Optional[Categoria]:
    """Obtiene una categoría por su ID."""
    return db.get(Categoria, categoria_id)


def create_categoria(db: Session, categoria_create: CategoriaCreate) -> CategoriaDetailRead:
    """Crea una nueva categoría si no existe una con el mismo nombre."""
    existente = db.exec(
        select(Categoria).where(Categoria.nombre == categoria_create.nombre)
    ).first()

    if existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ya existe una categoría con el nombre '{categoria_create.nombre}'."
        )

    categoria = Categoria.model_validate(categoria_create)
    db.add(categoria)
    db.commit()
    db.refresh(categoria)
    return categoria


def update_categoria(db: Session, categoria_id: int, categoria_update: CategoriaUpdate) -> CategoriaDetailRead:
    """Actualiza una categoría existente por su ID."""
    categoria = get_categoria_by_id(db, categoria_id)
    if not categoria:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Categoría no encontrada."
        )

    # Validar si se intenta cambiar el nombre por uno existente
    if categoria_update.nombre and categoria_update.nombre != categoria.nombre:
        existente = db.exec(
            select(Categoria).where(Categoria.nombre == categoria_update.nombre)
        ).first()
        if existente:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ya existe una categoría con ese nombre."
            )

    for field, value in categoria_update.model_dump(exclude_unset=True).items():
        setattr(categoria, field, value)

    db.commit()
    db.refresh(categoria)
    return categoria


def delete_categoria(db: Session, categoria_id: int) -> bool:
    """Elimina un categoria por su ID."""
    categoria = db.get(Categoria, categoria_id)
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoria no encontrado")

    # Relaciones que bloquean el borrado
    if categoria.productos:
        raise HTTPException(status_code=400, detail="No se puede eliminar, tiene relaciones activas")

    # Eliminar el categoria
    db.delete(categoria)
    db.commit()

    return True


def get_categorias(
    db: Session,
    page: int = 1,
    page_size: int = 50,
    search: Optional[str] = None,
    estado: Optional[bool] = None,
    sort_by: Optional[str] = None,
    sort_order: Optional[str] = "asc"
) -> PagedResponse[CategoriaDetailRead]:
    """Obtiene todas las categorías con búsqueda por nombre, filtros, paginación y ordenamiento dinámico."""
    
    filters = []
    if search:
        filters.append(Categoria.nombre.ilike(f"%{search}%"))

    if estado is not None:
        filters.append(Categoria.estado == estado)

    # --- Conteo total ---
    count_stmt = select(func.count(Categoria.id))
    if filters:
        count_stmt = count_stmt.where(*filters)

    total = db.exec(count_stmt).one()

    total_pages = (total + page_size - 1) // page_size if total > 0 else 1
    offset = (page - 1) * page_size

    # --- Listado ---
    statement = select(Categoria)

    if filters:
        statement = statement.where(*filters)

    # Ordenamiento dinámico
    col = None
    if sort_by:
        if hasattr(Categoria, sort_by):
            col = getattr(Categoria, sort_by)

    if col is not None:
        statement = statement.order_by(
            asc(col) if sort_order == "asc" else desc(col)
        )
    else:
        # Orden por defecto
        statement = statement.order_by(asc(Categoria.nombre))

    # Paginación
    statement = statement.offset(offset).limit(page_size)

    categorias = db.exec(statement).all()

    return PagedResponse(
        total=total,
        page_size=page_size,
        current_page=page,
        total_pages=total_pages,
        items=categorias
    )


def change_estado_categoria(db: Session, categoria_id: int) -> CategoriaDetailRead:
    """Desactiva una categoria en la base de datos."""
    categoria = db.get(Categoria, categoria_id)
    
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoria no encontrado")

    # Alternar el estado del usuario
    categoria.estado = not categoria.estado

    db.commit()
    db.refresh(categoria)

    return CategoriaDetailRead.model_validate(categoria)


def get_categorias_infinito(
    db: Session,
    skip: int = 0,     
    limit: int = 50,
    search: Optional[str] = None
) -> List[CategoriaSimpleRead]:
    """
    Obtiene categorías activas para infinite scroll.
    Devuelve solo id y nombre.
    """
    statement = select(Categoria)
    
    #filtro nombre
    if search:
        statement = statement.where(Categoria.nombre.ilike(f"%{search}%"))

    # Solo entidades activas
    statement = statement.where(Categoria.estado == True)

    # Orden alfabetico por nombre
    statement = statement.order_by(Categoria.nombre).offset(skip).limit(limit)

    rows = db.exec(statement).all()

    return [CategoriaSimpleRead.model_validate(row) for row in rows]