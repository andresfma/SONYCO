from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session
from typing import List, Optional

from app.db.session import get_session
from app.models.inventario import Inventario
from app.models.movimiento_inventario import TipoMovimientoEnum
from app.schemas.inventario import (
    InventarioReadDetail,
    InventarioCantidadCreate,
    InventarioRead,
    InventarioCantidadUpdate
)
from app.schemas.movimiento_inventario import (
    MovimientoInventarioRead,
    MovimientoInventarioCreate,
    MovimientoInventarioDetailRead
)
from app.services.inventario_service import (
    register_inventario, 
    get_inventarios,
    register_entrada,
    register_salida,
    get_historial_movimientos_by_producto, 
    get_inventarios_stock_bajo,
    get_inventario_by_product_id,
    get_movimientos_inventario,
    get_historial_movimientos_by_usuario,
    update_inventario,
    change_estado_inventario,
    get_inventario_by_id,
    get_movimiento_by_id
)
from app.api.dependencies import get_current_user
from app.models.usuario import Usuario
from app.schemas.shared import PagedResponse, ErrorResponse

router = APIRouter()


@router.post(
        "/movimientos/entrada", 
        response_model=MovimientoInventarioRead, 
        summary="Registrar entrada de inventario",
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
                "description": "Producto inactivo",
                "model": ErrorResponse,
            },
        }
        )
def registrar_entrada(
    data: MovimientoInventarioCreate,
    db: Session = Depends(get_session),
    user: Usuario = Depends(get_current_user),
):
    return register_entrada(db, data, current_user=user)


@router.post(
        "/movimientos/salida", 
        response_model=MovimientoInventarioRead, 
        summary="Registrar salida de inventario",
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
                "description": "Producto inactivo o stock insuficiente",
                "model": ErrorResponse,
            },
        }
        )
def registrar_salida(
    data: MovimientoInventarioCreate,
    db: Session = Depends(get_session),
    user: Usuario = Depends(get_current_user)
):
    return register_salida(db, data, current_user=user)


@router.get(
        "/movimientos/producto/{producto_id}", 
        response_model=PagedResponse[MovimientoInventarioDetailRead], 
        summary="Historial de movimientos por producto (paginado)",
        responses={
            401: {
                "description": "No autorizado",
                "model": ErrorResponse,
            },
        }
        )
def historial_movimientos_producto(
    producto_id: int,
    page: int = Query(1, ge=1, description="Número de página (desde 1)"),
    page_size: int = Query(10, ge=1, le=100, description="Cantidad de resultados por página"),
    tipo: Optional[TipoMovimientoEnum] = Query(None, description="Filtrar por tipo de movimiento"),
    db: Session = Depends(get_session),
    user: Usuario = Depends(get_current_user)
):
    return get_historial_movimientos_by_producto(
        db=db,
        producto_id=producto_id,
        page=page,
        page_size=page_size,
        tipo=tipo
    )


@router.get(
        "/movimientos/usuario/{usuario_id}", 
        response_model=PagedResponse[MovimientoInventarioDetailRead], 
        summary="Historial de movimientos por usuario (paginado)",
        responses={
            401: {
                "description": "No autorizado",
                "model": ErrorResponse,
            },
        }
        )
def historial_movimientos_usuario(
    usuario_id: int,
    page: int = Query(1, ge=1, description="Número de página (desde 1)"),
    page_size: int = Query(10, ge=1, le=100, description="Cantidad de resultados por página"),
    tipo: Optional[TipoMovimientoEnum] = Query(None, description="Filtrar por tipo de movimiento"),
    db: Session = Depends(get_session),
    user: Usuario = Depends(get_current_user)
):
    return get_historial_movimientos_by_usuario(
        db=db,
        usuario_id=usuario_id,
        page=page,
        page_size=page_size,
        tipo=tipo
    )


@router.get(
        "/movimientos", 
        response_model=PagedResponse[MovimientoInventarioDetailRead], 
        summary="Listar movimientos de inventario",
        responses={
            401: {
                "description": "No autorizado",
                "model": ErrorResponse,
            },
        }
        )
def listar_movimientos_inventario(
    db: Session = Depends(get_session),
    page: int = Query(1, ge=1, description="Número de página (comienza en 1)"),
    page_size: int = Query(50, ge=1, le=100, description="Cantidad de elementos por página"),
    tipo: Optional[TipoMovimientoEnum] = Query(None, description="Filtrar por tipo de movimiento"),
    search: Optional[str] = Query(None, description="Buscar por nombre de usuario o nombre/código de producto"),
    sort_by: Optional[str] = Query(None, description="Columna para ordenar"),
    sort_order: Optional[str] = Query("asc", regex="^(asc|desc)$", description="Orden ascendente o descendente"),
    user=Depends(get_current_user)
):
    return get_movimientos_inventario(
        db=db,
        page=page,
        page_size=page_size,
        tipo=tipo,
        search=search,
        sort_by=sort_by,
        sort_order=sort_order
    )


