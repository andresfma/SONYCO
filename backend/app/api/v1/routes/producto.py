from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session
from typing import Optional, List

from app.db.session import get_session
from app.schemas.producto import (
    ProductoDetailRead, 
    ProductoUpdate, 
    ProductoCreate, 
    ProductoTotalResponse,
    ProductoRead,
    ProductoSimpleRead,
    ProductoInfinito
)
from app.schemas.shared import PagedResponse, ErrorResponse
from app.services.producto_service import (
    get_productos, 
    get_producto_by_code, 
    update_producto, 
    delete_producto, 
    create_producto,
    get_producto_by_id,
    get_numero_total_productos,
    change_estado_producto,
    get_productos_infinito_inventario,
    get_productos_infinito_movimiento
)
from app.api.dependencies import get_current_user

router = APIRouter()

@router.get(
        "/infinito/inventario", 
        response_model=List[ProductoInfinito], 
        summary="Listar productos activos para vista de inventarios",
        responses={
            401: {
                "description": "No autorizado",
                "model": ErrorResponse,
            },
        }
        )
def listar_productos_infinita_inventario(
    db: Session = Depends(get_session),
    skip: int = Query(0, ge=0, description="Número de registro desde donde empezar"),     
    limit: int = Query(50, le=100, description="Número de registro máximos a retornar"),
    search: Optional[str] = Query(None, description="Buscar por nombre o código de producto"),
    user=Depends(get_current_user)
):
    return get_productos_infinito_inventario(
        db=db,
        skip=skip,
        limit=limit,
        search=search
    )
    

@router.get(
        "/infinito/movimiento", 
        response_model=List[ProductoInfinito], 
        summary="Listar productos activos para vista de movimientos",
        responses={
            401: {
                "description": "No autorizado",
                "model": ErrorResponse,
            },
        }
        )
def listar_productos_infinita_movimiento(
    db: Session = Depends(get_session),
    skip: int = Query(0, ge=0, description="Número de registro desde donde empezar"),     
    limit: int = Query(50, le=100, description="Número de registro máximos a retornar"),
    search: Optional[str] = Query(None, description="Buscar por nombre o código de producto"),
    user=Depends(get_current_user)
):
    return get_productos_infinito_movimiento(
        db=db,
        skip=skip,
        limit=limit,
        search=search
    )


@router.post(
        "/", 
        response_model=ProductoDetailRead, 
        status_code=status.HTTP_201_CREATED, 
        summary="Crear Producto",
        responses={
            401: {
                "description": "No autorizado",
                "model": ErrorResponse,
            },
            400: {
                "description": "Producto existente",
                "model": ErrorResponse,
            },
        }
        )
def crear_producto(
    producto_create: ProductoCreate,
    db: Session = Depends(get_session),
    user=Depends(get_current_user)
): 
    return create_producto(db, producto_create)


@router.get(
        "/total", 
        response_model=ProductoTotalResponse, 
        summary="Obtener número total de Productos",
        responses={
            401: {
                "description": "No autorizado",
                "model": ErrorResponse,
            },
        }
        )
def total_productos(
    db: Session = Depends(get_session),
    user=Depends(get_current_user)
):
    return get_numero_total_productos(db)


@router.get(
        "/", 
        response_model=PagedResponse[ProductoDetailRead], 
        summary="Listar Productos con búsqueda y paginación",
        responses={
            401: {
                "description": "No autorizado",
                "model": ErrorResponse,
            },
        }
        )
def listar_productos( 
    search: Optional[str] = Query(None, description="Buscar por nombre o código del producto"),
    categoria: Optional[str] = Query(None, description="Buscar por nombre de categoría"),
    page: int = Query(1, ge=1, description="Número de página (desde 1)"),
    page_size: int = Query(10, ge=1, le=100, description="Cantidad de productos por página"),
    sort_by: Optional[str] = Query(None, description="Columna para ordenar"),
    sort_order: Optional[str] = Query("asc", regex="^(asc|desc)$", description="Orden ascendente o descendente"),
    estado: Optional[bool] = Query(None, description="Filtrar por estado del producto (true=activo, false=inactivo)"),
    db: Session = Depends(get_session),
    user=Depends(get_current_user)
):
    return get_productos(
        db=db,
        search=search,
        categoria=categoria,
        page=page,
        page_size=page_size,
        estado=estado,
        sort_by=sort_by,
        sort_order=sort_order
    )


@router.get(
        "/code/{codigo}", 
        response_model=ProductoDetailRead, 
        summary="Obtener Producto por Código",
        responses={
            401: {
                "description": "No autorizado",
                "model": ErrorResponse,
            },
            404: {
                "description": "Producto no encontrado",
                "model": ErrorResponse,
            },
        }
        )
def obtener_producto_por_codigo(
    codigo: str,
    db: Session = Depends(get_session),
    user=Depends(get_current_user)
):
    producto = get_producto_by_code(db, codigo)
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return producto


@router.get(
        "/{producto_id}", 
        response_model=ProductoDetailRead, 
        summary="Obtener Producto por ID",
        responses={
            401: {
                "description": "No autorizado",
                "model": ErrorResponse,
            },
            404: {
                "description": "Producto no encontrado",
                "model": ErrorResponse,
            },
        }
        )
def obtener_producto(
    producto_id: int,
    db: Session = Depends(get_session),
    user=Depends(get_current_user)
):
    producto = get_producto_by_id(db, producto_id)
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return producto


@router.patch(
        "/{producto_id}", 
        response_model=ProductoDetailRead, 
        summary="Actualizar Producto",
        responses={
            401: {
                "description": "No autorizado",
                "model": ErrorResponse,
            },
            404: {
                "description": "Producto no encontrado",
                "model": ErrorResponse,
            },
            400: {
                "description": "Producto existente",
                "model": ErrorResponse,
            },
        }
        )
def actualizar_producto(
    producto_id: int,
    producto_update: ProductoUpdate,
    db: Session = Depends(get_session),
    user=Depends(get_current_user)
):
    producto = update_producto(db, producto_id, producto_update)
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return producto


@router.delete(
        "/{producto_id}", 
        status_code=status.HTTP_204_NO_CONTENT, 
        summary="Eliminar Producto",
        responses={
            401: {
                "description": "No autorizado",
                "model": ErrorResponse,
            },
            404: {
                "description": "Producto no encontrado",
                "model": ErrorResponse,
            },
            400: {
                "description": "No se puede eliminar, tiene relaciones activas",
                "model": ErrorResponse,
            },
        }
        )
def eliminar_producto(
    producto_id: int,
    db: Session = Depends(get_session),
    user=Depends(get_current_user)
):
    return delete_producto(db, producto_id)


@router.patch(
        "/{producto_id}/estado", 
        response_model=ProductoDetailRead, 
        summary="Cambiar estado del Producto",
        responses={
            401: {
                "description": "No autorizado",
                "model": ErrorResponse,
            },
            404: {
                "description": "Producto no encontrado",
                "model": ErrorResponse,
            },
        })
def cambiar_estado_producto(
    producto_id: int,
    db: Session = Depends(get_session),
    user=Depends(get_current_user)
):
    return change_estado_producto(db, producto_id)
