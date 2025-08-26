from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session
from typing import List, Optional

from app.db.session import get_session
from app.services.venta_service import (
    create_venta, 
    get_venta_by_id, 
    get_ventas, 
    update_venta, 
    delete_venta,
    get_venta_by_cliente_id,
    get_numero_ventas_ultimos_30_dias,
    change_estado_venta,
    get_detalles_venta_by_venta_id
)
from app.schemas.venta import (
    VentaListRead, 
    VentaDetailRead, 
    VentaUpdate, 
    VentaRequest, 
    VentaTotalResponse,
    VentaUpdateRead
)
from app.schemas.detalle_venta import DetalleVentaRead
from app.schemas.shared import PagedResponse
from app.models.venta import Venta
from app.api.dependencies import get_current_user 

router = APIRouter()

@router.post("/", response_model=VentaDetailRead, status_code=status.HTTP_201_CREATED, summary="Crear Venta")
def crear_venta(
    request: VentaRequest,
    db: Session = Depends(get_session),
    current_user=Depends(get_current_user)
):
    return create_venta(
        db,
        venta_data=request,
        usuario_id=current_user.id
    )


@router.get("/30dias", response_model=VentaTotalResponse, summary="Número de ventas en los últimos 30 días")
def ventas_30_dias(
    db: Session = Depends(get_session),
    user=Depends(get_current_user)
):
    return get_numero_ventas_ultimos_30_dias(db)


@router.get("/", response_model=PagedResponse[VentaListRead], summary="Listar ventas paginadas y buscables")
def listar_ventas(
    search: Optional[str] = Query(None, description="Buscar por nombre de cliente o vendedor"),
    page: int = Query(1, ge=1, description="Número de página"),
    page_size: int = Query(10, ge=1, le=100, description="Elementos por página"),
    db: Session = Depends(get_session),
    sort_by: Optional[str] = Query(None, description="Columna para ordenar"),
    sort_order: Optional[str] = Query("asc", regex="^(asc|desc)$", description="Orden ascendente o descendente"),
    estado: Optional[bool] = Query(None, description="Filtrar por estado de la venta (true=activa, false=inactiva)"),
    user=Depends(get_current_user)
):
    return get_ventas(
        db=db, 
        search=search, 
        page=page, 
        page_size=page_size,
        estado=estado,
        sort_by=sort_by,
        sort_order=sort_order
        )
    

@router.get("/detalles/{venta_id}", response_model=PagedResponse[DetalleVentaRead], summary="Listar detalles de una venta paginadas y buscables")
def listar_detalles_venta_por_venta_id(
    venta_id: int,
    search: Optional[str] = Query(None, description="Buscar por nombre o código de producto"),
    page: int = Query(1, ge=1, description="Número de página"),
    page_size: int = Query(10, ge=1, le=100, description="Elementos por página"),
    db: Session = Depends(get_session),
    sort_by: Optional[str] = Query(None, description="Columna para ordenar"),
    sort_order: Optional[str] = Query("asc", regex="^(asc|desc)$", description="Orden ascendente o descendente"),
    user=Depends(get_current_user)
):
    return get_detalles_venta_by_venta_id(
        venta_id=venta_id,
        db=db, 
        search=search, 
        page=page, 
        page_size=page_size,
        sort_by=sort_by,
        sort_order=sort_order
        )


@router.get("/{venta_id}", response_model=VentaDetailRead, summary="Obtener Venta por su ID")
def venta_by_id(venta_id: int, db: Session = Depends(get_session), user=Depends(get_current_user)):
    return get_venta_by_id(db, venta_id)


@router.patch("/{venta_id}", response_model=VentaUpdateRead, summary="Actualizar Venta")
def actualizar_venta(
    venta_id: int,
    venta_data: VentaUpdate,
    db: Session = Depends(get_session),
    user=Depends(get_current_user)
):
    return update_venta(db, venta_id, venta_data)


@router.delete("/{venta_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Eliminar Venta")
def eliminar_venta(venta_id: int, db: Session = Depends(get_session), user=Depends(get_current_user)):
    return delete_venta(db, venta_id, user)


@router.get("/cliente/{cliente_id}", response_model=List[VentaListRead], summary="Obtener Ventas por Cliente")
def ventas_por_cliente(cliente_id: int, db: Session = Depends(get_session), user=Depends(get_current_user)):
    ventas = get_venta_by_cliente_id(db, cliente_id)
    if not ventas:
        raise HTTPException(status_code=404, detail="No se encontraron ventas para este cliente")
    return ventas


@router.patch("/{venta_id}/estado", response_model=VentaDetailRead, summary="Cambiar estado del Venta")
def cambiar_estado_venta(
    venta_id: int,
    db: Session = Depends(get_session),
    user=Depends(get_current_user)
):
    return change_estado_venta(db, venta_id)