@router.get(
        "/stock-bajo", 
        response_model=PagedResponse[InventarioReadDetail],
        summary="Retorna el listado de productos con stock bajo",
        responses={
            401: {
                "description": "No autorizado",
                "model": ErrorResponse,
            },
        }
        )
def listar_stock_bajo(
    db: Session = Depends(get_session),
    search: Optional[str] = Query(None, description="Buscar por nombre o código de producto"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    sort_by: Optional[str] = Query(None, description="Columna para ordenar"),
    sort_order: Optional[str] = Query("asc", regex="^(asc|desc)$", description="Orden ascendente o descendente"),
    user: Usuario = Depends(get_current_user)
):
    return get_inventarios_stock_bajo(
        db,
        search=search,
        page=page, 
        page_size=page_size, 
        sort_by=sort_by,
        sort_order=sort_order
    )


@router.get(
        "/", 
        response_model=PagedResponse[InventarioRead],
        summary="Listar inventarios con filtros",
        responses={
            401: {
                "description": "No autorizado",
                "model": ErrorResponse,
            },
        }
        )
def listar_inventarios(
    db: Session = Depends(get_session),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None, description="Buscar por nombre o código de producto"),
    sort_by: Optional[str] = Query(None, description="Columna para ordenar"),
    sort_order: Optional[str] = Query("asc", regex="^(asc|desc)$", description="Orden ascendente o descendente"),
    estado: Optional[bool] = Query(None, description="Filtrar por estado del inventario (activo/inactivo)"),
    user: Usuario = Depends(get_current_user)
):
    return get_inventarios(
        db,
        page=page, 
        page_size=page_size, 
        search=search,
        estado=estado,
        sort_by=sort_by,
        sort_order=sort_order
        )


@router.post(
        "/", 
        response_model=InventarioReadDetail, 
        summary="Crear un nuevo inventario",
        responses={
            401: {
                "description": "No autorizado",
                "model": ErrorResponse,
            },
            400: {
                "description": "Producto inválido",
                "model": ErrorResponse,
            },
            404: {
                "description": "Producto no encontrado",
                "model": ErrorResponse,
            },
        }
        )
def crear_inventario(
    data: InventarioCantidadCreate,
    db: Session = Depends(get_session),
    user: Usuario = Depends(get_current_user)
):
    return register_inventario(db, data)


@router.get(
        "/producto/{producto_id}", 
        response_model=InventarioReadDetail, 
        summary="Obtener inventario por ID de producto",
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
def obtener_inventario_por_producto(
    producto_id: int,
    db: Session = Depends(get_session),
    user: Usuario = Depends(get_current_user)
):
    inventario = get_inventario_by_product_id(db, producto_id)
    if not inventario:
        raise HTTPException(status_code=404, detail="Producto no encontrado en inventario")
    return inventario


@router.get(
        "/movimientos/{movimiento_inventario_id}", 
        response_model=MovimientoInventarioDetailRead, 
        summary="Obtener Movimiento por ID",
        responses={
            401: {
                "description": "No autorizado",
                "model": ErrorResponse,
            },
            404: {
                "description": "Movimiento no encontrado",
                "model": ErrorResponse,
            },
        }
        )
def obtener_movimiento_inventario(
    movimiento_inventario_id: int,
    db: Session = Depends(get_session),
    user=Depends(get_current_user)
):
    inventario = get_movimiento_by_id(db, movimiento_inventario_id)
    if not inventario:
        raise HTTPException(status_code=404, detail="Movimiento no encontrado")
    return inventario


@router.get(
        "/{inventario_id}", 
        response_model=InventarioRead, 
        summary="Obtener Inventario por ID",
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
def obtener_inventario(
    inventario_id: int,
    db: Session = Depends(get_session),
    user=Depends(get_current_user)
):
    inventario = get_inventario_by_id(db, inventario_id)
    if not inventario:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return inventario


@router.patch(
        "/{inventario_id}", 
        response_model=InventarioReadDetail, 
        summary="Actualizar inventario",
        responses={
            401: {
                "description": "No autorizado",
                "model": ErrorResponse,
            },
            404: {
                "description": "Inventario no encontrado",
                "model": ErrorResponse,
            },
            400: {
                "description": "Inventario inactivo o cantidad inválida",
                "model": ErrorResponse,
            },
        }
        )
def actualizar_inventario(
    inventario_id: int,
    data: InventarioCantidadUpdate,
    db: Session = Depends(get_session),
    user: Usuario = Depends(get_current_user)
):
    return update_inventario(db, inventario_id, data, current_user=user)


@router.patch(
        "/{inventario_id}/estado", 
        response_model=InventarioReadDetail, 
        summary="Cambiar estado del Inventario",
        responses={
            401: {
                "description": "No autorizado",
                "model": ErrorResponse,
            },
            404: {
                "description": "Inventario no encontrado",
                "model": ErrorResponse,
            },
        }
        )
def cambiar_estado_inventario(
    inventario_id: int,
    db: Session = Depends(get_session),
    user=Depends(get_current_user)
):
    return change_estado_inventario(db, inventario_id)
