from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Annotated, Optional, List

from app.schemas.categoria import (
    CategoriaCreate,
    CategoriaDetailRead,
    CategoriaUpdate,
    CategoriaSimpleRead
)
from app.services.categoria_service import (
    create_categoria,
    get_categoria_by_id,
    update_categoria,
    delete_categoria,
    get_categorias,
    change_estado_categoria,
    get_categorias_infinito
)
from app.schemas.shared import PagedResponse, ErrorResponse
from app.db.session import get_session
from app.api.dependencies import get_current_user

router = APIRouter()

@router.get(
        "/infinito", 
        response_model=List[CategoriaSimpleRead], 
        summary="Listar categorías activas",
        responses={
            401: {
                "description": "No autorizado",
                "model": ErrorResponse,
            },
        }
        )
def listar_categorias_infinita(
    db: Session = Depends(get_session),
    skip: int = Query(0, ge=0, description="Número de registro desde donde empezar"),     
    limit: int = Query(50, le=100, description="Número de registro máximos a retornar"),
    search: Optional[str] = Query(None, description="Buscar por nombre de categoría"),
    user=Depends(get_current_user)
):
    return get_categorias_infinito(
        db=db,
        skip=skip,
        limit=limit,
        search=search
    )


@router.post(
        "/", 
        response_model=CategoriaDetailRead, 
        status_code=status.HTTP_201_CREATED, 
        summary="Crear una nueva categoría",
        responses={
            401: {
                "description": "No autorizado",
                "model": ErrorResponse,
            },
            400: {
                "description": "Categoría existente",
                "model": ErrorResponse,
            }
        }
        )
def crear_categoria(
    categoria_create: CategoriaCreate,
    db: Session = Depends(get_session),
    user=Depends(get_current_user)
):
    return create_categoria(db, categoria_create)


@router.get(
        "/", 
        response_model=PagedResponse[CategoriaDetailRead], 
        summary="Listar todas las categorías con búsqueda y paginación",
        responses={
            401: {
                "description": "No autorizado",
                "model": ErrorResponse,
            },
        }
        )
def listar_categorias(
    db: Session = Depends(get_session),
    page: int = Query(1, ge=1, description="Número de página (comienza en 1)"),
    page_size: int = Query(50, ge=1, le=100, description="Elementos por página"),
    search: Optional[str] = Query(None, description="Buscar por nombre de categoría"),
    sort_by: Optional[str] = Query(None, description="Columna para ordenar"),
    sort_order: Optional[str] = Query("asc", regex="^(asc|desc)$", description="Orden ascendente o descendente"),
    estado: Optional[bool] = Query(None, description="Filtrar por estado de la categoría (true=activo, false=inactivo)"),
    user=Depends(get_current_user)
):
    return get_categorias(
        db=db,
        page=page,
        page_size=page_size,
        search=search,
        estado=estado,
        sort_by=sort_by,
        sort_order=sort_order
    )


@router.get(
        "/{categoria_id}", 
        response_model=CategoriaDetailRead, 
        summary="Obtener una categoría por su ID",
        responses={
            401: {
                "description": "No autorizado",
                "model": ErrorResponse,
            },
            404: {
                "description": "Categoría no encontrada",
                "model": ErrorResponse
            },
        }
        )
def obtener_categoria(
    categoria_id: int,
    db: Session = Depends(get_session),
    user=Depends(get_current_user)
):
    categoria = get_categoria_by_id(db, categoria_id)
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoría no encontrada.")
    return categoria


@router.patch(
        "/{categoria_id}", 
        response_model=CategoriaDetailRead, 
        summary="Actualizar una categoría existente",
        responses={
            401: {
                "description": "No autorizado",
                "model": ErrorResponse,
            },
            404: {
                "description": "Categoría no encontrada",
                "model": ErrorResponse
            },
            400: {
                "description": "Categoría existente",
                "model": ErrorResponse
            },
        }
        )
def actualizar_categoria(
    categoria_id: int,
    categoria_update: CategoriaUpdate,
    db: Session = Depends(get_session),
    user=Depends(get_current_user)
):
    return update_categoria(db, categoria_id, categoria_update)


@router.delete(
        "/{categoria_id}", 
        status_code=status.HTTP_204_NO_CONTENT, 
        summary="Eliminar una categoría por su ID",
        responses={
            401: {
                "description": "No autorizado",
                "model": ErrorResponse,
            },
            404: {
                "description": "Categoría no encontrada",
                "model": ErrorResponse
            },
            400: {
                "description": "No se puede eliminar, relaciones activas",
                "model": ErrorResponse
            },
        }
        )
def eliminar_categoria(
    categoria_id: int,
    db: Session = Depends(get_session),
    user=Depends(get_current_user)
):
    delete_categoria(db, categoria_id)


@router.patch(
        "/{categoria_id}/estado", 
        response_model=CategoriaDetailRead, 
        summary="Cambiar estado del Categoria",
        responses={
            401: {
                "description": "No autorizado",
                "model": ErrorResponse,
            },
            404: {
                "description": "Categoría no encontrada",
                "model": ErrorResponse
            },
        }
        )
def cambiar_estado_categoria(
    categoria_id: int,
    db: Session = Depends(get_session),
    user=Depends(get_current_user)
):
    return change_estado_categoria(db, categoria_id)