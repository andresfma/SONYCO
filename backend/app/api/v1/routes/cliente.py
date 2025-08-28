from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Optional
from sqlmodel import Session
from typing import List

from app.db.session import get_session
from app.models.cliente import TipoPersona
from app.schemas.cliente import ClienteRead, ClienteUpdate, ClienteCreate, ClienteVentasResponse, ClienteReadSimple
from app.schemas.shared import PagedResponse, ErrorResponse
from app.services.cliente_service import (
    get_clientes, 
    get_cliente_by_email, 
    update_cliente, 
    delete_cliente, 
    create_cliente,
    get_cliente_by_id,
    change_estado_cliente,
    get_numero_clientes_con_ventas,
    get_clientes_infinito
)
from app.api.dependencies import get_current_user

router = APIRouter()

@router.get(
        "/infinito", 
        response_model=List[ClienteReadSimple], 
        summary="Listar clientes activos",
        responses={
            401: {
                "description": "No autorizado",
                "model": ErrorResponse,
            },
        }
        )
def listar_clientes_infinita(
    db: Session = Depends(get_session),
    skip: int = Query(0, ge=0, description="Número de registro desde donde empezar"),     
    limit: int = Query(50, le=100, description="Número de registro máximos a retornar"),
    search: Optional[str] = Query(None, description="Buscar por nombre de cliente"),
    user=Depends(get_current_user)
):
    return get_clientes_infinito(
        db=db,
        skip=skip,
        limit=limit,
        search=search
    )


@router.get(
        "/con-ventas", 
        response_model=ClienteVentasResponse, 
        summary="Retorna el total de clientes con ventas",
        responses={
            401: {
                "description": "No autorizado",
                "model": ErrorResponse,
            },
        }
        )
def clientes_con_ventas_total(
    db: Session = Depends(get_session),
    user=Depends(get_current_user)
):
    return get_numero_clientes_con_ventas(db)


@router.post(
        "/", 
        response_model=ClienteRead, 
        status_code=status.HTTP_201_CREATED, 
        summary="Crear Cliente",
        responses={
            401: {
                "description": "No autorizado",
                "model": ErrorResponse,
            },
            409: {
                "description": "Cliente ya existe",
                "model": ErrorResponse,
            },
        }
        )
def crear_cliente(
    cliente_create: ClienteCreate,
    db: Session = Depends(get_session),
    user=Depends(get_current_user)
):
    """Crea un nuevo cliente."""

    return create_cliente(db, cliente_create)


@router.get(
        "/", 
        response_model=PagedResponse[ClienteRead], 
        summary="Listar clientes con filtros",
        responses={
            401: {
                "description": "No autorizado",
                "model": ErrorResponse,
            },
        }
        )
def listar_clientes(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    search: Optional[str] = Query(None, description="Búsqueda general por nombre, identificación o email"),
    tipo_persona: Optional[TipoPersona] = Query(None, description="Tipo de persona: natural o jurídica"),
    db: Session = Depends(get_session),
    sort_by: Optional[str] = Query(None, description="Columna para ordenar"),
    sort_order: Optional[str] = Query("asc", regex="^(asc|desc)$", description="Orden ascendente o descendente"),
    estado: Optional[bool] = Query(None, description="Filtrar por estado del cliente (true=activo, false=inactivo)"),
    user=Depends(get_current_user)
):
    return get_clientes(
        db, 
        page=page, 
        page_size=page_size, 
        search=search, 
        tipo_persona=tipo_persona,
        sort_by=sort_by,
        sort_order=sort_order,
        estado=estado
        )


@router.get(
        "/{cliente_id}", 
        response_model=ClienteRead, 
        summary="Obtener Cliente por ID",
        responses={
            401: {
                "description": "No autorizado",
                "model": ErrorResponse,
            },
            404: {
                "description": "Cliente no encontrado",
                "model": ErrorResponse,
            },
        }
        )
def obtener_cliente(
    cliente_id: int,
    db: Session = Depends(get_session),
    user=Depends(get_current_user)
):
    cliente = get_cliente_by_id(db, cliente_id)
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return cliente


@router.patch(
        "/{cliente_id}", 
        response_model=ClienteRead, 
        summary="Actualizar Cliente",
        responses={
            401: {
                "description": "No autorizado",
                "model": ErrorResponse,
            },
            400: {
                "description": "Cliente existente",
                "model": ErrorResponse
            },
            404: {
                "description": "Cliente no encontrado",
                "model": ErrorResponse
            },
        }
        )
def actualizar_cliente(
    cliente_id: int,
    cliente_update: ClienteUpdate,
    db: Session = Depends(get_session),
    user=Depends(get_current_user)
):
    return update_cliente(db, cliente_id, cliente_update)


@router.delete(
        "/{cliente_id}", 
        status_code=status.HTTP_204_NO_CONTENT, 
        summary="Eliminar Cliente",
        responses={
            401: {
                "description": "No autorizado",
                "model": ErrorResponse,
            },
            400: {
                "description": "No se puede eliminar, relaciones activas",
                "model": ErrorResponse
            },
            404: {
                "description": "Cliente no encontrado",
                "model": ErrorResponse
            },
        }
        )
def eliminar_cliente(
    cliente_id: int,
    db: Session = Depends(get_session),
    user=Depends(get_current_user)
):
    return delete_cliente(db, cliente_id)


@router.patch(
        "/{cliente_id}/estado", 
        response_model=ClienteRead, 
        summary="Cambiar estado del Cliente",
        responses={
            401: {
                "description": "No autorizado",
                "model": ErrorResponse,
            },
            404: {
                "description": "Cliente no encontrado",
                "model": ErrorResponse
            },
        }
        )
def cambiar_estado_cliente(
    cliente_id: int,
    db: Session = Depends(get_session),
    user=Depends(get_current_user)
):
    return change_estado_cliente(db, cliente_id)
