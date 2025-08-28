from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from app.db.session import get_session
from app.schemas.detalle_venta import DetalleVentaCreate, DetalleVentaUpdate, DetalleVentaRead
from app.schemas.venta import VentaDetailRead
from app.services.venta_service import add_detalle_venta, update_detalle_venta, delete_detalle_venta, get_detalle_venta_by_id
from app.api.dependencies import get_current_user
from app.schemas.shared import ErrorResponse

router = APIRouter()

@router.post(
        "/{venta_id}", 
        response_model=VentaDetailRead, 
        summary="Agregar Detalle a Venta",
        responses={
            401: {
                "description": "No autorizado",
                "model": ErrorResponse,
            },
            400: {
                "description": "Entidad inactiva o stock insuficiente",
                "model": ErrorResponse
            },
            404: {
                "description": "Entidad no encontrada",
                "model": ErrorResponse
            },
        }
        )
def agregar_detalle_venta(
    venta_id: int,
    detalle_data: DetalleVentaCreate,
    db: Session = Depends(get_session),
    user=Depends(get_current_user)
):
    """Agrega un nuevo detalle a una venta y devuelve la venta actualizada."""
    venta = add_detalle_venta(db, venta_id, detalle_data, user)
    return venta


@router.get(
        "/{detalle_id}", 
        response_model=DetalleVentaRead, 
        summary="Obtener detalle venta por su ID",
        responses={
            401: {
                "description": "No autorizado",
                "model": ErrorResponse,
            },
            404: {
                "description": "Detalle de venta no encontrada",
                "model": ErrorResponse,
            },
        }
        )
def detalle_venta_by_id(
    detalle_id: int, 
    db: Session = Depends(get_session), 
    user=Depends(get_current_user)
    ):
    return get_detalle_venta_by_id(db, detalle_id)


@router.patch(
        "/{detalle_id}", 
        response_model=VentaDetailRead, 
        summary="Actualizar Detalle de Venta",
        responses={
            401: {
                "description": "No autorizado",
                "model": ErrorResponse,
            },
            404: {
                "description": "Entidad no encontrada",
                "model": ErrorResponse,
            },
            400: {
                "description": "Entidad inactiva o stock insuficiente",
                "model": ErrorResponse
            },
        }
        )
def actualizar_detalle_venta(
    detalle_id: int,
    detalle_data: DetalleVentaUpdate,
    db: Session = Depends(get_session),
    user=Depends(get_current_user)
):
    """Actualiza un detalle de venta y devuelve la venta actualizada."""
    venta = update_detalle_venta(db, detalle_id, detalle_data, user)
    return venta


@router.delete(
        "/{detalle_id}", 
        response_model=VentaDetailRead, 
        summary="Eliminar Detalle de Venta",
        responses={
            401: {
                "description": "No autorizado",
                "model": ErrorResponse,
            },
            404: {
                "description": "Entidad no encontrada",
                "model": ErrorResponse,
            },
            400: {
                "description": "Venta inactiva",
                "model": ErrorResponse,
            },
        }
        )
def eliminar_detalle_venta(
    detalle_id: int,
    db: Session = Depends(get_session),
    user=Depends(get_current_user)
):
    """Elimina un detalle de venta y devuelve la venta actualizada."""
    venta = delete_detalle_venta(db, detalle_id, user)
    return venta
